# BuyNexa — Product Specification

> **Product:** BuyNexa  
> **Category:** AI shopping copilot and agentic-commerce experience  
> **Hackathon:** PayPal AI Hackathon 2026  
> **Build model:** Solo developer; one repository containing a React/Vite frontend and a FastAPI backend  
> **Document status:** MVP product brief and delivery contract  
> **Last updated:** 10 November 2026

---

## 1. Product summary

BuyNexa helps people make better online shopping decisions when they know what they need but do not know which product to buy. A shopper describes a goal in everyday language; BuyNexa turns it into a structured shopping brief, searches real product data through Channel3, compares relevant options against the shopper's criteria, and explains trade-offs using evidence from product records.

BuyNexa is designed around a controlled shopping-agent loop:

1. **Understand** the shopper's intent, constraints and preferences.
2. **Search** real product data through a server-controlled Channel3 integration.
3. **Evaluate** candidates against the shopper's criteria.
4. **Explain** the strongest options, their evidence and their unknowns.
5. **Hand control back** to the shopper for the purchase decision.

The product also demonstrates a complete PayPal Sandbox payment journey through a separate, clearly labelled BuyNexa demo catalog. This makes the PayPal integration real and testable without implying that BuyNexa is authorized to collect money for products sold by unrelated retailers.

**Product promise:** “Tell BuyNexa what matters. Compare with confidence. Stay in control when you pay.”

### One-sentence pitch

BuyNexa is an AI shopping copilot that turns a natural-language buying goal into an explainable shortlist from real product data, then demonstrates a customer-approved PayPal checkout in its sandbox store.

---

## 2. The problem and target audience

Most shopping searches start with keywords, while shoppers usually start with a goal:

- “I need comfortable headphones for flights and office calls under $150.”
- “Find a 27-inch monitor for coding on a small desk, ideally below $250.”
- “I need a useful travel gift for someone who already owns the basics.”

A shopper then has to translate that goal into search phrases, open many tabs, compare inconsistent specifications, determine which details matter, and decide whether the available evidence is sufficient. Search results return products; they do not reliably explain which option best fits an individual need.

### Initial target audience

The MVP is for frequent online shoppers who:

- have a goal, budget or a few non-negotiable requirements;
- find it tiring to compare many similar listings;
- value concise explanations over a long specification dump;
- want to understand uncertainty and trade-offs before deciding;
- expect to remain in charge of the final purchase and payment.

### Jobs to be done

1. Help me turn an incomplete shopping idea into a clear set of requirements.
2. Find real products that appear to meet those requirements.
3. Explain why an option fits and where it may fall short.
4. Compare a small shortlist on the criteria I actually care about.
5. Let me choose whether to visit a retailer or try a clearly identified PayPal Sandbox checkout.

### What BuyNexa is not

BuyNexa is not a retailer marketplace, a universal price-guarantee engine, a product-review publisher, or an autonomous purchasing bot. The MVP does not claim to search every retailer, guarantee stock or price accuracy, or purchase third-party retailer products on the shopper's behalf.

---

## 3. Product principles

1. **Evidence before persuasion.** Recommendations must be tied to actual product fields or explicitly labelled user preferences.
2. **Customer control.** The agent can research, compare and prepare. It cannot spend money or capture a payment without a customer approval flow.
3. **Honest commerce boundaries.** Channel3 products are external retailer listings. PayPal Sandbox checkout applies only to the BuyNexa demo catalog.
4. **Code decides money.** The FastAPI backend calculates totals, validates cart contents and controls PayPal order state. The language model never sets payment amounts or captures orders.
5. **Unknown means unknown.** Missing specifications are displayed as “Not listed” or “Not provided”, never guessed.
6. **Transparent ranking.** Explain the factors affecting the shortlist; do not present a heuristic fit score as an objective truth or probability.
7. **Fast first value.** A shopper should receive an understandable shortlist without navigating a complex setup wizard.
8. **Graceful degradation.** Provider errors should produce useful retry/error states, not fabricated live results.

---

## 4. Application structure and technology boundary

BuyNexa is one Git repository with two clearly separated application directories:

