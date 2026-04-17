import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from database import engine, Base, SessionLocal
from models import Interaction
from agent import process_chat_message

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-First CRM HCP Module")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ChatRequest(BaseModel):
    message: str
    current_form_state: Dict[str, Any]

class ChatResponse(BaseModel):
    response: str
    new_form_state: Dict[str, Any]

class SaveInteractionRequest(BaseModel):
    form_state: Dict[str, Any]

@app.post("/api/chat", response_model=ChatResponse)
def handle_chat(request: ChatRequest):
    try:
        response_text, new_state = process_chat_message(request.message, request.current_form_state)
        return ChatResponse(response=response_text, new_form_state=new_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interactions")
def save_interaction(request: SaveInteractionRequest, db: Session = Depends(get_db)):
    state = request.form_state
    new_interaction = Interaction(
        hcp_name=state.get("hcp_name"),
        interaction_type=state.get("interaction_type"),
        date=state.get("date"),
        time=state.get("time"),
        attendees=state.get("attendees"),
        topics_discussed=state.get("topics_discussed"),
        materials_shared=state.get("materials_shared"),
        samples_distributed=state.get("samples_distributed"),
        sentiment=state.get("sentiment"),
        outcomes=state.get("outcomes"),
        follow_up_actions=state.get("follow_up_actions")
    )
    db.add(new_interaction)
    db.commit()
    db.refresh(new_interaction)
    return {"status": "success", "id": new_interaction.id}

@app.get("/api/interactions")
def list_interactions(db: Session = Depends(get_db)):
    interactions = db.query(Interaction).all()
    return interactions
