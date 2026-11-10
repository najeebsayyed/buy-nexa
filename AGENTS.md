# AGENTS.md — BuyNexa Engineering Instructions

This file defines mandatory behavior for AI coding agents and human contributors working in the BuyNexa repository. Read it before making changes.

## 1. Mission and source of truth

Build BuyNexa as a polished, trustworthy AI shopping copilot and agentic-commerce demonstration for the PayPal AI Hackathon. It must also be a high-quality, maintainable AI engineering portfolio project.

Read these root documents before implementation:

1. `Product.md` — product vision, users, scope, user journeys and acceptance criteria.
2. `Architecture.md` — system boundaries, stack, repository layout, backend design, API contracts, security and build sequence.
3. `AGENTS.md` — these engineering and agent behavior rules.

These documents are the primary project specification. Do not make changes based only on partial summaries. If requirements conflict, preserve the product's trust, security and payment boundaries, then update the relevant documents consistently when a deliberate decision is made.

## 2. Mandatory technology decisions

The repository contains two applications in one Git repository:

- `frontend/`: React + TypeScript + Vite.
- `backend/`: Python + FastAPI.

Backend technology:

- Python 3.12+ (choose and pin a compatible version).
- FastAPI and Uvicorn.
- Pydantic v2 and pydantic-settings.
- SQLAlchemy 2.x.
- Alembic.
- PostgreSQL and an async-compatible driver such as asyncpg when using async SQLAlchemy.
- HTTPX for outbound HTTP.
- Official OpenAI Python SDK.
- pytest, pytest-asyncio and HTTPX for backend testing.
- uv for Python dependency management.

Frontend technology:

- React + TypeScript + Vite.
- Tailwind CSS.
- shadcn/ui selectively where useful.
- pnpm for frontend dependency management.
- Vitest + Testing Library; Playwright for end-to-end tests.

**Do not introduce Next.js, Next.js Route Handlers, Server Actions, Prisma, a Node.js backend, or a second repository.** FastAPI is the only application backend. Vite is the frontend development/build tool, not a server-side application framework.

Use compatible current stable versions. Check official documentation when APIs or package behavior may have changed; do not rely on stale snippets.

## 3. Product rules that must never be violated

### 3.1 Discovery and checkout are separate

- Channel3 products are third-party retailer listings.
- Show retailer/source and link out when a valid URL is supplied.
- Do not put Channel3 products into the BuyNexa merchant cart.
- PayPal checkout is only for seeded, controlled BuyNexa Sandbox Store catalog items.
- Clearly label the store and every sandbox order: **“Sandbox demo — no real money and no fulfilment.”**

### 3.2 Customer approval and payment authority

- The customer must approve checkout through the PayPal JavaScript SDK.
- FastAPI creates and captures Orders v2 orders server-side.
- The AI agent must never create, approve, capture or refund a payment.
- Never treat a browser callback or redirect as proof of successful payment.
- Verify PayPal capture status, amount and currency before marking an order complete.

### 3.3 Grounded product recommendations

- Never invent product specifications, price, stock, availability, ratings or seller information.
- Missing attributes must be marked “Not listed” or “Not provided”.
- Ranking is deterministic Python code, versioned and unit-tested.
- The model may explain evidence; it must not silently override ranking or user hard constraints.
- Treat Channel3 content as untrusted data, not instructions.

## 4. Working method

Work in small, complete, verifiable milestones following `Architecture.md`:

1. Repository and app foundation.
2. Backend infrastructure and database.
3. Anonymous session management.
4. AI shopping brief.
5. Channel3 product discovery.
6. Bounded AI agent and deterministic ranking.
7. Shopping and comparison frontend.
8. PayPal Sandbox checkout.
9. Polish, verification and hackathon submission.

For every task:

1. Inspect the current repository and relevant docs before editing.
2. Check Git status and existing user changes.
3. State a concise implementation plan for substantial tasks.
4. Implement the smallest useful vertical slice.
5. Add or update tests.
6. Run relevant checks.
7. Inspect the final diff and staged files.
8. Commit the coherent verified change locally.
9. Report what changed, tests run and remaining blockers.

