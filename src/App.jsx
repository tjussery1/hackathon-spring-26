import React, { useState, useEffect, useRef } from 'react';
import SensorViewer from './SensorViewer.jsx';

// --- PURA FLOW ENTERPRISE CSS ---
const injectedStyles = `
  @keyframes slideUpFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulseGreen { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
  @keyframes pulseYellow { 0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); } 70% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); } 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); } }
  @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(237, 28, 36, 0.5); } 70% { box-shadow: 0 0 0 12px rgba(237, 28, 36, 0); } 100% { box-shadow: 0 0 0 0 rgba(237, 28, 36, 0); } }
  @keyframes sway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
  @keyframes waterRipple { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-6px); } }
  @keyframes popIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes pulseText { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  body { margin: 0; background-color: #F1F5F9; background-image: radial-gradient(#CBD5E1 1px, transparent 1px); background-size: 24px 24px; color: #0F172A; font-family: 'Inter', -apple-system, sans-serif; }
  
  .white-card { background: #FFFFFF; border: 1px solid #CBD5E1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border-radius: 4px; padding: 24px; animation: slideUpFade 0.4s ease-out forwards; position: relative; }
  
  .nav-btn { background: transparent; color: #475569; border: none; padding: 20px 20px; font-weight: 700; font-size: 0.85rem; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s; letter-spacing: 0.5px; text-transform: uppercase; }
  .nav-btn.active { color: #00548F; border-bottom: 3px solid #00548F; background: linear-gradient(to top, rgba(0,84,143,0.05), transparent); }
  .nav-btn:hover:not(.active) { color: #000000; background: rgba(255,255,255,0.8); }

  .btn-primary { background: #00548F; color: white; border: none; padding: 10px 20px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; border-radius: 2px; }
  .btn-primary:hover { background: #00335A; box-shadow: 0 4px 8px rgba(0, 84, 143, 0.3); }
  
  .btn-outline { background: white; color: #00548F; border: 2px solid #00548F; padding: 10px 20px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; border-radius: 2px; }
  .btn-outline:hover { background: #F1F5F9; }

  .btn-emergency { background: #ED1C24; color: white; border: 2px solid #8B0000; padding: 8px 16px; font-weight: 900; font-size: 0.75rem; letter-spacing: 1px; cursor: pointer; border-radius: 2px; animation: pulseRed 1.5s infinite; transition: 0.2s; }
  .btn-emergency:hover { background: #B91C1C; }

  .btn-telemetry { background: #F8FAFC; color: #334155; border: 1px solid #CBD5E1; padding: 10px 16px; font-size: 0.75rem; font-weight: 800; cursor: pointer; border-radius: 2px; transition: all 0.2s; width: 100%; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 15px; }
  .btn-telemetry:hover { background: #E2E8F0; color: #000000; }

  .search-input { flex: 1; padding: 12px 16px; border: 2px solid #CBD5E1; border-radius: 4px; font-size: 0.95rem; font-weight: 600; color: #0F172A; outline: none; transition: 0.2s; background: white; }
  .search-input:focus { border-color: #00548F; box-shadow: 0 0 0 3px rgba(0,84,143,0.1); }
  .filter-select { padding: 12px 16px; border: 2px solid #CBD5E1; border-radius: 4px; font-size: 0.95rem; font-weight: 600; color: #0F172A; outline: none; background: white; cursor: pointer; }

  .health-track { width: 100%; height: 6px; background: #E2E8F0; border-radius: 2px; overflow: hidden; margin-top: 5px; }
  .health-fill { height: 100%; transition: width 0.5s ease-in-out, background-color 0.3s; }

  .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(4px); z-index: 1000; display: flex; justify-content: center; align-items: center; animation: fadeIn 0.2s ease-out; }
  .modal-card { background: white; border-radius: 4px; border-top: 6px solid #00548F; width: 90%; max-width: 650px; max-height: 90vh; overflow-y: auto; padding: 30px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); animation: popIn 0.2s ease-out; position: relative; }
  .modal-close { position: absolute; top: 15px; right: 15px; background: transparent; border: none; font-weight: bold; color: #64748B; cursor: pointer; font-size: 1.5rem; transition: 0.2s; }
  .modal-close:hover { color: #ED1C24; }

  .chevron-banner { position: relative; background: #002244; color: white; border-radius: 4px; padding: 40px; display: flex; flex-direction: column; align-items: flex-start; gap: 15px; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); margin-bottom: 40px; border-top: 4px solid #ED1C24; border-bottom: 4px solid #00548F; }
  
  .side-tab-btn { width: 100%; text-align: left; padding: 15px 20px; border: none; background: transparent; font-weight: 700; color: #64748B; cursor: pointer; transition: 0.2s; border-left: 4px solid transparent; margin-bottom: 2px; border-radius: 0; }
  .side-tab-btn.active { background: #EFF6FF; color: #00548F; border-left: 4px solid #ED1C24; font-size: 1rem; }
  .side-tab-btn:hover:not(.active) { background: #F1F5F9; color: #000000; }

  .lan-badge { display: flex; align-items: center; gap: 8px; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 6px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; color: #334155; letter-spacing: 0.5px; }
  .lan-dot { width: 8px; height: 8px; background: #10B981; border-radius: 50%; animation: pulseGreen 2s infinite; }

  /* Expanded Ticket Table Scroll Area */
  .ticket-scroll-container { max-height: 350px; overflow-y: auto; border: 1px solid #CBD5E1; border-radius: 4px; }

  /* Chatbox CSS */
  .chat-container { display: flex; flexDirection: column; height: 100%; border-left: 1px solid #CBD5E1; background: #FFFFFF; }
  .chat-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
  .chat-msg { padding: 12px 16px; border-radius: 8px; max-width: 85%; font-size: 0.9rem; line-height: 1.5; font-weight: 500; }
  .msg-ai { background: #F1F5F9; color: #0F172A; border: 1px solid #E2E8F0; align-self: flex-start; border-bottom-left-radius: 0; }
  .msg-user { background: #00548F; color: white; align-self: flex-end; border-bottom-right-radius: 0; }
  .chat-input-area { padding: 15px; border-top: 1px solid #CBD5E1; display: flex; gap: 10px; background: #F8FAFC; }
  .chat-input { flex: 1; padding: 10px 15px; border: 1px solid #CBD5E1; border-radius: 4px; outline: none; font-family: 'Inter'; }
  .chat-input:focus { border-color: #00548F; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F1F5F9; }
  ::-webkit-scrollbar-thumb { background: #94A3B8; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: #00548F; }
`;

const PuraFlowLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
    <path d="M10,85 L90,85 L70,100 L30,100 Z" fill="#94A3B8" />
    <rect x="30" y="45" width="20" height="40" fill="#64748B" />
    <rect x="25" y="40" width="30" height="5" fill="#0F172A" />
    <g style={{ transformOrigin: '75px 80px', animation: 'sway 4s ease-in-out infinite' }}>
      <path d="M 75 80 Q 80 60 70 40" stroke="#0F172A" strokeWidth="4" fill="none" />
      <path d="M 70 40 L 55 35 L 60 50 Z" fill="#10B981" />
      <path d="M 70 40 L 85 30 L 75 45 Z" fill="#059669" />
    </g>
    <path d="M0,85 Q25,75 50,85 T100,85 L100,100 L0,100 Z" fill="#00548F" opacity="0.9" style={{ animation: 'waterRipple 3s ease-in-out infinite' }} />
  </svg>
);

// --- YOUR PARTNER'S EXACT LOGIC ---
const getTempStatus = (temp) => {
  if (temp == null || isNaN(temp)) return "GREEN"; // Failsafe
  if (temp >= 68 && temp <= 78) return "GREEN";
  if ((temp >= 60 && temp < 68) || (temp > 78 && temp <= 85)) return "YELLOW";
  return "RED";
};

const getHumStatus = (hum) => {
  if (hum == null || isNaN(hum)) return "GREEN"; // Failsafe
  if (hum >= 30 && hum <= 60) return "GREEN";
  if ((hum >= 20 && hum < 30) || (hum > 60 && hum <= 70)) return "YELLOW";
  return "RED";
};

const getCombinedStatus = (temp, hum) => {
  const tStat = getTempStatus(temp);
  const hStat = getHumStatus(hum);
  if (tStat === "RED" || hStat === "RED") return "RED";
  if (tStat === "YELLOW" || hStat === "YELLOW") return "YELLOW";
  return "GREEN";
};

