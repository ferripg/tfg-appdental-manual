# Sprint 1 — Setup i Infraestructura Base
> **Objectiu:** Deixar l'entorn de desenvolupament completament operatiu amb tots els contenidors comunicant-se, perquè el Sprint 2 pugui centrar-se exclusivament en el codi de l'aplicació.  
> **Durada estimada:** 1-2 setmanes  
> **Repositoris afectats:** `tfg-manual` i `tfg-ia` (setup idèntic per als dos)

---

## EPIC: INFRA-00 — Configuració de l'Entorn de Treball

### INFRA-00 · Instal·lació de prerequisits (Windows)
**Tipus:** Task | **Prioritat:** Highest | **Estimació:** 1h

**Descripció:**  
Instal·lar i verificar totes les eines necessaries per al projecte a Windows.

**Tasques seqüencials:**
1. Instal·lar **Node.js LTS** des de nodejs.org → verificar `node -v` i `npm -v` al terminal
2. Instal·lar **Docker Desktop per a Windows** des de docker.com → activar WSL 2 si ho demana
3. Verificar que Docker funciona: `docker run hello-world` al terminal
4. Instal·lar **Git per a Windows** des de git-scm.com
5. Verificar: `git --version` al terminal
6. Instal·lar **VS Code** (si no està instal·lat) i les extensions recomanades: ESLint, Prettier, Docker, Prisma

**Criteri d'acceptació:**
- `node -v`, `npm -v`, `docker -v`, `git --version` retornen versions correctes al terminal
- Docker Desktop arrenca sense errors

### INFRA-01 · Preparació de GitHub i eines locals
**Tipus:** Task | **Prioritat:** Highest | **Estimació:** 2h

**Descripció:**  
Configurar les eines locals i els repositoris de GitHub que serviran de base per a tot el projecte.

**Tasques seqüencials:**
1. Instal·lar i verificar versions de: Node.js (LTS), Docker Desktop, Git *(ja fet a INFRA-00)*
2. Crear compte a GitHub (si no existeix)
3. Configurar autenticació amb GitHub: crear un **Personal Access Token (PAT)** a GitHub → Settings → Developer Settings → Tokens. Usar el PAT com a password quan Git el demani en fer `git push`. *(alternativa més senzilla a SSH keys a Windows)*
4. Crear repositori `tfg-manual` a GitHub → inicialitzar amb `README.md` i `.gitignore` per a Node.js
5. Crear repositori `tfg-ia` a GitHub → inicialitzar amb `README.md` i `.gitignore` per a Node.js
6. Configurar les branques: `main` (producció) i `develop` (desenvolupament actiu)
7. Clonar ambdos repositoris en local

**Criteri d'acceptació:**
- Els dos repos existeixen a GitHub i estan clonats en local
- `git status` retorna net en ambdos
- PAT configurat i `git push` funciona sense demanar password repetidament

---

### INFRA-02 · Configuració de Jira i Clockify
**Tipus:** Task | **Prioritat:** High | **Estimació:** 1h

**Descripció:**  
Configurar les eines de tracking per poder mesurar el temps i les tasques des del primer moment.

**Tasques seqüencials:**
1. Crear projecte a Jira: `TFG-Manual` (board Scrum)
2. Crear projecte a Jira: `TFG-IA` (board Scrum)
3. Importar o crear manualment les tasques del Sprint 1 a ambdós projectes
4. Crear projectes a Clockify: `TFG-Manual` i `TFG-IA`
5. Configurar integració Jira ↔ Clockify (si disponible) o workflow manual
6. Iniciar tracking de temps **des d'ara**

**Criteri d'acceptació:**
- Jira té els dos projectes amb el Sprint 1 creat i les tasques importades
- Clockify mesura temps per projecte separat

---

## EPIC: INFRA-10 — Inicialització del Projecte Next.js

### INFRA-11 · Crear el projecte Next.js base
**Tipus:** Task | **Prioritat:** Highest | **Estimació:** 1h

**Descripció:**  
Inicialitzar l'aplicació Next.js amb la configuració correcta des del primer moment. Aquesta tasca es repeteix per als dos repositoris.