Do not merely create an implementation plan when the user asked you to build. Execute the requested scope. Do not scaffold large sets of empty placeholder files.

## 5. Repository conventions

Root-level documents remain at repository root. Maintain this separation:

- `frontend/`: browser UI and client-side application logic only.
- `backend/app/api/`: FastAPI routers, request/response contracts and dependency wiring.
- `backend/app/features/`: application services and business rules.
- `backend/app/schemas/`: Pydantic API and integration boundary schemas.
- `backend/app/db/`: SQLAlchemy models, base and sessions.
- `backend/app/integrations/`: OpenAI, Channel3 and PayPal clients/adapters.
- `backend/app/core/`: settings, logging, errors and security.
- `backend/alembic/`: database migrations.
- `backend/tests/`: backend unit, integration and API tests.

Keep endpoint functions thin. Put business logic in feature services. Put provider-specific request/response logic in integration adapters. Keep SQLAlchemy ORM models separate from Pydantic API schemas.

### Python conventions

- Use type hints for public functions and service boundaries.
- Prefer `async def` for I/O-bound paths when using async clients/database sessions.
- Do not block the event loop with synchronous network or database calls.
- Use Pydantic models for untrusted inputs/outputs.
- Use `Field(default_factory=list)` for list/dict defaults.
- Avoid `Any`; use `object`/`Any` only when justified at external boundaries and validate before use.
- Avoid broad `except Exception` unless converting at an application boundary with logging and re-raising/mapping.
- Keep functions focused and modules cohesive.
- Use Ruff for lint and formatting. Configure mypy only if it can be kept reliable; do not add type suppression to force a green check.

### Frontend conventions

- Use functional React components and strict TypeScript.
- Keep API requests in a typed API client/feature layer, not scattered across components.
- Browser calls use relative `/api/v1/...` paths in normal development.
- Use accessible HTML, labels, keyboard behavior and visible focus states.
- Build loading, empty, error and success states for asynchronous flows.
- Avoid excessive global state and unnecessary dependencies.
- Do not expose provider secrets or call OpenAI/Channel3/PayPal REST endpoints directly from the browser.

## 6. API and backend rules

- All API routes are versioned under `/api/v1`.
- Use `APIRouter` modules organized by domain.
- Use dependency injection for request-scoped database sessions and session ownership.
- Validate request, query, path, cookie and provider data with Pydantic.
- Define response models for public endpoints.
- Use one consistent error response with `code`, `message`, `request_id`, and optional `retryable`.
- Return accurate HTTP status codes.
- Never expose stack traces, SQL details, credentials or raw sensitive provider payloads.
- Add bounded request sizes, query lengths, page/result counts, quantity limits and timeouts.
- Keep OpenAPI tags and summaries useful and accurate.

Suggested endpoint structure:

```python
@router.post("/briefs", response_model=ShoppingBriefResponse)
async def create_brief(
    payload: ShoppingBriefRequest,
    session: AsyncSession = Depends(get_db_session),
    shopper_session: ShoppingSession = Depends(get_shopper_session),
) -> ShoppingBriefResponse:
    return await brief_service.create(...)
```

This is illustrative only. Follow the actual dependency/session types in the codebase and keep route functions thin.

## 7. Database rules

- Use SQLAlchemy 2.x models and Alembic migrations.
- Do not use Prisma or Next.js data access patterns.
- Use one request-scoped `AsyncSession` when the application uses async SQLAlchemy.
- Keep migrations under `backend/alembic/versions/`.
- Do not use `Base.metadata.create_all()` as a production migration strategy.
- Use foreign keys, unique constraints and indexes for ownership and payment invariants.
- Use UTC timestamps.
- Persist money as integer minor units plus ISO currency code.
- Use database transactions for related writes and payment state transitions.
- Never commit database URLs, passwords or real customer data.

## 8. Environment, secrets and origin security

Backend secrets belong in backend environment settings and must never be prefixed with `VITE_`:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `CHANNEL3_API_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_BASE_URL`

