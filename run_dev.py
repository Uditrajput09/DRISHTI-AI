"""
run_dev.py
Unified development launcher for DRISHTI-AI Landslide Early Warning System.
Launches FastAPI backend (port 8000) and React frontend (port 5173) concurrently.
"""

import sys
import os
import subprocess
import time
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")


def main():
    print("=" * 70)
    print("  🚀 DRISHTI-AI Landslide Early Warning System — Dev Launcher")
    print("  Pilot Region: East Khasi Hills, Meghalaya")
    print("=" * 70)

    # 1. Initialize and Seed DB if needed
    print("\n[1/3] Ensuring database is initialized and seeded...")
    try:
        from backend.seed_data import seed_database
        seed_database()
        print("✓ Database ready.")
    except Exception as e:
        print(f"⚠️ Database seed note: {e}")

    # 2. Launch FastAPI Backend
    from backend.config import settings
    port = settings.PORT

    # Check if port is already occupied
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        if s.connect_ex(("127.0.0.1", port)) == 0:
            print(f"⚠️ Warning: Port {port} is already in use by an active process.")
            print(f"   If you experience HTTP 404 or connection conflicts, stop any background server using port {port}.")

    print(f"\n[2/3] Starting FastAPI Backend on http://127.0.0.1:{port} ...")
    backend_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        str(port),
        "--reload"
    ]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=ROOT_DIR,
        env=os.environ.copy()
    )

    # Wait for FastAPI backend to initialize and bind port before launching Vite
    print(f"Waiting for backend to initialize on port {port}...")
    for _ in range(30):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.5)
            if s.connect_ex(("127.0.0.1", port)) == 0:
                print(f"✓ Backend ready on port {port}.")
                break
        time.sleep(0.5)

    # 3. Launch Frontend (Vite)
    print("\n[3/3] Starting React Vite Frontend on http://localhost:5173 ...")
    import shutil
    npm_path = shutil.which("npm.cmd") or shutil.which("npm") or ("npm.cmd" if sys.platform == "win32" else "npm")
    frontend_proc = subprocess.Popen(
        [npm_path, "run", "dev"],
        cwd=FRONTEND_DIR,
        shell=(sys.platform == "win32"),
        env=os.environ.copy()
    )

    print("\n" + "=" * 70)
    print("  ✅ Platform is Running!")
    print("  • GIS Dashboard & Field App: http://localhost:5173")
    print("  • FastAPI Swagger Docs:      http://127.0.0.1:8000/docs")
    print("  • Press Ctrl+C to terminate both servers")
    print("=" * 70 + "\n")

    def handle_shutdown(sig, frame):
        print("\n\nShutting down backend and frontend...")
        backend_proc.terminate()
        frontend_proc.terminate()
        try:
            backend_proc.wait(timeout=3)
            frontend_proc.wait(timeout=3)
        except Exception:
            backend_proc.kill()
            frontend_proc.kill()
        print("Servers stopped cleanly.")
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)

    try:
        while True:
            time.sleep(1)
            # If any process exited unexpectedly, handle it
            if backend_proc.poll() is not None:
                print("Backend process exited.")
                break
            if frontend_proc.poll() is not None:
                print("Frontend process exited.")
                break
    except KeyboardInterrupt:
        handle_shutdown(None, None)


if __name__ == "__main__":
    main()
