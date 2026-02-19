# Jashnify 📸

Jashnify is a professional marketplace for event services, specialized in connecting clients with curated photographers for weddings, parties, corporate events, and more. It features a minimalist, high-performance design built with modern technologies.

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS v4 (Minimalist Grayscale Theme)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **UI Components:** Radix UI / Shadcn UI

### Backend
- **Framework:** Ruby on Rails 7.x (API Mode)
- **Authentication:** Devise + JWT
- **Database:** PostgreSQL
- **Background Jobs:** Sidekiq + Redis
- **Architecture:** Packwerk (Component-based architecture)

---

## 🛠 Local Development

### Prerequisites
- Docker & Docker Compose
- Ruby 3.x
- Node.js 20+

### Quick Start
We provide a unified development script that handles Docker services (Postgres, Redis, Sidekiq) and local development servers (Rails, Next.js) simultaneously.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/jashnify.git
   cd jashnify
   ```

2. **Run the development script:**
   ```bash
   chmod +x dev.sh
   ./dev.sh
   ```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001](http://localhost:3001)
- **Sidekiq Web UI:** [http://localhost:3001/sidekiq](http://localhost:3001/sidekiq)

---

## 🌍 Deployment

Jashnify is optimized for a "Zero Dollar" professional deployment strategy:

- **Frontend:** Hosted on **Vercel** (`https://jashnify.in`)
- **Backend API:** Hosted on **Render.com** (`https://api.jashnify.in`)
- **Database:** **Supabase** (Managed PostgreSQL)
- **Redis:** **Upstash** (Serverless Redis for Sidekiq)

### Deployment Workflow
1. Push changes to GitHub: `git push origin main`.
2. Vercel and Render automatically trigger builds.
3. For database changes, run migrations via the Render shell:
   ```bash
   bundle exec rails db:migrate
   ```

---

## 📂 Project Structure

```text
jashnify/
├── frontend/           # Next.js application
│   ├── app/            # App Router (pages & layouts)
│   ├── components/     # UI & shared components
│   └── lib/            # API services & Contexts
├── backend/            # Rails API
│   ├── app/            # Core Rails files
│   ├── packs/          # Modular business logic
│   └── config/         # Environment & initializers
├── dev.sh              # Unified development script
└── docker-compose.yml  # Docker services (DB, Redis, Sidekiq)
```

## 📝 License
Proprietary. All rights reserved.