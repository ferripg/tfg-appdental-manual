# ARQUITECTURA.md — TFG: App de Gestió de Factures per a Clínica Dental

> **Estat:** En definició activa  
> **Última actualització:** 2026-03-26  
> **Autor:** Ferran Paredes  
> **Rol de suport:** Tech Lead / Consultor d'Arquitectura (IA)

---

## 1. Visió General del Projecte

**Nom provisional:** DentaBooks (o el que es decideixi)  
**Tipus d'aplicació:** Web app de gestió interna (back-office)  
**Client real:** Clínica dental  
**Propòsit:** Gestionar factures i despeses de la clínica, amb informes, dashboards i automatització d'entrada de documents via IA.

---

## 2. Decisions d'Arquitectura (en construcció)

### 2.1 Tipologia d'aplicació
| Decisió | Valor | Raó |
|---|---|---|
| Tipologia | Back-office intern (Opció A) | Ús exclusiu de la clínica, 2-3 usuaris màxim, sense multi-tenant ni portals externs |
| Plataforma | Web responsive (no app nativa) | Ús principal des d'escriptori; disseny adaptatiu per a consultes puntuals des del mòbil. Cap PWA ni app nativa. |
| Arquitectura backend | Next.js Full-Stack (monòlit justificat) | Back-office d'un sol client, 2-3 usuaris. Monòlit ben estructurat per capes internes (Routes → Services → Repositories). Eliminació de Spring/NestJS per reduir complexitat i maximitzar efectivitat de la IA. |
| Base de dades | PostgreSQL en contenidor Docker | Solució professional i autogestionada. Sense Supabase BaaS. Control total de l'esquema. |
| Autenticació | NextAuth.js v5 + PostgreSQL Adapter | Sessions en BD (stateful): revocació instantània, seguretat per a dades financeres, flux complet demostrable al tribunal. Cookies httpOnly. |
| ORM | Prisma | Capa d'abstracció entre Node.js i PostgreSQL. Esquema tipat, migracions gestionades, Prisma Studio per a inspecció visual. Estàndard de la indústria en l'ecosistema Next.js/TS. |

---

## 3. Stack Tecnològic i Llibreries Core

A continuació es detalla l'ecosistema i les llibreries core que componen l'arquitectura del projecte, degudament categoritzades per facilitar-ne la documentació al TFG:

### 3.1 Framework & Infraestructura
- **Next.js 15 (React 19) + TypeScript:** Framework Full-Stack utilitzat per construir front-end (Rutes de client) i back-end (API Routes i Server Actions).
- **Docker & Docker Compose:** Contenidorització unificada (creant instàncies aïllades per a PostgreSQL, MinIO i l'aplicació Next.js) per evitar configuracions complexes als entorns host.
- **Automatització IA (Futur):** Script de Python que farà de microservei per extraure dades dels PDFs via un Model de Visió IA.

### 3.2 Dades & Emmagatzematge
- **PostgreSQL:** Sistema Gestor de Base de Dades (SGBD) relacional seleccionat.
- **Prisma (`prisma`, `@prisma/client`):** Eina d'abstracció (ORM) per modelar taules, aplicar migracions i construir les consultes SQL des de Next.js de forma estricta (Type-Safe).
- **MinIO SDK (`minio`):** Llibreria utilitzada pel Backend per transferir arxius al servidor MinIO autogestionat, utilitzant un protocol compatible amb S3.

### 3.3 Seguretat & Autenticació
- **NextAuth.js v5 (`next-auth`, `@auth/prisma-adapter`):** Eina central delegada de tota l'autenticació. L'adaptador de Prisma permet vincular-lo directament al motor de PostgreSQL per guardar la persistència (Sessions segures).
- **Bcrypt (`bcryptjs`, `@types/bcryptjs`):** Eina de *hashing* encarregada d'encriptar les contrasenyes dels usuaris al registrar-se per garantir l'anonimització completa a la taula d'usuaris.

### 3.4 Frontend, Disseny UI & Validacions
- **Tailwind CSS + Shadcn/UI:** Sistema de disseny base i llibreria de components visuals reutilitzables respectivament, clau per a construir interfícies "Back-office" pures i endreçades.
- **Zod (`zod`):** Llibreria de validació d'esquemes per defensar la integritat de les dades dels formularis (p. ex: correus ben formats) i sanititzar la informació abans que toqui la Base de Dades.

---

## 4. Mòduls Funcionals Identificats (preliminar)

### Rols d'usuari
| Rol | Permisos |
|---|---|
| `ADMIN` | Permisos totals: gestió d'usuaris, configuració del sistema, tot el CRUD |
| `MANAGER` | Permisos operatius: crear/editar/esborrar despeses i factures, gestionar taules mestre (tipus despesa, proveïdors) |
| `VIEWER` | Lectura i consulta de dades. Sense capacitat d'edició |

### Mòduls per MVP
- [ ] **M1** Autenticació i gestió de rols (ADMIN / MANAGER / VIEWER)
- [ ] **M2** CRUD de despeses/factures (camps: proveidor, import, data, categoria, fitxer)
- [ ] **M3** Taules mestre: tipus de despesa i proveïdors (creació/edició per ADMIN i MANAGER)
- [ ] **M4** Repositori de fitxers: pujada de PDF/imatge a MinIO, visualització via presigned URL
- [ ] **M5** Informes i dashboard: gràfics de despeses per categoria, per mes, comparatives
- [ ] **M6** *(Opcional / post-MVP)* Automatització: script Python + visió IA per extreure dades de factures

---

## 5. Metodologia i Eines de Treball

- **Control de versions:** Git + GitHub
- **Gestió de tasques:** Jira
- **Control de temps:** Clockify (per generar mètriques objectives del TFG)
- **Metodologia:** Agile (Sprints)
- **Entorn agèntic:** Google Antigravity (models Claude / Gemini)
- **Doble MVP:** Desenvolupament manual vs. assistit per IA (per comparar rendiments)

---

## 6. Preguntes Obertes / Decisions Pendents

1. ✅ Plataforma: Web responsive (principalment escriptori, mòbil secundari, sense app nativa)
2. ✅ Backend: Next.js Full-Stack. Estructura interna per capes: `/app/api` (transport) → `/services` (lògica de negoci) → `/repositories` (accés a dades)
3. ✅ Base de dades: PostgreSQL en contenidor Docker (autogestionat, sense Supabase)
4. ✅ Autenticació: NextAuth.js v5 + PostgreSQL Adapter. Estratègia: Sessions en BD + cookies httpOnly. Gestió de rols a la taula `users`.
5. ✅ ORM: Prisma (capa d'abstracció sobre PostgreSQL, tipat automàtic, migracions i Prisma Studio inclosos)
6. ✅ Repositori de fitxers: MinIO (S3-compatible, self-hosted). La BD guarda el `fitxer_key`, MinIO serveix presigned URLs.
7. ✅ Automatització: Descartada n8n. Script Python + Model de visió IA (feature opcional, condicional al temps disponible). Recomanació del tutor.
8. ✅ Domíni i SSL: Desenvolupament local (`localhost`), desplegament a VPS + Let's Encrypt + Certbot en fase final.
9. ✅ Estratègia doble MVP: Dos repositoris GitHub independents (`tfg-manual` i `tfg-ia`), cada un amb el seu Docker Compose complet. Mètriques de temps per repo via Clockify.