- **Frontend:** React + TypeScript + Vite. Owns presentation, browser interactions and the PayPal JavaScript SDK approval UI.
- **Backend:** Python + FastAPI. Owns API endpoints, business logic, AI orchestration, database access, Channel3 integration and PayPal server calls.

Both applications are developed and versioned in the same repository. They are not separate projects or repositories. The frontend must never call OpenAI, Channel3 or PayPal server endpoints directly. It calls the FastAPI API.

### Selected stack

| Layer | Technology |
|---|---|
| Frontend framework | React + TypeScript |
| Frontend tooling | Vite |
| Styling / UI | Tailwind CSS + shadcn/ui where useful |
| Frontend validation | Zod or typed API contracts where useful |
| Backend framework | FastAPI |
| Backend language | Python |
| Backend validation/settings | Pydantic v2 + pydantic-settings |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.x (async where appropriate) |
| Migrations | Alembic |
| Python package/dependency manager | uv |
| AI | Official OpenAI Python SDK with structured outputs and tool calling |
| Product discovery | Channel3 API through a backend adapter |
| Payments | PayPal JavaScript SDK + Orders v2 API from FastAPI |
| Backend HTTP client | HTTPX |
| Backend tests | pytest + pytest-asyncio + HTTPX test client |
| Frontend tests | Vitest + Testing Library; Playwright for end-to-end journeys |

Do not add a separate Next.js application, FastAPI replacement, microservice, or second repository. The frontend/backend split is intentional and remains within one repository.

---

## 5. The key product distinction: discovery vs. demo checkout

This distinction must be obvious in both the interface and code.

### 5.1 Channel3 discovery results

Channel3 is used to search, enrich and compare third-party product listings. A result can include a title, image, price, variants, availability, retailer and product/buy link, depending on the returned data.

For these results:

- show the retailer/source and product link;
- display price, availability and variants only when returned and valid;
- link the customer to the retailer to purchase;
- do not create a PayPal order for the third-party retailer's item;
- do not imply that BuyNexa is the merchant, fulfiller or authorized seller.

### 5.2 BuyNexa demo catalog

The PayPal integration uses a small, seeded **BuyNexa Sandbox Store** catalog controlled by the application. It exists to demonstrate an authentic PayPal create → customer approval → capture flow.

For this hackathon MVP:

- label the store and checkout as **Sandbox demo — no real money and no fulfilment**;
- use seeded products and prices owned by the application;
- calculate prices from the database, not browser or AI input;
- use PayPal Sandbox credentials and endpoints only;
- do not imply that a sandbox order purchases or ships a real product;
- never mix a Channel3 retailer product into the BuyNexa merchant cart.

This separation is a deliberate trust and compliance decision, not an unfinished checkout integration.

---

## 6. MVP scope

### P0 — Must ship

| Capability | Description | Acceptance criteria |
|---|---|---|
| Shopping brief | Shopper submits one natural-language buying goal | Original query is retained and validated |
| AI intent extraction | Convert request to category, use case, budget, must-haves, preferences and exclusions | Structured output passes Pydantic/schema validation; unknown values remain unknown |
| Brief confirmation | Show extracted requirements in an editable review step | Shopper can correct the brief before search |
| Channel3 discovery | Search real product listings using confirmed brief | A real Channel3 API call is made; provider ID and source URL are preserved |
| Agent refinement | Agent can choose a targeted follow-up search if initial results are weak | Tool calls are bounded and logged; agent cannot call arbitrary URLs |
| Evidence-based ranking | Score products against shopper criteria | Deterministic backend code performs ranking; each result includes reasons and caveats |
| Product shortlist | Display 3–5 useful results when provider data permits | Each card displays source, available price, available attributes and retailer link |
| Product comparison | Compare up to 3 selected products | Missing attributes are clearly marked; no invented specs |
| Refinement | Shopper can add or change one requirement and search again | Updated brief and search are linked to the session |
| Demo catalog | Display a small seeded BuyNexa Sandbox Store | All items and prices are identified as demo data |
| PayPal checkout | FastAPI creates PayPal order; customer approves; FastAPI captures | Full Sandbox flow works and state is persisted/verified |
| Order result | Show verified order outcome | UI reads server-verified local order status, not only a client callback |
| README and demo readiness | Provide setup, environment and test instructions | A fresh developer can install and run both apps from the public repo |

