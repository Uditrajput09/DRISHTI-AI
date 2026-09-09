# ==============================================================================
# run_dev.ps1 — PowerShell launcher for DRISHTI-AI Development Environment
# Starts both FastAPI backend (port 8000) and React frontend (port 5173)
# ==============================================================================

$ErrorActionPreference = "Stop"
$ScriptRoot = $PSScriptRoot
$env:UV_LINK_MODE = "copy"

# Locate valid python executable
$PythonCmd = if (Test-Path "$ScriptRoot\.venv\Scripts\python.exe") {
    "$ScriptRoot\.venv\Scripts\python.exe"
}
elseif (Get-Command "python" -ErrorAction SilentlyContinue) {
    "python"
}
elseif (Get-Command "py" -ErrorAction SilentlyContinue) {
    "py"
}
else {
    "python"
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  🚀 Launching DRISHTI-AI Development Servers (Backend + Frontend)" -ForegroundColor White
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

& $PythonCmd (Join-Path $ScriptRoot "run_dev.py")
