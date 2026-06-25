import { useState, useEffect } from 'react';
import { Server, Database, DatabaseZap, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import './index.css';

const API_BASE = '/api';

function App() {
  const [activeTab, setActiveTab] = useState('backend');
  const [backendStatus, setBackendStatus] = useState('loading');
  const [dbStatus, setDbStatus] = useState('loading');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState([]);

  const checkBackend = async () => {
    setBackendStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/status/backend`);
      if (res.ok) setBackendStatus('online');
      else setBackendStatus('offline');
    } catch {
      setBackendStatus('offline');
    }
  };

  const checkDb = async () => {
    setDbStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/status/database`);
      if (res.ok) setDbStatus('online');
      else setDbStatus('offline');
    } catch {
      setDbStatus('offline');
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/data`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch items');
    }
  };

  useEffect(() => {
    if (activeTab === 'backend') checkBackend();
    if (activeTab === 'database') checkDb();
    if (activeTab === 'data') fetchItems();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputValue })
      });
      if (res.ok) {
        setInputValue('');
        setIsDialogOpen(false);
        fetchItems();
      }
    } catch (err) {
      console.error('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <main className="glass-panel">
        <header>
          <h1>System Control</h1>
          <p>Monitor your 3-tier architecture</p>
        </header>

        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'backend' ? 'active' : ''}`}
            onClick={() => setActiveTab('backend')}
          >
            <Server size={18} /> Backend
          </button>
          <button 
            className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            <Database size={18} /> Database
          </button>
          <button 
            className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <DatabaseZap size={18} /> Data Input
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'backend' && (
            <div className="status-card">
              <h2>Backend Node.js Server</h2>
              <div className={`status-indicator ${backendStatus}`}>
                {backendStatus === 'loading' && <Loader2 className="spin" size={32} />}
                {backendStatus === 'online' && <CheckCircle2 size={32} />}
                {backendStatus === 'offline' && <XCircle size={32} />}
                <span className="status-text">{backendStatus.toUpperCase()}</span>
              </div>
              <button className="refresh-btn" onClick={checkBackend}>Refresh Status</button>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="status-card">
              <h2>PostgreSQL Database</h2>
              <div className={`status-indicator ${dbStatus}`}>
                {dbStatus === 'loading' && <Loader2 className="spin" size={32} />}
                {dbStatus === 'online' && <CheckCircle2 size={32} />}
                {dbStatus === 'offline' && <XCircle size={32} />}
                <span className="status-text">{dbStatus.toUpperCase()}</span>
              </div>
              <button className="refresh-btn" onClick={checkDb}>Refresh Status</button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="data-panel">
              <div className="data-header">
                <h2>Database Entries</h2>
                <button className="primary-btn" onClick={() => setIsDialogOpen(true)}>
                  Add New Entry
                </button>
              </div>
              
              <div className="data-list">
                {items.length === 0 ? (
                  <p className="empty-state">No data available. Add some entries!</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="data-item">
                      <span className="item-id">#{item.id}</span>
                      <span className="item-content">{item.content}</span>
                      <span className="item-date">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Dialog / Modal */}
      {isDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h3>Add New Entry</h3>
            <p>Insert a new record into the PostgreSQL database.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Content Data</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Enter something awesome..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={!inputValue.trim() || isSubmitting}>
                  {isSubmitting ? <Loader2 className="spin" size={18} /> : 'Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
