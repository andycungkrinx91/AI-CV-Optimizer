import streamlit as st
import requests
import os
import base64
from PIL import Image

# --- Page Configuration: Use the custom logo for the page icon ---
try:
    logo_image = Image.open("logo.png")
    st.set_page_config(
        page_title="AI CV Optimizer",
        page_icon=logo_image,
        layout="wide"
    )
except FileNotFoundError:
    # Fallback to a default emoji if the logo file is not found
    st.set_page_config(
        page_title="AI CV Optimizer",
        page_icon="📄",
        layout="wide"
    )

# --- Custom Styling with Violet Palette ---
st.markdown("""
<style>
    /* General App Styling */
    .stApp {
        background-color: #F5F3FF; /* violet-50 */
    }
    /* Main block container */
    .st-emotion-cache-1y4p8pa {
        padding-top: 2rem;
        padding-bottom: 3rem;
    }
    /* Input Form Container */
    .st-emotion-cache-16txtl3 {
        padding: 2rem;
        background-color: #FFFFFF;
        border: 1px solid #DDD6FE; /* violet-200 */
        border-radius: 1rem;
    }
    /* Metric styling for the score */
    .stMetric {
        background-color: #FFFFFF;
        border: 1px solid #DDD6FE;
        border-radius: 1rem;
        padding: 1.5rem;
        text-align: center;
    }
    /* Tab styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 24px;
        border-bottom: 2px solid #DDD6FE;
    }
    .stTabs [data-baseweb="tab"] {
        height: 44px;
        background-color: transparent;
        padding-left: 0;
        padding-right: 0;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px; /* Align with the border */
        font-weight: 600;
        font-size: 1.1rem;
        color: #5B21B6; /* violet-800 */
    }
    .stTabs [aria-selected="true"] {
        border-bottom-color: #7C3AED; /* violet-600 */
        color: #7C3AED;
    }
    /* Primary button styling */
    .stButton>button {
        font-weight: 600;
        font-size: 1rem;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        background-color: #7C3AED;
        color: white;
    }
    .stButton>button:hover {
        background-color: #6D28D9;
        color: white;
    }
    /* Result text styling */
    .stAlert, .st-emotion-cache-1b22p9e {
        font-size: 1.05rem;
    }
    /* Footer Styling */
    .footer {
        text-align: center;
        padding: 2rem 0;
        color: #6B7280; /* gray-500 */
        font-size: 0.875rem;
    }
    .footer a {
        color: #6D28D9; /* violet-700 */
        font-weight: 600;
        text-decoration: none;
    }
    .footer a:hover {
        text-decoration: underline;
    }
</style>
""", unsafe_allow_html=True)


# --- Get variables from the container's environment ---
BACKEND_URL = os.getenv("BACKEND_API_URL")
API_TOKEN = os.getenv("API_AUTH_TOKEN")


# --- Function to get the logo as a Base64 encoded image ---
def get_logo_html(file_path="logo.png"):
    """Reads a local image file and returns an HTML img tag with a specific size."""
    try:
        with open(file_path, "rb") as f:
            data = base64.b64encode(f.read()).decode("utf-8")
        return f'<img src="data:image/png;base64,{data}" height="120px">'
    except FileNotFoundError:
        return "📄"


# --- Header, adjusted for a smaller logo ---
logo_html = get_logo_html()
st.markdown(
    f"""
    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
        <div style="margin-right: -30px;margin-top: 20px;">
            {logo_html}
        </div>
        <h1 style='color: #4C1D95; margin: 0; line-height: 1; font-size: 1.5rem;'>AI CV Optimizer</h1>
    </div>
    <p style='text-align: center; color: #5B21B6; margin-bottom: 2rem; font-size: 1rem;'>
        Upload your CV and a job description to get instant, AI-powered analysis.
    </p>
    """,
    unsafe_allow_html=True
)

# --- Session State Initialization ---
if 'analysis_result' not in st.session_state:
    st.session_state.analysis_result = None

# --- Input Form ---
with st.container(border=True):
    col1, col2 = st.columns(2)
    with col1:
        uploaded_cv = st.file_uploader("1. Upload Your CV", type="pdf", label_visibility="visible")
    with col2:
        job_description = st.text_area("2. Paste Job Description", height=180, label_visibility="visible")

    submit_button = st.button("✨ Analyze and Optimize", use_container_width=True, type="primary")