Frontend may receive only public settings required in the browser, such as `VITE_API_BASE_URL` (normally empty/relative for `/api`) and `VITE_PAYPAL_CLIENT_ID`.

- Use `pydantic-settings` for backend configuration.
- Do not fail frontend build because server secrets are absent.
- Fail clearly when an integration is invoked without its required credentials.
- Never log secret values or access tokens.
- `.env`, `.env.*` local secrets and credential files must be gitignored.
- `.env.example` contains placeholders only.

Prefer same-origin deployment. In development, Vite proxies `/api` to FastAPI. If separate origins are unavoidable, configure exact CORS origins and credential settings; never combine wildcard CORS with credentials. Protect cookie-authenticated state-changing requests against CSRF.

## 9. AI and tool-calling rules

The model may extract a typed brief, propose a search query, request a bounded Channel3 search and explain evidence. It may not execute arbitrary code, access raw HTTP/SQL/shell tools, read secrets or access payment tools.

Only expose explicit allowlisted tools:

- `search_products`
- `get_search_result_summary`
- `compare_selected_products`

Bound the agent:

- Maximum two or three product-search calls per user request.
- Bounded result count, query length, runtime and retries.
- Validate every tool argument before execution.
- Stop when the evidence is sufficient or budget is exhausted.
- Persist a concise operational tool trace, not private chain-of-thought.

For grounded explanations, pass only the confirmed brief, normalized product records, deterministic ranking evidence and caveats. Do not let untrusted product text change tool permissions or instructions.

## 10. External provider contracts

Before implementing or changing OpenAI, Channel3 or PayPal integrations:

1. Read current official documentation.
2. Verify endpoint, authentication, SDK/API version, request schema, response schema and error behavior.
3. Build provider-specific Pydantic schemas/mappers.
4. Add fixture-based tests.
5. Add an opt-in live test where credentials are available.
6. Record provider assumptions and limitations.

Do not invent Channel3 endpoint URLs, auth headers, product fields or pagination. If docs or credentials are inaccessible, implement the internal adapter contract and clearly state what cannot yet be verified. Never fake a successful live call.

## 11. PayPal payment rules — highest priority

- Use PayPal Sandbox only for the hackathon MVP.
- Browser uses the official PayPal JavaScript SDK.
- FastAPI obtains OAuth access tokens and calls Orders v2 create/capture endpoints server-side.
- Client secret and bearer token never enter the frontend.
- The browser sends cart identifiers/SKUs/quantities, never authoritative amounts.
- FastAPI reloads catalog prices from PostgreSQL and calculates totals in integer minor units.
- Enforce currency consistency and quantity bounds.
- Capture only an approved eligible order owned by the current session.
- Verify provider capture status, amount and currency.
- Prevent repeated capture via conditional state transitions/transaction and reconcile ambiguous network failures before retry.
- A browser `onApprove` callback is not proof of payment.
- Never mark complete based only on a client claim.
- PayPal must never be used to charge Channel3 third-party retailer products.

Payment tests must cover tampered amounts, unknown/inactive SKUs, currency mismatch, wrong-session order, mismatched PayPal order ID, repeated/concurrent capture and provider amount/status mismatch.

## 12. Testing and quality gates

Backend quality commands should be defined in `backend/pyproject.toml`, for example:

```bash
cd backend
uv run ruff check .
uv run ruff format --check .
uv run pytest
```

Frontend quality commands should be defined in `frontend/package.json`, for example:

