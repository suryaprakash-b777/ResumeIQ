# AI Analyzer & ResumeIQ — Multimodal Intelligence & Career System

A complete, production-ready, full-stack AI analysis platform featuring 6 specialized modules:
1. **ResumeIQ / Resume Analyzer**: ATS compatibility scoring (0–100), hybrid skill-gap analysis, target-role matching, 8-week personalized learning roadmap, and downloadable PDF reports.
2. **Text Analyzer**: Deep document summarization, confidence-scored sentiment analysis, key point extraction, and keyword mapping.
3. **Image Analyzer**: Multimodal visual scene understanding, object detection, subject localization, and color palette extraction powered by Gemini Vision.
4. **Code Analyzer**: Automated static analysis, security vulnerability audits, cyclomatic complexity metrics, and AI-suggested refactored code.
5. **Data Analyzer**: Tabular data profiling (CSV/XLSX/JSON), mathematical distribution metrics (mean, median, mode, std dev), Recharts visual graphs, and automated business observations.
6. **General AI Analyzer**: Interactive Gemini-powered technical assistant with contextual memory and document attachment support.

---

## Architecture Overview

Frontend and backend are **completely independent applications**:
- `frontend/` — Built with React 18, Vite, Tailwind CSS, Recharts, Lucide React, and jsPDF.
- `backend/` — Built with Node.js, Express, Prisma ORM, pdf-parse, mammoth, xlsx, bcryptjs, and `@google/generative-ai`.

```
RESUME IQ/
├── frontend/                     # React 18 + Vite Frontend Application
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/           # Reusable UI cards, charts, tags, loading steps
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── AnalyzerCard.jsx
│   │   │   ├── UploadCard.jsx
│   │   │   ├── ScoreCard.jsx
│   │   │   ├── SkillTag.jsx
│   │   │   ├── ProgressChart.jsx
│   │   │   ├── LoadingSteps.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/                # All 6 Analyzers + Auth, History, Profile
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ResumeAnalyzer.jsx
│   │   │   ├── TextAnalyzer.jsx
│   │   │   ├── ImageAnalyzer.jsx
│   │   │   ├── CodeAnalyzer.jsx
│   │   │   ├── DataAnalyzer.jsx
│   │   │   ├── GeneralAnalyzer.jsx
│   │   │   ├── History.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
│
├── backend/                      # Express + Prisma Backend Service
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── resumeController.js
│   │   ├── textController.js
│   │   ├── imageController.js
│   │   ├── codeController.js
│   │   ├── dataController.js
│   │   ├── generalController.js
│   │   └── historyController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── analysisRoutes.js
│   │   ├── textRoutes.js
│   │   ├── imageRoutes.js
│   │   ├── codeRoutes.js
│   │   ├── dataRoutes.js
│   │   ├── generalRoutes.js
│   │   ├── profileRoutes.js
│   │   └── historyRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   └── errorMiddleware.js
│   ├── services/
│   │   ├── geminiService.js
│   │   ├── pdfService.js
│   │   ├── docxService.js
│   │   ├── resumeAnalysisService.js
│   │   ├── textAnalysisService.js
│   │   ├── imageAnalysisService.js
│   │   ├── codeAnalysisService.js
│   │   ├── dataAnalysisService.js
│   │   ├── skillExtractor.js
│   │   ├── atsScorer.js
│   │   └── jobMatcher.js
│   ├── utils/
│   │   ├── skillDictionary.js
│   │   ├── roleTemplates.js
│   │   ├── reportGenerator.js
│   │   └── validators.js
│   ├── prisma/
│   │   ├── schema.prisma         # Active SQLite schema (out-of-the-box)
│   │   ├── schema.postgresql.prisma # PostgreSQL production schema
│   │   └── seed.js               # 134 skills + 10 career role templates
│   ├── uploads/                  # Upload directory
│   ├── server.js                 # Main Express server entrypoint
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── README.md
└── .gitignore
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom royal blue (`#3867F5`) design system & dark mode
- **Routing**: React Router DOM (v6)
- **Charts**: Recharts (Pie/Doughnut charts, Line charts, Bar charts) + Custom SVG circular progress
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **PDF Generation**: jsPDF with jsPDF-AutoTable
- **HTTP Client**: Axios with interceptors