# --- API Call and Processing Logic ---
if submit_button:
    if not uploaded_cv:
        st.warning("Please upload a CV to continue.", icon="📄")
    elif not job_description:
        st.warning("Please paste a job description to continue.", icon="📋")
    elif not API_TOKEN or not BACKEND_URL:
        st.error("CRITICAL: Frontend configuration is missing.")
    else:
        with st.spinner('Contacting AI Backend... This may take a moment.'):
            try:
                files = {'cv_file': (uploaded_cv.name, uploaded_cv.getvalue(), uploaded_cv.type)}
                data = {'job_description': job_description}
                headers = {'Authorization': f'Bearer {API_TOKEN}'}
                response = requests.post(BACKEND_URL, files=files, data=data, headers=headers)

                if response.status_code == 200:
                    st.session_state.analysis_result = response.json()
                else:
                    st.error(f"Error from backend: {response.status_code} - {response.text}")
            except Exception as e:
                st.error(f"An unexpected error occurred: {e}")

# --- Display Results ---
if st.session_state.analysis_result:
    result = st.session_state.analysis_result
    st.success("Analysis Complete!", icon="🎉")

    # --- Display Scores ---
    score_col1, score_col2, score_col3 = st.columns(3)
    with score_col1:
        st.metric(
            label="**CV Match Score**",
            value=f"{result.get('match_score', 0)}%"
        )
    with score_col2:
        st.metric(
            label="**ATS Friendliness**",
            value=f"{result.get('ats_score', 0)}%"
        )
    with score_col3:
        # The main job role fit score is the first one in the suggested list
        suggested_roles = result.get('suggested_job_roles', [])
        main_role_score = 0
        if suggested_roles and isinstance(suggested_roles, list) and len(suggested_roles) > 0:
            main_role_score = suggested_roles[0].get('score', 0)
        st.metric(
            label="**Target Role Fit**",
            value=f"{main_role_score}%"
        )

    # --- Display Persona ---
    persona_name = result.get('persona_name')
    persona_description = result.get('persona_description')
    persona_emoji = result.get('persona_emoji')

    if persona_name and persona_description and persona_emoji:
        st.subheader("Your Persona Overview")

        # Use columns for a nice layout: image on the left, text on the right
        col1, col2 = st.columns([1, 4], gap="medium")
        with col1:
            st.markdown(f"<p style='font-size: 96px; text-align: center;'>{persona_emoji}</p>", unsafe_allow_html=True)
        with col2:
            st.markdown(f"### {persona_name}")
            st.markdown(f"> {persona_description}")

    st.divider()

    # --- Display Detailed Feedback in Tabs ---
    tab1, tab2, tab3, tab4 = st.tabs([
        "✅ **Corrections & Rewrites**",
        "🚀 **Optimization Suggestions**",
        "📄 **ATS Review**",
        "🎯 **Suggested Roles**"
    ])
    with tab1:
        st.subheader("Optimized Professional Summary")
        st.info(result.get('corrected_cv_summary', 'Not available.'))
        st.subheader("Optimized Work Experience")
        st.info(result.get('corrected_cv_experience', 'Not available.'))
        st.subheader("Correction Rationale")
        st.warning(result.get('correction_feedback', 'Not available.'))
    with tab2:
        st.subheader("Actionable Next Steps")
        suggestions = result.get('optimization_suggestions', [])
        for suggestion in suggestions:
            st.markdown(f"- {suggestion}")
    with tab3:
        st.subheader("ATS Friendliness Review")
        suggestions = result.get('ats_suggestions', [])
        for suggestion in suggestions:
            st.markdown(f"- {suggestion}")
    with tab4:
        st.subheader("Suggested Job Roles For You")
        role_suggestions = result.get('suggested_job_roles', [])
        if role_suggestions and isinstance(role_suggestions, list):
            for i, role_info in enumerate(role_suggestions):
                role_name = role_info.get('role', 'N/A')
                role_score = role_info.get('score', 0)
                if i == 0:
                    st.markdown(f"**{role_name}** (Your Target Role)")
                else:
                    st.markdown(f"**{role_name}**")
                st.progress(role_score, text=f"{role_score}% Match")
                st.write("") # Add a little vertical space
        else:
            st.info("No job role suggestions could be generated at this time.")

# --- THIS IS THE UPDATED FOOTER ---
st.markdown("---")
st.markdown(
    """
    <p class='footer'>
        Copyright <a href="https://www.linkedin.com/in/andy-setiyawan-452396170/" target="_blank">Andy Setiyawan</a>. All rights reserved © 2025 
    </p>
    """,
    unsafe_allow_html=True
)