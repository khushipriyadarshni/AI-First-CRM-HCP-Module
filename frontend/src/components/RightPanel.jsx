import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, setLoading } from '../store/chatSlice';
import { updateFormState } from '../store/interactionSlice';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');

export default function RightPanel() {
  const [inputText, setInputText] = useState('');
  const { messages, isLoading } = useSelector((state) => state.chat);
  const formState = useSelector((state) => state.interaction);
  const dispatch = useDispatch();
  const historyRef = useRef(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    dispatch(addMessage({ id: Date.now(), sender: 'user', text: userMessage }));
    setInputText('');
    dispatch(setLoading(true));

    try {
      // Connect to the FastAPI Backend
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: userMessage,
        current_form_state: formState
      });

      const { response: aiText, new_form_state } = response.data;

      // Update Form State Universally
      dispatch(updateFormState(new_form_state));
      
      // Update Chat
      dispatch(addMessage({ id: Date.now(), sender: 'ai', text: aiText }));

    } catch (error) {
      console.error(error);
      let errorMsg = 'Sorry, I encountered an error while contacting the backend API.';
      if (error.response && error.response.data && error.response.data.detail) {
        errorMsg = `Backend Error: ${error.response.data.detail}`;
      }
      dispatch(addMessage({ 
        id: Date.now(), 
        sender: 'ai', 
        text: errorMsg
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="right-panel">
      <div className="panel-header" style={{display:'flex', alignItems: 'center', gap:'0.5rem'}}>
        <div style={{width:'12px', height:'12px', borderRadius:'50%', backgroundColor:'var(--primary-color)'}}></div>
        <h2>AI Assistant</h2>
      </div>
      
      <div className="chat-history" ref={historyRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="chat-bubble ai" style={{opacity: 0.7}}>
            Typing / Processing Tools...
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input 
          type="text" 
          className="chat-input"
          placeholder="Describe interaction or corrections..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button className="send-button" onClick={handleSend} disabled={isLoading}>
          ➤
        </button>
      </div>
    </div>
  );
}
