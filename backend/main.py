import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import sqlite3
from datetime import datetime, timedelta

app = FastAPI()
# 1. Create storage folders
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
# Make uploaded images accessible via URL
# (e.g., http://your-ip:8000/uploads/image.jpg)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
# 2. Database Setup
DB_PATH = "history.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS logs 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  timestamp TEXT, 
                  label TEXT, 
                  confidence REAL, 
                  image_path TEXT)''')
    conn.commit()
    conn.close()

init_db()

MODEL_PATH = "model/model.tflite"
LABELS_PATH = "model/labels.txt"
interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

with open(LABELS_PATH, "r") as f:
    labels = [line.strip().split(" ", 1)[1] for line in f.readlines()]

def process_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img, dtype=np.float32)
    normalized_img = (img_array - 127.5) / 127.5
    return np.expand_dims(normalized_img, axis=0)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read and save the file
    contents = await file.read()
    filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Run AI
    input_data = process_image(contents)
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])[0]
    top_index = np.argmax(output_data)
    prediction_label = labels[top_index]
    confidence = float(output_data[top_index]) / 255.0

    # Save to Database
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO logs (timestamp, label, confidence, image_path) VALUES (?, ?, ?, ?)",
              (datetime.now().isoformat(), prediction_label, confidence, file_path))
    conn.commit()
    conn.close()

    return {
        "prediction": prediction_label,
        "confidence": round(confidence, 4),
        "image_url": f"/uploads/{filename}"
    }

@app.get("/history")
async def get_history():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM logs ORDER BY timestamp DESC")
    rows = c.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/")
def health():
    return {"status": "Poop Tracker API is online 💩"}

@app.get("/stats/weekly")
async def get_weekly_list():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Get logs for the current week
    c.execute('''
        SELECT 
            timestamp,
            label, 
            date(timestamp) as raw_date,
            strftime('%H:%M', timestamp) as time_string
        FROM logs 
        WHERE date(timestamp) >= date('now', 'weekday 1', '-7 days')
        ORDER BY timestamp DESC
    ''')
    rows = c.fetchall()
    conn.close()

    # Organize logs by date
    logs_by_date = {}
    for row in rows:
        date_key = row["raw_date"]

        if date_key not in logs_by_date:
            logs_by_date[date_key] = []

        logs_by_date[date_key].append({
            "label": row["label"], 
            "time": row["time_string"]
        })

    # Generate last 7 days
    weekly_data = []
    for i in range(7):
        current_dt = datetime.now() - timedelta(days=i)
        raw_date = current_dt.strftime("%Y-%m-%d")
        display_date = current_dt.strftime("%b %-d, %Y")

        if raw_date in logs_by_date:
            for entry in logs_by_date[raw_date]:
                weekly_data.append({
                    "date": display_date,
                    "label": entry["label"],
                    "time": entry["time"],
                    "has_log": True
                })
        else:
            weekly_data.append({
                "date": display_date,
                "label": "No log",
                "has_log": False
            })

    return {"week_logs": weekly_data}

@app.get("/stats/calendar")
async def get_calendar_dots():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT date(timestamp) as day, COUNT(*) as count FROM logs GROUP BY day")
    rows = c.fetchall()
    conn.close()
    return {row[0]: row[1] for row in rows}

@app.get("/tips")
async def get_daily_tips():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT label FROM logs WHERE date(timestamp) = date('now', '-1 day') ORDER BY timestamp DESC LIMIT 1")
    yesterday = c.fetchone()
    conn.close()

    if not yesterday:
        return {"status": "No data", "tip": "Looks like you didn't record any bowel movements yesterday! If you're constipated, drink more water and eat more fiber."}

    label = yesterday["label"].lower()
    if "healthy" in label:
        return {"status": "Healthy", "tip": "Good job yesterday, your bowel movements were healthy!"}
    elif "constipation" in label:
        return {"status": "Constipation", "tip": "Yesterday was a bit tough. Try drinking more water and eating more fiber."}
    elif "diarrhea" in label:
        return {"status": "Diarrhea", "tip": "Yesterday was rough. Try drinking more water and avoiding fat and dairy."}
    
    return {"status": "Unknown", "tip": "Keep tracking to see your personalized digestive trends!"} 

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