### P1 — Only after P0 is complete

- Save and revisit shopping briefs in the same anonymous session.
- Add a “why this ranking?” explainer with adjustable preference weights.
- Show comparison history.
- Add an evaluation page for a fixed set of shopping briefs.
- Add optional product detail enrichment if Channel3 supports it and it can be completed safely.
- Add a light merchant/demo-order inspection page for testing.

### Out of scope for the hackathon MVP

- Real-money transactions or live PayPal credentials.
- Real inventory, fulfilment, shipping, tax or refund processing.
- Collecting payment for Channel3 third-party retailer products.
- Retailer scraping, browser automation or bypassing access controls.
- Autonomous purchasing, scheduled purchasing or unattended capture.
- User accounts, social login, subscriptions or a multi-merchant marketplace.
- Complex multi-agent frameworks, vector databases, Redis, queues or microservices.
- Currency conversion or claims that products in different currencies are directly comparable.

---

## 7. Primary user journeys

### Journey A — Search and recommend

1. Shopper opens the BuyNexa home page.
2. Shopper enters a request, for example: “Find wireless headphones under $150 for flights and office calls. Noise cancellation is important; avoid bulky models.”
3. The React frontend sends the request to FastAPI.
4. FastAPI uses OpenAI to extract a structured shopping brief.
5. BuyNexa shows the brief for confirmation and lets the shopper edit it.
6. The shopping agent decides whether it has enough information to search. If a critical detail is missing, it asks one focused question; it must not turn every request into a questionnaire.
7. FastAPI calls Channel3 through a dedicated adapter.
8. Results are normalized, deduplicated and ranked using deterministic Python code.
9. The AI explains why the top options fit and identifies missing evidence or trade-offs.
10. The shopper opens retailer links, compares products or refines the brief.

### Journey B — Compare products

1. Shopper selects up to three products from one search result set.
2. BuyNexa compares attributes that map to the shopper's criteria first.
3. Each cell shows a value, “Not listed”, or “Not comparable” where appropriate.
4. A concise summary identifies the strongest fit for each priority and the main trade-off.
5. The shopper can return to the shortlist without losing the brief.

### Journey C — PayPal Sandbox checkout

1. Shopper opens the BuyNexa Sandbox Store.
2. Shopper selects a seeded demo item and quantity.
3. FastAPI validates the SKU and recalculates the cart total from trusted database prices.
4. Shopper reviews the clearly labelled sandbox cart and total.
5. Shopper clicks the PayPal button.
6. The browser PayPal JavaScript SDK starts the approval experience using an order created by FastAPI.
7. Shopper approves in the PayPal Sandbox experience.
8. The browser calls the FastAPI capture endpoint with the local order reference and PayPal order ID.
9. FastAPI verifies order ownership/state, captures through PayPal, validates returned status/amount/currency, and persists the result.
10. The order page displays a receipt marked **Sandbox demo — not a real purchase**.

The shopping agent is not involved in payment creation or capture. It cannot create, approve or capture payments.

---

## 8. Information architecture and screens

### 8.1 Home `/`

Purpose: explain the product and invite a shopping brief.

Required elements:

- headline: **“Shop by what you need, not just what you search.”**
- prominent prompt composer;
- optional budget/category shortcuts;
- a few example prompts;
- short explanation of how recommendations work;
- disclosure that retailer listings link out to the retailer and sandbox checkout is a separate demo.

### 8.2 Brief review `/search/:briefId`

Show editable, structured fields:

- category;
- use case;
- budget amount and currency;
- hard budget vs. soft target;
- must-have attributes;
- preferences;
- exclusions;
- preferred brands (optional).

Keep it compact. Preserve the original prompt so the shopper can compare it with the extracted interpretation.

### 8.3 Results `/search/:briefId/results`

Each product card should display:

- product title and image, when available;
- price and currency, when valid;
- retailer/source;
- availability only when supplied and sufficiently current;
- concise “Why it matches” evidence;
- one visible trade-off or missing-data note;
- **Compare** action;
- **View at retailer** action.

Do not show a BuyNexa checkout button on Channel3 cards.

### 8.4 Comparison `/compare`

