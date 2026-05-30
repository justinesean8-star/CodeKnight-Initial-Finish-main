import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template, request, jsonify, session, redirect, send_from_directory
import json
import random
import time
from werkzeug.security import generate_password_hash, check_password_hash

from modules.question_checker import evaluate

app = Flask(__name__)
app.secret_key = "dungeon_quest_secret_2026"

QUESTIONS_FILE = os.path.join(os.path.dirname(__file__), "questions", "questions.json")

with open(QUESTIONS_FILE, "r") as f:
    ALL_QUESTIONS = json.load(f)

# --- Simple user storage (file-backed) ---------------------------------
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")


def load_users():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, "w") as uf:
            json.dump({"users": {}}, uf)
    with open(USERS_FILE, "r") as uf:
        return json.load(uf)


def save_users(data):
    with open(USERS_FILE, "w") as uf:
        json.dump(data, uf, indent=2)

# ------------------------------------------------------------------------


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


@app.route("/login")
def login_page():
    if session.get("user"):
        return redirect('/dashboard')
    return render_template("login.html")


@app.route("/register")
def register_page():
    if session.get("user"):
        return redirect('/dashboard')
    return render_template("register.html")


@app.route("/dashboard")
def dashboard():
    user = session.get("user")
    return render_template("dashboard.html", user=user)


@app.route('/ck-assets/<path:filename>')
def ck_assets(filename):
    """Serve Codedknight NEW UI public assets without copying them.
    This keeps the original asset files in the attached folder and
    exposes them under /ck-assets/<filename> for the Flask app.
    """
    public_dir = os.path.join(os.path.dirname(__file__), 'Codedknight NEW UI', 'public')
    return send_from_directory(public_dir, filename)


@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    users = load_users()
    if username in users.get("users", {}):
        return jsonify({"error": "User exists"}), 400

    users.setdefault("users", {})[username] = {
        "password": generate_password_hash(password),
        "xp": 0,
        "level": 1,
        "achievements": [],
        "save": {}
    }
    save_users(users)
    session["user"] = username
    return jsonify({"success": True, "user": username})


@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    users = load_users()
    user = users.get("users", {}).get(username)
    if not user or not check_password_hash(user.get("password", ""), password):
        return jsonify({"error": "Invalid credentials"}), 401
    session["user"] = username
    return jsonify({"success": True, "user": username})


@app.route("/api/logout")
def api_logout():
    session.pop('user', None)
    return redirect('/')


@app.route("/api/save", methods=["POST"])
def api_save():
    if not session.get("user"):
        return jsonify({"error": "Not authenticated"}), 401
    data = request.get_json() or {}
    users = load_users()
    u = users.get("users", {}).get(session["user"])
    if not u:
        return jsonify({"error": "User not found"}), 404
    u["save"] = data.get("save", {})
    if "xp" in data:
        try:
            u["xp"] = int(data.get("xp", u.get("xp", 0)))
        except Exception:
            pass
    if "level" in data:
        try:
            u["level"] = int(data.get("level", u.get("level", 1)))
        except Exception:
            pass
    save_users(users)
    return jsonify({"success": True})


@app.route("/api/load", methods=["GET"])
def api_load():
    if not session.get("user"):
        return jsonify({"error": "Not authenticated"}), 401
    users = load_users()
    u = users.get("users", {}).get(session["user"])
    if not u:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"save": u.get("save", {}), "xp": u.get("xp", 0), "level": u.get("level", 1), "achievements": u.get("achievements", [])})


@app.route("/api/me", methods=["GET"])
def api_me():
    user = session.get("user")
    if not user:
        return jsonify({"user": None})
    users = load_users()
    u = users.get("users", {}).get(user, {})
    return jsonify({"user": user, "xp": u.get("xp", 0), "level": u.get("level", 1), "achievements": u.get("achievements", [])})


