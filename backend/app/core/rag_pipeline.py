import io
from pypdf import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from .config import settings

# --- The structured output we expect from the AI ---
response_schemas = [
    # --- Scores ---
    ResponseSchema(name="match_score", description="A holistic score from 0-100 on how well the CV aligns with the job description, considering keywords, experience level, and required qualifications.", type="integer"),
    ResponseSchema(name="ats_score", description="A score from 0-100 for ATS compatibility. Penalize for images, tables, columns, and non-standard fonts/headings. Reward for keyword density and standard resume format.", type="integer"),

    # --- Analysis & Persona ---
    ResponseSchema(name="persona_name", description="A creative, epic, and professional title for the candidate that combines their core skills, inspired by archetypes (e.g., 'Sang Arsitek & Pengawal Infrastruktur Awan'). Respond in the CV's original language.", type="string"),
    ResponseSchema(name="persona_description", description="A powerful 1-2 sentence summary explaining why the candidate fits the epic persona title, referencing their specific skills. Respond in the CV's original language.", type="string"),
    ResponseSchema(name="persona_emoji", description="A single emoji that visually represents the persona's combined core skills (e.g., 🛡️ for an architect & guardian).", type="string"),
    ResponseSchema(name="correction_feedback", description="The rationale for the rewrites. Explain *why* the changes improve the CV, linking them to the STAR method, impact metrics, and alignment with the job description.", type="string"),

    # --- Actionable Suggestions (as lists) ---
    ResponseSchema(
        name="optimization_suggestions",
        description="A list of 3-5 high-level, strategic recommendations for the candidate's career trajectory based on the analysis, going beyond immediate CV fixes.",
        type="list"
    ),
    ResponseSchema(
        name="ats_suggestions",
        description="A list of concrete actions to improve the ATS score. Must include specific missing keywords from the job description and point out any formatting issues (e.g., 'Missing keywords: FastAPI, CI/CD', 'Remove the two-column layout').",
        type="list"
    ),
    ResponseSchema(
        name="suggested_job_roles",
        description="A list of dictionaries identifying suitable job roles. The first item MUST be the target job role from the job description. Add 2-4 alternative roles. Each dictionary must have 'role' (string) and 'score' (integer 0-100). Example: [{'role': 'Senior Python Developer', 'score': 85}, {'role': 'DevOps Engineer', 'score': 70}]",
        type="list"
    ),

    # --- Rewritten Content ---
    ResponseSchema(
        name="corrected_cv_summary",
        description="A fully rewritten, powerful 2-3 sentence professional summary, tailored as an 'elevator pitch' for this specific job role and packed with relevant keywords.",
        type="string"
    ),
    ResponseSchema(
        name="corrected_cv_experience",
        description="A fully rewritten version of the most relevant work experience, with 3-4 bullet points. Each point must start with a strong action verb and include quantifiable results (e.g., '...increasing efficiency by 15%').",
        type="string"
    )
]
output_parser = StructuredOutputParser.from_response_schemas(response_schemas)