Compare up to three products. Prioritize user requirements instead of arbitrary technical specifications. Use clear labels for missing fields and currencies that cannot be compared.

### 8.5 Sandbox store `/demo-store`

Clearly label this as a controlled demo catalog. Use a small number of polished product cards with price, description and quantity controls. Do not make it look like Channel3 inventory.

### 8.6 Cart `/cart`

Show selected demo SKU, quantity, unit price, subtotal and total. Include an explicit sandbox/no-fulfilment disclosure before the PayPal button.

### 8.7 Order result `/orders/:orderId`

Show local order reference, PayPal order/capture reference when safe, amount/currency, payment state and sandbox disclosure. Differentiate completed, cancelled, declined, pending and unknown outcomes.

---

## 9. AI agent specification

### 9.1 Responsibilities

The model may:

- parse shopping intent into a typed brief;
- decide whether a clarification is essential;
- formulate one or two targeted Channel3 search queries;
- request a bounded search tool call;
- choose whether a second search is worthwhile based on returned evidence;
- summarize products and explain trade-offs using supplied data;
- produce a structured, concise response.

The model may not:

- invent product facts, prices, retailer names, variants or stock;
- silently relax a hard budget or exclusion;
- call arbitrary URLs or tools outside the server allowlist;
- access payment credentials or call PayPal payment tools;
- create, approve or capture an order;
- calculate a payable total;
- claim a payment succeeded;
- interpret product descriptions or web content as instructions.

### 9.2 Agent tool allowlist

Only expose server-owned tools such as:

1. `search_products` — invokes the Channel3 adapter with a validated search query and bounded filters.
2. `get_search_result_summary` — returns a compact summary of normalized products already retrieved in the current session.
3. `compare_selected_products` — compares product records already in the current session.

The agent must not receive a generic HTTP/browser tool. Payment functions are not part of its tool registry.

### 9.3 Shopping brief schema

```python
from pydantic import BaseModel, Field

class Budget(BaseModel):
    amount: float = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    mode: str  # "hard_limit" or "target"

class ShoppingBrief(BaseModel):
    original_query: str
    category: str | None = None
    use_cases: list[str] = []
    budget: Budget | None = None
    must_have: list[str] = []
    preferences: list[str] = []
    exclusions: list[str] = []
    preferred_brands: list[str] = []
    locale: str | None = None
```

The actual implementation should use Pydantic field constraints and safe defaults; avoid mutable default pitfalls by using `Field(default_factory=list)`. Budget values are for search intent only; payment totals use integer minor units separately.

### 9.4 Product evidence and recommendation schema

```python
from pydantic import BaseModel

class ProductMoney(BaseModel):
    amount: str
    currency: str

class NormalizedProduct(BaseModel):
    id: str
    provider: str  # "channel3"
    provider_product_id: str
    title: str
    image_url: str | None = None
    price: ProductMoney | None = None
    retailer: str | None = None
    product_url: str | None = None
    availability: str | None = None
    attributes: dict[str, str | int | float | bool | None]
    fetched_at: str

class CriterionEvidence(BaseModel):
    criterion: str
    evidence: str

class ProductRecommendation(BaseModel):
    product_id: str
    rank: int
    fit_score: int
    matched_criteria: list[CriterionEvidence]
    caveats: list[str]
    missing_attributes: list[str]
    explanation: str
```

`fit_score` is a deterministic heuristic from 0–100, not a probability, review score or guarantee. The interface must label it “Brief fit” or “Fit score” and explain that it reflects the shopper's current criteria and the information returned by the provider.

### 9.5 Ranking approach

Ranking is implemented in deterministic Python and versioned. It must be testable without an LLM.

1. If a hard budget is supplied and the product price is known in the same currency, exclude a product above the hard limit.
2. If currency differs or price is missing, do not infer budget compliance; mark the item “Budget not verified”.
3. Exclude only clear, evidence-backed violations of hard exclusions or must-haves.
4. Score must-have matches more heavily than nice-to-have preferences.
5. Add a small completeness factor so well-documented options can be distinguished without treating missing data as proof of poor quality.
6. Preserve tie-breakers and scoring version in the recommendation record.
7. Generate explanation text only from normalized product evidence and the shopper's criteria.