# --- Skill Tree & World Map ------------------------------------------------
SKILL_TREE_NODES = [
    {"id": "vars", "label": "Variables", "desc": "Store values and names.", "parents": [], "cost": 1},
    {"id": "loops", "label": "Loops", "desc": "Repeat code with for/while.", "parents": ["vars"], "cost": 1},
    {"id": "functions", "label": "Functions", "desc": "Encapsulate logic in reusable blocks.", "parents": ["vars"], "cost": 1},
    {"id": "datastruct", "label": "Data Structures", "desc": "Lists, dicts, sets and tuples.", "parents": ["loops","functions"], "cost": 2},
    {"id": "oop", "label": "OOP", "desc": "Classes and objects.", "parents": ["functions"], "cost": 2},
    {"id": "io", "label": "File I/O", "desc": "Read and write files.", "parents": ["functions"], "cost": 1},
    {"id": "debug", "label": "Debugging", "desc": "Tools and practices to find bugs.", "parents": ["vars","loops","functions"], "cost": 1},
]


@app.route('/world')
def world_map():
    return render_template('world_map.html')


@app.route('/skill-tree')
def skill_tree_page():
    return render_template('skill_tree.html')


@app.route('/api/skilltree', methods=['GET'])
def api_skilltree():
    user = session.get('user')
    unlocked = []
    if user:
        users = load_users()
        u = users.get('users', {}).get(user, {})
        unlocked = u.get('skill_unlocked', [])
    return jsonify({"nodes": SKILL_TREE_NODES, "unlocked": unlocked})


@app.route('/api/skilltree/unlock', methods=['POST'])
def api_skilltree_unlock():
    if not session.get('user'):
        return jsonify({"error": "Not authenticated"}), 401
    data = request.get_json() or {}
    node_id = data.get('node')
    if not node_id:
        return jsonify({"error": "Missing node"}), 400
    node = next((n for n in SKILL_TREE_NODES if n['id'] == node_id), None)
    if not node:
        return jsonify({"error": "Node not found"}), 404
    users = load_users()
    username = session['user']
    u = users.get('users', {}).get(username)
    if not u:
        return jsonify({"error": "User not found"}), 404
    unlocked = u.setdefault('skill_unlocked', [])
    if node_id in unlocked:
        return jsonify({"success": True, "unlocked": unlocked})
    # check prerequisites
    for p in node.get('parents', []):
        if p not in unlocked:
            return jsonify({"error": "Prerequisite not met", "missing": p}), 400
    unlocked.append(node_id)
    save_users(users)
    return jsonify({"success": True, "unlocked": unlocked})

# ---------------------------------------------------------------------------
# Daily Quests / Inventory --------------------------------------------------
DAILY_QUESTS = [
    {"id": "daily_1", "title": "Solve 2 easy problems", "desc": "Complete two easy challenges.", "xp": 10},
    {"id": "daily_2", "title": "Use a hint once", "desc": "Use one hint during battle.", "xp": 5},
]


@app.route('/inventory')
def inventory_page():
    return render_template('inventory.html')


@app.route('/quests')
def quests_page():
    return render_template('quests.html')


@app.route('/api/inventory', methods=['GET'])
def api_inventory_get():
    user = session.get('user')
    if not user:
        return jsonify({"inventory": []})
    users = load_users()
    u = users.get('users', {}).get(user, {})
    return jsonify({"inventory": u.get('inventory', [])})


@app.route('/api/inventory/add', methods=['POST'])
def api_inventory_add():
    if not session.get('user'):
        return jsonify({"error": "Not authenticated"}), 401
    data = request.get_json() or {}
    item = data.get('item')
    if not item:
        return jsonify({"error": "Missing item"}), 400
    users = load_users()
    username = session['user']
    u = users.get('users', {}).get(username)
    if not u:
        return jsonify({"error": "User not found"}), 404
    inv = u.setdefault('inventory', [])
    if isinstance(item, str):
        item = {"id": item, "name": item, "qty": 1}
    try:
        qty = int(item.get('qty', 1))
    except Exception:
        qty = 1
    # Merge stackable items by id
    found = False
    for it in inv:
        if it.get('id') == item.get('id'):
            it['qty'] = int(it.get('qty', 1)) + qty
            found = True
            break
    if not found:
        item['qty'] = qty
        inv.append(item)
    save_users(users)
    return jsonify({"success": True, "inventory": inv})


