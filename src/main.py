from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import datetime
import random
from openai import OpenAI

# --- CONFIGURE AI VIA OPENROUTER ---
# Paste your OpenRouter API key right here inside the quotes!
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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"
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

class SensorData(BaseModel):
    sensor_id: str
    temperature: float

def init_db():
    conn = sqlite3.connect("hackathon.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sensor_id TEXT,
            temperature REAL,
            status TEXT,
            explanation TEXT,
            timestamp TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS maintenance_tickets (
            ticket_id TEXT PRIMARY KEY,
            sensor_id TEXT,
            issue TEXT,
            timestamp TEXT,
            status TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

@app.post("/api/sensor")
async def process_sensor_data(data: SensorData):
    temp = data.temperature
    timestamp = datetime.datetime.now().strftime("%I:%M:%S %p")
    
    conn = sqlite3.connect("hackathon.db")
    cursor = conn.cursor()
    
    # 1 & 2: DETECT AND DECIDE
    if temp < 90:
        status = "Normal"
        explanation = f"System operating at optimal thermal capacity ({temp}°C)."
    elif temp >= 90 and temp < 110:
        status = "Warning"
        explanation = f"Thermal elevation detected ({temp}°C). Pre-emptive monitoring engaged."
    else:
        status = "CRITICAL"
        
        # --- 4. EXPLAIN: THE AI BRAIN KICKS IN ---
        try:
            response = client.chat.completions.create(
                model="openrouter/auto", # OpenRouter will automatically pick a fast model
                messages=[
                    {"role": "system", "content": "You are an autonomous AI safety inspector for an oilfield. Keep responses to exactly two short, professional sentences."},
                    {"role": "user", "content": f"Pump {data.sensor_id} just reached a critical temperature of {temp}°C. Write an incident report stating the pump was remotely shut down to prevent failure and a maintenance crew was dispatched."}
                ]
            )
            # This pulls the exact sentence the AI wrote
            explanation = response.choices[0].message.content.strip()
            
        except Exception as e:
            # Fallback if your Wi-Fi drops or the API key is wrong
            explanation = f"CRITICAL OVERHEAT ({temp}°C). Autonomous shutdown engaged. Crew dispatched."
            print("AI Error:", e)

        # --- 3. ACT: Generate Maintenance Ticket ---
        ticket_id = f"TKT-{random.randint(1000, 9999)}"
        issue_details = f"Thermal overload ({temp}°C)."
        cursor.execute(
            "INSERT INTO maintenance_tickets (ticket_id, sensor_id, issue, timestamp, status) VALUES (?, ?, ?, ?, ?)",
            (ticket_id, data.sensor_id, issue_details, timestamp, "OPEN")
        )
    
    # Save the AI's explanation to the system log
    cursor.execute(
        "INSERT INTO system_logs (sensor_id, temperature, status, explanation, timestamp) VALUES (?, ?, ?, ?, ?)", 
        (data.sensor_id, temp, status, explanation, timestamp)
    )
    conn.commit()
    conn.close()
    
    return {"status": status}

@app.get("/api/logs")
async def get_logs():
    conn = sqlite3.connect("hackathon.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM system_logs ORDER BY id DESC LIMIT 10")
    columns = [col[0] for col in cursor.description]
    logs = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return logs

@app.get("/api/tickets")
async def get_tickets():
    conn = sqlite3.connect("hackathon.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM maintenance_tickets ORDER BY timestamp DESC LIMIT 5")
    columns = [col[0] for col in cursor.description]
    tickets = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return tickets

# --- NEW: AI CHATBOX ENDPOINT ---
class ChatMessage(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_with_system(chat: ChatMessage):
    # 1. Fetch the recent data so the AI knows what is happening
    conn = sqlite3.connect("hackathon.db")
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, sensor_id, temperature, status, explanation FROM system_logs ORDER BY id DESC LIMIT 5")
    recent_logs = cursor.fetchall()
    conn.close()

    # 2. Format the data into a hidden context string
    context_str = "RECENT SENSOR DATA (JSON History):\n"
    for log in recent_logs:
        context_str += f"- [{log[0]}] {log[1]} reported {log[2]}°C. Status: {log[3]}. Action: {log[4]}\n"

    # 3. Build the prompt for OpenRouter
    prompt = f"""You are the AI Control Room Assistant for Hack Island.
    You monitor incoming JSON sensor data and system logs. 
    Answer the user's question briefly and professionally based ONLY on the provided recent logs below.
    If the answer isn't in the logs, say "I don't have that data in my recent telemetry."

    {context_str}

    User Question: {chat.message}
    """

    try:
        response = client.chat.completions.create(
            model="openrouter/auto", 
            messages=[
                {"role": "system", "content": "You are a highly advanced AI system assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        ai_reply = response.choices[0].message.content.strip()
    except Exception as e:
        ai_reply = "System error: Unable to connect to AI core."
        print("Chat Error:", e)

    return {"reply": ai_reply}

# --- NEW: EXCEL EXPORT ENDPOINT ---
@app.get("/api/all_logs")
async def get_all_logs():
    conn = sqlite3.connect("hackathon.db")
    cursor = conn.cursor()
    # Grab literally everything in the database
    cursor.execute("SELECT timestamp, sensor_id, temperature, status, explanation FROM system_logs ORDER BY id DESC")
    columns = [col[0] for col in cursor.description]
    logs = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return logs

print("hello, world!")