The LLM can help select relevant evidence and phrase the rationale, but it must not override deterministic eligibility/ranking results.

---

## 10. MVP data model

| Entity | Important fields | Purpose |
|---|---|---|
| `ShoppingSession` | `id`, `token_hash`, `created_at`, `updated_at` | Anonymous session ownership |
| `ShoppingBrief` | `id`, `session_id`, `original_query`, `normalized_json`, timestamps | User intent and validated brief |
| `AgentRun` | `id`, `brief_id`, `status`, `model`, `tool_calls_json`, timestamp | Traceable agent workflow |
| `SearchRun` | `id`, `brief_id`, `provider`, `query`, `status`, `result_count`, `latency_ms` | Channel3 search activity |
| `ProductSnapshot` | `id`, `search_run_id`, `provider_product_id`, `normalized_json`, `fetched_at` | Evidence used for ranking and comparison |
| `RecommendationRun` | `id`, `brief_id`, `search_run_id`, `ranking_version`, `result_json` | Recommendation output |
| `DemoCatalogItem` | `id`, `sku`, `title`, `description`, `price_minor`, `currency`, `active` | Trusted BuyNexa demo prices |
| `Cart` | `id`, `session_id`, `status`, timestamps | Demo cart |
| `CartItem` | `id`, `cart_id`, `catalog_item_id`, `quantity`, `unit_price_minor` | Cart line snapshot |
| `PurchaseOrder` | `id`, `cart_id`, `paypal_order_id`, `status`, `amount_minor`, `currency` | Local PayPal order state |
| `PaymentEvent` | `id`, `purchase_order_id`, `event_type`, `provider_event_id`, `redacted_payload_json` | Payment audit trail |

Use integer minor units for money (for example, cents) plus an ISO currency code. Never use floating-point arithmetic for cart totals. Persist the unit-price snapshot used at order creation so later catalog edits do not change a pending order.

---

## 11. API surface

