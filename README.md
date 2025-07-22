# 🧠 AI CV Optimizer

![CV Optimizer UI](https://raw.githubusercontent.com/andycungkrinx91/AI-CV-Optimizer/master/frontend/logo-github.png)
[![Watch the demo](https://raw.githubusercontent.com/andycungkrinx91/AI-CV-Optimizer/master/thumbnail.png)](https://drive.google.com/file/d/1KavzrGTsjs8uE90ydoQUK9ZDGzOias23/view?usp=sharing)

**AI CV Optimizer** is a full-stack, AI-powered web application designed to help job seekers improve their CVs. Users can upload their CV, paste a job description, and get personalized feedback including:

- ✅ **Comprehensive Scores**: CV Match, ATS Friendliness, and Target Role Fit.
- 🦸 **Your Coder Persona**: A dynamic, creative analysis of your work style based on Superhero or Wayang archetypes (e.g., "Gatotkaca Penjaga Kode").
- ✍️ **AI-Powered Rewrites**: Optimized summaries and experience sections.
- 🚀 **Actionable Suggestions**: Concrete steps to improve your CV and a list of alternative job roles you're suited for.

All tailored specifically to the target job role.

---

## 📚 Table of Contents

- [🧰 Technology Stack](#-technology-stack)
- [🔁 System Flow](#-system-flow)
- [📁 Project Structure](#-project-structure)
- [⚙️ Configuration (.env)](#-configuration-env)
- [🚀 Running the Project](#-running-the-project)
- [🧪 Testing the Backend](#-testing-the-backend)
- [🔑 Getting a Google AI API Key](#-getting-a-google-ai-api-key)
- [📈 Google AI Models & Rate Limits](#-google-ai-models--rate-limits)

---

## 🧰 Technology Stack

| Component     | Technology                                                                 | Purpose                                                                                           |
|--------------|------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| **Frontend**  | [Streamlit](https://streamlit.io/)                                          | Beautiful and interactive Python-based UI                                                         |
| **Backend**   | [FastAPI](https://fastapi.tiangolo.com/)                                    | High-performance REST API                                                                         |
| **AI Logic**  | [LangChain](https://www.langchain.com/)                                     | RAG-based pipeline to optimize prompts and inference                                              |
| **AI Model**  | [Google Gemini](https://ai.google.dev/)                                     | LLM used for analysis, correction, and generation                                                 |
| **Vector DB** | [FAISS](https://faiss.ai/)                                                  | Efficient similarity search for relevant CV context                                               |
| **Container** | [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) | Isolated, reproducible full-stack development setup                                     |

---

## 🔁 System Flow

1. 📤 **Upload CV**: User uploads PDF CV and pastes a job description.
2. 📡 **API Request**: Streamlit sends the data to FastAPI.
3. 🔒 **Authentication**: Token validated on backend.
4. ⚙️ **AI Pipeline**:
    - Extracts text from PDF.
    - Generates embeddings with Gemini + FAISS.
    - Constructs hybrid prompt (top CV chunks + full CV).
5. 🤖 **AI Generation**: Gemini returns structured insights.
6. 📦 **Response**: FastAPI sends JSON to frontend.
7. 🧾 **Display**: Streamlit shows scores, a dynamic Coder Persona, rewrite suggestions, and a list of suggested job roles.

---

## 📁 Project Structure

```
cv-optimizer-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api/
│   │   │   └── review.py
│   │   └── core/
│   │       ├── config.py
│   │       ├── rag_pipeline.py
│   │       └── security.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── app.py
│   ├── Dockerfile
│   ├── logo.png
│   └── requirements.txt
│
├── .env
└── docker-compose.yml
```

---

## ⚙️ Configuration (.env)

Create a `.env` file in the project root with the following content:

```env
GOOGLE_API_KEY=<your_google_ai_api_key>
GOOGLE_MODEL_NAME=gemini-1.5-flash
LLM_TEMPERATURE=0.8
LLM_MAX_TOKENS=8192
API_AUTH_TOKEN="<your_api_auth_token>" # You can generate random from this https://generate-random.org/api-key-generator
BACKEND_API_URL="http://backend:8000/api/review"
```

---

## 🚀 Running the Project

### ✅ Prerequisites
- Docker & Docker Compose installed.

### ▶️ Steps

```bash
# 1. Clone the repository
git clone https://github.com/andycungkrinx91/AI-CV-Optimizer.git
cd AI-CV-Optimizer

# 2. Create .env file (see above)

# 3. Build and run the app
docker compose up --build
```

Once running, open your browser at:

```
http://localhost:5000
```

---

## 🧪 Testing the Backend

You can test the API with the following `curl` command:

```bash
curl -X POST "http://localhost:8000/api/review" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <your_api_auth_token>" \
  -H "Content-Type: multipart/form-data" \
  -F "cv_file=@/path/to/your/cv.pdf" \
  -F "job_description=@job-description.txt"
```

---

## 🔑 Getting a Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app).
2. Click **Get API Key**.
3. Create a new project → Copy the API key.
4. Paste it into your `.env` file as `GOOGLE_API_KEY`.

---

## 📈 Google AI Models & Rate Limits

| Model Name             | Use Case                   | Notes                                   |
|------------------------|----------------------------|-----------------------------------------|
| `gemini-1.5-flash`     | Recommended, fast & cheap  | Ideal for real-time interaction         |
| `gemini-1.5-pro`       | Deep reasoning tasks        | Slower and more expensive               |
| `models/embedding-001`| Embedding CV/job text      | Used for FAISS vector search            |

### ⚠️ Rate Limits (Free Tier)
- **60 requests/minute**
- You’ll receive HTTP `429` if exceeded.

---

## 💎 Credits

Built with ❤️ by **Gem Custom**

---

## 🧠 Bonus Ideas

- Integrate LinkedIn scraping 🧲
- Score comparison over time 📊