**Tasques seqüencials:**
1. Dins del directori del repo, executar `create-next-app` amb les opcions: TypeScript ✅, Tailwind CSS ✅, App Router ✅, ESLint ✅, `src/` directory ✅
2. Verificar que `npm run dev` arrenca correctament a `localhost:3000`
3. Eliminar el codi de demo d'exemple que genera Next.js (`page.tsx`, `globals.css` genèric)
4. Crear estructura de carpetes inicial:
   - `src/app/api/` — API Routes
   - `src/services/` — Lògica de negoci
   - `src/repositories/` — Accés a dades (Prisma)
   - `src/components/` — Components React
   - `src/lib/` — Utilitats i configuració
5. Fer el primer commit: `feat: initialize Next.js project structure`

**Criteri d'acceptació:**
- `npm run dev` → `localhost:3000` mostra pàgina en blanc sense errors
- Estructura de carpetes creada i commitejada

---

### INFRA-12 · Instal·lar i configurar dependències core
**Tipus:** Task | **Prioritat:** High | **Estimació:** 1h

**Descripció:**  
Instal·lar totes les dependències del projecte que s'usaran al llarg del desenvolupament.

**Paquets a instal·lar:**
- `prisma` + `@prisma/client` — ORM
- `next-auth` — Autenticació
- `@auth/prisma-adapter` — Adaptador Prisma per a NextAuth
- `shadcn/ui` — Component library (inicialització)
- `bcryptjs` + `@types/bcryptjs` — Hash de passwords (per si cal)
- `minio` — SDK de MinIO per a Node.js
- `zod` — Validació de dades (schemas)

**Tasques seqüencials:**
1. Instal·lar totes les dependències llistades
2. Inicialitzar Shadcn/UI (`npx shadcn init`) — seleccionar tema i configuració base
3. Instal·lar els primers components Shadcn necessaris: `button`, `input`, `card`, `table`
4. Verificar que `npm run dev` segueix funcionant
5. Commit: `feat: add core dependencies and initialize shadcn/ui`

**Criteri d'acceptació:**
- `npm install` sense errors
- `npm run dev` funciona
- `node_modules` existeix però NO s'ha commitejat (`.gitignore` correcte)

---

## EPIC: INFRA-20 — Configuració de Prisma i Base de Dades

### INFRA-21 · Inicialitzar Prisma i definir l'esquema inicial
**Tipus:** Task | **Prioritat:** Highest | **Estimació:** 2h

**Descripció:**  
Crear l'esquema de base de dades inicial amb les taules core del sistema. Prisma genera els tipus TypeScript automàticament.

**Tasques seqüencials:**
1. Executar `npx prisma init` → crea `prisma/schema.prisma` i `.env`
2. Configurar `DATABASE_URL` al `.env` apuntant a PostgreSQL (encara en local, sense Docker)
3. Definir les taules a `schema.prisma`:
   - `User` (id, email, password, role: ADMIN/MANAGER/VIEWER, createdAt)
   - `Session` (per a NextAuth adapter)
   - `Account` (per a NextAuth adapter)
   - `TipusDespesa` (id, nom, descripció, actiu)
   - `Proveidor` (id, nom, nif, actiu)
   - `Despesa` (id, concepte, import, data, fitxerKey, tipusDespesaId, proveïdorId, userId, createdAt)
4. Executar `npx prisma generate` → genera el client TypeScript
5. Commit: `feat: add prisma schema with initial tables`

**Criteri d'acceptació:**
- `npx prisma generate` sense errors
- Fitxer `schema.prisma` amb totes les taules i relacions definides
- `.env` afegit al `.gitignore` (mai es commiteja)
- `.env.example` creat amb les variables necessàries (sense valors reals)

---

## EPIC: INFRA-30 — Docker i Contenidors

### INFRA-31 · Crear el Dockerfile de l'aplicació Next.js
**Tipus:** Task | **Prioritat:** Highest | **Estimació:** 1.5h

**Descripció:**  
Crear el Dockerfile optimitzat per a producció de Next.js, seguint el patró multi-stage build per minimitzar la mida de la imatge final.

**Tasques seqüencials:**
1. Crear `Dockerfile` a l'arrel del projecte amb build multi-stage:
   - Stage 1 `deps`: instal·lar dependències
   - Stage 2 `builder`: compilar l'app
   - Stage 3 `runner`: imatge final mínima