### Backend
- **Server**: Node.js & Express.js
- **Database ORM**: Prisma ORM
- **Default Database**: SQLite (`dev.db`) for instant zero-configuration local execution, with one-command switch to PostgreSQL
- **AI Engine**: Google Gemini (`@google/generative-ai` with structured JSON mode and deterministic fallbacks)
- **Document Extractors**: `pdf-parse` (PDF) and `mammoth` (DOCX)
- **Data Parser**: `xlsx` (Excel XLSX, XLS, and CSV)
- **Security**: `bcryptjs`, `jsonwebtoken` (JWT), `express-rate-limit`, `cors`

---

## ATS Scoring Engine Formula

The ATS scorer calculates a transparent, weighted score from 0 to 100 based on 5 core pillars:

$$\text{Final Score} = (\text{Skills Relevance} \times 0.30) + (\text{Experience \& Projects} \times 0.20) + (\text{Education \& Certifications} \times 0.15) + (\text{Resume Structure} \times 0.15) + (\text{Keyword Compatibility} \times 0.20)$$

### Rating Thresholds:
- **80 – 100**: Excellent
- **65 – 79**: Good
- **50 – 64**: Needs Improvement
- **Below 50**: Weak ATS Compatibility

---

## Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Configure Backend
```bash
cd backend

# Install dependencies (already installed in workspace)
npm install

# Review environment variables in backend/.env
# PORT=5000
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="your_jwt_secret"
# GEMINI_API_KEY="your_api_key_here"

# Initialize and seed database (134 skills & 10 role templates)
npx prisma generate
npx prisma db push
node prisma/seed.js

# Start backend server
npm start
```
The backend starts at `http://localhost:5000`.

### 3. Configure Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
The frontend launches at `http://localhost:5173`.

---

## Switching Between SQLite and PostgreSQL

The project includes an automatic switcher:

### To Use PostgreSQL:
1. Update `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_analyzer?schema=public"
   ```
2. Run the helper script:
   ```bash
   cd backend
   npm run db:use-postgres
   npx prisma generate
   npx prisma db push
   node prisma/seed.js
   ```

### To Switch Back to SQLite:
```bash
cd backend
npm run db:use-sqlite
npx prisma generate
npx prisma db push
node prisma/seed.js
```

---

## Google Gemini API Key Setup

1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Paste the key into `backend/.env`:
   ```env
   GEMINI_API_KEY="AIzaSyYourGeneratedGeminiKey"
   ```
3. Restart the backend server.
> **Note**: Even if no Gemini API key is configured, the entire application functions with built-in rule-based NLP, keyword parsers, and static analyzers without crashing!

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` — Create user account
- `POST /api/auth/login` — Sign in and issue JWT
- `GET /api/auth/me` — Get current profile
- `POST /api/auth/logout` — End session
- `PUT /api/profile` — Update user profile
- `PUT /api/profile/password` — Change password

### Resume & Career Analysis (ResumeIQ)
- `POST /api/resume/upload` — Upload PDF/DOCX resume & get extracted preview
- `POST /api/resume/analyze` — Run ATS scoring, skill-gap detection, role match & 8-week roadmap
- `GET /api/resume` — List user uploaded resumes
- `GET /api/resume/:id` — Get resume details
- `GET /api/resume/:id/report` — Get structured report data for PDF export
- `DELETE /api/resume/:id` — Delete resume & analyses
- `GET /api/roles` — Predefined career templates

### Specialized Modules
- `POST /api/text/analyze` — Summarize text/document, detect sentiment & extract keywords
- `POST /api/image/analyze` — Multimodal object detection & scene understanding
- `POST /api/code/analyze` — Static code auditing, vulnerability checks & optimization
- `POST /api/data/analyze` — Tabular dataset statistics & chart series generator
- `POST /api/general/chat` — Conversational assistant with context support

### History
- `GET /api/history` — Filterable audit trail of user analyses
- `GET /api/history/:id` — Retrieve specific historical analysis
- `DELETE /api/history/:id` — Delete historical item

---

## Production Build & Deployment

### Build Frontend
```bash
cd frontend
npm run build
```
This generates the optimized static production bundle in `frontend/dist`.

### Production Server
In production environments, serve `frontend/dist` using Nginx, Vercel, or Express static middleware:
```javascript
// Example in server.js:
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});
```

