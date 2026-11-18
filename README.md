# L & K — Pharmaceutical Distribution Platform

A responsive, high-performance, and regulatory-compliant B2B pharmaceutical distribution website built for two independent distributors under the master **L & K Group** brand:

1. **Lakshmi Pharma** (Teal / Emerald accent) — Ethical formulations, essential generics, and community healthcare supply serving 1,400+ pharmacies across South India.
2. **The Kothottil Pharmaceutical Distributor** (Royal Blue accent) — Specialty therapeutics, oncology, diabetology, and cold-chain institutional critical care logistics.

---

## Key Highlights & Architecture

### 1. Two Companies, One Integrated Website
- **Flipkart-Style Dual Switcher in Header Navbar**: Segmented pill toggle allowing users to switch seamlessly between **Lakshmi Pharma** and **The Kothottil Pharma** with company-specific active color badges.
- **Company-Scoped Routes**:
  - `/[companySlug]` — Company overview, logistics highlights, and authorized manufacturers banner
  - `/[companySlug]/products` — Advanced composition-based search catalog
  - `/[companySlug]/products/[productSlug]` — Text-only technical specifications & "Products with matching composition"
  - `/[companySlug]/manufacturers` — Authorized principal manufacturers directory with logos and text badges
  - `/[companySlug]/about` — Company profile, service coverage, and Good Distribution Practice compliance
  - `/[companySlug]/contact` — Direct commercial trade desk, telephone, email, WhatsApp, and B2B inquiry form
- **Strict Catalog Isolation**: Formulations published for one company never leak into the other. For example, *Calpol 650* is listed exclusively in Lakshmi Pharma's catalog, while *Glycomet 500 SR* is listed exclusively in Kothottil Pharma's catalog.

### 2. Composition-Based Product Search (Primary Feature)
- Search across:
  - **Brand / Product Name** (e.g., `Dolo`, `Calpol`, `Augmentin`)
  - **Canonical Active Ingredients** (e.g., `Paracetamol`, `Amoxicillin`, `Clavulanic Acid`)
  - **Ingredient Aliases / Synonyms** (e.g., searching `acetaminophen` matches `Paracetamol` formulations through synonym mapping)
  - **Strength & Units** (e.g., `650`, `650 mg`, `500 mg`)
  - **Authorized Manufacturers** (e.g., `Micro Labs`, `GSK`, `Cipla`)
- **Non-Deduplication Guarantee**: Multiple products sharing identical compositions (such as *Dolo 650* and *Calpol 650*, both containing Paracetamol 650 mg) are maintained as separate products with their distinct manufacturers and packaging.
- **Multi-Ingredient Support**: Multi-active formulations (e.g., *Augmentin 625 Duo* containing 500 mg Amoxicillin + 125 mg Clavulanic Acid, and *Rhinex Cold*) are matched regardless of query term order.
- **Exact Matches Ranked First**: High-scoring exact composition and strength matches are prioritized before broader partial matches.
- **Match Reason Badges**: Shows why a result was returned (e.g., `Alias Match: "acetaminophen" -> Paracetamol 650 mg`, `Exact Brand Match: Dolo 650`).

### 3. Products with Matching Composition Section
- On individual product detail pages, a dedicated section lists other branded products listed by the same distributor that have matching ingredients, strengths, and dosage forms (excluding the current product).
- **Medical & Regulatory Notice**: Displays a mandatory notice: *"Information for catalog reference only. Do not describe matching compositions as automatically interchangeable medicines or recommend substitutions."*

### 4. Zero Product Images (Strict Compliance)
- **No Product Images**: No product image fields, no file uploads for medicines, no image placeholders, and no image galleries on product pages.
- **Manufacturer Logos Only**: Authorized manufacturer logos (Cipla, Micro Labs, Rhine Biopharm, Sun Pharma, GlaxoSmithKline) with clean text badges for manufacturers without an authorized logo asset.

### 5. Multi-Tier Administration & Role-Based Security
- **Super Administrator** (`superadmin@lkpharma.demo`): Can manage both companies, edit shared product master records, add canonical ingredients & aliases, and manage manufacturer partnerships.
- **Company Administrators** (`admin@lakshmipharma.demo` & `admin@kothottilpharma.demo`): Scoped strictly to their assigned company’s profile, catalog publish/featured toggles, and incoming trade inquiries.

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend API**: Express.js, TypeScript, CORS, Helmet, express-rate-limit, Multer (logo-only uploads), Zod validation, JWT authentication, bcryptjs
- **Database**: Prisma ORM, provisionally configured for PostgreSQL (Neon Serverless Postgres recommended provider) with local SQLite compatibility for instant zero-dependency execution.

---

## Directory Structure

