import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template, request, jsonify, session
import json
import random

from modules.question_checker import evaluate

app = Flask(__name__)
app.secret_key = "dungeon_quest_secret_2026"

QUESTIONS_FILE = os.path.join(os.path.dirname(__file__), "questions", "questions.json")

with open(QUESTIONS_FILE, "r") as f:
    ALL_QUESTIONS = json.load(f)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/battle")
def battle():
    return render_template("battle.html")


@app.route("/api/question", methods=["GET"])
def get_question():
    difficulty = request.args.get("difficulty", "easy")
    filtered = [q for q in ALL_QUESTIONS if q["difficulty"] == difficulty]
    if not filtered:
        filtered = ALL_QUESTIONS
    question = random.choice(filtered)
    # Don't send expected_output to frontend
    return jsonify({
        "id": question["id"],
        "question": question["question"],
        "difficulty": question["difficulty"],
        "hint": question["hint"],
        "exp_reward": question["exp_reward"],
        "enemy": question["enemy"]
    })


@app.route("/api/submit", methods=["POST"])
def submit_code():
    data = request.get_json()
    question_id = data.get("question_id")
    code = data.get("code", "")

    question = next((q for q in ALL_QUESTIONS if q["id"] == question_id), None)
    if not question:
        return jsonify({"error": "Question not found"}), 404

    result = evaluate(code, question["expected_output"])
    return jsonify({
        "correct": result["correct"],
        "actual": result["actual"],
        "expected": result["expected"] if not result["correct"] else "",
        "error": result["error"],
        "exp_reward": question["exp_reward"] if result["correct"] else 0,
        "enemy": question["enemy"]
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
