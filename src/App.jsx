import React, { useState, useEffect } from 'react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // Tabs!
  const [temperature, setTemperature] = useState(85);
  const [logs, setLogs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("Normal");
  const [loading, setLoading] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Pura Vida! I am your AI assistant. How can I help you monitor the system today?' }
  ]);

  const fetchData = async () => {
    try {
      const logRes = await fetch('http://127.0.0.1:8000/api/logs');
      setLogs(await logRes.json());
      const ticketRes = await fetch('http://127.0.0.1:8000/api/tickets');
      setTickets(await ticketRes.json());
    } catch (error) {
      console.error("Backend offline?");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const sendSensorData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/sensor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensor_id: "Pump_Alpha_1", temperature: parseFloat(temperature) }),
      });
      const data = await response.json();
      setCurrentStatus(data.status);
      fetchData(); 
    } catch (error) {
      alert("Make sure your Python server is running!");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user', text: chatInput }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsChatting(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput }),
      });
      const data = await response.json();
      setChatMessages([...newMessages, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setChatMessages([...newMessages, { role: 'ai', text: "Error: Comm-link offline." }]);
    } finally {
      setIsChatting(false);
    }
  };

  // --- NEW: EXCEL (CSV) EXPORTER ---
  const exportToExcel = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/all_logs');
      const data = await res.json();
      
      if (data.length === 0) return alert("No data to export!");

      // Convert JSON to CSV format (which Excel opens natively)
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(",")).join("\n");
      const csv = `${headers}\n${rows}`;
      
      // Trigger the browser download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Pura_Vida_Telemetry.csv';
      a.click();
    } catch (error) {
      alert("Failed to export data.");
    }
  };

  // Fresh Pura Vida Colors
  const getVisuals = (temp) => {
    if (temp < 90) return { color: '#059669', status: 'SYSTEM NOMINAL' }; // Emerald
    if (temp >= 90 && temp < 110) return { color: '#d97706', status: 'WARNING' }; // Amber
    return { color: '#dc2626', status: 'CRITICAL OVERHEAT' }; // Red
  };

  const visuals = getVisuals(temperature);

  return (
    <div style={styles.appWrapper}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&family=Nunito:wght@400;600;700&display=swap');`}
      </style>

      <div style={styles.container}>
        
        {/* HEADER & TABS */}
        <header style={styles.header}>
          <div style={styles.branding}>
            <h1 style={styles.title}>Pura Vida <span style={styles.titleLight}>Systems</span></h1>
            <p style={styles.subtitle}>AI-Driven Environmental & Hardware Telemetry</p>
          </div>
          
          <div style={styles.tabContainer}>
            <button 
              style={activeTab === 'dashboard' ? styles.activeTab : styles.inactiveTab}
              onClick={() => setActiveTab('dashboard')}
            >
              Live Dashboard
            </button>
            <button 
              style={activeTab === 'data' ? styles.activeTab : styles.inactiveTab}
              onClick={() => setActiveTab('data')}
            >
              Data Center & Export
            </button>
          </div>
        </header>

        {/* --- TAB 1: LIVE DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div style={styles.bentoGrid}>
            
            {/* Telemetry */}
            <div style={styles.glassCard}>
              <h3 style={styles.cardTitle}>LIVE TELEMETRY</h3>
              <div style={styles.telemetryDisplay}>
                <div style={{...styles.tempNumber, color: visuals.color}}>
                  {temperature}<span style={styles.degreeSymbol}>°C</span>
                </div>
                <div style={{...styles.statusLabel, color: visuals.color}}>{visuals.status}</div>
              </div>
              <input type="range" min="50" max="150" value={temperature} onChange={(e) => setTemperature(e.target.value)} style={styles.slider} />
              <button onClick={sendSensorData} disabled={loading} style={{...styles.button, backgroundColor: visuals.color}}>
                {loading ? 'SYNCING...' : 'TRANSMIT SENSOR DATA'}
              </button>
            </div>

            {/* Pura Vida Chatbox */}
            <div style={styles.glassCard}>
              <h3 style={styles.cardTitle}>🌿 PURA VIDA CHATBOX</h3>
              <div style={styles.chatWindow}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={msg.role === 'user' ? styles.userMessage : styles.aiMessage}>
                    {msg.text}
                  </div>
                ))}
                {isChatting && <div style={styles.aiMessage}>Thinking...</div>}
              </div>
              <div style={styles.chatInputRow}>
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask about the JSON data..." style={styles.chatInput} />
                <button onClick={handleSendMessage} disabled={isChatting} style={styles.chatSendBtn}>ASK</button>
              </div>
            </div>

            {/* Autonomous Actions */}
            <div style={{...styles.glassCard, gridColumn: 'span 2'}}>
              <h3 style={styles.cardTitle}>AUTONOMOUS ACTIONS</h3>
              <div style={styles.logList}>
                {logs.length === 0 ? <p>Awaiting system data...</p> : 
                  logs.map((log) => (
                    <div key={log.id} style={{...styles.logItem, borderLeft: `4px solid ${getVisuals(log.temperature).color}`}}>
                      <strong>{log.timestamp}</strong> - {log.explanation}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: DATA CENTER --- */}
        {activeTab === 'data' && (
          <div style={styles.glassCard}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={styles.cardTitle}>DATABASE RECORDS</h3>
              <button onClick={exportToExcel} style={styles.exportBtn}>
                📥 Export to Excel (CSV)
              </button>
            </div>
            
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Sensor</th>
                    <th style={styles.th}>Temp (°C)</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} style={styles.tr}>
                      <td style={styles.td}>{log.timestamp}</td>
                      <td style={styles.td}>{log.sensor_id}</td>
                      <td style={{...styles.td, color: getVisuals(log.temperature).color, fontWeight: 'bold'}}>{log.temperature}</td>
                      <td style={styles.td}>{log.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// --- PURA VIDA STYLES ---
const styles = {
  appWrapper: { 
    minHeight: '100vh', 
    // Beautiful, fresh tropical leaves Unsplash background
    backgroundImage: `linear-gradient(rgba(240, 24df, 244, 0.8), rgba(230, 240, 235, 0.9)), url('https://images.unsplash.com/photo-1518182170546-076616fdcb18?q=80&w=2070&auto=format&fit=crop')`, 
    backgroundSize: 'cover', backgroundAttachment: 'fixed', 
    fontFamily: "'Nunito', sans-serif", color: '#1e293b', 
    display: 'flex', justifyContent: 'center', padding: '40px 20px' 
  },
  container: { width: '100%', maxWidth: '1000px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' },
  branding: { flex: 1 },
  title: { fontFamily: "'Montserrat', sans-serif", fontSize: '3rem', margin: '0 0 5px 0', color: '#0f766e', fontWeight: '800', letterSpacing: '-1px' },
  titleLight: { fontWeight: '400', color: '#059669' },
  subtitle: { margin: 0, fontSize: '1rem', color: '#475569', fontWeight: '600' },
  
  // Tabs
  tabContainer: { display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.5)', padding: '5px', borderRadius: '12px' },
  activeTab: { background: '#0f766e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  inactiveTab: { background: 'transparent', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },

  bentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  
  // Light, clean Glassmorphism
  glassCard: { background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 1)', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  cardTitle: { fontSize: '0.9rem', letterSpacing: '2px', color: '#64748b', fontWeight: '800', marginTop: 0, borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', textTransform: 'uppercase' },
  
  telemetryDisplay: { textAlign: 'center', marginBottom: '20px' },
  tempNumber: { fontFamily: "'Montserrat', sans-serif", fontSize: '5rem', fontWeight: '800', lineHeight: '1' },
  degreeSymbol: { fontSize: '2rem', verticalAlign: 'top', color: '#94a3b8' },
  statusLabel: { fontSize: '1.2rem', fontWeight: '800', marginTop: '10px', letterSpacing: '2px' },
  
  slider: { width: '100%', cursor: 'pointer', marginBottom: '20px', accentColor: '#0f766e' },
  button: { width: '100%', padding: '15px', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', letterSpacing: '1px' },
  
  // Chat Styles
  chatWindow: { flexGrow: 1, maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px', paddingRight: '5px' },
  aiMessage: { alignSelf: 'flex-start', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '12px 12px 12px 0', fontSize: '0.9rem', color: '#334155', maxWidth: '85%' },
  userMessage: { alignSelf: 'flex-end', background: '#ccfbf1', border: '1px solid #5eead4', padding: '12px', borderRadius: '12px 12px 0 12px', fontSize: '0.9rem', color: '#0f766e', maxWidth: '85%' },
  chatInputRow: { display: 'flex', gap: '10px' },
  chatInput: { flexGrow: 1, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', color: '#0f172a', outline: 'none' },
  chatSendBtn: { background: '#0f766e', color: 'white', border: 'none', borderRadius: '8px', padding: '0 20px', fontWeight: 'bold', cursor: 'pointer' },

  // Logs & Data
  logList: { maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  logItem: { background: '#f8fafc', padding: '15px', borderRadius: '10px', fontSize: '0.9rem', color: '#475569' },
  
  // Excel Table
  exportBtn: { background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '15px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontWeight: 'bold' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '15px', color: '#334155' }
};

export default App;