# BuyNexa

> **AI Shopping Copilot & Agentic Commerce Experience**  
> Built for the PayPal AI Hackathon 2026.

BuyNexa helps people make better online shopping decisions when they know what they need but do not know which product to buy. A shopper describes a goal in everyday language; BuyNexa turns it into a structured shopping brief, searches real product data through Channel3, compares relevant options against the shopper's criteria, and explains trade-offs using evidence from product records.

The product also demonstrates a complete PayPal Sandbox payment journey through a separate, clearly labelled BuyNexa Sandbox Store demo catalog.

---

## Architecture Overview

BuyNexa is structured as a modular single-repository containing two applications:

- **`frontend/`**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons.
- **`backend/`**: Python 3.12 + FastAPI + async SQLAlchemy 2.x + Pydantic v2 + Alembic + OpenAI Python SDK.

```mermaid
flowchart TD
    Shopper[Shopper / Browser] -->|Vite Proxy /api| API[FastAPI Backend]
    API --> Services[Domain Services]
    Services --> DB[(PostgreSQL)]
    Services --> AI[OpenAI Client Adapter]
    Services --> C3[Channel3 Adapter (Phase 2)]
    Services --> PP[PayPal Server Adapter (Phase 3)]
    AI --> OpenAI[OpenAI API (GPT-4o-mini)]
```

### Trust & Security Boundaries

1. **Anonymous Sessions**: Shoppers are issued cryptographically secure opaque tokens via `HttpOnly`, `SameSite=Lax` cookies. The server persists only SHA-256 hashes in the database.
2. **Discovery vs. Checkout**: Channel3 products are external retailer listings that link out to third-party stores. PayPal checkout is exclusively for controlled BuyNexa Sandbox Store demo items.
3. **Evidence-Grounded AI**: The AI extracts structured intent (`ShoppingBrief`) and summarizes factual product evidence. The model never sets prices, approves payments, or captures orders.

---

## Repository Structure

```text
buy-nexa/
├── frontend/                     # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── lib/                  # Reusable typed API client
│   │   ├── test/                 # Test setup and mocks
│   │   ├── App.tsx               # Application shell & status view
│   │   └── main.tsx              # Application mount
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts            # Configured with /api proxy to FastAPI (port 8000)
│   └── vitest.config.ts
├── backend/                      # Python + FastAPI backend
│   ├── alembic/                  # Versioned database migrations
│   │   ├── versions/
│   │   │   └── 0001_initial_sessions_and_briefs.py
│   │   └── env.py
│   ├── app/
│   │   ├── api/                  # Dependencies and versioned endpoints
│   │   │   ├── deps.py           # Database and session injection
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── health.py # /api/v1/health/live & /api/v1/health/ready
│   │   │       │   └── briefs.py # /api/v1/briefs (POST, PATCH)
│   │   │       └── router.py
│   │   ├── core/                 # Centralized configuration, logging, errors, security
│   │   │   ├── config.py         # Pydantic Settings
│   │   │   ├── logging.py        # JSON structured logging with redaction
│   │   │   ├── errors.py         # Standard error handling and exceptions
│   │   │   └── security.py       # Session token generation and hashing
│   │   ├── db/                   # SQLAlchemy engine, session, and declarative models
│   │   │   ├── models/           # ShoppingSession and ShoppingBrief models
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── features/             # Business feature services and repositories
│   │   │   └── briefs/
│   │   ├── integrations/         # External provider adapters
│   │   │   └── openai/           # OpenAI client with structured output extraction
│   │   ├── schemas/              # Pydantic API boundary schemas
│   │   └── main.py               # FastAPI entrypoint, middleware, exception handlers
│   ├── tests/                    # Unit, integration, and API tests
│   │   ├── api/
│   │   ├── integration/
│   │   └── unit/
│   ├── pyproject.toml
│   ├── uv.lock
│   └── alembic.ini
├── .env.example                  # Environment configuration template
├── .gitignore
├── AGENTS.md                     # Engineering and contributor guidelines
├── Architecture.md               # Detailed system architecture document
├── Product.md                    # Product specification document
└── LICENSE                       # MIT License
```

---

## Prerequisites

- **Python 3.12+** (managed via `uv`)
- **uv** (`>= 0.12.0`)
- **Node.js** (`>= 20.0.0`)
- **pnpm** (`>= 9.0.0`)
- **PostgreSQL** (`>= 15.0`) for live database persistence (in-memory SQLite is used automatically in tests)

---

## Getting Started

### 1. Environment Configuration

Copy the example environment configuration into `.env` at the project root:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
APP_NAME=BuyNexa
APP_ENV=development
API_V1_PREFIX=/api/v1

FRONTEND_ORIGIN=http://localhost:5173

# PostgreSQL connection string
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/buynexa

# OpenAI API Key (required for live brief extraction)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# Channel3 (Phase 2)
CHANNEL3_API_KEY=

# PayPal Orders v2 Sandbox (Phase 3)
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# Anonymous Session
SESSION_COOKIE_NAME=buynexa_session
SESSION_COOKIE_SECURE=false
SESSION_MAX_AGE_DAYS=30
```

---

### 2. Backend Setup & Local Server

Navigate to the `backend/` directory:

```bash
cd backend
```

Install pinned dependencies using `uv`:

```bash
uv sync
```

Run database migrations against PostgreSQL:

```bash
uv run alembic upgrade head
```

Start the FastAPI development server with hot-reload:

```bash
uv run fastapi dev app/main.py --port 8000
```

The interactive API documentation is accessible at:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### 3. Frontend Setup & Local Server

In a separate terminal, navigate to the `frontend/` directory:

```bash
cd frontend
```

Install frontend dependencies using `pnpm`:

```bash
pnpm install
```

Start the Vite development server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.  
Vite's proxy forwards `/api` requests to `http://127.0.0.1:8000` automatically, preserving same-origin session cookies.

---

## Running Tests & Quality Checks

### Backend Quality Suite

```bash
cd backend

# Run Ruff linter
uv run ruff check .

# Check Ruff formatting
uv run ruff format --check .

# Run all automated tests (unit, integration, and API tests)
uv run pytest -v
```

### Frontend Quality Suite

```bash
cd frontend

# Run TypeScript type check
pnpm typecheck

# Run Oxlint / ESLint
pnpm lint

# Run Vitest component tests
pnpm test

# Build production bundle
pnpm build
```

---

## Implemented API Endpoints (Phase 1)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health/live` | Process liveness monitoring |
| `GET` | `/api/v1/health/ready` | Database readiness check |
| `POST` | `/api/v1/briefs` | Extracts shopper intent via OpenAI and persists `ShoppingBrief` with anonymous session cookie |
| `PATCH` | `/api/v1/briefs/{brief_id}` | Updates user-confirmed brief criteria with session ownership verification |

---

## Sandbox Demo Disclosure

PayPal checkout in BuyNexa is exclusively for demonstration purposes using seeded demo catalog items in the PayPal Sandbox environment. No real money is transferred and no real goods are fulfilled. External Channel3 retailer listings link directly to third-party stores.

---

## License

This project is licensed under the [MIT License](LICENSE).
