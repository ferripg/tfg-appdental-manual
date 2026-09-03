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

- `POSTGRES_PASSWORD` i `MINIO_ROOT_PASSWORD`: tria'n unes de llargues i **només amb
  lletres, números, `-` i `_`**. Res de `@`, `:`, `/` o `#`: la de Postgres va dins del
  `DATABASE_URL`, i aquests caràcters trenquen la URL de connexió. Per generar-ne una:
  `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"`.
- `DATABASE_URL`: substitueix `<PASSWORD_BD>` per **exactament** la mateixa contrasenya que
  has posat a `POSTGRES_PASSWORD`. Si les dues no coincideixen, `prisma migrate dev` falla
  amb `P1000: Authentication failed against database server`.
- `BETTER_AUTH_SECRET`: **mínim 32 caràcters aleatoris**, genera'l amb
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
  (si en poses un de curt, Better Auth avisa a cada petició).
- `SEED_ADMIN_PASSWORD`: la contrasenya amb què entraràs a l'aplicació. No la deixis buida
  o el `seed:admin` petarà.
- Les variables `MINIO_ENDPOINT`, `MINIO_PORT` i `MINIO_USE_SSL` deixa-les tal com venen:
  serveixen per executar scripts des del teu ordinador. Dins de Docker, el `compose` ja les
  reescriu perquè apuntin al contenidor `minio`.

```bash
docker compose up -d --build   # Postgres, MinIO, app i reverse proxy
npm install
npx prisma migrate dev         # crea les taules
npx prisma generate            # genera el client tipat de Prisma
npm run seed:admin             # crea l'usuari admin (SEED_ADMIN_* del .env)
npm run seed:demo              # opcional: omple l'app amb dades de prova
```

L'aplicació és a http://localhost i la consola de MinIO a http://localhost:9001. Entra amb
el correu i la contrasenya de `SEED_ADMIN_EMAIL` i `SEED_ADMIN_PASSWORD`.

### Dades de prova

`npm run seed:demo` omple l'aplicació amb tres anys de moviments d'una clínica
fictícia: uns 190 apunts de despesa, 10 proveïdors, 13 tipus de despesa, 8 béns
d'inventari amb les seves amortitzacions ja calculades i un registre d'auditoria.
Algunes despeses porten la factura en PDF adjunta.

Les amortitzacions de l'exercici en curs es deixen **sense generar** a posta, perquè
es puguin generar des de la pantalla d'amortitzacions i veure com funciona.

A més de l'admin, crea tres usuaris per provar els permisos de cada rol
(contrasenya `Demo1234-clinica`):

| Usuari | Rol | |
|---|---|---|
| `gestora@clinica.test` | MANAGER | CRUD complet, exports i amortitzacions |
| `recepcio@clinica.test` | OPERARI | només crear despeses i consultar llistats |
| `auxiliar@clinica.test` | OPERARI | desactivat, per veure com es bloqueja l'accés |

Es pot tornar a executar tantes vegades com calgui: esborra les dades de domini
(incloent-hi els PDFs de MinIO) i les torna a generar igual, sense tocar els usuaris.

El bucket `factures` de MinIO es crea sol la primera vegada que es puja una factura, no
cal tocar res a la consola.

Per aturar-ho tot: `docker compose down` (afegeix `-v` si també vols esborrar les dades de
Postgres i MinIO i tornar a començar de zero).

### Si alguna cosa falla

- **La imatge no compila** o `docker compose up` acaba amb `Build error occurred`: recorda
  que el `Dockerfile` fa `npm run build` dins del contenidor. Torna-ho a provar amb
  `docker compose build --no-cache nextjs` per veure l'error complet.
- **Ports ocupats** (80, 5432, 9000, 9001): atura el que els estigui fent servir o canvia
  el port de l'esquerra al `docker-compose.yml`.
- **`P1000: Authentication failed` a `prisma migrate dev`**: la contrasenya del
  `DATABASE_URL` no és la mateixa que la de `POSTGRES_PASSWORD`. Compte, però: Postgres
  només llegeix `POSTGRES_PASSWORD` **el primer cop que crea la base de dades**. Si la
  canvies quan el volum ja existeix, cal recrear-lo perquè faci efecte:
  `docker compose down -v && docker compose up -d` (això esborra les dades, així que
  després toca tornar a fer `prisma migrate dev` i `seed:admin`).
- **`Cannot find module '.prisma/client/default'`**: et falta `npx prisma generate`.
- **No facis `npm audit fix --force`**: vol pujar Next fora del rang declarat i `better-auth`
  a la 1.7, que canvia l'esquema de la taula `account` i trenca el login. El `better-auth`
  està fixat a `~1.6.30` a posta: ja té els avisos de seguretat tapats sense el canvi
  d'esquema. Un `npm audit fix` normal (sense `--force`) sí que és segur.

## Estructura

- `src/app/`: pàgines (Server Components) i server actions
- `src/components/`: interfície (shadcn/ui)
- `src/services/`: lògica de negoci
- `src/repositories/`: accés a dades, l'únic lloc que toca Prisma
- `src/schemas/`: validació amb Zod
- `src/lib/`: Better Auth, permisos per rols i MinIO
- `src/proxy.ts`: filtre d'autenticació abans de cada petició
