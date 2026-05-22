Prisma & Postgres setup

1. Environment

- Copy `.env.example` to `.env` and update `DATABASE_URL`.

2. Run locally with Docker Compose (starts Postgres and PgBouncer):

```bash
# from project root
docker-compose up -d postgres pgbouncer
# in backend folder
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
```

3. Connection pooling

- This compose includes `pgbouncer` listening on port 6432. To use it, point `DATABASE_URL` to `postgres://user:pass@localhost:6432/dbname`.
- For production, use a managed connection pooler or Prisma Data Proxy.

4. CI / Deploy

- Use `prisma migrate deploy` in your CI/CD to run migrations against production DB.
