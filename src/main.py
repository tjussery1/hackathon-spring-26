from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import datetime
import json
from openai import OpenAI

# --- CONFIGURE AI ---
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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" 
)

app = FastAPI()

# Standard CORS to allow React to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "chevron_final_v3.db"

class SensorInput(BaseModel):
    fluid_type: str 
    outside_temp: float
    humidity: float

class ChatMessage(BaseModel):
    message: str

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            fluid_type TEXT,
            outside_temp REAL,
            humidity REAL,
            liquid_temp REAL,
            ph REAL,
            flow_rate REAL,
            pressure REAL,
            tank_level REAL,
            sys_load REAL,
            status TEXT,
            explanation TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

@app.post("/api/sensor")
async def process_sensor_data(data: SensorInput):
    print(f"--- Incoming Data: {data.fluid_type} | Temp: {data.outside_temp} ---")
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    
    ai_prompt = f"Act as a Chevron Engineer. Analyze: {data.fluid_type} fluid, {data.outside_temp}C Ambient. Return ONLY JSON: {{\"liquid_temp\": float, \"ph\": float, \"flow_rate\": float, \"pressure\": float, \"level\": float, \"load\": float, \"status\": \"Normal/Warning/CRITICAL\", \"explanation\": \"Short safety report.\"}}"
    
    try:
        response = client.chat.completions.create(
            model="openrouter/auto",
            messages=[{"role": "user", "content": ai_prompt}]
        )
        sim_data = json.loads(response.choices[0].message.content.replace('```json', '').replace('```', '').strip())
    except Exception as e:
        print(f"AI Error: {e}")
        calc_pressure = 100 + (data.outside_temp * 1.5)
        # conditionals to determine status based on temp
        sim_data = {
            "liquid_temp": data.outside_temp + 2.5,
            "ph": 7.0,
            "flow_rate": 50.0,
            "pressure": round(calc_pressure, 2),
            "level": 75.0,
            "load": 30.0,
            "status": "CRITICAL" if data.outside_temp > 45 else ("Warning" if data.outside_temp > 30 else "Normal"),
            "explanation": f"Manual calculation: Pressure increased to {calc_pressure} PSI due to thermal expansion."
        }
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO system_logs 
        (timestamp, fluid_type, outside_temp, humidity, liquid_temp, ph, flow_rate, pressure, tank_level, sys_load, status, explanation) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", 
        (timestamp, data.fluid_type, data.outside_temp, data.humidity, 
         sim_data['liquid_temp'], sim_data['ph'], sim_data['flow_rate'], sim_data['pressure'], 
         sim_data['level'], sim_data['load'], sim_data['status'], sim_data['explanation']))
    conn.commit()
    conn.close()
    return sim_data

@app.get("/api/logs")
async def get_logs():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM system_logs ORDER BY id DESC LIMIT 10")
    columns = [col[0] for col in cursor.description]
    logs = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return logs

@app.get("/api/all_logs")
async def get_all_logs():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM system_logs ORDER BY id DESC")
    columns = [col[0] for col in cursor.description]
    logs = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return logs

@app.post("/api/chat")
async def chat_with_system(chat: ChatMessage):
    try:
        # Debug print to see if the message even arrives
        print(f"Chat received: {chat.message}")

        # Simple context fetch
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM system_logs ORDER BY id DESC LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        
        system_status = f"Current State: {row[11]} status at {row[3]}C" if row else "System is currently idle."

        # AI Call
        res = client.chat.completions.create(
            model="openrouter/auto", 
            messages=[
                {"role": "system", "content": f"You are a Chevron AI Analyst. {system_status}"}, 
                {"role": "user", "content": chat.message}
            ]
        )
        return {"reply": res.choices[0].message.content}
    except Exception as e:
        # THIS IS KEY: Check your Python terminal to see what this prints!
        print(f"DETAILED CHAT ERROR: {e}")
        return {"reply": "Connection lost to Chevron Analyst."}
    
@app.get("/api/generate_report")
async def generate_report():
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        # Fetch all logs to analyze trends
        cursor.execute("SELECT * FROM system_logs ORDER BY id DESC")
        all_logs = cursor.fetchall()
        conn.close()

        if not all_logs:
            return {"report": "No data available to generate a report."}

        # Format data for the AI to "read"
        summary_data = [f"Time: {log[1]}, Fluid: {log[2]}, Temp: {log[3]}C, Status: {log[11]}" for log in all_logs[:20]]
        
        report_prompt = f"""
        Act as a Chevron Senior Operations Manager. 
        Analyze the following recent telemetry logs and write a 'Weekly Executive Summary'.
        
        DATA TRENDS:
        {json.dumps(summary_data)}

        STRUCTURE:
        1. Executive Summary (High level)
        2. Operational Risks (Identify any temperature or pressure spikes)
        3. Maintenance Recommendation (Suggest a next step)
        
        Keep it professional, concise, and industrial. Use Markdown for headers.
        """

        res = client.chat.completions.create(
            model="openrouter/auto", 
            messages=[{"role": "user", "content": report_prompt}]
        )
        return {"report": res.choices[0].message.content}
    except Exception as e:
        print(f"Report Error: {e}")
        return {"report": "Failed to generate AI report. Check backend connectivity."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)