# VEXMOR LICENSE SYSTEM

Starter monorepo for a Discord license bot, web dashboard, and Lua/Luau validation API.

## Stack
- Node.js 20+
- Discord.js 14
- Express API
- Next.js dashboard
- PostgreSQL + Prisma
- Railway deployment (separate services)

## Repository layout
- `apps/api` — REST API for license operations and loader validation
- `apps/bot` — Discord slash-command bot
- `apps/web` — Next.js dashboard starter
- `packages/shared` — shared configuration
- `prisma` — database schema

## Local setup
1. Copy `.env.example` to `.env` and fill in values.
2. Create a PostgreSQL database.
3. Run `npm install`.
4. Run `npm run db:generate` then `npm run db:push`.
5. Run `npm run dev`.

## Railway deployment
Create separate Railway services from this repository:
- API: root directory `/apps/api`, start command `npm start`
- Bot: root directory `/apps/bot`, start command `npm start`
- Web: root directory `/apps/web`, start command `npm start`
- PostgreSQL: add a Railway PostgreSQL database

Set the environment variables from `.env.example` in each service. Use Railway's private networking for internal service-to-service traffic where possible.

## Security notes
- Never commit `.env` or Discord/API secrets.
- The API hashes license keys at rest; the raw key is shown only when generated.
- The example loader endpoint is intended for scripts and experiences you own or are authorized to administer.
- Add authentication/authorization before exposing administrative endpoints publicly.
- Do not treat a client-provided HWID as strong device identity; it is only an optional binding signal.
