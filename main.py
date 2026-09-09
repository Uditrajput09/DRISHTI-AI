"""
main.py
Root application entrypoint for cloud hosting providers (Render, Railway, Koyeb, Vercel).
Re-exports the core DRISHTI-AI FastAPI application from backend.main.
"""

from backend.main import app

__all__ = ["app"]

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