2. Crear `.dockerignore` excloent: `node_modules`, `.next`, `.env`, `.git`
3. Construir la imatge localment (`docker build`) per verificar que no hi ha errors
4. Commit: `feat: add multi-stage Dockerfile for Next.js`

**Criteri d'acceptació:**
- `docker build` finalitza sense errors
- La imatge resultant pesa menys de 500MB
- `.dockerignore` correcte (no inclou secrets ni `node_modules`)

---

### INFRA-32 · Crear la configuració de Nginx
**Tipus:** Task | **Prioritat:** High | **Estimació:** 1h

**Descripció:**  
Configurar Nginx com a reverse proxy que redirigeixi el tràfic a Next.js i MinIO.

**Tasques seqüencials:**
1. Crear carpeta `nginx/` a l'arrel del projecte
2. Crear `nginx/nginx.conf` amb:
   - Bloc `server` escoltant al port 80
   - `location /` → proxy cap al contenidor `nextjs:3000`
   - `location /minio/` → proxy cap al contenidor `minio:9000` (per a la consola d'admin)
   - Headers de proxy correctes (`X-Real-IP`, `Host`, etc.)
3. Commit: `feat: add nginx reverse proxy configuration`

**Criteri d'acceptació:**
- Fitxer `nginx.conf` creat i versionat
- Configuració revisada sense errors de sintaxi

---

### INFRA-33 · Crear el `docker-compose.yml` principal
**Tipus:** Task | **Prioritat:** Highest | **Estimació:** 2h

**Descripció:**  
Muntar el fitxer `docker-compose.yml` que orquestra els 4 serveis del sistema i els connecta en una xarxa interna Docker.

**Serveis a definir:**

| Servei | Imatge | Port intern | Port extern (dev) |
|---|---|---|---|
| `nginx` | `nginx:alpine` | 80 | 80 |
| `nextjs` | (build local) | 3000 | — (via Nginx) |
| `postgres` | `postgres:16-alpine` | 5432 | 5432 (només dev) |
| `minio` | `minio/minio` | 9000 / 9001 | 9001 (consola admin) |

**Tasques seqüencials:**
1. Crear `docker-compose.yml` a l'arrel amb els 4 serveis
2. Definir la xarxa interna `app-network` (bridge) — tots els serveis en la mateixa xarxa
3. Configurar volums persistents: `postgres-data` i `minio-data`
4. Crear `.env.docker` amb les variables d'entorn dels contenidors:
   - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (credencials de la BD)
   - `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` (credencials de MinIO)
   - `NEXTAUTH_SECRET` (string aleatori per signar sessions)
   - `DATABASE_URL` (URL de connexió de Prisma: `postgresql://USER:PASS@postgres:5432/DB`)
5. Crear `docker-compose.override.yml` per a overrides de desenvolupament (ports exposats, hot-reload)
6. Afegir health checks als serveis de BD i MinIO
7. Commit: `feat: add docker-compose with all 4 services`

**Criteri d'acceptació:**
- `docker compose up -d` arrenca els 4 contenidors sense errors
- `docker compose ps` mostra tots amb status `healthy` o `running`
- Les variables sensibles estan en `.env.docker` (al `.gitignore`)

---

### INFRA-34 · Verificació de la comunicació entre serveis
**Tipus:** Task | **Prioritat:** Highest | **Estimació:** 1.5h

**Descripció:**  
Verificar que tots els serveis es comuniquen correctament dins la xarxa Docker interna.

**Tasques seqüencials:**
1. Verificar que Next.js pot arribar a PostgreSQL (Prisma connecta → `npx prisma migrate dev`)
2. Executar la primera migració de Prisma → les taules es creen a la BD
3. Verificar consola d'admin de MinIO a `localhost:9001` (login amb credencials configurades)
4. Crear un bucket `factures` a MinIO manualment via la consola
5. Verificar que Nginx redirigeix correctament a `localhost:80` → l'app de Next.js
6. Commit: `feat: verify all services communication + first prisma migration`

**Criteri d'acceptació:**
- `localhost:80` → mostra l'app Next.js
- `localhost:9001` → consola MinIO accessible
- `npx prisma studio` → mostra les taules creades amb les columnes correctes
- Log de Docker sense errors crítics

---

## EPIC: INFRA-40 — Configuració de NextAuth.js

### INFRA-41 · Configurar NextAuth.js amb sessions en BD
**Tipus:** Task | **Prioritat:** High | **Estimació:** 2h

**Descripció:**  
Configurar NextAuth.js v5 amb el provider de credencials (email + password) i el PostgreSQL Adapter perquè les sessions es guardin a la BD.

**Tasques seqüencials:**
1. Crear `src/lib/auth.ts` — configuració principal de NextAuth
2. Configurar el `PrismaAdapter` amb el client de Prisma
3. Configurar el `CredentialsProvider` amb validació email + password (bcrypt)
4. Crear `src/app/api/auth/[...nextauth]/route.ts` — route handler de NextAuth
5. Crear el middleware `src/middleware.ts` per protegir rutes (redirigir a login si no autenticat)
6. Crear una pàgina de login mínima funcional (sense disseny final)
7. Crear un script de seed: crear l'usuari admin inicial a la BD
8. Executar el seed i verificar login
9. Commit: `feat: configure NextAuth.js with database sessions`

**Criteri d'acceptació:**
- Login amb email + password funciona
- Sessió es guarda a la taula `Session` de la BD (verificable amb Prisma Studio)
- Rutes protegides redirigeixen a `/login` si no autenticat
- Usuari admin existent a la BD

---

## EPIC: INFRA-50 — Finalització i Documentació del Sprint

### INFRA-51 · Crear el `README.md` d'arrencada del projecte
**Tipus:** Task | **Prioritat:** Medium | **Estimació:** 1h

**Descripció:**  
Documentar com arrancar el projecte des de zero perquè qualsevol persona (o tu en el futur) pugui posar-lo en marxa en minuts.

**Contingut del README:**
- Prerequisits (Node.js, Docker Desktop)
- Variables d'entorn necessàries (amb referència a `.env.example`)
- Comandes: `docker compose up`, `npx prisma migrate dev`, seed inicial
- Com accedir a l'app, Prisma Studio i consola MinIO

**Criteri d'acceptació:**
- Seguint el README des de zero, el projecte arrenca sense cap pas addicional

---

### INFRA-52 · Sprint Review i retrospectiva
**Tipus:** Task | **Prioritat:** Medium | **Estimació:** 0.5h

**Descripció:**  
Tancar el sprint formalment, anotar mètriques i preparar el Sprint 2.

**Tasques seqüencials:**
1. Marcar totes les tasques com a Done a Jira
2. Anotar a Clockify el temps total invertit per `tfg-manual` i `tfg-ia`
3. Capturar screenshots de: `docker compose ps`, Prisma Studio, consola MinIO, pàgina de login
4. Anotar bloquejos o aprenentatges al Jira (camp de notes/retro)
5. Crear les primeres tasques del Sprint 2 (funcionalitat CRUD)

**Criteri d'acceptació:**
- Clockify mostra hores reals per cada repositori
- Sprint 1 tancat a Jira

---

## Resum de tasques i estimació

| ID | Tasca | Estimació |
|---|---|---|
| INFRA-01 | Preparació GitHub i eines locals | 2h |
| INFRA-02 | Configuració Jira i Clockify | 1h |
| INFRA-11 | Crear projecte Next.js base | 1h |
| INFRA-12 | Instal·lar dependències core | 1h |
| INFRA-21 | Inicialitzar Prisma i esquema inicial | 2h |
| INFRA-31 | Dockerfile de Next.js | 1.5h |
| INFRA-32 | Configuració Nginx | 1h |
| INFRA-33 | `docker-compose.yml` principal | 2h |
| INFRA-34 | Verificació de comunicació entre serveis | 1.5h |
| INFRA-41 | Configurar NextAuth.js | 2h |
| INFRA-51 | README d'arrencada | 1h |
| INFRA-52 | Sprint Review i retrospectiva | 0.5h |
| | **TOTAL estimat** | **~16.5h** |

> ⚠️ **Nota sobre la comparativa:** El Sprint 1 (setup i infraestructura) es fa **manualment per als dos repositoris** i **no forma part de la comparativa TFG**. És overhead de configuració idèntic en tots dos casos. La comparativa de temps i productivitat (Clockify + Jira) comença al **Sprint 2**, quan `tfg-manual` es desenvolupa sense IA i `tfg-ia` es desenvolupa amb l'agent com a co-pilot.
