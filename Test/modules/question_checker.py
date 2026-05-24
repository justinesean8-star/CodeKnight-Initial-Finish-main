import subprocess
import sys
import tempfile
import os

BLOCKED_IMPORTS = [
    "os", "sys", "subprocess", "shutil", "socket", "importlib",
    "builtins", "ctypes", "multiprocessing", "threading", "requests",
    "urllib", "http", "pickle", "shelve", "io"
]

BLOCKED_KEYWORDS = [
    "__import__", "exec(", "eval(", "compile(", "open(", "input(",
    "globals(", "locals(", "vars(", "dir(", "getattr(", "setattr(",
    "delattr(", "hasattr(", "breakpoint(", "__builtins__"
]


def check_code_safety(code: str):
    for blk in BLOCKED_KEYWORDS:
        if blk in code:
            return False, f"Forbidden keyword detected: {blk}"
    for mod in BLOCKED_IMPORTS:
        if f"import {mod}" in code or f"from {mod}" in code:
            return False, f"Forbidden module: {mod}"
    return True, "OK"


def run_code(code: str, timeout: int = 5):
    safe, reason = check_code_safety(code)
    if not safe:
        return False, "", f"Security violation: {reason}"

    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            tmp_path = f.name

        result = subprocess.run(
            [sys.executable, tmp_path],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        os.unlink(tmp_path)

        if result.returncode != 0:
            return False, "", result.stderr.strip()
        return True, result.stdout.strip(), ""
    except subprocess.TimeoutExpired:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
        return False, "", "Time limit exceeded!"
    except Exception as e:
        return False, "", str(e)


def evaluate(code: str, expected_output: str, timeout: int = 5):
    success, actual_output, error = run_code(code, timeout)
    if not success:
        return {
            "correct": False,
            "actual": "",
            "expected": expected_output,
            "error": error
        }

    correct = actual_output.strip() == expected_output.strip()
    return {
        "correct": correct,
        "actual": actual_output,
        "expected": expected_output,
        "error": ""
    }
