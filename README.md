# ⚡ Conduit — Full-Stack RealWorld Platform (FastAPI + React)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0%20(Async)-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Zero--Config-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Pytest](https://img.shields.io/badge/Pytest-69%2B%20Tests%20Passing-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)](https://docs.pytest.org/)

> A production-grade, enterprise-architected full-stack implementation of the **[RealWorld (Conduit)](https://github.com/gothinkster/realworld)** specification. Designed and implemented with **Domain-Driven Design (DDD)**, **Clean Architecture**, asynchronous persistence via **SQLAlchemy 2.0**, and a responsive **React 18** client.

---

## 📸 Visual Showcase

### 1. Global Feed & Interactive Web Application
*Modern dark-mode UI with real-time tag filtering, pagination, article authoring, and social interactions.*
![Conduit Frontend Feed](https://raw.githubusercontent.com/chetandhamani-github/fastapi-backend-api/main/assets/screenshots/frontend_feed.png)

---

### 2. Interactive Swagger API Documentation (`/docs`)
*Comprehensive OpenAPI 3.1 schema and interactive documentation for testing endpoints.*
![Conduit Swagger API Docs](https://raw.githubusercontent.com/chetandhamani-github/fastapi-backend-api/main/assets/screenshots/swagger_docs.png)

---

### 3. Article Reading & Comments Discussion
*Full Markdown-rendered article reading view with user following, favorite toggles, and discussions.*
![Conduit Frontend Article](https://raw.githubusercontent.com/chetandhamani-github/fastapi-backend-api/main/assets/screenshots/frontend_article.png)

---

### 4. Secure Authentication & User Identity
*Bcrypt-hashed password verification and JWT-secured token authentication.*
![Conduit Frontend Auth](https://raw.githubusercontent.com/chetandhamani-github/fastapi-backend-api/main/assets/screenshots/frontend_auth.png)

---

## 🌟 Key Engineering Highlights

- **Clean Architecture & DDD Principles**: Strict separation between the HTTP delivery layer, business use-case services, repository abstractions, and database persistence models.
- **Layered DTO Pattern**: Clear demarcation between persistence record DTOs (`conduit/dtos/records`) and business domain DTOs (`conduit/dtos/domain`), preventing ORM entity leaks into the presentation layer.
- **Dual Database Flexibility**:
  - **Zero-Config Local Development**: Out-of-the-box SQLite support (`aiosqlite`) requires zero setup or external services.
  - **Production Ready**: High-performance PostgreSQL with `asyncpg` connection pooling and Alembic migration tracking.
- **Robust Security & Identity**:
  - Bcrypt password hashing with unique salts.
  - Asymmetric/symmetric JWT tokens with timezone-aware expiration.
  - Role-based authorization & resource ownership validation (e.g., users can only edit or delete their own articles and comments).
  - Built-in rate limiting middleware protecting against abuse.
- **Complete Test Coverage**:
  - 69+ automated tests covering authentication, authorization boundaries, query filters (by tag, author, favorited), input validation schemas, slug collisions, cascading relations, and dependency overrides.

---

## 🏗️ Architecture & Package Layout

```
conduit/
├── api/                       # Presentation / HTTP Delivery Layer
│   ├── middlewares/           # Custom middlewares (Rate Limiting, CORS, Logging)
│   ├── routes/                # FastAPI endpoint routers (articles, auth, profiles, tags, user)
│   ├── schemas/               # Pydantic v2 request/response serialization contracts
│   └── router.py              # Root API routing registration
├── services/                  # Application Use Cases / Business Logic
│   ├── article.py             # Article curation, feed generation, favoriting
│   ├── auth.py                # User credentials verification & registration
│   ├── auth_token.py          # JWT issuance, decoding, and validation
│   ├── comment.py             # Comment management and moderation
│   ├── password.py            # Bcrypt hashing & verification
│   ├── profile.py             # Social graph (follow/unfollow) logic
│   ├── tag.py                 # Tag aggregation
│   └── user.py                # Profile lifecycle and settings
├── interfaces/                # Ports & Abstract Protocols
│   ├── repositories/          # Repository contracts (User, Article, Comment, Tag)
│   └── services/              # Service contracts for dependency inversion
├── dtos/                      # Data Transfer Objects
│   ├── domain/                # Business-layer DTOs consumed by services and API
│   └── records/               # Low-level persistence DTOs returned by repositories
├── infrastructure/            # Adapters / Data Persistence Layer
│   ├── models/                # SQLAlchemy declarative models (User, Article, Comment, Tag, Favorite, Follower)
│   ├── repositories/          # Concrete async repositories (SQLAlchemy queries & SQLite/Postgres dialect mappings)
│   └── migrations/            # Alembic schema versioning & migration scripts
└── core/                      # Cross-Cutting Infrastructure
    ├── config.py              # Pydantic settings loading by environment
    ├── container.py           # Dependency Injection container
    ├── dependencies.py        # FastAPI dependency providers
    ├── security.py            # Crypto and token helpers
    └── settings/              # Environment configurations (App, Dev, Test, Prod)
```

---

## 🚀 Quickstart & Local Setup

### Option 1: Instant Run with SQLite (Zero External Dependencies)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chetandhamani-github/fastapi-backend.git
   cd fastapi-backend
   ```

2. **Set up Python Virtual Environment:**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the FastAPI Backend:**
   ```bash
   uvicorn conduit.app:app --host 0.0.0.0 --port 8000 --reload
   ```
   - Interactive Swagger API: **[http://localhost:8000/](http://localhost:8000/)**
   - ReDoc Documentation: **[http://localhost:8000/redoc](http://localhost:8000/redoc)**

5. **Launch the React Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   - Web Application: **[http://localhost:5173](http://localhost:5173)**

---

### Option 2: Production Setup with Docker & PostgreSQL

1. **Start all services with Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

2. **Run Alembic Database Migrations:**
   ```bash
   docker exec -it conduit-api alembic upgrade head
   ```

3. **Access Services:**
   - API & Swagger Docs: `http://localhost:8000/`
   - PostgreSQL Database: `localhost:5432`

---

## 🧪 Testing Suite & Quality Assurance

This repository includes a test suite covering business logic, security constraints, and database edge cases.

### Running Pytest

```bash
# Run all automated tests
$env:APP_ENV="test"; pytest tests -v      # Windows PowerShell
APP_ENV=test pytest tests -v              # Linux / macOS
```

### Running Test Coverage

```bash
$env:APP_ENV="test"; pytest --cov=conduit tests
```

### Key Test Categories Covered:
- **Authentication & Permissions**: Unauthenticated access blocks, expired/malformed JWT rejection, and unauthorized resource mutation guards.
- **Article Lifecycle**: Creation, markdown body rendering, automatic unique slug derivation, collision resolution, updating, and deletion.
- **Social Graph & Feeds**: Personalized followee feed filtering (`/api/articles/feed`), follower toggling, and favorite count tracking.
- **Data Validation**: Strict Pydantic model validation on emails, usernames, duplicate tag sanitization, and pagination boundary bounds.
- **Dependency Inversion Overrides**: Verification of dynamic dependency injection swapping during tests.

---

## 📡 REST API Specification

All API endpoints follow the RealWorld REST specification under `/api`:

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/api/users` | Register a new user account | No |
| `POST` | `/api/users/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/user` | Get current authenticated user details | Yes |
| `PUT` | `/api/user` | Update user profile, email, or credentials | Yes |
| `GET` | `/api/profiles/{username}` | Fetch user profile with following status | Optional |
| `POST` | `/api/profiles/{username}/follow` | Follow a user | Yes |
| `DELETE` | `/api/profiles/{username}/follow` | Unfollow a user | Yes |
| `GET` | `/api/articles` | List recent articles with tag/author/favorite filters | Optional |
| `GET` | `/api/articles/feed` | List articles from followed authors | Yes |
| `GET` | `/api/articles/{slug}` | Get single article by unique slug | Optional |
| `POST` | `/api/articles` | Create a new article with tags | Yes |
| `PUT` | `/api/articles/{slug}` | Update an article (owner only) | Yes |
| `DELETE` | `/api/articles/{slug}` | Delete an article (owner only) | Yes |
| `POST` | `/api/articles/{slug}/favorite` | Favorite an article | Yes |
| `DELETE` | `/api/articles/{slug}/favorite` | Unfavorite an article | Yes |
| `GET` | `/api/articles/{slug}/comments` | Get comments for an article | Optional |
| `POST` | `/api/articles/{slug}/comments` | Post a comment on an article | Yes |
| `DELETE` | `/api/articles/{slug}/comments/{id}` | Delete a comment (author only) | Yes |
| `GET` | `/api/tags` | List all unique tags | No |
| `GET` | `/api/health-check` | Service health status check | No |

---

## 👨‍💻 Author

**Chetan Dhamani**
- **GitHub**: [@chetandhamani-github](https://github.com/chetandhamani-github)
- **Email**: [dhamanichetan@gmail.com](mailto:dhamanichetan@gmail.com)

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
