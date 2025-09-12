from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import uuid
import requests
import base64
from supabase import create_client, Client
from deep_translator import GoogleTranslator
import random
import json

# Translator function
def translate_text(text, target_lang):
    if target_lang == "en":
        return text
    try:
        return GoogleTranslator(source='auto', target=target_lang).translate(text)
    except Exception as e:
        print("Translation error:", e)
        return text

app = Flask(__name__)
CORS(app)

# -------------------- Supabase --------------------
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_ANON_KEY")
)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# -------------------- SYSTEM PROMPT --------------------
SYSTEM_PROMPT = """You are ISH (Innovatrix Health Bot), an AI-driven public health assistant.

🎯 Goals:
- Educate rural and semi-urban populations about preventive healthcare, common diseases, vaccination, nutrition
- Provide real-time health information when available
- Be concise, clear, and culturally sensitive
- Use simple language for low literacy audiences
- Always respond in the user's selected language

🧭 Guidelines:
1. Keep responses short (2-4 sentences max)
2. If uncertain, say: "Please check with a local health worker for confirmation"
3. Never give harmful advice
4. For emergencies (chest pain, high fever, breathing issues): "Visit nearest hospital or call emergency immediately"
5. Include actionable tips (wash hands, drink clean water, use mosquito nets)
6. Maintain friendly, caring, trustworthy tone

Language: {lang}
User Message: {message}
"""

# -------------------- Chat Endpoint --------------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "message" not in data or "lang" not in data:
        return jsonify({"error": "Missing required fields: message and lang"}), 400

    user_message = data["message"]
    language = data["lang"]
    session_id = data.get("session_id", str(uuid.uuid4()))

    full_prompt = SYSTEM_PROMPT.format(lang=language, message=user_message)

    try:
        payload = {"contents": [{"parts": [{"text": full_prompt}]}]}
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json=payload,
            headers=headers,
            timeout=15
        )
        response.raise_for_status()
        gemini_data = response.json()
        bot_reply = gemini_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "Sorry, I couldn't process your request.")
    except Exception as e:
        print("Gemini API error:", e)
        bot_reply = "I'm having trouble connecting right now. Please try again later."

    bot_reply = translate_text(bot_reply, language)

    # Save chat to Supabase
    try:
        supabase.table("chat_history").insert({
            "session_id": session_id,
            "user_message": user_message,
            "bot_reply": bot_reply,
            "language": language,
            "created_at": datetime.utcnow().isoformat(),
            "metadata": {
                "ip": request.remote_addr,
                "user_agent": request.headers.get("User-Agent", "Unknown")
            }
        }).execute()
    except Exception as db_error:
        print("Supabase DB error:", db_error)

    return jsonify({"reply": {"parts": [{"text": bot_reply}]}, "session_id": session_id, "status": "success"}), 200

# -------------------- Myth Buster --------------------
@app.route("/mythbuster", methods=["POST"])
def mythbuster():
    data = request.get_json()
    question = data.get("question", "").strip()
    language = data.get("lang", "en")
    if not question:
        return jsonify({"answer": "Please ask a valid question."}), 400

    prompt = f"""
You are ISH (Innovatrix Health Bot), specialized in myth-busting public health misinformation.
Answer the user's question accurately, clearly, and concisely.
Always include a credible source link at the end (WHO, ICMR, MoHFW) if relevant.
Respond in English.

User Question: {question}
"""
    try:
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json=payload,
            headers=headers,
            timeout=15
        )
        response.raise_for_status()
        gemini_data = response.json()
        answer_en = gemini_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "Sorry, I couldn't process your request.")
    except Exception as e:
        print("Gemini API error:", e)
        answer_en = "I'm having trouble connecting right now. Please try again later."

    answer = translate_text(answer_en, language)
    return jsonify({"answer": answer}), 200

# -------------------- Image Upload / Analysis --------------------
@app.route("/analyze-image", methods=["POST"])
def analyze_image():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    language = request.form.get("lang", "en")
    user_message = request.form.get("message", "")  # optional

    try:
        image_bytes = image_file.read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")

        payload = {
            "input_image_bytes": image_b64,
            "instructions": f"Provide basic guidance about this image. {user_message} Do not give harmful advice."
        }
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json=payload,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        gemini_data = response.json()
        ai_reply = gemini_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "Sorry, I couldn't process your image.")
    except Exception as e:
        print("Gemini Vision API error:", e)
        ai_reply = "I'm having trouble analyzing the image right now. Please try again later."

    ai_reply = translate_text(ai_reply, language)
    return jsonify({"advice": ai_reply}), 200

# -------------------- AI Quiz --------------------
used_questions = {}  # session tracker

@app.route("/ai-quiz", methods=["GET"])
def ai_quiz_unique():
    language = request.args.get("lang", "en")
    session_id = request.args.get("session_id", str(uuid.uuid4()))

    if session_id not in used_questions:
        used_questions[session_id] = set()

    topics = [
        "hand hygiene", "vaccination", "nutrition", "mosquito-borne diseases",
        "common cold prevention", "diabetes management", "healthy habits",
        "mental health", "heart health", "eye care", "oral hygiene",
        "exercise", "pregnancy care", "child health", "elderly health"
    ]

    available_topics = [t for t in topics if t not in used_questions[session_id]]
    if not available_topics:
        used_questions[session_id] = set()
        available_topics = topics

    topic = random.choice(available_topics)
    used_questions[session_id].add(topic)

    prompt = f"""
You are ISH (Innovatrix Health Bot), specialized in generating short health quizzes.
Create a multiple-choice question about {topic}, with 4 options and clearly indicate the correct answer.
Provide points as 10 for correct answer.
Respond in English.
Format JSON only like:
{{
  "question": "Question text",
  "options": ["Option1", "Option2", "Option3", "Option4"],
  "correct": "Correct Option",
  "points": 10
}}
"""

    try:
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json=payload,
            headers=headers,
            timeout=15
        )
        response.raise_for_status()
        gemini_data = response.json()
        question_json_str = gemini_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
        try:
            question_data = json.loads(question_json_str)
        except:
            question_data = {
                "question": "How often should you wash your hands?",
                "options": ["Once a day", "Before meals", "Never", "After using bathroom"],
                "correct": "Before meals",
                "points": 10
            }
    except Exception as e:
        print("Gemini API error:", e)
        question_data = {
            "question": "How often should you wash your hands?",
            "options": ["Once a day", "Before meals", "Never", "After using bathroom"],
            "correct": "Before meals",
            "points": 10
        }

    # Translate
    question_data_translated = question_data.copy()
    if language != "en":
        question_data_translated["question"] = translate_text(question_data["question"], language)
        question_data_translated["options"] = [translate_text(opt, language) for opt in question_data["options"]]

    return jsonify({"quiz": question_data_translated, "session_id": session_id}), 200

# -------------------- Health Check --------------------
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "ISH Bot API"}), 200

@app.route("/", methods=["GET"])
def home():
    return "ISH Bot Backend is running! Use POST /chat, /mythbuster, /analyze-image or GET /ai-quiz."

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
