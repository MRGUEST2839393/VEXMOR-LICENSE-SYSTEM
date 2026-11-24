const {
  Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const commands = [
  new SlashCommandBuilder().setName("genkey").setDescription("Generate a VEXMOR license")
    .addStringOption(o => o.setName("product").setDescription("Product name").setRequired(true))
    .addIntegerOption(o => o.setName("days").setDescription("Duration in days; omit for no expiry").setMinValue(1)),
  new SlashCommandBuilder().setName("stats").setDescription("Show license service status"),
  new SlashCommandBuilder().setName("help").setDescription("Show VEXMOR commands")
].map(c => c.toJSON());

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
    { body: commands }
  );
  console.log("VEXMOR slash commands registered.");
}

client.once("ready", () => console.log(`VEXMOR online as ${client.user.tag}`));

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "help") {
    return interaction.reply({ ephemeral: true, content: "**VEXMOR**\n`/genkey` — generate a license\n`/stats` — service status\n`/help` — command list" });
  }
  if (interaction.commandName === "stats") {
    return interaction.reply({ ephemeral: true, content: "VEXMOR API-backed license system is online when its API health check succeeds." });
  }
  if (interaction.commandName === "genkey") {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ ephemeral: true, content: "You need Manage Server permission." });
    }
    await interaction.deferReply({ ephemeral: true });
    try {
      const product = interaction.options.getString("product", true);
      const days = interaction.options.getInteger("days");
      const response = await fetch(`${process.env.API_BASE_URL}/v1/licenses`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-vexmor-secret": process.env.API_INTERNAL_SECRET
        },
        body: JSON.stringify({ product, durationDays: days, discordId: interaction.user.id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "API error");
      return interaction.editReply(`**License generated**\nProduct: ${data.product}\nKey: \`${data.key}\`\nExpires: ${data.expiresAt || "Never"}`);
    } catch (error) {
      console.error(error);
      return interaction.editReply("Could not generate the license. Check the API and database configuration.");
    }
  }
});

(async () => {
  await registerCommands();
  await client.login(process.env.DISCORD_TOKEN);
})();