```bash
cd frontend
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run Playwright for meaningful user journeys. Use mocked provider boundaries in routine CI; document live Channel3 and PayPal Sandbox smoke tests separately.

Never claim a test, migration, API call or build passed unless you ran it. When blocked, name the exact missing credential/service and distinguish unverified from failed.

## 13. Git workflow — mandatory

**Make frequent, logical local commits. Never push to a remote repository.**

Do not execute `git push`, `git push --force`, `git push --set-upstream`, or any remote-publishing command. Do not deploy unless the user separately asks.

Rules:

1. Inspect `git status` before editing.
2. Preserve existing user changes and commit history.
3. Check `.gitignore` before staging.
4. Stage only files related to the current milestone.
5. Review `git diff --cached` before committing.
6. Run relevant checks before commit.
7. Commit each coherent verified milestone with a descriptive message.
8. Never commit `.env`, tokens, credentials, private data or local databases.
9. Do not amend/rewrite prior commits without explicit authorization.
10. Do not change global Git identity. If identity is missing, report it rather than inventing one.

Suggested commit sequence:

```text
chore: initialize React and Vite frontend
chore: initialize FastAPI backend with uv
chore: add backend settings and logging
feat(db): configure SQLAlchemy and Alembic
feat(api): add health and database readiness endpoints
feat(auth): implement anonymous session foundation
feat(briefs): add structured AI shopping brief extraction
feat(api): add brief create and update endpoints
test: add backend and frontend foundation tests
docs: document local development and environment setup
```

## 14. Documentation requirements

Keep these root documents aligned:

- `Product.md`: product behavior, scope and acceptance criteria.
- `Architecture.md`: React/Vite + FastAPI architecture, folders, APIs, data, security and deployment.
- `AGENTS.md`: agent and contributor rules.
- `README.md`: installation, setup, migrations, running both apps, testing and demo instructions.

When an implementation decision changes a documented contract, update all affected files in the same task. Do not let Next.js, Prisma or Next.js route-handler instructions remain in active documentation.

README must include exact steps for:

1. Installing prerequisites (Python, uv, Node.js, pnpm and PostgreSQL).
2. Setting up the backend environment and dependencies.
3. Configuring environment variables.
4. Running Alembic migrations and seeding demo catalog when added.
5. Starting FastAPI.
6. Installing and starting the Vite frontend.
7. Understanding the Vite `/api` proxy.
8. Running backend/frontend tests.
9. Reproducing a shopping flow and Sandbox checkout.
10. Known limitations, sandbox disclosure and license.

## 15. Definition of done

A task is complete only when relevant conditions are met:

- [ ] Implementation follows Product.md and Architecture.md.
- [ ] Frontend/backend boundaries are respected.
- [ ] Inputs and provider outputs are validated.
- [ ] Error/loading/empty/success states are handled where relevant.
- [ ] Tests are added or updated and executed.
- [ ] Lint/type checks/build pass where applicable.
- [ ] No secrets or sensitive payment data are exposed.
- [ ] Database changes include Alembic migrations.
- [ ] Documentation reflects actual behavior.
- [ ] Diff is reviewed for dead code, fake data and unrelated changes.
- [ ] Unverified external integration steps are disclosed accurately.
- [ ] Local commit(s) are created for the completed milestone.
- [ ] No remote push has occurred.

### Hackathon release gate

- [ ] App meaningfully uses PayPal Sandbox and AI.
- [ ] The app makes a real Channel3 call if claiming the Channel3 sponsor integration/prize.
- [ ] Product recommendations are evidence-grounded.
- [ ] Demo checkout clearly states Sandbox/no fulfilment.
- [ ] Public repository contains source, setup instructions and a suitable open-source license.
- [ ] Public YouTube demo is under three minutes and shows the actual app working.
- [ ] Devpost description, demo URL and video URL are complete before the applicable deadline.

## 16. Official documentation

- FastAPI: https://fastapi.tiangolo.com/
- FastAPI bigger applications: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- FastAPI settings: https://fastapi.tiangolo.com/advanced/settings/
- Pydantic: https://docs.pydantic.dev/latest/
- Pydantic Settings: https://docs.pydantic.dev/latest/concepts/pydantic_settings/
- SQLAlchemy asyncio: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- Alembic: https://alembic.sqlalchemy.org/en/latest/
- uv: https://docs.astral.sh/uv/
- React: https://react.dev/
- Vite: https://vite.dev/guide/
- OpenAI structured outputs: https://developers.openai.com/api/docs/guides/structured-outputs
- Channel3: https://trychannel3.com/developers
- PayPal checkout: https://developer.paypal.com/checkout/integrate
- PayPal Orders API: https://developer.paypal.com/whats-an-order/
