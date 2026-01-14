# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tower of Hanoi Solver - A web-based implementation of the classic Tower of Hanoi puzzle with both 2D and 3D interactive interfaces. The application uses FastAPI for the backend REST API and vanilla JavaScript/Three.js for dual frontend interfaces.

## Development Commands

### Running the Application
```bash
# Install dependencies
pip install -r requirements.txt

# Start the FastAPI development server (with auto-reload)
uvicorn app:app --reload

# Run the CLI version (command-line game)
python main.py
```

### Accessing the Interfaces
- 2D Interface: http://localhost:8000/
- 3D Interface: http://localhost:8000/three-ui.html
- API docs: http://localhost:8000/docs (FastAPI auto-generated)

### Deploying to GCP Cloud Run
```bash
# One-command deployment (builds, pushes, and deploys)
./deploy.sh

# Manual deployment steps (if needed):
# 1. Build for linux/amd64 (required by Cloud Run)
docker build --platform linux/amd64 -t gcr.io/$(gcloud config get-value project)/tower-hanoi:latest .

# 2. Push to Google Container Registry
docker push gcr.io/$(gcloud config get-value project)/tower-hanoi:latest

# 3. Deploy to Cloud Run
gcloud run deploy tower-hanoi \
  --image gcr.io/$(gcloud config get-value project)/tower-hanoi:latest \
  --region us-west1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 1
```

**Prerequisites for deployment:**
- Docker installed locally
- Google Cloud CLI installed and authenticated (`gcloud auth login`)
- Project configured (`gcloud config set project YOUR_PROJECT_ID`)
- Docker configured for GCR (`gcloud auth configure-docker`)
- Required APIs enabled (`gcloud services enable cloudbuild.googleapis.com run.googleapis.com`)

## Architecture

### Backend Structure

The backend consists of two main Python modules:

**main.py** - Core game engine (`Game` class):
- `Game.board`: 3-element list representing the three pegs, where each peg is a list of ring sizes (larger numbers = larger rings)
- `Game.history`: List of board states for undo functionality
- `Game.move(src, dst)`: Validates and executes moves, returns tuple `(success: bool, message: str)`
- `Game.solve()`: Recursive solver that modifies board state and prints to console
- `Game._solve_recursive(n, src, dst, aux)`: Classic 3-peg recursive algorithm
- `Game.undo()`: Reverts to previous board state from history

**app.py** - FastAPI web server:
- Maintains a single global `game` instance (not thread-safe, single-user design)
- Serves static files (HTML/CSS/JS) directly via `FileResponse`
- API endpoints modify the shared game state and return JSON responses

### API Endpoints

- `POST /start?rings=N` - Initialize game with N rings, returns `{"board": [[...], [], []]}`
- `GET /state` - Returns current board state `{"board": [...]}`
- `POST /move?src=X&dst=Y` - Execute move, returns `[success: bool, message: str]`
- `POST /solve` - Computes full solution without modifying game state, returns `{"steps": [board1, board2, ...]}`
- `POST /undo` - Undo last move, returns same format as `Game.undo()`

### Frontend Structure

**2D Interface** (index.html + script.js + styles.css):
- Click-based interaction: first click selects source peg, second click moves to destination
- Canvas or DOM-based rendering of pegs and rings
- Polls `/state` after each action to re-render board

**3D Interface** (three-ui.html + three-ui.js):
- Three.js WebGL rendering with orbital camera controls
- Drag-and-drop interaction using raycasting for object selection
- Rings are 3D cylinder meshes positioned on peg objects
- Requires WebGL-capable browser

Both frontends are independent and communicate only through the REST API.

## Key Implementation Details

### Board Representation
- Board is a list of 3 lists: `[[peg0_rings], [peg1_rings], [peg2_rings]]`
- Ring sizes are integers where larger numbers = larger rings (e.g., `[3, 2, 1]` on peg 0 means ring 3 at bottom, ring 1 at top)
- Initial state for N rings: `[[N, N-1, ..., 1], [], []]`

### Move Validation
The `Game.move()` method enforces Tower of Hanoi rules:
1. Source and destination must be valid pegs (0-2)
2. Source and destination cannot be the same
3. Source peg must not be empty
4. Cannot place larger ring on smaller ring

### Solver Algorithm
- Uses classic recursive approach: to move N rings from src to dst using aux, recursively move N-1 rings to aux, move largest ring to dst, recursively move N-1 rings from aux to dst
- The `/solve` endpoint computes steps without modifying global game state (works on local copy)
- The `Game.solve()` method resets and modifies the game instance (used in CLI mode)

### State Management
- Game state is stored in-memory in a single global `Game` instance
- No persistence - restarting the server loses all state
- History is append-only during gameplay; undo pops from history but doesn't allow redo

## Important Constraints

- **Single-user design**: The global `game` instance means concurrent users will conflict
- **No database**: All state is ephemeral and in-memory
- **Ring limit**: UI tested with 1-10 rings; higher counts may impact performance
- **3D performance**: Depends on hardware acceleration and WebGL support

## Deployment Notes

### Cloud Run Configuration
- **Region**: us-west1
- **Memory**: 512Mi (sufficient for this application)
- **CPU**: 1 vCPU
- **Max instances**: 1 (prevents scaling costs for free tier)
- **Platform requirement**: Must build Docker images for linux/amd64 architecture (use `--platform linux/amd64` flag)

### Cloud Run Free Tier Limits (2024)
- 2 million requests/month
- 360,000 GB-seconds of memory/month
- 180,000 vCPU-seconds/month
- 1 GB network egress/month
- Cold starts after ~15 minutes of inactivity

### Deployment Files
- **Dockerfile**: Builds Python 3.9-slim image with FastAPI and uvicorn
- **deploy.sh**: Automated build, push, and deploy script (gets project ID from gcloud config)
- **.dockerignore**: Excludes venv, __pycache__, .git, .idea from image
