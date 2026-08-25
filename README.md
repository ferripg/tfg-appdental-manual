# AppDental — versió manual (TFG)

Aplicació de gestió administrativa per a una clínica dental. Versió feta a mà, sense IA
agèntica, per a l'estudi comparatiu del TFG. La versió assistida és a `tfg-appdental-ia`.

Stack: Next.js 16, TypeScript, Prisma 7 + PostgreSQL, Better Auth, MinIO i Docker.

## Requisits

- Docker i Docker Compose
- Node.js 24
- Git

## Engegar des de zero

```bash
git clone <url-del-repositori>
cd tfg-appdental-manual

cp .env.example .env
# omple les contrasenyes buides del .env (i posa la de Postgres també a DATABASE_URL)

docker compose up -d          # Postgres, MinIO, app i reverse proxy
npm install
npx prisma migrate dev        # crea les taules
npx tsx prisma/seed.ts        # crea l'usuari admin (SEED_ADMIN_* del .env)
```

App a http://localhost i consola de MinIO a http://localhost:9001. Entra amb el correu i la
contrasenya que hagis posat a `SEED_ADMIN_EMAIL` i `SEED_ADMIN_PASSWORD`.

Per aturar-ho tot: `docker compose down`.

## Estructura

- `app/`: pàgines (Server Components) i server actions
- `components/`: interfície (shadcn/ui)
- `services/`: lògica de negoci
- `repositories/`: accés a dades, l'únic lloc que toca Prisma
- `schemas/`: validació amb Zod
- `lib/`: Better Auth, permisos per rols i MinIO
- `proxy.ts`: filtre d'autenticació abans de cada petició
