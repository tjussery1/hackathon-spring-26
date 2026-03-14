import React, { useState, useEffect } from 'react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fluidType, setFluidType] = useState('Oil');
  const [outsideTemp, setOutsideTemp] = useState(25);
  const [humidity, setHumidity] = useState(50);
  const [simData, setSimData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: 'Chevron Systems Online. Ready for simulation.' }]);

  const chevronBlue = "#00548F";
  const statusColor = simData?.status === 'CRITICAL' ? '#E31B23' : simData?.status === 'Warning' ? '#d97706' : '#059669';

  const fetchData = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/logs');
      if (res.ok) setLogs(await res.json());
    } catch (e) { console.error("History fetch failed"); }
  };

  useEffect(() => { fetchData(); }, []);

  const runSimulation = async () => {
    setLoading(true);
    const payload = { 
        fluid_type: String(fluidType), 
        outside_temp: Number(outsideTemp), 
        humidity: Number(humidity) 
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/sensor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Sync Failed");
      const data = await res.json();
      setSimData(data);
      fetchData();
    } catch (e) { 
      alert("Submission Error. Check Python Terminal."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (e) { setChatMessages(prev => [...prev, { role: 'ai', text: "AI Link Offline." }]); }
  };

  const exportCSV = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/all_logs');
      const data = await res.json();
      const headers = ["Time", "Fluid", "Outside Temp", "Pressure", "Humidity", "Liquid Temp", "PH", "Level", "Load", "Status", "Explanation"];
      const csv = [headers.join(','), ...data.map(r => [r.timestamp, r.fluid_typ, r.outside_temp + "C", r.pressure + "psi", r.humidity + "%", r.liquid_temp + "C", r.ph, r.tank_level + "%", r.sys_load + "%", r.status, r.explanation].join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Chevron_Data.csv";
      link.click();
    } catch (e) { alert("Export failed."); }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src="./assets/chev_logopng" style={{ height: '40px' }} alt="Chevron" />
            <h1 style={{ color: chevronBlue, fontSize: '1.5rem', borderLeft: '1px solid #ccc', paddingLeft: '15px' }}>Digital Twin Platform</h1>
          </div>
          <div style={{ background: '#e2e8f0', padding: '5px', borderRadius: '8px' }}>
            <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 15px', border: 'none', background: activeTab === 'dashboard' ? 'white' : 'transparent', borderRadius: '6px', cursor: 'pointer' }}>Operations</button>
            <button onClick={() => setActiveTab('data')} style={{ padding: '8px 15px', border: 'none', background: activeTab === 'data' ? 'white' : 'transparent', borderRadius: '6px', cursor: 'pointer' }}>Logs</button>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `5px solid ${chevronBlue}` }}>
              <h4 style={{ color: '#64748b', marginTop: 0 }}>SETPOINTS</h4>
              <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
                {['Oil', 'Water', 'Gas'].map(t => (
                  <button key={t} onClick={() => setFluidType(t)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `2px solid ${chevronBlue}`, background: fluidType === t ? chevronBlue : 'white', color: fluidType === t ? 'white' : chevronBlue, fontWeight: 'bold' }}>{t}</button>
                ))}
              </div>
              <p>Temperature: {outsideTemp}°C</p>
              <input type="range" min="0" max="300" value={outsideTemp} onChange={e => setOutsideTemp(e.target.value)} style={{ width: '100%', accentColor: chevronBlue }} />
              <p>Humidity: {humidity}%</p>
              <input type="range" min="0" max="100" value={humidity} onChange={e => setHumidity(e.target.value)} style={{ width: '100%', accentColor: chevronBlue }} />
              <button onClick={runSimulation} style={{ width: '100%', marginTop: '20px', padding: '15px', background: chevronBlue, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'SYNCING...' : 'UPDATE SYSTEM'}
              </button>
            </div>

            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `5px solid ${statusColor}` }}>
              <h4 style={{ color: '#64748b', marginTop: 0 }}>TELEMETRY ANALYSIS</h4>
              {simData ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>Pressure: <strong>{simData.pressure} PSI</strong></div>
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>Flow: <strong>{simData.flow_rate} GPS</strong></div>
                  <div style={{ gridColumn: 'span 2', background: statusColor + '10', color: statusColor, padding: '10px', textAlign: 'center', borderRadius: '6px' }}><strong>STATUS: {simData.status}</strong></div>
                  <div style={{ gridColumn: 'span 2', fontStyle: 'italic', fontSize: '0.9rem', color: '#475569' }}>{simData.explanation}</div>
                </div>
              ) : <p style={{ textAlign: 'center', color: '#94a3b8', paddingTop: '40px' }}>Awaiting Data Input...</p>}
            </div>

            <div style={{ gridColumn: 'span 2', background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h4 style={{ color: '#64748b', marginTop: 0 }}>CHEVRON CHATBOX ANALYST</h4>
              <div style={{ height: '150px', overflowY: 'auto', background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                {chatMessages.map((m, i) => <div key={i} style={{ marginBottom: '10px', textAlign: m.role === 'user' ? 'right' : 'left' }}><span style={{ background: m.role === 'user' ? chevronBlue : 'white', color: m.role === 'user' ? 'white' : 'black', padding: '8px 12px', borderRadius: '12px', fontSize: '0.9rem' }}>{m.text}</span></div>)}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} placeholder="Inquire about safety..." />
                <button onClick={handleChat} style={{ background: chevronBlue, color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px' }}>Send</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Compliance Archive</h3>
              <button onClick={exportCSV} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Export CSV</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}><tr><th style={{ padding: '10px' }}>Time</th><th>Fluid</th><th>Pressure</th><th>Status</th></tr></thead>
              <tbody>
                {logs.map(l => <tr key={l.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{l.timestamp}</td><td>{l.fluid_type}</td><td>{l.pressure} PSI</td><td>{l.status}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;