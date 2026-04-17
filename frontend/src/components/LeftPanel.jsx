import React from 'react';
import { useSelector } from 'react-redux';

export default function LeftPanel() {
  const formState = useSelector((state) => state.interaction);

  return (
    <div className="left-panel">
      <div className="panel-header">
        <h2>Log HCP Interaction</h2>
        <p style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px'}}>
          Interaction Details (Read-only. Please use the AI Assistant to log data)
        </p>
      </div>
      
      <div className="panel-content">
        <div className="form-grid">
          <div className="form-group">
            <label>HCP Name</label>
            <input type="text" className="form-control" readOnly value={formState.hcp_name || ''} placeholder="Search or select HCP..." />
          </div>
          
          <div className="form-group">
            <label>Interaction Type</label>
            <input type="text" className="form-control" readOnly value={formState.interaction_type || ''} />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input type="text" className="form-control" readOnly value={formState.date || ''} placeholder="DD-MM-YYYY" />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input type="text" className="form-control" readOnly value={formState.time || ''} placeholder="HH:MM" />
          </div>

          <div className="form-group full-width">
            <label>Attendees</label>
            <input type="text" className="form-control" readOnly value={formState.attendees || ''} placeholder="Enter names or search..." />
          </div>

          <div className="form-group full-width">
            <label>Topics Discussed</label>
            <textarea className="form-control" readOnly value={formState.topics_discussed || ''} placeholder="Key discussion points..."></textarea>
          </div>

          <div className="form-group full-width">
            <label>Materials Shared</label>
            <textarea className="form-control" readOnly value={formState.materials_shared || ''} placeholder="Materials/Brochures given..."></textarea>
          </div>

          <div className="form-group full-width">
            <label>Samples Distributed</label>
            <textarea className="form-control" readOnly value={formState.samples_distributed || ''} placeholder="Any generic samples..."></textarea>
          </div>

          <div className="form-group full-width">
            <label>Observed/Inferred HCP Sentiment</label>
            <div className="radio-group" style={{pointerEvents: 'none'}}>
              <label className="radio-label">
                <input type="radio" checked={formState.sentiment?.toLowerCase() === 'positive'} readOnly />
                😊 Positive
              </label>
              <label className="radio-label">
                <input type="radio" checked={formState.sentiment?.toLowerCase() === 'neutral'} readOnly />
                😐 Neutral
              </label>
              <label className="radio-label">
                <input type="radio" checked={formState.sentiment?.toLowerCase() === 'negative'} readOnly />
                😠 Negative
              </label>
            </div>
            {/* Show parsed text directly as well if it doesn't match standard three */}
            {formState.sentiment && !['positive', 'neutral', 'negative'].includes(formState.sentiment.toLowerCase()) && (
              <p style={{fontSize:'0.8rem', color:'var(--primary-color)', marginTop:'4px'}}>Raw: {formState.sentiment}</p>
            )}
          </div>

          <div className="form-group full-width">
            <label>Outcomes</label>
            <textarea className="form-control" readOnly value={formState.outcomes || ''} placeholder="Key outcomes or agreements..."></textarea>
          </div>

          <div className="form-group full-width">
            <label>Follow-up Actions</label>
            <textarea className="form-control" readOnly value={formState.follow_up_actions || ''} placeholder="Next steps..."></textarea>
          </div>

        </div>
      </div>
    </div>
  );
}
