# 🚀 RelayHub: Multi-Tenant Marketing & Blog Automation Platform

RelayHub is an all-in-one AI marketing automation platform designed for modern founders, creators, and marketing teams. It combines **personal & business website blog publishing (WordPress REST API + Webhooks)** with **multi-channel social media scheduling (LinkedIn, X, Instagram)** and **email newsletter distribution** powered by a unified 1-click AI repurposing engine.

---

## 🌟 Key Features

### 1. 🏛️ Personal & Business Website Blog Integration (The Anchor Content)
* **WordPress REST API Connector**: Direct publishing and draft syncing using WordPress Application Passwords. Supports title, markdown/HTML content, slug, meta excerpt, tags, and categories.
* **Generic Webhook / Custom CMS Connector**: Signed HMAC-SHA256 HTTP POST dispatches for Next.js On-Demand ISR, Astro, Ghost, and headless CMS.
* **Anchor & Relay Workflow**: Start by generating an in-depth, authoritative SEO blog post on your own domain, rather than building exclusively on rented social media land.

### 2. ⚡ AI Content Studio & 1-Click Repurposing
* **Ollama (Default Local LLM)**: Full privacy-preserving local generation with automatic cloud fallback (OpenAI/Gemini).
* **Google Imagen / Banana Pro Integration**: Generates 16:9 featured hero banner images for your articles.
* **1-Click Multi-Channel Relayer**: Automatically converts your blog post into:
  * **LinkedIn**: High-signal thought leadership update with hook, bullets, CTA, and hashtags.
  * **X / Twitter**: Micro-thread starter or punchy tweet (<280 chars) with blog teaser.
  * **Instagram**: Visual caption with emojis and hashtag clusters.
  * **Email Newsletter**: Catchy subject line, preheader snippet, and conversational summary linking to the full blog post.

### 3. 🏢 Multi-Tenant SaaS Architecture
* Complete workspace data isolation.
* PostgreSQL (Async SQLAlchemy / SQLModel) + SQLite support for lightweight local testing.
* Redis & Celery task queues for scheduled posting and automated webhooks.
* JWT Authentication with bcrypt password hashing.

---

## 🏗️ Architecture Overview

```text
                                  RELAYHUB
                                     │
      ┌──────────────────────────────┼──────────────────────────────┐
      │                              │                              │
  BLOG / CMS                       SOCIAL                         EMAIL
      │                              │                              │
 ┌────┼────────────┐           ┌─────┼────────────┐          ┌──────┼───────┐
 │    │            │           │     │            │          │      │       │
WordPress Webhook/Custom     LinkedIn  X   Instagram      Newsletters Subscribers
 │    │            │           │     │            │          │      │       │
 └────┴────────────┘           └─────┴────────────┘          └──────┴───────┘
      │                              │                              │
      └──────────────────────────────┴──────────────────────────────┘
                                     │
                              AUTOMATION & RELAY
                                     │
                        ┌────────────┴────────────┐
                        │                         │
                 AI Content Engine          Scheduler / Queue
               (Ollama / Banana Pro)       (FastAPI + Redis)
                        │                         │
                        └────────────┬────────────┘
                                     │
                               DATABASE
                       (Multi-tenant Workspaces)
```

---

## 🚦 Getting Started

### 1. Prerequisites
* **Node.js** >= 18 (Node 24 recommended)
* **Python** >= 3.11 (Python 3.12 recommended)
* **Docker & Docker Compose** (Optional, for containerized deployment)
* **Ollama** (Optional, running locally on `http://localhost:11434` for AI generation)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Start FastAPI development server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend will be live at `http://localhost:8000`. Swagger API docs available at `http://localhost:8000/docs`.

### 3. Run Backend Tests
```bash
cd backend
python -m pytest tests -v
```

### 4. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open `http://localhost:3000` to explore the RelayHub Dashboard.

### 5. Running with Docker Compose
To run PostgreSQL, Redis, FastAPI Backend, and Next.js together:
```bash
docker-compose up --build
```

---

## 🔌 Connecting Your Personal Website Blog

### Connecting WordPress
1. Log into your WordPress admin dashboard (`/wp-admin`).
2. Go to **Users > Profile**.
3. Scroll down to **Application Passwords**.
4. Enter an application name (e.g., `RelayHub`) and click **Add New Application Password**.
5. Copy the generated 24-character password.
6. In RelayHub > **Website Blogs (CMS)** > Click **Connect New Blog**:
   * CMS Type: `WordPress (REST API)`
   * Website URL: `https://yourdomain.com`
   * Username: Your WP username
   * Password: The Application Password from Step 5.
7. Click **Save & Test Connection**.

### Connecting Custom Sites (Next.js / Astro / Headless)
1. In RelayHub > **Website Blogs (CMS)** > Click **Connect New Blog**:
   * CMS Type: `Custom Webhook`
   * Endpoint URL: `https://yourdomain.com/api/revalidate-blog`
   * Secret Key: An optional shared HMAC secret.
2. RelayHub sends a JSON payload on publication containing `{ event: "blog_post.published", post: { title, slug, content, tags, ... } }` and an `X-RelayHub-Signature` header.

---

## 🔒 Environment Variables Reference

See [.env.example](.env.example):
```env
ENVIRONMENT=development
DATABASE_URL=sqlite+aiosqlite:///./relay_hub.db
REDIS_URL=redis://localhost:6379/0

# AI Configuration
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest

# Google Imagen (Banana Pro) Image Generation
GEMINI_API_KEY=your_gemini_key_here
IMAGEN_MODEL=imagen-3.0-generate-002
```
