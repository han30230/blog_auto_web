# Create database for local testing

If you see "Can't reach database server" or "database does not exist":

1. **Start PostgreSQL** (e.g. start the Windows service, or run in Docker):
   ```bash
   docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
   ```

2. **Create the database** (if using local PostgreSQL):
   - Using `psql`:
     ```bash
     psql -U postgres -h localhost -c "CREATE DATABASE keyworddb;"
     ```
   - Or in Docker:
     ```bash
     docker exec -it pg psql -U postgres -c "CREATE DATABASE keyworddb;"
     ```

3. Then run:
   ```bash
   pnpm db:migrate --name init
   pnpm db:seed
   ```

Alternatively, use `pnpm db:push` to sync the schema without migration history (good for local dev).
