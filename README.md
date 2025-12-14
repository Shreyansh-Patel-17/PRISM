# PRISM 🧠

**PRISM** is an AI-powered interview-practice platform that combines a modern Next.js frontend with backend Python modules for resume parsing, smart interview question generation, speech-to-text, answer evaluation, and skill-score tracking.
It provides users with a full interview simulation — and detailed feedback on strengths, weaknesses, and skill readiness.

---

## ✨ Why PRISM?

Many developers struggle to objectively assess their interview readiness. PRISM helps by offering:

* Automatic generation of relevant technical & soft-skill questions based on your actual skill set
* Ability to answer via microphone (speech → text)
* Semantic & keyword-based evaluation of answers, plus sentiment scoring
* Skill scoring (0–100) per topic, tracked over time
* A dashboard highlighting your strong skills and weak areas — so you know what to improve

**Who it’s for:** students, bootcamp grads, self-taught programmers — anyone preparing for technical interviews.

---

## 📁 Project Structure (at a glance)

```graphql
/
├── src/
│   ├── app/            # Next.js App Router pages + UI components
│   ├── components/     # Reusable React components (Navbar, Layout, etc.)
│   ├── app/api/        # Serverless API routes (auth, questions, STT, evaluation, skill-scores, etc.)
│   ├── lib/            # Utility libraries (e.g. MongoDB connector)
│   └── models/         # Mongoose models (User, etc.)
├── src/modules/        # Python modules for heavy-duty tasks:
│     ├── question-generator/
│     ├── response-evaluator/
│     ├── resume-parser/
│     ├── Speech-to-Text/
│     ├── Text-to-Speech/
│     └── ... (other helper scripts)
├── requirements.txt    # Python dependencies
├── package.json        # Node / Next.js dependencies & scripts
├── README.md           # This file
└── .env*               # Environment variables (not committed)
```

---

## ✅ Features

* Full user authentication & session management (via NextAuth)
* Resume upload & parsing to auto-extract skills
* Automatic question generation based on user’s skills (via LLM)
* A user-friendly interview UI: mic + webcam support, waveform/audio recording
* Speech-to-text (STT) conversion and answer capture
* Automatic answer evaluation: keyword match, semantic similarity, sentiment analysis
* Skill scoring system (0–100) — stored in MongoDB per user
* Dashboard with readiness overview, skill-score chart, and “strengths / weaknesses” insights

---

## 🛠️ Tech Stack

| Layer          | Technologies / Libraries                                                                 |
| -------------- | ---------------------------------------------------------------------------------------- |
| Frontend       | Next.js (TypeScript + React), Tailwind CSS / custom UI                                   |
| Backend / API  | Node.js, Next.js API routes, Mongoose + MongoDB                                          |
| Python Modules | Python 3.10+, `sentence-transformers`, NLTK / TextBlob, custom scripts + LLM integration |
| Authentication | NextAuth                                                                                 |
| Storage        | MongoDB (Atlas or local)                                                                 |
| AI / LLM       | Generative model via `gemini_api.py` (configurable)                                      |

---

## 🚀 Getting Started (Local Dev)

### Prerequisites

* Node.js (v18+), npm / yarn / pnpm
* Python 3.10+
* MongoDB (local or Atlas)
* A valid LLM API key (for question generation / evaluation)
* Add environment variables (see below)

### Frontend + Backend (Next.js)

```bash
git clone https://github.com/Shreyansh-Patel-17/PRISM.git
cd PRISM
npm install
```

Create a `.env.local` file (or set environment variables):

```ini
MONGODB_URI=your_mongo_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
# If using OAuth:
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
# AI / LLM key:
GEMINI_API_KEY=...   # or OPENAI_API_KEY, depending on config
```

Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Python Modules (LLM / STT / Evaluation)

```bash
cd PRISM
python -m venv .venv
# On macOS/Linux:
source .venv/bin/activate
# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

Once dependencies are installed, you don’t need to run anything separately: the Next.js backend will invoke Python scripts (for question generation, STT, evaluation) as needed.

---

## 🧪 How to Use PRISM (User Flow)

1. Sign in or sign up.
2. Upload your resume (PDF) — resume parser extracts your skills.
3. Click **Start Interview** — the system generates tailored questions.
4. Answer questions (via mic / speech).
5. System performs STT → evaluates your answer → gives a score & feedback.
6. Visit **Dashboard** to view your skill-score chart:

   * See which skills you did well in (highlight them in resume)
   * See which skills need improvement (focus next practice rounds)

---

## 🧑‍💻 API Endpoints (Next.js App Router under `src/app/api/`)

| Endpoint                                      | Method | Purpose                                                         |
| --------------------------------------------- | ------ | --------------------------------------------------------------- |
| `/api/generate-questions`                     | POST   | Generate interview questions tailored to user’s skill set       |
| `/api/get-questions`                          | GET    | Fetch previously generated questions from DB                    |
| `/api/upload-resume`                          | POST   | Upload + parse user resume (extract skills)                     |
| `/api/speech-to-text`                         | POST   | Receive recorded audio; run STT (Python) → return transcription |
| `/api/response-evaluator`                     | POST   | Evaluate user’s answer → return score & feedback                |
| `/api/skill-scores`                           | GET    | Fetch aggregated per-skill scores for logged in user            |
| (plus standard auth routes under `/api/auth`) |        |                                                                 |

---

## ⚙️ Customization / Configuration

* Swap the LLM provider (Gemini, OpenAI, etc.) by updating `src/modules/question-generator/gemini_api.py` (or equivalent) — just provide the correct API key.
* Extend resume parsing logic (`src/modules/resume-parser/`) to extract more metadata (education, projects, etc.)
* Adjust evaluation algorithm (in `response-evaluator/`) — e.g. change keyword-vs-sentiment weighting, add custom scoring logic
* Customize frontend theme / UI — the React components and Tailwind (or CSS) make it easy to restyle

---

## 🧭 Future Plans / Roadmap

* Add full user profile (education, projects, extra info)
* Persist interview history to track progress over time
* Export results / summary (PDF / shareable resume-ready output)
* Add coding-question evaluation (not just verbal/text answers)
* Deploy to production (e.g. Next.js on Vercel, Python modules on serverless / microservice)
* Add automated testing / CI pipelines (unit tests for both TS & Python)

---

## 🤝 Contribution Guidelines

Feel free to contribute! To get started:

1. Fork the repo and create a feature branch (e.g. `feature/new-chart`)
2. Install dependencies (`npm install`, `pip install -r requirements.txt`)
3. Make sure your changes work (frontend + Python parts)
4. Submit a pull request with clear description of changes

We appreciate every suggestion, bug report, or feature idea. 🙏

---