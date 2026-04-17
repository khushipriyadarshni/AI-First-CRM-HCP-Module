import React from 'react';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { resetForm } from './store/interactionSlice';
import { addMessage } from './store/chatSlice';

function App() {
  const formState = useSelector((state) => state.interaction);
  const dispatch = useDispatch();

  const handleSaveToDatabase = async () => {
    try {
      const resp = await axios.post('http://localhost:8000/api/interactions', {
        form_state: formState
      });
      if(resp.data.status === 'success') {
         dispatch(resetForm());
         dispatch(addMessage({ id: Date.now(), sender: 'ai', text: 'Interaction saved to database successfully! Starting a new log.' }));
      }
    } catch (e) {
      alert("Failed to save to database. Ensure backend is running.");
    }
  };

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh'}}>
      <div style={{padding:'1rem 1.5rem', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{fontSize:'1.5rem', color:'var(--primary-color)'}}>AI-First CRM</h1>
        <button 
          onClick={handleSaveToDatabase}
          style={{padding:'0.5rem 1rem', background:'var(--success)', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'600'}}>
          Save Interaction Log
        </button>
      </div>
      <div className="app-container">
        <LeftPanel />
        <RightPanel />
      </div>
    </div>
  );
}

export default App;