The FastAPI backend exposes versioned REST endpoints under `/api/v1`. The React frontend calls these endpoints; it does not call OpenAI, Channel3 or PayPal server APIs directly.

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/v1/health` | Application and database readiness |
| `POST` | `/api/v1/briefs` | Parse and save a shopping brief |
| `PATCH` | `/api/v1/briefs/{brief_id}` | Update user-confirmed brief fields |
| `POST` | `/api/v1/agent/runs` | Start bounded agent search/refinement workflow |
| `GET` | `/api/v1/agent/runs/{run_id}` | Read run status and result |
| `POST` | `/api/v1/search` | Run Channel3 search for a confirmed brief |
| `POST` | `/api/v1/compare` | Compare up to three products from the session |
| `GET` | `/api/v1/demo-catalog` | List active BuyNexa demo SKUs |
| `POST` | `/api/v1/cart` | Create/update cart from SKU and quantity |
| `GET` | `/api/v1/cart/{cart_id}` | Read server-priced cart |
| `POST` | `/api/v1/payments/paypal/orders` | Validate cart and create PayPal order |
| `POST` | `/api/v1/payments/paypal/orders/{local_order_id}/capture` | Capture approved PayPal order |
| `GET` | `/api/v1/orders/{local_order_id}` | Read verified order state/receipt |

Use Pydantic request/response models. Keep OpenAPI tags organized by domain. Return consistent errors without leaking provider payloads or stack traces.

---

## 12. Frontend experience and quality bar

The frontend should feel like a modern commerce product, not a generic AI dashboard.

- Use React components with clear feature boundaries.
- Use responsive layouts and accessible interactions.
- Build reusable design primitives and a consistent visual language.
- Include loading, empty, error and success states for all meaningful async actions.
- Keep the original shopping brief visible or one click away.
- Clearly distinguish product evidence from AI-generated explanation.
- Show missing values instead of hiding them.
- Make Channel3 retailer links visually distinct from BuyNexa demo-store checkout.
- Display the Sandbox disclosure before payment and on the order page.

Do not prioritize decorative animation over a complete, coherent shopping journey.

---

## 13. Success metrics and acceptance checklist

### Product and technical metrics

- Time from prompt submission to first useful shortlist.
- Percentage of recommendations with evidence for each claimed match.
- Product search success rate and Channel3 latency.
- Percentage of results with valid source URL and price/currency when the provider supplies them.
- Percentage of users comparing at least two products.
- Sandbox checkout completion rate.
- Payment state reconciliation success.
- AI extraction schema-validity rate.

### Hackathon acceptance checklist

- [ ] A natural-language brief becomes a visible, editable structured brief.
- [ ] React frontend calls the FastAPI backend, not provider APIs directly.
- [ ] The app makes a real Channel3 API call.
- [ ] At least three real returned products are shown when the API returns enough results.
- [ ] Each recommendation has evidence and caveats.
- [ ] Comparison uses only available product attributes.
- [ ] External retailer products are clearly separated from BuyNexa demo-store SKUs.
- [ ] PayPal JavaScript SDK is integrated in the browser.
- [ ] FastAPI performs server-side Orders v2 create and capture calls in Sandbox.
- [ ] Cart totals are recalculated from trusted catalog data.
- [ ] Payment state is persisted and verified.
- [ ] The demo can be reset and repeated.
- [ ] The public repository has setup instructions and an open-source license.
- [ ] A public YouTube demo under three minutes shows the working app.

---

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Channel3 API schema/rate limit changes | Isolate it behind an adapter; use fixture-based tests and a clearly labelled sample fallback |
| Product data lacks a requested attribute | Say “not listed”; never infer from title alone |
| LLM hallucination | Pydantic validation, evidence-only prompts, deterministic ranking and UI caveats |
| PayPal checkout becomes a superficial button | Implement real Sandbox create → approve → capture and persist state |
| Third-party product cannot be sold by BuyNexa | External retailer link only; checkout restricted to controlled demo catalog |
| Cross-origin session complexity | Prefer same-origin production routing; configure explicit CORS only where necessary |
| Scope creep | Freeze P0; defer accounts, live payments, fulfilment and advanced agent workflows |

---

## 15. Suggested demo narrative

**Opening (0:00–0:20):** “Shopping starts with a need, but today's search forces people to become product researchers.”

**Brief (0:20–0:45):** Enter a realistic request with a hard budget and two must-haves. Show the extracted brief and confirm it.

**Discovery (0:45–1:20):** Show Channel3-backed products, source links, fit explanations and missing-data caveats.

**Comparison (1:20–1:45):** Compare two or three products and explain the trade-off.

**PayPal (1:45–2:35):** Switch to the clearly labelled BuyNexa demo store, add a supported item, review the total, approve PayPal Sandbox checkout, and show the server-verified completed order.

**Close (2:35–2:55):** “BuyNexa turns shopping intent into an explainable decision and a customer-approved payment flow.”

The video must be under three minutes, publicly available on YouTube, and show the real application running.

---

## 16. Decisions to preserve

- One repository with `frontend/` and `backend/` directories.
- React + TypeScript + Vite frontend.
- Python + FastAPI backend; no Next.js server or separate Node backend.
- PostgreSQL with SQLAlchemy 2.x and Alembic migrations.
- Pydantic v2 and pydantic-settings for validation/configuration.
- OpenAI Python SDK for structured extraction and agent tool calling.
- Channel3 is the real product-discovery provider.
- PayPal Orders v2 Sandbox is the payment integration.
- Customer approval is mandatory before capture.
- Third-party retailer products are outbound-link products, not BuyNexa merchant inventory.
- PayPal checkout is for the controlled BuyNexa demo catalog only.
- The MVP is optimized for a repeatable, honest end-to-end demo, not production marketplace operations.

## 17. Official references

- [FastAPI — Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [Vite — Getting Started](https://vite.dev/guide/)
- [React — TypeScript](https://react.dev/learn/typescript)
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [SQLAlchemy asyncio](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [Alembic documentation](https://alembic.sqlalchemy.org/en/latest/)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Channel3 developer portal](https://trychannel3.com/developers)
- [PayPal Checkout integration](https://developer.paypal.com/checkout/integrate)
- [PayPal Orders API](https://developer.paypal.com/whats-an-order/)
- [Datalumina — Customer support automation](https://learn.datalumina.com/docs/customer-support-automation)
- [Datalumina — Invoice review](https://learn.datalumina.com/docs/invoice-review)
