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
```

Omple el `.env` abans de continuar. Docker Compose llegeix aquest fitxer, així que si hi
falta alguna variable els contenidors no arrencaran bé:

- `POSTGRES_PASSWORD` i `MINIO_ROOT_PASSWORD`: tria'n les que vulguis (MinIO en demana 8
  caràcters com a mínim).
- `DATABASE_URL`: substitueix `<PASSWORD_BD>` per la mateixa contrasenya de Postgres.
- `BETTER_AUTH_SECRET`: **mínim 32 caràcters aleatoris**, genera'l amb
  `openssl rand -base64 32` (si en poses un de curt, Better Auth avisa a cada petició).
- `SEED_ADMIN_PASSWORD`: la contrasenya amb què entraràs a l'aplicació.
- Les variables `MINIO_ENDPOINT`, `MINIO_PORT` i `MINIO_USE_SSL` deixa-les tal com venen:
  serveixen per executar scripts des del teu ordinador. Dins de Docker, el `compose` ja les
  reescriu perquè apuntin al contenidor `minio`.

```bash
docker compose up -d --build   # Postgres, MinIO, app i reverse proxy
npm install
npx prisma migrate dev         # crea les taules
npm run seed:admin             # crea l'usuari admin (SEED_ADMIN_* del .env)
```

L'aplicació és a http://localhost i la consola de MinIO a http://localhost:9001. Entra amb
el correu i la contrasenya de `SEED_ADMIN_EMAIL` i `SEED_ADMIN_PASSWORD`.

Un últim pas: entra a la consola de MinIO amb `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` i
crea el bucket **`factures`**. Sense aquest bucket, les factures de les despeses no es
poden pujar.

Per aturar-ho tot: `docker compose down` (afegeix `-v` si també vols esborrar les dades de
Postgres i MinIO i tornar a començar de zero).

### Si alguna cosa falla

- **La imatge no compila** o `docker compose up` acaba amb `Build error occurred`: recorda
  que el `Dockerfile` fa `npm run build` dins del contenidor. Torna-ho a provar amb
  `docker compose build --no-cache nextjs` per veure l'error complet.
- **Ports ocupats** (80, 5432, 9000, 9001): atura el que els estigui fent servir o canvia
  el port de l'esquerra al `docker-compose.yml`.
- **`npx prisma migrate dev` no connecta**: el contenidor `denta-postgres` ha d'estar
  aixecat i el `DATABASE_URL` del `.env` ha d'apuntar a `localhost:5432` amb la contrasenya
  correcta. Comprova l'estat amb `docker compose ps`.

## Estructura

- `src/app/`: pàgines (Server Components) i server actions
- `src/components/`: interfície (shadcn/ui)
- `src/services/`: lògica de negoci
- `src/repositories/`: accés a dades, l'únic lloc que toca Prisma
- `src/schemas/`: validació amb Zod
- `src/lib/`: Better Auth, permisos per rols i MinIO
- `src/proxy.ts`: filtre d'autenticació abans de cada petició