def process_cv_and_review(cv_content: bytes, job_description: str):
    """
    Processes a CV using a hybrid approach: RAG for analysis and full-context for rewriting.
    """
    print("--- Starting Hybrid RAG Pipeline ---")
    try:
        # --- 1. PDF Parsing and Text Splitting ---
        print("[1/5] Parsing PDF and splitting text...")
        full_cv_text = ""
        pdf_file = io.BytesIO(cv_content)
        pdf_reader = PdfReader(pdf_file)
        for page in pdf_reader.pages:
            full_cv_text += page.extract_text() or ""

        if not full_cv_text:
            print("[ERROR] No text could be extracted from the PDF.")
            return {}

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=250)
        chunks = text_splitter.split_text(text=full_cv_text)
        print(f"[1/5] PDF parsed. Text split into {len(chunks)} chunks.")

        # --- 2. Initialize Models & Embeddings ---
        print("[2/5] Initializing Google AI models...")
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=settings.GOOGLE_API_KEY)
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
        llm = ChatGoogleGenerativeAI(
            model=settings.GOOGLE_MODEL_NAME,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=settings.LLM_TEMPERATURE,
            max_output_tokens=settings.LLM_MAX_TOKENS,
            safety_settings=safety_settings
        )
        print("[2/5] Models initialized.")

        # --- 3. Create FAISS Index and Retrieve Context for Analysis ---
        print("[3/5] Creating FAISS index and retrieving relevant context...")
        vector_store = FAISS.from_texts(texts=chunks, embedding=embeddings)
        retriever = vector_store.as_retriever(search_kwargs={"k": 5}) # Get top 5 relevant chunks
        retrieved_docs = retriever.invoke(job_description)
        retrieved_context = "\n\n---\n\n".join([doc.page_content for doc in retrieved_docs])
        print("[3/5] FAISS context retrieved.")

        # --- 4. Create Hybrid Prompt and Chain ---
        print("[4/5] Creating hybrid prompt...")
        format_instructions = output_parser.get_format_instructions()
        
        prompt = PromptTemplate(
            template="""You are a world-class AI career coach and technical recruiter. Your task is to provide a comprehensive, rich, and highly relevant analysis of a CV against a specific job description. Your feedback must be actionable, encouraging, and directly tied to the provided texts. Respond in the CV's original language (e.g., English or Indonesian).

            **CORE ANALYSIS PRINCIPLES:**
            1.  **Direct Comparison**: For every piece of feedback, you MUST cross-reference the `FULL CV TEXT` with the `JOB DESCRIPTION`. Your goal is to close the gap between the two.
            2.  **Be Specific & Actionable**: Do not give generic advice. Provide concrete examples and quantifiable suggestions. Instead of "add more keywords," say "Incorporate keywords like 'FastAPI', 'PostgreSQL', and 'CI/CD' from the job description into your experience bullet points."
            3.  **Impact-Oriented Rewrites**: When rewriting sections, explain *why* the new version is better. Focus on demonstrating achievements and results, not just listing responsibilities. Use the STAR (Situation, Task, Action, Result) method as a guiding principle for experience points.

            **PERSONA ANALYSIS (Superhero & Wayang Dynamic Character):**
            Your goal is to create a unique, professional, and highly creative "Coder Persona" for the candidate, localized to the CV's language (English or Indonesian). The persona MUST be based on a Superhero or Wayang character archetype.

            1.  **Analyze Core Skills**: Deeply analyze the `FULL CV TEXT` to identify the candidate's primary and secondary areas of expertise (e.g., Infrastructure, Security, Backend Development).
            2.  **Create a Character-Based Title**: Generate a powerful `persona_name` that creates an analogy between the candidate's skills and a specific **Superhero** or **Wayang Character**. The title must be epic, memorable, and professional.
            3.  **Write a Detailed Description**: The `persona_description` should be a concise, powerful summary of *why* they fit this character persona, directly referencing their skills from the CV.
            4.  **Localize**: Ensure the `persona_name` and `persona_description` are in the CV's original language.
            5.  **Choose a Relevant Emoji**: Provide a single, relevant `persona_emoji` that visually represents their core skill(s) in the context of the character.

            **High-Quality Examples:**
            - **Example 1 (Indonesian - Wayang Inspired - Unique dynamic persona_name, persona_emoji, persona_description):**
              - CV shows skills in reliability, security, and system stability.
              - `persona_name`: "Gatotkaca Penjaga Kode"
              - `persona_description`: "Seperti Gatotkaca dengan otot kawat dan tulang besi, Anda adalah penjaga tangguh yang memastikan keandalan dan keamanan sistem, melindungi dari bug dan ancaman."
              - `persona_emoji`: "🛡️"
            - **Example 2 (English - Superhero Inspired - Unique dynamic persona_name, persona_emoji, persona_description):**
              - CV shows skills in system design, building complex features, and using many tools.
              - `persona_name`: "The 'Iron Man' of Software Architecture"
              - `persona_description`: "Like Tony Stark building his suits, you architect and construct complex, high-tech solutions from the ground up, mastering every tool at your disposal."
              - `persona_emoji`: "🤖"

            Your task is to generate the `persona_name`, `persona_description`, and `persona_emoji` fields in the final JSON with Unique dynamic result.

            **DETAILED INSTRUCTIONS:**
            -   **`match_score`, `ats_score`**: Calculate these scores based on a holistic review, using the `RETRIEVED CV SECTIONS` for a quick keyword-based assessment and the `FULL CV TEXT` for a deeper, contextual understanding.
            -   **`ats_suggestions`**:
                -   Identify specific keywords from the `JOB DESCRIPTION` that are missing in the CV.
                -   Check for non-standard formatting (e.g., tables, columns, graphics, headers/footers) that can confuse parsers.
                -   Verify standard section headings (e.g., 'Work Experience', 'Education', 'Skills').
            -   **`suggested_job_roles`**:
                -   Analyze the candidate's skills in the `FULL CV TEXT`. The first item in your list MUST be an analysis against the provided `JOB DESCRIPTION`.
                -   Then, brainstorm 2-4 *alternative* job roles the candidate is qualified for (e.g., 'DevOps Engineer', 'Data Analyst', 'SRE').
                -   Provide a percentage match score for each role, justified by the CV's content.
            -   **`corrected_cv_summary` & `corrected_cv_experience`**:
                -   Rewrite these sections to be concise, powerful, and packed with relevant keywords from the job description.
                -   The summary should be a 2-3 sentence "elevator pitch" for this specific role.
                -   The experience bullet points should start with strong action verbs and include metrics where possible (e.g., "Reduced API latency by 30%...").
            -   **`correction_feedback`**: Clearly explain the rationale behind your rewrites, linking them back to the goal of matching the job description and impressing a recruiter.

            **JOB DESCRIPTION:**
            ----------------
            {job_description}
            ----------------

            **RETRIEVED CV SECTIONS (for initial analysis):**
            ----------------
            {retrieved_context}
            ----------------

            **FULL CV TEXT (for deep analysis, rewriting, and correction):**
            ----------------
            {full_cv_text}
            ----------------

            Provide your response ONLY in the specified JSON format. Your tone should be professional yet encouraging.
            {format_instructions}
            """,
            input_variables=["job_description", "retrieved_context", "full_cv_text"],
            partial_variables={"format_instructions": format_instructions}
        )
        
        chain = prompt | llm | output_parser
        print("[4/5] Hybrid prompt and chain created.")
        
        # --- 5. Invoke Chain and Get Response ---
        print("[5/5] Invoking AI correction chain...")
        response_data = chain.invoke({
            "job_description": job_description,
            "retrieved_context": retrieved_context,
            "full_cv_text": full_cv_text
        })
        print("[5/5] Correction complete.")
        return response_data

    except Exception as e:
        print(f"--- [FATAL ERROR] An error occurred in the pipeline: {e} ---")
        import traceback
        traceback.print_exc()
        return {}