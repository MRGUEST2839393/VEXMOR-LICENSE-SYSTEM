const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const crypto = require("node:crypto");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.API_PORT || 4000);

app.use(helmet());
app.use(cors({ origin: process.env.WEB_URL || "http://localhost:3000" }));
app.use(express.json({ limit: "32kb" }));

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const safeEqual = (a, b) => {
  const aa = Buffer.from(a || "");
  const bb = Buffer.from(b || "");
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
};
const requireInternal = (req, res, next) => {
  if (!safeEqual(req.get("x-vexmor-secret"), process.env.API_INTERNAL_SECRET)) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
};

app.get("/health", (_req, res) => res.json({ ok: true, service: "vexmor-api" }));

// Admin endpoint: call only from trusted bot/server code, never directly from a browser.
app.post("/v1/licenses", requireInternal, async (req, res) => {
  const { product, durationDays = null, discordId = null } = req.body || {};
  if (typeof product !== "string" || !product.trim()) {
    return res.status(400).json({ error: "product_required" });
  }
  const rawKey = `VEX-${crypto.randomBytes(18).toString("hex").toUpperCase()}`;
  const expiresAt = Number.isInteger(durationDays) && durationDays > 0
    ? new Date(Date.now() + durationDays * 86400000) : null;
  const license = await prisma.license.create({
    data: {
      keyHash: hash(rawKey),
      keyPrefix: rawKey.slice(0, 8),
      product: product.trim(),
      discordId,
      expiresAt
    }
  });
  await prisma.licenseEvent.create({
    data: { licenseId: license.id, action: "created", details: "License generated" }
  });
  res.status(201).json({ id: license.id, key: rawKey, product: license.product, expiresAt });
});

// Public validation endpoint for your own Lua/Luau projects.
app.post("/v1/validate", async (req, res) => {
  const { key, product, hwid } = req.body || {};
  if (typeof key !== "string" || typeof product !== "string") {
    return res.status(400).json({ valid: false, error: "invalid_request" });
  }
  const license = await prisma.license.findUnique({ where: { keyHash: hash(key) } });
  if (!license || license.product !== product || license.status !== "active") {
    return res.status(200).json({ valid: false, error: "license_invalid" });
  }
  if (license.expiresAt && license.expiresAt.getTime() < Date.now()) {
    return res.status(200).json({ valid: false, error: "license_expired" });
  }
  if (hwid && license.hwidHash && license.hwidHash !== hash(String(hwid))) {
    return res.status(200).json({ valid: false, error: "device_mismatch" });
  }
  if (hwid && !license.hwidHash) {
    await prisma.license.update({
      where: { id: license.id },
      data: { hwidHash: hash(String(hwid)), activations: { increment: 1 } }
    });
  }
  await prisma.licenseEvent.create({
    data: { licenseId: license.id, action: "validated", details: "Loader validation" }
  });
  res.json({ valid: true, product: license.product, expiresAt: license.expiresAt });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

app.listen(port, () => console.log(`VEXMOR API listening on ${port}`));
                                 
