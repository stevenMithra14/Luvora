# Luvora — Digital Gift Creation Platform

Luvora is a free, digital gift creation platform inspired by personalized digital gifts such as birthday cards, love letters, anniversary experiences, friendship gifts, and other special occasions.

> [!NOTE]
> Luvora is 100% free with no paywalls, subscriptions, or payment features. Everything is freely accessible to creators and recipients.

---

## Features

- **5-Step Creator Wizard**:
  - Step 1 (`/create`): Occasion Selection (*Birthday*, *Love*, *Anniversary*, *Friendship*, *Graduation*, *Celebration*, *Just Because*).
  - Step 2 (`/create/person`): Recipient details and date picker with *"I don't know the year"* option and real-time live preview card.
  - Step 3 (`/create/customize`): Visual customization editor with 6 original themes (*Romantic*, *Midnight*, *Sunset*, *Dreamy*, *Minimal*, *Celebration*), font selector, alignment, solid/gradient/image background, animations, cover titles, and optional bcrypt password protection.
  - Step 4 (`/create/memories`): Photo management (drag-and-drop, captions, reorder, delete) and background audio uploader with browser-compliant controls.
  - Step 5 (`/create/interactive`): 6 interactive surprises (*Birthday Countdown*, *Memory Timeline*, *Secret Message*, *Surprise Button*, *Photo Slideshow*, *Final Message*).
  - Step 6 (`/create/preview`): Recipient experience preview with Desktop vs. Mobile device frame switcher, pre-publishing validation checklist, and publishing trigger.
- **Publishing & Sharing**:
  - Unpredictable 12-char nanoid `public_id` and secret 32-byte `edit_token`.
  - Downloadable high-resolution QR Code PNG image (`luvora-qr-{publicId}.png`).
  - Native Web Share API integration (`navigator.share`) with clipboard copy fallback.
- **Recipient Surprise Experience (`/g/:publicId`)**:
  - Immersive 8-stage unboxing sequence (*Loading*, *Cover*, *Unwrapping*, *Name Reveal*, *Progressive Message Reveal*, *Cinematic Photos*, *Interactive Modules*, *Ending*).
  - Zero creator controls or administrative clutter inside recipient views.
  - Optional bcrypt password unlock with zero-data-leakage content stripping and brute-force rate-limiting.
- **Author Editing System (`/edit/:edit_token`)**:
  - Author editing via secret token with constant-time token comparison (`hmac.compare_digest`).
  - Instant public synchronization.

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: FastAPI, Python 3.11+, SQLAlchemy, Pydantic V2, Bcrypt.
- **Database**: SQLite (dev) / PostgreSQL (prod) with UUID primary keys and cascading foreign keys.
- **Storage**: Storage Abstraction Layer (`BaseStorageProvider` ABC) supporting Local disk storage, Cloudinary, and Supabase.

---

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env

# Run FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

*Backend Health Check*: [http://localhost:8000/api/health](http://localhost:8000/api/health)  
*Swagger API Docs*: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Start Vite development server
npm run dev
```

*Frontend Web Application*: [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `APP_NAME` | Name of the FastAPI application | `"Luvora API"` |
| `DEBUG` | Enable debug mode | `True` |
| `PORT` | Server listening port | `8000` |
| `SECRET_KEY` | HMAC signing key for access tokens | `"luvora-production-secret-change-this-key"` |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./luvora_dev.db` |
| `STORAGE_BACKEND` | Storage provider (`local`, `cloudinary`, `supabase`) | `local` |
| `UPLOAD_DIR` | Directory for uploaded files | `uploads` |
| `CORS_ORIGINS` | JSON list of allowed origins | `["http://localhost:5173","http://127.0.0.1:5173"]` |

### Frontend (`frontend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base API endpoint URL | `http://127.0.0.1:8000/api` |

---

## Database Setup & Migrations

Database tables are initialized automatically on application startup via SQLAlchemy lifespan context (`init_db()`).

To re-seed or initialize from scratch:
```bash
python -c "from app.database.init_db import init_db; init_db()"
```

---

## Core API Endpoints

- `GET /api/health`: Health status.
- `POST /api/upload/photo`: Image asset upload (MIME & size validation up to 10MB).
- `POST /api/upload/audio`: Audio track upload (MIME & size validation up to 15MB).
- `POST /api/gifts`: Create & publish new gift (returns `public_id` and `edit_token`).
- `GET /api/gifts/public/{public_id}`: Recipient gift retrieval (strips content if locked).
- `POST /api/gifts/public/{public_id}/verify-password`: Password verification with brute-force rate-limiting.
- `POST /api/gifts/public/{public_id}/unlocked-content`: Fetches unlocked gift payload via temporary access token.
- `GET /api/gifts/edit/{edit_token}`: Retrieve gift payload for author editing.
- `PUT /api/gifts/edit/{edit_token}`: Save gift modifications.

---

## Production Deployment Recommendations

1. **Managed Database**: Provision a managed PostgreSQL instance (AWS RDS, Render PostgreSQL, Supabase DB) and set `DATABASE_URL=postgresql://user:pass@host:5432/luvora`.
2. **Cloud Storage**: Set `STORAGE_BACKEND=cloudinary` or `STORAGE_BACKEND=supabase` in production for CDN delivery of images and audio.
3. **SSL / Reverse Proxy**: Deploy behind Nginx / Caddy / Vercel with automatic TLS certificate issuance.
4. **Environment Security**: Generate a cryptographically strong 64-character string for `SECRET_KEY` and restrict `CORS_ORIGINS` to the production website domain.
