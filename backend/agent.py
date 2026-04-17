import os
from typing import TypedDict, Annotated, List, Optional
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage, SystemMessage
from langgraph.prebuilt import ToolNode

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    form_state: dict

# Define the 5 LangGraph tools

@tool
def log_interaction(
    hcp_name: Optional[str] = None,
    interaction_type: Optional[str] = None,
    date: Optional[str] = None,
    time: Optional[str] = None,
    attendees: Optional[str] = None,
    topics_discussed: Optional[str] = None,
    materials_shared: Optional[str] = None,
    samples_distributed: Optional[str] = None,
    sentiment: Optional[str] = None,
    outcomes: Optional[str] = None,
    follow_up_actions: Optional[str] = None
):
    """
    Log an interaction with an HCP. Use this tool to extract details from the user's natural language summary
    and structured them into form fields. Return the extracted fields as a dictionary.
    """
    return {
        "hcp_name": hcp_name,
        "interaction_type": interaction_type,
        "date": date,
        "time": time,
        "attendees": attendees,
        "topics_discussed": topics_discussed,
        "materials_shared": materials_shared,
        "samples_distributed": samples_distributed,
        "sentiment": sentiment,
        "outcomes": outcomes,
        "follow_up_actions": follow_up_actions
    }

@tool
def edit_interaction(field_name: str, new_value: str):
    """
    Edit a specific field in the currently logged interaction. Use this when the user
    says something like "Change the sentiment to negative" or "The name was actually Dr. John".
    field_name must match one of the form fields: hcp_name, interaction_type, date, time, attendees,
    topics_discussed, materials_shared, samples_distributed, sentiment, outcomes, follow_up_actions.
    """
    return {"field": field_name, "value": new_value}

@tool
def search_hcp_directory(query: str):
    """
    Search the internal directory for an HCP's exact information based on a partial query.
    Helps resolve fuzzy names to concrete records.
    """
    # Mock data search
    mock_db = {
        "smith": {"name": "Dr. John Smith", "specialty": "Cardiology"},
        "john": {"name": "Dr. John Smith", "specialty": "Cardiology"},
        "sharma": {"name": "Dr. A. Sharma", "specialty": "Oncology"},
    }
    query_lower = query.lower()
    for key, data in mock_db.items():
        if key in query_lower:
            return f"Found matching HCP: {data['name']} ({data['specialty']})"
    return f"No HCP found matching '{query}'"

@tool
def get_available_materials(product_name: str):
    """
    Retrieve available brochures, samples, or digital assets for a specific product.
    Helps the agent know what materials *could* have been shared.
    """
    mock_materials = {
        "product x": ["Product X Efficacy Brochure", "Product X Sample Pack (10mg)"],
        "oncoboost": ["OncoBoost Phase III Clinical Trial PDF"]
    }
    val = mock_materials.get(product_name.lower(), [])
    if val:
        return f"Available materials for {product_name}: {', '.join(val)}"
    return f"No specific materials found in the catalog for {product_name}."

@tool
def schedule_follow_up(action_description: str, time_frame: str):
    """
    Appends a structured follow-up action to the log and 'schedules' it internally.
    Use this when the user needs to follow up later.
    """
    return {"added_follow_up": f"{action_description} (Timing: {time_frame})"}

tools = [
    log_interaction,
    edit_interaction,
    search_hcp_directory,
    get_available_materials,
    schedule_follow_up
]

tool_node = ToolNode(tools)

def get_llm():
    # Use llama-3.3-70b-versatile via Groq because gemma2-9b-it was decommissioned
    # The API key must be set in environment variable: GROQ_API_KEY
    # We provide a safe fallback if not present immediately during build
    api_key = os.environ.get("GROQ_API_KEY", "mock_key_if_not_provided")
    return ChatGroq(model="llama-3.3-70b-versatile", temperature=0, groq_api_key=api_key)

def call_model(state: AgentState):
    llm = get_llm()
    # Bind tools to the LLM
    llm_with_tools = llm.bind_tools(tools)
    
    from datetime import datetime
    current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # We give the LLM context of the current form state so it knows what it's editing
    system_msg = SystemMessage(content=f"You are an AI assistant helping a life sciences sales representative log HCP interactions.\n"
        f"Right now the current real-world date and time is {current_time_str}.\n"
        f"You must use the provided tools to extract structured data from user input and update the interaction form.\n"
        f"The current state of the form is: {state.get('form_state', {})}\n"
        "Never fill out the form manually in your text response. Always use the 'log_interaction' or 'edit_interaction' tools.")
    
    messages = [system_msg] + state["messages"]
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END



workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, ["tools", END])
workflow.add_edge("tools", "agent")

app = workflow.compile()

def process_chat_message(user_message: str, current_form_state: dict):
    initial_state = {
        "messages": [HumanMessage(content=user_message)],
        "form_state": current_form_state
    }
    
    # Run the graph
    events = app.invoke(initial_state)
    
    # Extract AI response text
    ai_msg = events["messages"][-1]
    response_text = ai_msg.content
    
    # We analyze tool messages to compute the new form state
    new_form_state = dict(current_form_state)
    
    for msg in events["messages"]:
        if isinstance(msg, ToolMessage):
            # Try to safely evaluate the string content back to dict if the tool returned a dict
            import json
            try:
                # the ToolNode returns stringified json depending on how it's handled.
                # Since our tools return dicts natively, we can parse them if they were stringified.
                # Actually, langgraph tool_node returns strings of the return values.
                # Wait, if we return a dictionary in the tool, it usually stringifies it.
                data = json.loads(msg.content.replace("'", '"')) 
                
                if msg.name == "log_interaction":
                    for k, v in data.items():
                        if v is not None:
                            new_form_state[k] = v
                            
                elif msg.name == "edit_interaction":
                    field = data.get("field")
                    value = data.get("value")
                    if field:
                        new_form_state[field] = value
                        
                elif msg.name == "schedule_follow_up":
                    existing = new_form_state.get("follow_up_actions", "")
                    addition = data.get("added_follow_up", "")
                    if existing:
                        new_form_state["follow_up_actions"] = existing + "\n" + addition
                    else:
                        new_form_state["follow_up_actions"] = addition
                        
            except Exception:
                pass
            
    return response_text, new_form_state