@app.route('/api/inventory/remove', methods=['POST'])
def api_inventory_remove():
    if not session.get('user'):
        return jsonify({"error": "Not authenticated"}), 401
    data = request.get_json() or {}
    item_id = data.get('id')
    if not item_id:
        return jsonify({"error": "Missing id"}), 400
    users = load_users()
    username = session['user']
    u = users.get('users', {}).get(username)
    if not u:
        return jsonify({"error": "User not found"}), 404
    inv = u.setdefault('inventory', [])
    inv = [it for it in inv if it.get('id') != item_id]
    u['inventory'] = inv
    save_users(users)
    return jsonify({"success": True, "inventory": inv})


@app.route('/api/quests', methods=['GET'])
def api_quests_get():
    user = session.get('user')
    quests = list(DAILY_QUESTS)
    if user:
        users = load_users()
        u = users.get('users', {}).get(user, {})
        state = u.setdefault('quests', {})
        for q in quests:
            s = state.get(q['id'], {})
            q['completed'] = bool(s.get('completed', False))
            q['claimed'] = bool(s.get('claimed', False))
    else:
        for q in quests:
            q['completed'] = False
            q['claimed'] = False
    return jsonify({"quests": quests})


@app.route('/api/quests/complete', methods=['POST'])
def api_quests_complete():
    if not session.get('user'):
        return jsonify({"error": "Not authenticated"}), 401
    data = request.get_json() or {}
    qid = data.get('id')
    if not qid:
        return jsonify({"error": "Missing id"}), 400
    users = load_users()
    username = session['user']
    u = users.get('users', {}).get(username)
    if not u:
        return jsonify({"error": "User not found"}), 404
    state = u.setdefault('quests', {})
    q = next((qq for qq in DAILY_QUESTS if qq['id'] == qid), None)
    if not q:
        return jsonify({"error": "Quest not found"}), 404
    state.setdefault(qid, {})['completed'] = True
    u['xp'] = int(u.get('xp', 0)) + int(q.get('xp', 0))
    save_users(users)
    return jsonify({"success": True, "xp": u['xp'], "quest": qid})

# ---------------------------------------------------------------------------

# Loot / Settings -----------------------------------------------------------
LOOT_TABLE = [
    {"id": "rusty_sword", "name": "Rusty Sword", "rarity": "common", "base_stage": 1, "min_qty": 1, "max_qty": 1},
    {"id": "healing_potion", "name": "Healing Potion", "rarity": "common", "base_stage": 1, "min_qty": 1, "max_qty": 2},
    {"id": "iron_shield", "name": "Iron Shield", "rarity": "uncommon", "base_stage": 2, "min_qty": 1, "max_qty": 1},
    {"id": "mystic_scroll", "name": "Mystic Scroll", "rarity": "rare", "base_stage": 3, "min_qty": 1, "max_qty": 1}
]


@app.route('/api/loot/generate', methods=['GET', 'POST'])
def api_loot_generate():
    data = request.get_json() or {}
    stage = int(request.args.get('stage', data.get('stage', 1)))
    count = int(request.args.get('count', data.get('count', 1)))
    seed = data.get('seed')
    rng = random.Random(seed if seed is not None else None)
    choices = [it for it in LOOT_TABLE if it.get('base_stage', 1) <= stage]
    if not choices:
        choices = LOOT_TABLE
    loot = []
    for i in range(max(1, count)):
        item = rng.choice(choices)
        qty = rng.randint(item.get('min_qty', 1), item.get('max_qty', 1))
        loot.append({"id": item['id'], "name": item['name'], "rarity": item.get('rarity', 'common'), "qty": qty})

    # optional auto-add to authenticated user's inventory
    auto_add = bool(data.get('auto_add', False))
    if auto_add and session.get('user'):
        users = load_users()
        u = users.get('users', {}).get(session['user'])
        if u is not None:
            inv = u.setdefault('inventory', [])
            for it in loot:
                found = False
                for ex in inv:
                    if ex.get('id') == it['id']:
                        ex['qty'] = int(ex.get('qty', 1)) + int(it.get('qty', 1))
                        found = True
                        break
                if not found:
                    inv.append(it)
            save_users(users)

    return jsonify({"loot": loot})