const App = () => {
  const [activeTab, setActiveTab] = useState('fleet');
  const [telemetryTab, setTelemetryTab] = useState('CHV-WTR-0001'); 
  const [detailedPumpId, setDetailedPumpId] = useState(null); 
  
  const [report, setReport] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [localTickets, setLocalTickets] = useState([]);

  // Chatbox State
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hello. I am the Pura Flow System AI. How can I assist you with the fleet data today?' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  const [liveData, setLiveData] = useState({ status: 'Awaiting Data...', temperature: null, humidity: null, open_tickets: [] });
  
  // FAKE DATA (PUMP 2 is RED, PUMP 3 is YELLOW)
  const [simGas, setSimGas] = useState({ temp: 88.5, hum: 25, flow: 120.5 }); // RED
  const [simOil, setSimOil] = useState({ temp: 81.2, hum: 45, flow: 28.4 });  // YELLOW
  const [simWater, setSimWater] = useState({ temp: 72.1, hum: 55, flow: 350.5 }); // GREEN
  
  const [simulatedFleet, setSimulatedFleet] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const currentFullDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Generate the 16 fake fleet pumps
  useEffect(() => {
    const locations = ['Gulf of Mexico', 'Tengiz Field', 'San Joaquin Valley', 'Gorgon Project', 'El Segundo Refinery', 'Pascagoula', 'Richmond Refinery', 'Midcontinent'];
    const types = ['WATER', 'GAS', 'OIL'];
    const fakeFleet = Array.from({length: 16}).map((_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const loc = locations[Math.floor(Math.random() * locations.length)];
      const id = `CHV-${type.substring(0,3)}-${Math.floor(1000 + Math.random() * 8999)}`;
      let baseTemp = type === 'WATER' ? 72 : (type === 'GAS' ? 75 : 65);
      return {
        id, type, location: loc, isLive: false, hasError: false, health: Math.floor(85 + Math.random() * 15),
        metrics: { ambientTemp: baseTemp.toFixed(1), ambientHum: '50.0', liquidTemp: (baseTemp - 5).toFixed(1), flow: (Math.random() * 200 + 50).toFixed(1) }
      };
    });
    setSimulatedFleet(fakeFleet);
  }, []);

  // Polling Loop & Jitter Engine
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/dashboard');
        if (res.ok) {
           const data = await res.json();
           setLiveData(data);
        }
      } catch (e) { console.error("API Offline or disconnected."); }
    };

    fetchDashboard();
    const liveInterval = setInterval(fetchDashboard, 3000);

    const simInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setSimGas(prev => ({ ...prev, temp: +(prev.temp + (Math.random() - 0.5) * 0.4).toFixed(1), flow: +(prev.flow + (Math.random() - 0.5) * 2).toFixed(1) }));
      setSimOil(prev => ({ ...prev, temp: +(prev.temp + (Math.random() - 0.5) * 0.4).toFixed(1), flow: +(prev.flow + (Math.random() - 0.5) * 1).toFixed(1) }));
      setSimWater(prev => ({ ...prev, temp: +(prev.temp + (Math.random() - 0.5) * 0.4).toFixed(1), flow: +(prev.flow + (Math.random() - 0.5) * 5).toFixed(1) }));
      
      setSimulatedFleet(prevFleet => prevFleet.map(pump => ({
        ...pump, metrics: { ...pump.metrics, ambientTemp: (parseFloat(pump.metrics.ambientTemp) + (Math.random() - 0.5) * 0.8).toFixed(1) }
      })));
    }, 2500);

    return () => { clearInterval(liveInterval); clearInterval(simInterval); };
  }, []);


  // --- AGGRESSIVE DATA PARSER (Fixes the Sync Issue) ---
  // This checks every possible key your Python backend might be using.
  const extractLiveTemp = () => {
    if (liveData?.temp_f !== undefined) return parseFloat(liveData.temp_f);
    if (liveData?.temperature !== undefined) return parseFloat(liveData.temperature);
    if (liveData?.temp !== undefined) return parseFloat(liveData.temp);
    return null;
  };

  const extractLiveHum = () => {
    if (liveData?.humidity !== undefined) return parseFloat(liveData.humidity);
    if (liveData?.hum !== undefined) return parseFloat(liveData.hum);
    return null;
  };

  const rawLiveTemp = extractLiveTemp();
  const rawLiveHum = extractLiveHum();
  
  // If the Arduino is physically connected but sending 0, it will display 0.0 and trigger RED.
  // If it's completely null/disconnected, we show '--'.
  const liveTempDisplay = rawLiveTemp !== null && !isNaN(rawLiveTemp) ? rawLiveTemp.toFixed(1) : '--';
  const liveHumDisplay = rawLiveHum !== null && !isNaN(rawLiveHum) ? rawLiveHum.toFixed(1) : '--';
  
  // Calculate status based strictly on the displayed numbers
  const liveStatusStr = getCombinedStatus(parseFloat(liveTempDisplay), parseFloat(liveHumDisplay));

  // --- AUTOMATED TICKETS ---
  // Constantly checks if ANY pump hits RED. If it does, and the ticket doesn't exist, it makes one.
  useEffect(() => {
    const allCurrentPumps = [
      { id: 'CHV-WTR-0001', status: liveStatusStr, temp: liveTempDisplay },
      { id: 'CHV-GAS-4091', status: getCombinedStatus(simGas.temp, simGas.hum), temp: simGas.temp.toFixed(1) }
    ];

    allCurrentPumps.forEach(p => {
      if (p.status === "RED") {
        setLocalTickets(prev => {
          if (!prev.find(t => t.id === `AUTO-${p.id}`)) {
            return [{ id: `AUTO-${p.id}`, time: new Date().toLocaleTimeString(), issue: `CRITICAL ALERT: Node ${p.id} reporting ${p.temp}°F.` }, ...prev];
          }
          return prev;
        });
      }
    });
  }, [liveStatusStr, simGas.temp, liveTempDisplay]);

  // Master Pump Array
 const corePumps = [
  { 
    id: 'CHV-WTR-0001', 
    type: 'WATER', 
    location: 'Permian Basin, TX (LIVE NODE)', 
    isLive: true,
    // FIX 1: Use the live status string from the backend
    calcStatus: liveStatusStr, 
    hasError: liveStatusStr === "RED", 
    health: liveStatusStr === "RED" ? 35 : (liveStatusStr === "YELLOW" ? 75 : 99),
    metrics: { 
      // FIX 2: This is where the 0 is coming from. 
      // Ensure these match your live display variables!
      ambientTemp: liveTempDisplay, 
      ambientHum: liveHumDisplay, 
      liquidTemp: '68.2', 
      flow: liveStatusStr === "RED" ? '0.0' : '45.2' 
    }
  },
  // ... other pumps
];
  const allPumps = [...corePumps, ...simulatedFleet];
  const combinedTickets = [...(liveData?.open_tickets || []), ...localTickets];

  // NATIVE FRONTEND AI REPORT GENERATOR
  const generateNativeReport = (timeframe) => {
    setGeneratingReport(true);
    setReport(`[SYSTEM SECURE LINK ESTABLISHED]\nAnalyzing ${timeframe.toLowerCase()} telemetry logs...\n\n`);
    
    setTimeout(() => {
      const redPumps = allPumps.filter(p => p.calcStatus === 'RED');
      const yellowPumps = allPumps.filter(p => p.calcStatus === 'YELLOW');
      
      let newReport = `=================================================\n`;
      newReport += `PURA FLOW EXECUTIVE AI SUMMARY - ${timeframe.toUpperCase()}\n`;
      newReport += `DATE GENERATED: ${currentFullDate}\n`;
      newReport += `TOTAL ASSETS SCANNED: ${allPumps.length} Nodes\n`;
      newReport += `=================================================\n\n`;
      
      newReport += `[ FLEET HEALTH OVERVIEW ]\n`;
      newReport += `- OPTIMAL (GREEN): ${allPumps.length - redPumps.length - yellowPumps.length} assets operating within normal parameters.\n`;
      newReport += `- WARNING (YELLOW): ${yellowPumps.length} assets require preventative maintenance.\n`;
      newReport += `- CRITICAL (RED): ${redPumps.length} assets currently under Stop Work Authority / ESD.\n\n`;

      if (redPumps.length > 0) {
         newReport += `🚨 [ CRITICAL INCIDENTS DETECTED ] 🚨\n`;
         redPumps.forEach(p => {
           newReport += `>> ASSET: ${p.id} (${p.location})\n   ISSUE: Ambient Temperature spiked to ${p.metrics.ambientTemp}°F.\n   ACTION: Emergency Shut Down invoked. Ticket generated.\n\n`;
         });
      }

      if (yellowPumps.length > 0) {
         newReport += `⚠️ [ PREVENTATIVE WARNINGS ]\n`;
         yellowPumps.forEach(p => {
           newReport += `>> ASSET: ${p.id}\n   STATUS: Elevated temperature (${p.metrics.ambientTemp}°F) approaching threshold.\n`;
         });
         newReport += `\n`;
      }

      newReport += `[ AI RECOMMENDATION ]\n`;
      if (redPumps.length > 0) {
        newReport += `Immediate dispatch of field technicians to critical nodes is required. Ensure LAN fallback networks remain online while repairs are conducted.\n`;
      } else {
        newReport += `Maintain current operational load. Fleet efficiency is optimal.\n`;
      }
      
      setReport(newReport);
      setGeneratingReport(false);
    }, 1500); 
  };

  // Chatbox Handlers
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    setTimeout(() => {
      let aiText = "I have logged your inquiry. Based on the current fleet metrics, all data is being safely routed through the local LAN node.";
      const lowerInput = userMsg.text.toLowerCase();
      
      if (lowerInput.includes('status') || lowerInput.includes('health')) {
        aiText = `Currently monitoring ${allPumps.length} assets. We have ${combinedTickets.length} active critical tickets requiring attention.`;
      } else if (lowerInput.includes('live') || lowerInput.includes('arduino') || lowerInput.includes('node')) {
        aiText = `Node CHV-WTR-0001 (Permian Basin) is actively transmitting live hardware telemetry. Current Temp: ${liveTempDisplay}°F.`;
      } else if (lowerInput.includes('ticket') || lowerInput.includes('dispatch')) {
        aiText = `If a node hits critical temperatures (>85°F) or drops below 60°F, a ticket is automatically generated. Please dispatch a tech from the Fleet Overview page.`;
      }

      setChatMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    }, 1000);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleESD = (pumpId) => {
    alert(`🚨 STOP WORK AUTHORITY INVOKED 🚨\n\nEmergency Shut Down (ESD) triggered for ${pumpId}. \nAll valves closing. Field technicians have been dispatched.`);
  };

  const handleDispatch = (ticketId) => {
    window.alert(`✅ DISPATCH CONFIRMED\n\nMaintenance Team Alpha has been routed to the affected asset for Ticket #${ticketId}. Estimated time of arrival: 14 minutes.`);
    setLocalTickets(prev => prev.filter(t => t.id !== ticketId));
  };

  const filteredPumps = allPumps.filter(pump => {
    const matchesSearch = pump.id.toLowerCase().includes(searchQuery.toLowerCase()) || pump.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || pump.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColorConfig = (statusString) => {
    if (statusString === "RED") return { text: "CRITICAL", hex: "#ED1C24", bg: "#FEF2F2", border: "#FECACA", anim: "pulseRed" };
    if (statusString === "YELLOW") return { text: "WARNING", hex: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", anim: "pulseYellow" };
    return { text: "OPTIMAL", hex: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", anim: "pulseGreen" };
  };

  const getDetailedChecks = (pump) => {
    if (!pump) return [];
    return [
      { name: 'Network Protocol', value: 'Local Area Network (LAN)', pass: true },
      { name: 'Ambient Temp Sensor', value: `${pump.metrics.ambientTemp}°F`, pass: getTempStatus(parseFloat(pump.metrics.ambientTemp)) !== "RED" },
      { name: 'Ambient Humidity Sensor', value: `${pump.metrics.ambientHum}%`, pass: getHumStatus(parseFloat(pump.metrics.ambientHum)) !== "RED" },
      { name: 'Pipeline Compression', value: 'Nominal', pass: true }
    ];
  };

  const detailedPump = allPumps.find(p => p.id === detailedPumpId);
  
  const generateFakeHistory = (pumpId) => {
    const p = allPumps.find(x => x.id === pumpId);
    if (!p) return [];
    const baseTemp = isNaN(parseFloat(p.metrics.ambientTemp)) ? 72.0 : parseFloat(p.metrics.ambientTemp);
    const baseFlow = isNaN(parseFloat(p.metrics.flow)) ? 45.0 : parseFloat(p.metrics.flow);
    return Array.from({length: 20}).map((_, i) => ({
       id: 8490 - i,
       time: new Date(Date.now() - (i * 5000)).toLocaleTimeString(),
       flow: (baseFlow + (Math.random() - 0.5) * 2).toFixed(1),
       temp: (baseTemp + (Math.random() - 0.5)).toFixed(1),
       status: 'VERIFIED'
    }));
  };

  const currentYear = new Date().getFullYear();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <style>{injectedStyles}</style>

      {/* DETAILED MAINTENANCE CHECKS MODAL */}
      {detailedPump && (
        <div className="modal-overlay" onClick={() => setDetailedPumpId(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDetailedPumpId(null)}>×</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', borderBottom: '2px solid #E2E8F0', paddingBottom: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 5px 0', color: '#0F172A', fontWeight: '900', fontSize: '1.5rem', textTransform: 'uppercase' }}>{detailedPump.id} Diagnostics</h2>
                <div style={{ color: '#00548F', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {detailedPump.type} • {detailedPump.location}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '30px', background: '#F8FAFC', padding: '15px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '800', color: '#0F172A', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                 <span>Overall System Health</span>
                 <span style={{ color: detailedPump.health < 50 ? '#ED1C24' : (detailedPump.health < 80 ? '#F59E0B' : '#10B981') }}>{detailedPump.health}%</span>
               </div>
               <div className="health-track" style={{ height: '8px', background: '#E2E8F0' }}>
                 <div className="health-fill" style={{ width: `${detailedPump.health}%`, backgroundColor: detailedPump.health < 50 ? '#ED1C24' : (detailedPump.health < 80 ? '#F59E0B' : '#10B981') }}></div>
               </div>
            </div>

            <h3 style={{ margin: '0 0 15px 0', color: '#0F172A', fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase' }}>Maintenance Checks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getDetailedChecks(detailedPump).map((check, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '12px 15px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                  <div><div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '2px', fontSize: '0.85rem' }}>{check.name}</div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.9rem' }}>{check.value}</span>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: check.pass ? '#10B981' : '#ED1C24', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem' }}>
                      {check.pass ? '✓' : '✕'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => setDetailedPumpId(null)}>ACKNOWLEDGE</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ height: '4px', width: '100%', background: '#ED1C24' }}></div>
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src="./assets/chev logo.png" alt="Chevron" style={{ height: '32px' }} onError={(e) => { e.target.style.display='none'; }} />
          <div style={{ height: '35px', width: '1px', background: '#CBD5E1' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <PuraFlowLogo />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.5px' }}>PURA FLOW</h2>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#00548F', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>the human energy company™</div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className={`nav-btn ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => setActiveTab('fleet')}>FLEET OVERVIEW</button>
          <button className={`nav-btn ${activeTab === 'safety' ? 'active' : ''}`} onClick={() => setActiveTab('safety')}>SAFETY & COMPLIANCE</button>
          <button className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>AI REPORTS</button>
          <button className={`nav-btn ${activeTab === 'external' ? 'active' : ''}`} onClick={() => setActiveTab('external')}>RAW TELEMETRY</button>
          <button className={`nav-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>ABOUT US</button>
          
          <div style={{ marginLeft: '10px', borderLeft: '1px solid #CBD5E1', paddingLeft: '20px' }}>
            <div className="lan-badge"><div className="lan-dot"></div>LOCAL NODE / OFFLINE</div>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto', flex: 1, width: '100%', boxSizing: 'border-box' }}>
        
        {/* TAB 1: FLEET OVERVIEW */}
        {activeTab === 'fleet' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

            <div className="white-card" style={{ padding: '20px 30px', display: 'flex', gap: '20px', alignItems: 'center', background: '#FFFFFF', borderTop: '4px solid #00548F' }}>
              <div style={{ fontWeight: '900', color: '#0F172A', fontSize: '1rem', width: '200px', textTransform: 'uppercase' }}>FLEET FILTER</div>
              <input type="text" placeholder="Search by Pump ID or Location (e.g. 'Texas' or 'CHV-WTR')..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="ALL">All Fluid Types</option>
                <option value="WATER">Water</option>
                <option value="GAS">Natural Gas</option>
                <option value="OIL">Crude Oil</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px' }}>
              {filteredPumps.length === 0 ? (
                 <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#64748B', fontWeight: '700', fontSize: '1rem', background: 'white', borderRadius: '4px', border: '1px solid #CBD5E1' }}>No assets match current search criteria.</div>
              ) : filteredPumps.map((pump, index) => {
                const colors = getStatusColorConfig(pump.calcStatus);
                const cardBorder = pump.isLive ? `4px solid ${colors.hex}` : `2px solid ${colors.border}`;

                return (
                <div key={pump.id} className="white-card" style={{ borderTop: cardBorder, padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '15px', marginBottom: '15px' }}>
                    <div>
                      <h2 style={{ margin: '0 0 4px 0', color: '#0F172A', fontWeight: '900', fontSize: '1.2rem', letterSpacing: '0.5px' }}>{pump.id}</h2>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#00548F', background: '#EFF6FF', padding: '2px 6px', borderRadius: '2px' }}>{pump.type}</span>
                        <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>📍 {pump.location}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: colors.bg, border: `1px solid ${colors.border}`, padding: '4px 10px', borderRadius: '2px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.hex, animation: `${colors.anim} 2s infinite` }}></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: colors.hex }}>{colors.text}</span>
                      </div>
                      {pump.calcStatus === "RED" && (<button onClick={() => handleESD(pump.id)} className="btn-emergency">ESD / SHUT DOWN</button>)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                     <div style={{ flex: 1, background: getTempStatus(parseFloat(pump.metrics.ambientTemp)) === "RED" ? '#FEF2F2' : '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '2px', padding: '10px' }}>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800', color: '#64748B', display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                           Ambient Temp {pump.isLive && <span style={{ color: '#10B981', animation: 'pulseText 2s infinite' }}>LIVE</span>}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#000000' }}>{pump.metrics.ambientTemp}<span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '2px' }}>°F</span></div>
                     </div>
                     <div style={{ flex: 1, background: getHumStatus(parseFloat(pump.metrics.ambientHum)) === "RED" ? '#FEF2F2' : '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '2px', padding: '10px' }}>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800', color: '#64748B', display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                           Ambient Hum {pump.isLive && <span style={{ color: '#10B981', animation: 'pulseText 2s infinite' }}>LIVE</span>}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#000000' }}>{pump.metrics.ambientHum}<span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '2px' }}>%</span></div>
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ borderLeft: '3px solid #00548F', padding: '8px 12px', background: '#F8FAFC' }}>
                      <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: '800', color: '#00548F' }}>Liquid Temp</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#000000' }}>{pump.metrics.liquidTemp}<span style={{ fontSize: '0.7rem', color: '#64748B' }}>°F</span></div>
                    </div>
                    <div style={{ borderLeft: '3px solid #00548F', padding: '8px 12px', background: '#F8FAFC' }}>
                      <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: '800', color: '#00548F' }}>Flow Rate</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#000000' }}>{pump.metrics.flow}<span style={{ fontSize: '0.7rem', color: '#64748B' }}>g/s</span></div>
                    </div>
                  </div>

                  <button className="btn-telemetry" onClick={() => setDetailedPumpId(pump.id)}>VIEW MAINTENANCE CHECKS</button>
                </div>
              )})}
            </div>

            <div className="chevron-banner">
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src="./assets/chev logo.png" alt="Chevron" style={{ height: '30px', filter: 'brightness(0) invert(1)' }} onError={(e) => { e.target.style.display='none'; }} />
                  <span style={{ color: '#00A3E0', fontWeight: '800', letterSpacing: '1px', fontSize: '0.85rem' }}>THE HUMAN ENERGY COMPANY™</span>
               </div>
               <h1 style={{ margin: '0', fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.5px', lineHeight: '1.2' }}>
                 "A smooth, healthy flow of infrastructure."
               </h1>
               <p style={{ margin: 0, fontSize: '1rem', color: '#CBD5E1', fontWeight: '500', lineHeight: '1.6', maxWidth: '800px' }}>
                 Powering the future of enterprise environmental telemetry and sustainable operations across global assets. Local Area Network (LAN) fallback enabled for immediate offline deployments.
               </p>
            </div>

            {/* EXPANDED MAINTENANCE TICKETS */}
            <div className="white-card" style={{ borderTop: '4px solid #000000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#0F172A', fontWeight: '900', fontSize: '1.1rem', textTransform: 'uppercase' }}>MAINTENANCE TICKETS</h2>
                {combinedTickets.length > 0 && (
                  <div style={{ background: '#ED1C24', color: '#FFFFFF', padding: '4px 12px', borderRadius: '2px', fontSize: '0.75rem', fontWeight: '800' }}>{combinedTickets.length} OPEN ALERTS</div>
                )}
              </div>
              
              {combinedTickets.length === 0 ? (
                 <div style={{ padding: '30px', textAlign: 'center', background: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
                   <div style={{ color: '#10B981', fontSize: '1rem', fontWeight: '800', marginBottom: '4px' }}>ALL SYSTEMS NOMINAL</div>
                   <div style={{ color: '#64748B', fontSize: '0.85rem' }}>No active maintenance tickets in the queue.</div>
                 </div>
              ) : (
                 <div className="ticket-scroll-container">
                   <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                     <thead><tr style={{ background: '#F1F5F9', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', position: 'sticky', top: 0, zIndex: 5 }}><th style={{ padding: '12px', borderBottom: '1px solid #CBD5E1' }}>TICKET ID</th><th style={{ padding: '12px', borderBottom: '1px solid #CBD5E1' }}>TIMESTAMP</th><th style={{ padding: '12px', borderBottom: '1px solid #CBD5E1' }}>ISSUE DETECTED</th><th style={{ padding: '12px', borderBottom: '1px solid #CBD5E1' }}>ACTION</th></tr></thead>
                     <tbody>
                       {combinedTickets.map((t, idx) => (
                         <tr key={idx} style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
                            <td style={{ padding: '12px', color: '#0F172A', fontWeight: '800', fontSize: '0.85rem' }}>#{t.id}</td>
                            <td style={{ padding: '12px', color: '#64748B', fontSize: '0.85rem' }}>{t.time}</td>
                            <td style={{ padding: '12px', color: '#ED1C24', fontWeight: '700', fontSize: '0.85rem' }}>{t.issue}</td>
                            <td style={{ padding: '12px' }}><button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.7rem' }} onClick={() => handleDispatch(t.id)}>DISPATCH TECH</button></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SAFETY & COMPLIANCE */}
        {activeTab === 'safety' && (
          <div className="white-card" style={{ borderTop: '4px solid #00548F' }}>
            <h2 style={{ margin: '0 0 25px 0', color: '#0F172A', fontWeight: '900', textTransform: 'uppercase', fontSize: '1.2rem' }}>THE CHEVRON WAY: SAFETY & ENVIRONMENT</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '35px' }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderLeft: '4px solid #10B981', padding: '25px', borderRadius: '2px' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: '#047857', marginBottom: '10px' }}>Days Without Incident</div><div style={{ fontSize: '2.8rem', fontWeight: '900', color: '#0F172A' }}>342</div>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderLeft: '4px solid #94A3B8', padding: '25px', borderRadius: '2px' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: '#475569', marginBottom: '10px' }}>Active Stop Work Authorities</div><div style={{ fontSize: '2.8rem', fontWeight: '900', color: '#0F172A' }}>{combinedTickets.length}</div>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderLeft: '4px solid #00548F', padding: '25px', borderRadius: '2px' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: '#00548F', marginBottom: '10px' }}>Carbon Intensity (kg CO2e/boe)</div><div style={{ fontSize: '2.8rem', fontWeight: '900', color: '#0F172A' }}>18.4</div>
              </div>
            </div>
            
            <div style={{ background: '#F8FAFC', padding: '30px', border: '1px solid #CBD5E1', borderLeft: '6px solid #00548F' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#00548F', fontWeight: '900', fontSize: '1.1rem' }}>Always Protect People and the Environment</h3>
              <p style={{ color: '#334155', lineHeight: '1.8', margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>
                At Chevron, safety is our highest priority. The Pura Flow system continuously monitors pipeline and facility integrity to prevent incidents before they occur. Every operator has the Stop Work Authority (SWA) if they identify a potential hazard.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: AI REPORTS & CHATBOX */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', gap: '25px', height: 'calc(100vh - 200px)' }}>
             <div className="white-card" style={{ flex: 2, display: 'flex', flexDirection: 'column', borderTop: '4px solid #00548F' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #CBD5E1', paddingBottom: '20px' }}>
                  <div>
                    <h2 style={{ margin: 0, color: '#0F172A', fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>AI SYSTEM REPORTS</h2>
                    <p style={{ color: '#64748B', margin: '5px 0 0 0', fontWeight: '600', fontSize: '0.85rem' }}>Report Date: <strong style={{color: '#00548F'}}>{currentFullDate}</strong></p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => generateNativeReport('Daily')} disabled={generatingReport} className="btn-outline">DAILY REPORT</button>
                    <button onClick={() => generateNativeReport('Weekly')} disabled={generatingReport} className="btn-primary">WEEKLY REPORT</button>
                  </div>
               </div>
               <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '25px', borderRadius: '2px', overflowY: 'auto', color: '#0F172A', whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '0.95rem', fontWeight: '500', fontFamily: 'monospace' }}>
                  {report || `[ SYSTEM STANDBY ]\n\nSelect a timeframe above to compile a new AI Executive Summary based on current Pura Flow metrics.`}
               </div>
             </div>

             <div className="white-card chat-container" style={{ flex: 1, padding: 0, borderTop: '4px solid #10B981', display: 'flex', flexDirection: 'column' }}>
               <div style={{ background: '#0F172A', color: 'white', padding: '15px 20px', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.5px' }}>PURA FLOW AI ASSISTANT</div>
               <div className="chat-messages">
                 {chatMessages.map((msg, i) => (
                   <div key={i} className={`chat-msg ${msg.role === 'ai' ? 'msg-ai' : 'msg-user'}`}>
                     {msg.text}
                   </div>
                 ))}
                 <div ref={chatEndRef} />
               </div>
               <div className="chat-input-area">
                 <input type="text" className="chat-input" placeholder="Ask about fleet status..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
                 <button className="btn-primary" style={{ padding: '10px 15px' }} onClick={handleSendMessage}>SEND</button>
               </div>
             </div>
          </div>
        )}

        {/* TAB 4: RAW TELEMETRY */}
        {activeTab === 'external' && (
          <div className="white-card" style={{ padding: 0, display: 'flex', minHeight: '600px', overflow: 'hidden', borderTop: '4px solid #00548F' }}>
            <div style={{ width: '280px', background: '#F8FAFC', borderRight: '1px solid #CBD5E1', padding: '25px 0', overflowY: 'auto' }}>
               <h3 style={{ padding: '0 25px', margin: '0 0 20px 0', color: '#0F172A', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: '800' }}>DATA SOURCES ({allPumps.length})</h3>
               {allPumps.map(pump => (
                 <button key={pump.id} className={`side-tab-btn ${telemetryTab === pump.id ? 'active' : ''}`} onClick={() => setTelemetryTab(pump.id)}>
                   <strong style={{ display: 'block', marginBottom: '4px' }}>{pump.id}</strong> 
                   <span style={{ fontSize: '0.7rem', fontWeight: '600', opacity: 0.8 }}>{pump.type}</span>
                 </button>
               ))}
            </div>
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto', maxHeight: '700px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                 <h2 style={{ margin: 0, color: '#0F172A', fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>{telemetryTab} LOGS</h2>
                 <span style={{ background: '#ECFDF5', color: '#047857', padding: '6px 14px', borderRadius: '2px', fontWeight: '800', fontSize: '0.75rem', border: '1px solid #A7F3D0' }}>SYNCED: {currentTime}</span>
               </div>
               
               {telemetryTab === 'CHV-WTR-0001' ? (
                 <div style={{ background: '#FFFFFF', padding: '25px', border: '1px solid #CBD5E1' }}>
                    <p style={{ margin: '0 0 15px 0', fontWeight: '800', color: '#00548F', fontSize: '0.85rem', textTransform: 'uppercase' }}>Live External API Connection Active</p>
                    <SensorViewer />
                 </div>
               ) : (
                 <div style={{ background: '#FFFFFF', padding: '30px', border: '1px solid #CBD5E1' }}>
                    <table style={{ width: '100%', background: 'white', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: '#F1F5F9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}><th style={{ padding: '12px', borderBottom: '1px solid #CBD5E1' }}>Log ID</th><th style={{ padding: '12px', borderBottom: '1px solid #CBD5E1' }}>Timestamp</th><th style={{ padding: '12px', borderBottom: '1px solid #CBD5E1' }}>Flow Rate</th><th style={{ padding: '12px', borderBottom: '1px solid #CBD5E1' }}>Ambient Temp</th><th style={{ padding: '12px', borderBottom: '1px solid #CBD5E1' }}>Status</th></tr></thead>
                      <tbody>
                        {generateFakeHistory(telemetryTab).map(row => (
                          <tr key={row.id}>
                            <td style={{ padding: '12px', borderBottom: '1px solid #F1F5F9', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>#{row.id}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #F1F5F9', color: '#0F172A', fontWeight: '600', fontSize: '0.85rem' }}>{row.time}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #F1F5F9', color: '#00548F', fontWeight: '700', fontSize: '0.85rem' }}>{row.flow} g/s</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #F1F5F9', color: '#00548F', fontWeight: '700', fontSize: '0.85rem' }}>{row.temp}°F</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #F1F5F9', color: '#10B981', fontWeight: '800', fontSize: '0.85rem' }}>VERIFIED</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* TAB 5: ABOUT US */}
        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
             <div className="white-card" style={{ textAlign: 'center', padding: '60px 20px', background: '#002244', color: 'white', borderTop: '4px solid #ED1C24' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', margin: '0 0 15px 0', fontWeight: '900', letterSpacing: '-0.5px' }}>About Pura Flow</h1>
                <p style={{ fontSize: '1.1rem', color: '#CBD5E1', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6', fontWeight: '500' }}>Bridging the gap between embedded hardware and enterprise-level environmental monitoring.</p>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                <div className="about-card"><h2 style={{ color: '#00548F', marginTop: 0, fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>Mission Statement</h2><p style={{ color: '#334155', lineHeight: '1.8', fontWeight: '500', fontSize: '0.95rem' }}>Our mission is to create a simple, reliable, and scalable environmental monitoring system that captures real-time temperature and humidity data and securely stores it on a live server for viewing, tracking, and future analysis.</p></div>
                <div className="about-card"><h2 style={{ color: '#00548F', marginTop: 0, fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>Past Problems</h2><p style={{ color: '#334155', lineHeight: '1.8', fontWeight: '500', fontSize: '0.95rem' }}>Before building this system, there were several challenges that made collecting and using sensor data difficult. Sensor readings were often only visible locally through the Serial Monitor, which meant the information could not easily be stored, shared, or viewed remotely.</p></div>
                <div className="about-card"><h2 style={{ color: '#00548F', marginTop: 0, fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>Our System</h2><p style={{ color: '#334155', lineHeight: '1.8', fontWeight: '500', fontSize: '0.95rem' }}>Our system solves these problems by using a sensor-based data collection process that automatically transfers readings from the device to a server. On the server, the data is stored in organized JSON files by date.</p></div>
                <div className="about-card"><h2 style={{ color: '#00548F', marginTop: 0, fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase' }}>Our Solution</h2><p style={{ color: '#334155', lineHeight: '1.8', fontWeight: '500', fontSize: '0.95rem' }}>The solution brings together hardware, software, and web technology into one connected workflow. Instead of keeping sensor readings trapped on a local device, the system turns them into structured online data that can be reviewed at any time.</p></div>
             </div>
          </div>
        )}
      </div>

      {/* CHEVRON FOOTER */}
      <footer style={{ background: '#000000', color: '#94A3B8', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginTop: 'auto', borderTop: '2px solid #334155' }}>
        <div><strong>© {currentYear} Chevron Corporation.</strong> All rights reserved.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="./assets/chev logo.png" alt="Chevron" style={{ height: '15px', filter: 'brightness(0) invert(1)', opacity: 0.6 }} onError={(e) => { e.target.style.display='none'; }} />
          <div style={{ fontStyle: 'italic', letterSpacing: '1px', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>the human energy company™</div>
        </div>
      </footer>
    </div>
  );
};

export default App;