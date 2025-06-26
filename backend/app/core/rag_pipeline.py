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
    ResponseSchema(name="match_score", description="A percentage score from 0-100 of how well the CV matches the job description, based on the retrieved context.", type="integer"),
    ResponseSchema(name="personality_analysis", description="A brief analysis of the candidate's personality traits as inferred from the retrieved context. Respond in the CV's original language.", type="string"),
    ResponseSchema(name="correction_feedback", description="A summary of the corrections made. Explain WHY the changes were made, based on the full CV text. Respond in the CV's original language.", type="string"),
    ResponseSchema(name="optimization_suggestions", description="A list of 3-5 high-level suggestions for further improvement. Respond in the CV's original language.", type="list"),
    ResponseSchema(name="corrected_cv_summary", description="A fully rewritten, optimized version of the CV's professional summary, based on the full CV text. Respond in the CV's original language.", type="string"),
    ResponseSchema(name="corrected_cv_experience", description="A fully rewritten, optimized version of the bullet points for the single most relevant work experience, based on the full CV text. Respond in the CV's original language.", type="string")
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
        # This prompt uses both the retrieved context (for speed) and the full context (for quality)
        print("[4/5] Creating hybrid prompt...")
        format_instructions = output_parser.get_format_instructions()
        
        prompt = PromptTemplate(
            template="""You are a world-class AI career coach. Your task is to provide a comprehensive analysis and correction of a CV for a specific job. Respond in the CV's language.

            **INSTRUCTIONS:**
            1.  For calculating the `match_score` and `personality_analysis`, primarily use the `RETRIEVED CV SECTIONS`. This gives a focused analysis.
            2.  For `correction_feedback`, `corrected_cv_summary`, and `corrected_cv_experience`, you MUST use the `FULL CV TEXT` to ensure you have complete context for high-quality rewriting.

            **JOB DESCRIPTION:**
            ----------------
            {job_description}
            ----------------

            **RETRIEVED CV SECTIONS (for analysis):**
            ----------------
            {retrieved_context}
            ----------------

            **FULL CV TEXT (for rewriting and correction):**
            ----------------
            {full_cv_text}
            ----------------

            Provide your response ONLY in the specified JSON format.
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