@app.route('/api/loot/claim', methods=['POST'])
def api_loot_claim():
    if not session.get('user'):
        return jsonify({"error": "Not authenticated"}), 401
    data = request.get_json() or {}
    item = data.get('item')
    if not item:
        return jsonify({"error": "Missing item"}), 400
    users = load_users()
    username = session['user']
    u = users.get('users', {}).get(username)
    if not u:
        return jsonify({"error": "User not found"}), 404
    inv = u.setdefault('inventory', [])
    if isinstance(item, str):
        item = {"id": item, "name": item, "qty": 1}
    try:
        qty = int(item.get('qty', 1))
    except Exception:
        qty = 1
    found = False
    for it in inv:
        if it.get('id') == item.get('id'):
            it['qty'] = int(it.get('qty', 1)) + qty
            found = True
            break
    if not found:
        item['qty'] = qty
        inv.append(item)
    save_users(users)
    return jsonify({"success": True, "inventory": inv})


DEFAULT_SETTINGS = {"musicOn": True, "musicVolume": 0.6, "sfxOn": True, "sfxVolume": 0.9}


@app.route('/settings')
def settings_page():
    return render_template('settings.html')


@app.route('/api/settings', methods=['GET', 'POST'])
def api_settings():
    if request.method == 'GET':
        user = session.get('user')
        if not user:
            return jsonify({'settings': DEFAULT_SETTINGS})
        users = load_users()
        u = users.get('users', {}).get(user, {})
        return jsonify({'settings': u.get('settings', DEFAULT_SETTINGS)})
    # POST update
    data = request.get_json() or {}
    settings = data.get('settings') or {}
    if not session.get('user'):
        return jsonify({'error': 'Not authenticated'}), 401
    users = load_users()
    u = users.get('users', {}).get(session['user'])
    if not u:
        return jsonify({'error': 'User not found'}), 404
    u['settings'] = settings
    save_users(users)
    return jsonify({'success': True, 'settings': settings})


# Journal & Leaderboard -----------------------------------------------------
@app.route('/journal')
def journal_page():
    return render_template('journal.html')


@app.route('/api/journal', methods=['GET', 'POST'])
def api_journal():
    if request.method == 'GET':
        user = session.get('user')
        if not user:
            return jsonify({'entries': []})
        users = load_users()
        u = users.get('users', {}).get(user, {})
        return jsonify({'entries': u.get('journal', [])})
    # POST - add entry
    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    body = data.get('body') or ''
    tags = data.get('tags') or []
    if not session.get('user'):
        return jsonify({'error': 'Not authenticated'}), 401
    users = load_users()
    username = session['user']
    u = users.get('users', {}).get(username)
    if not u:
        return jsonify({'error': 'User not found'}), 404
    journal = u.setdefault('journal', [])
    entry = {'id': f'e{len(journal)+1}', 'title': title, 'body': body, 'tags': tags, 'time': int(time.time())}
    journal.append(entry)
    save_users(users)
    return jsonify({'success': True, 'entry': entry})


@app.route('/leaderboard')
def leaderboard_page():
    return render_template('leaderboard.html')


@app.route('/api/leaderboard', methods=['GET'])
def api_leaderboard():
    users = load_users()
    items = []
    for name, u in users.get('users', {}).items():
        items.append({'username': name, 'xp': u.get('xp', 0), 'level': u.get('level', 1)})
    items.sort(key=lambda x: x['xp'], reverse=True)
    return jsonify({'leaders': items[:20]})

# ---------------------------------------------------------------------------


if __name__ == "__main__":
    app.run(debug=True, port=5000)
