# MediGuide AI - Medical Report Analyzer

Educational tool that reads medical lab reports (PDF or photo), extracts the values,
flags LOW / HIGH using the reference ranges printed on the report, and explains them in
simple language. It does **not** diagnose or prescribe.

```
React (Vite)  ->  Express API  ->  MySQL
                      |-> LLM (Groq, Gemini as fallback)
                      |-> Python service (BioBERT) for finding the report lines relevant to a question
```

## One-time setup

1. **MySQL** must be running. Create `backend/.env` (never commit it):

   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=medical_report_analyzer
   DB_PORT=3306
   JWT_SECRET=a_long_random_string
   NODE_ENV=development

   LLM_BASE_URL=https://api.groq.com/openai/v1
   LLM_API_KEY=your_groq_key
   LLM_MODEL=openai/gpt-oss-120b
   LLM_FALLBACK_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
   LLM_FALLBACK_API_KEY=your_gemini_key
   LLM_FALLBACK_MODEL=gemini-3.8-flash
   ```

2. Install and create the tables:

   ```
   cd backend && npm install && npm run initdb
   cd ../frontend && npm install
   cd ../python_ai_service && python -m venv .venv
   .venv\Scripts\python -m pip install --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt
   ```

## Run (three terminals)

```
cd backend && npm start                      # http://localhost:5000
cd frontend && npm run dev                   # http://localhost:3000
cd python_ai_service && .venv\Scripts\python main.py   # http://localhost:8000 (optional)
```

The Python service is optional: without it, questions are still answered, just without the
BioBERT step. The first question downloads the BioBERT model (about 400 MB).

## Tests

```
cd backend && npm test
```

## How a report is processed

1. Upload (PDF/JPG/PNG, max 20 MB) -> saved in `backend/uploads` with a safe random name.
2. Text: PDF text layer; if none (scanned), OCR with tesseract.js.
3. Rules (`services/extractionService.js`) find test name, value, unit and reference range,
   and the report date/type. LOW/HIGH/NORMAL is calculated in code, never by the LLM.
   If OCR damaged a reference range, the result is marked UNKNOWN instead of guessing.
4. Rows go to `lab_results`; the dashboard, history, compare and trends read from MySQL.
5. The LLM writes a simple summary from those stored values (cached in `medical_reports.ai_summary`).

## Dashboard metrics

- **Reports Analyzed**: completed reports this month for the logged-in user.
- **Abnormal Values**: count of LOW + HIGH rows.
- **Extraction Quality**: average, over completed reports, of the % of extracted rows where a
  reference range was found on the report. It measures extraction, not medical accuracy.
- **Health Score**: not calculated. No documented algorithm exists, so it shows `--`.

## Where things are

- `backend/services/` - pdf, ocr, extraction, report pipeline, LLM, knowledge base
- `backend/data/medicalKnowledge.json` - small MedlinePlus-based knowledge base (source, title, topic, parameter, section, url)
- `backend/controllers`, `routes`, `middleware` - API (JWT-protected; user id always comes from the token)
- `python_ai_service/` - BioBERT ranking of report lines for a question

Log prefixes: `[DB] [AUTH] [REPORT] [OCR] [NLP] [AI] [QA] [API]`.
