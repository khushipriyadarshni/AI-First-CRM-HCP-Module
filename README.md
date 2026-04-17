# AI-First CRM HCP Module

This is a modern AI-First Customer Relationship Management module designed specifically for Life Sciences sales representatives logging interactions with Healthcare Professionals (HCPs).

It features a unique **split-screen architecture**:
- **Left Panel:** A rigid, structured form mapped directly to a SQL database.
- **Right Panel:** A LangGraph powered AI Assistant that drives the form automatically.

*Rule enforced:* Users cannot edit the form manually. They must converse with the AI naturally (e.g. "Met Dr. Smith, sentiment was positive") causing the AI to seamlessly map fields and edit errors on command.

## Tech Stack
- **Frontend:** React + Redux (Vite), Vanilla CSS, Google Inter Font.
- **Backend:** Python + FastAPI, SQLAlchemy (SQLite default, ready for PostgreSQL).
- **AI Agent Framework:** LangGraph.
- **LLM Engine:** Groq API (`gemma2-9b-it`).

## LangGraph Tools Built
1. `log_interaction`: Extracts unstructured natural language to update multiple interaction form fields at once.
2. `edit_interaction`: Modifies specific fields directly to allow error-correction.
3. `search_hcp_directory`: Mock internal directory search to guarantee exact spelling and profiles.
4. `get_available_materials`: Allows the agent to query mock product brochures logically.
5. `schedule_follow_up`: Injects scheduling logic directly into the form's next steps.

## How to Run It

Since this was designed to start instantly on your local machine, follow the instructions across two separate terminal tabs.

### Prerequisites
1. Get a [Groq API Key](https://console.groq.com/keys)

### 1. Start the Backend API (FastAPI)
Open a terminal in the root directory:
```powershell
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your Groq API Key
# Now, simply edit the file named `.env` in this backend folder
# and paste your GROQ_API_KEY inside it.

# Start the server on port 8000
uvicorn main:app --reload
```

### 2. Start the Frontend (Vite/React)
Open a second terminal in the root directory:
```powershell
cd frontend

# Install the dependencies (React, Redux Toolkit, Axios, etc)
npm install

# Start the Vite Dev Server
npm run dev
```

Navigate to `http://localhost:5173` to see the module. 
Interact with the right panel by typing things like: "Today I met Dr. Smith and showed the Product X Efficacy Brochure. The sentiment was positive." and watch the left panel instantly fill out!
