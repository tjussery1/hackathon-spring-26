from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import datetime
import json
from openai import OpenAI
from typing import Optional, Dict, List, Any

# --- CONFIGURE AI ---
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

DB_NAME = "chevron_final_v4.db" # Changed name to start fresh

class SensorInput(BaseModel):
    temperature: float
    humidity: float

class ReportRequest(BaseModel):
    timeframe: str # "day", "week", or "month"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # Logs Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            temperature REAL,
            humidity REAL,
            status TEXT
        )
    """)
    # Tickets Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            issue TEXT,
            priority TEXT,
            status TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

@app.post("/api/arduino")
async def receive_arduino_data(data: SensorInput):
    """This endpoint receives live data and applies the Chevron logic"""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    temp = data.temperature
    hum = data.humidity

    # --- MATCHING FRONTEND LOGIC ---
    # Temperature Logic
    if 68 <= temp <= 78:
        t_stat = "GREEN"
    elif (60 <= temp < 68) or (78 < temp <= 85):
        t_stat = "YELLOW"
    else:
        t_stat = "RED"

    # Humidity Logic
    if 30 <= hum <= 60:
        h_stat = "GREEN"
    elif (20 <= hum < 30) or (60 < hum <= 70):
        h_stat = "YELLOW"
    else:
        h_stat = "RED"

    # Combined Status (Worst Case)
    if t_stat == "RED" or h_stat == "RED":
        status = "RED"
        priority = "High"
        issue = f"CRITICAL: Temp {temp}F / Hum {hum}% outside safe bounds."
    elif t_stat == "YELLOW" or h_stat == "YELLOW":
        status = "YELLOW"
        priority = "Medium"
        issue = f"Warning: Environment fluctuating (T:{temp} H:{hum})"
    else:
        status = "GREEN"
        priority = "Low"
        issue = None

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Save Log with the new status
    cursor.execute("INSERT INTO system_logs (timestamp, temperature, humidity, status) VALUES (?, ?, ?, ?)", 
                   (timestamp, temp, hum, status))
    
    # Auto-Generate Ticket if status is NOT Green
    if issue:
        cursor.execute("INSERT INTO tickets (timestamp, issue, priority, status) VALUES (?, ?, ?, ?)", 
                       (timestamp, issue, priority, "Open"))
        
    conn.commit()
    conn.close()
    return {"message": "Data logged", "status": status}

@app.get("/api/dashboard")
async def get_dashboard_data():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM system_logs ORDER BY id DESC LIMIT 1")
    latest_log = cursor.fetchone()
    
    cursor.execute("SELECT * FROM tickets WHERE status='Open' ORDER BY id DESC")
    tickets = [{"id": r[0], "time": r[1], "issue": r[2], "priority": r[3]} for r in cursor.fetchall()]
    conn.close()

    if latest_log:
        return {
            "temperature": latest_log[2],
            "humidity": latest_log[3],
            "status": latest_log[4],
            "open_tickets": tickets
        }
    return {"temperature": 0, "humidity": 0, "status": "Offline", "open_tickets": []}

@app.post("/api/report")
async def generate_report(req: ReportRequest):
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM system_logs ORDER BY id DESC LIMIT 50")
        logs = cursor.fetchall()
        cursor.execute("SELECT * FROM tickets ORDER BY id DESC LIMIT 20")
        tickets = cursor.fetchall()
        conn.close()

        prompt = f"""
        Act as a Chevron Senior Operations Manager. Write a {req.timeframe} health report for the pumping system.
        Recent Logs count: {len(logs)}. Recent Tickets count: {len(tickets)}.
        Format with clear headers, bullet points, and a professional tone. Focus on system health, ticket resolution, and preventative maintenance. Do not use markdown asterisks, just clean text.
        """
        res = client.chat.completions.create(
            model="openrouter/auto", 
            messages=[{"role": "user", "content": prompt}]
        )
        return {"report": res.choices[0].message.content}
    except Exception as e:
        return {"report": f"AI Error: {e}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)