```text
pharma-distributors/
├── apps/
│   ├── web/                    # Next.js 14 Frontend Application
│   │   ├── src/
│   │   │   ├── app/            # App Router pages and layouts
│   │   │   │   ├── [companySlug]/ # Company-scoped routes (products, about, contact, etc.)
│   │   │   │   ├── admin/      # Admin dashboard and login
│   │   │   │   ├── layout.tsx  # Root HTML layout with SEO metadata
│   │   │   │   └── page.tsx    # L & K Master Gateway page
│   │   │   ├── components/     # UI components (Header, TopBar, Footer, ProductTable, SearchBar, etc.)
│   │   │   ├── lib/            # API client communication layer
│   │   │   └── types/          # TypeScript interface definitions
│   │   └── public/logos/       # Authorized manufacturer SVG logos
│   └── api/                    # Express.js REST API
│       ├── src/
│       │   ├── middleware/     # Auth, error handling, rate limiting
│       │   ├── routes/         # Companies, Products, Inquiries, Admin, Auth
│       │   ├── utils/          # Composition search engine & matching composition finder
│       │   └── index.ts        # Express server entry point
├── packages/
│   └── database/               # Prisma Database Layer
│       ├── prisma/
│       │   ├── schema.prisma   # PostgreSQL Schema (Neon Cloud Postgres)
│       │   ├── schema.sqlite.prisma # Local SQLite Fallback Schema
│       │   └── seed.ts         # Comprehensive pharmaceutical seed data
│       └── src/index.ts        # PrismaClient singleton export
├── test-acceptance.ts          # Automated acceptance test suite (15 checks)
├── verify-endpoints.ts         # End-to-end API & Web verification script
├── .env.example                # Configuration template
└── package.json                # Monorepo workspaces configuration
```

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js v18+ (tested on Node v22.17.0)
- npm v9+

### 2. Installation
```bash
npm install
```

### 3. Database Initialization & Seeding
For local development:
```bash
# Push schema and generate Prisma client
npm run push:sqlite --workspace=@lk/database

# Seed demo data (companies, manufacturers, ingredients, products, admin users)
npm run seed --workspace=@lk/database

# Build database package types
npm run build --workspace=@lk/database

# Open Prisma Studio visual database browser (http://localhost:5555)
npm run db:studio
```

To configure with **Neon Serverless Postgres**:
1. Copy `.env.example` to `.env`.
2. Set your Neon database connection string in `.env`:
   ```bash
   DATABASE_URL="postgresql://neondb_owner:npg_password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
3. Run Prisma migration:
   ```bash
   npm run push --workspace=@lk/database
   npm run seed --workspace=@lk/database
   ```

### 4. Running the Development Servers
In two separate terminals:
```bash
# Terminal 1: Express REST API (runs on port 5000)
npm run dev:api

# Terminal 2: Next.js Frontend (runs on port 3000)
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Acceptance Suite

An automated test suite validates all 9 acceptance criteria specified in the prompt:

```bash
npx tsx test-acceptance.ts
```

### Verified Test Results:
1. `[PASS]` Companies exist in database (Lakshmi Pharma & The Kothottil Pharma)
2. `[PASS]` Catalog scoping: *Calpol 650* is listed in Lakshmi Pharma but NEVER leaks into Kothottil Pharma
3. `[PASS]` Catalog isolation: *Glycomet 500 SR* is listed exclusively in Kothottil Pharma
4. `[PASS]` Acceptance fixture: Searching `paracetamol` returns both *Dolo 650* and *Calpol 650*
5. `[PASS]` Ingredient alias resolution: Searching `acetaminophen` returns *Dolo 650* and *Calpol 650*
6. `[PASS]` Strength matching: Searching `paracetamol 650 mg` returns both matching products
7. `[PASS]` Brand query: Searching `Dolo` returns only *Dolo 650*
8. `[PASS]` Non-deduplication: *Dolo 650* and *Calpol 650* are separate products with distinct manufacturers (Micro Labs vs GlaxoSmithKline)
9. `[PASS]` Filter narrowing: Applying manufacturer filter (`micro-labs`) narrows matches to *Dolo 650* without changing query
10. `[PASS]` Multi-ingredient matching: Searching `amoxicillin clavulanic` finds *Augmentin 625 Duo*
11. `[PASS]` Structured composition: *Augmentin 625 Duo* stores Amoxicillin 500 mg + Clavulanic Acid 125 mg
12. `[PASS]` Matching composition section: *Calpol 650* is listed on *Dolo 650* page with manufacturer GlaxoSmithKline (excluding Dolo 650 itself)
13. `[PASS]` Equivalence disclaimer: Clear medical disclaimer against automatic substitution
14. `[PASS]` Inquiries isolation: Inquiries save strictly to the designated company
15. `[PASS]` Absence of product images: Zero ProductImage models or product image attributes exist across models and schemas

---

## Pre-Configured Administrator Credentials

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Super Administrator** | `superadmin@lkpharma.demo` | `SuperAdmin@2026` | Both companies, shared product master, ingredients & aliases, manufacturers |
| **Lakshmi Pharma Admin** | `admin@lakshmipharma.demo` | `Lakshmi@2026` | Lakshmi Pharma profile, catalog listing toggles, incoming inquiries |
| **The Kothottil Pharma Admin** | `admin@kothottilpharma.demo` | `Kothottil@2026` | Kothottil Pharma profile, catalog listing toggles, incoming inquiries |

Demo login quick-autofill buttons are available directly on the login page at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
