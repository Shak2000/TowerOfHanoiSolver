# Tower of Hanoi Solver

A web-based implementation of the classic Tower of Hanoi puzzle featuring both 2D and 3D interactive interfaces. Built with Python FastAPI backend and JavaScript/Three.js frontend.

## Features

- **Dual Interface Options**:
  - Classic 2D web interface with click-based gameplay
  - Immersive 3D interface with drag-and-drop functionality using Three.js
- **Interactive Gameplay**: Move rings manually with visual feedback
- **Auto-Solver**: Watch the computer solve the puzzle step by step
- **Game Controls**: Start, restart, undo moves, and quit functionality
- **Configurable Difficulty**: Support for 1-10 rings
- **Move Validation**: Prevents invalid moves (larger rings on smaller ones)
- **Visual Feedback**: Clear status messages and animated solutions

## Screenshots

### 2D Interface
The classic web interface features colorful rings stacked on pegs with click-to-move gameplay.

### 3D Interface
The Three.js interface provides an immersive 3D experience with drag-and-drop controls and orbital camera movement.

## Installation

### Prerequisites
- Python 3.7+
- Modern web browser with JavaScript enabled

### Local Setup
1. Clone or download the project files
2. Install required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the FastAPI server:
   ```bash
   uvicorn app:app --reload
   ```

4. Open your browser and navigate to:
   - 2D Interface: `http://localhost:8000/`
   - 3D Interface: `http://localhost:8000/three-ui.html`

## Deployment

### Deploy to GCP Cloud Run

This application includes a one-command deployment script for Google Cloud Platform's Cloud Run service.

#### Prerequisites for Deployment
- Docker installed locally
- Google Cloud CLI installed and authenticated
- GCP project created and configured

#### Quick Deployment
```bash
# Configure your GCP project
gcloud config set project YOUR_PROJECT_ID
gcloud auth configure-docker

# Deploy with one command
./deploy.sh
```

The script will:
1. Build a Docker container (linux/amd64 architecture for Cloud Run)
2. Push to Google Container Registry
3. Deploy to Cloud Run in us-west1 region
4. Output your live service URL

#### Cloud Run Free Tier
The deployment is configured to stay within Cloud Run's free tier:
- 2 million requests/month
- 360,000 GB-seconds of memory/month
- 180,000 vCPU-seconds/month
- Max 1 instance to prevent scaling costs

**Note**: The application will cold start after ~15 minutes of inactivity on the free tier.

## File Structure

```
tower-of-hanoi/
├── app.py              # FastAPI web server and API endpoints
├── main.py             # Core game logic and Tower of Hanoi solver
├── index.html          # 2D interface HTML
├── three-ui.html       # 3D interface HTML
├── script.js           # 2D interface JavaScript
├── three-ui.js         # 3D interface JavaScript with Three.js
├── styles.css          # Shared CSS styles
├── requirements.txt    # Python dependencies
├── Dockerfile          # Container definition for Cloud Run
├── deploy.sh           # Automated deployment script
└── .dockerignore       # Files excluded from Docker build
```

## How to Play

### 2D Interface
1. Enter the number of rings (1-10) in the input field
2. Click "Start Game" to begin
3. Click on a peg to select it as the source
4. Click on another peg to move the top ring from source to destination
5. Use game controls: Restart, Undo, Solve, or Quit

### 3D Interface
1. Enter the number of rings and click "Start Game"
2. Use mouse/touch to orbit around the 3D scene
3. Drag the top ring from any peg to move it
4. Drop it on the desired destination peg
5. Same game controls available as 2D version

## Game Rules

The Tower of Hanoi follows these classic rules:
- Only one ring can be moved at a time
- Only the top ring from a peg can be moved
- A larger ring cannot be placed on top of a smaller ring
- The goal is to move all rings from the leftmost peg to the rightmost peg

## API Endpoints

- `POST /start?rings=N` - Start a new game with N rings
- `GET /state` - Get current board state
- `POST /move?src=X&dst=Y` - Move ring from peg X to peg Y
- `POST /solve` - Get complete solution steps
- `POST /undo` - Undo the last move

## Technical Details

### Backend
- **FastAPI**: Modern Python web framework for the REST API
- **Game Logic**: Recursive solver using the classic three-peg algorithm
- **State Management**: In-memory game state with move history for undo functionality
- **Containerization**: Docker support for easy deployment to cloud platforms

### Frontend
- **2D Interface**: Vanilla JavaScript with DOM manipulation
- **3D Interface**: Three.js WebGL library for 3D rendering
- **Responsive Design**: CSS flexbox layouts for different screen sizes
- **Interactive Controls**: Mouse/touch support for both interfaces

### 3D Features
- **Orbit Controls**: Mouse/touch camera controls for 3D navigation
- **Drag & Drop**: Intuitive ring movement with raycasting
- **Dynamic Lighting**: Ambient and directional lighting for visual appeal
- **Responsive Rendering**: Automatic canvas resizing and proper aspect ratios

## Browser Compatibility

- **2D Interface**: All modern browsers
- **3D Interface**: Browsers with WebGL support (Chrome, Firefox, Safari, Edge)

## Performance Notes

- Recommended maximum of 10 rings for optimal performance
- 3D interface may require hardware acceleration for smooth rendering
- Auto-solve animation speed can be adjusted by modifying the timeout values in the JavaScript files

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the game. Some potential enhancements:
- Sound effects and music
- Different color themes
- Save/load game states
- Multiplayer functionality
- Mobile-optimized touch controls

## License

This project is open source and available under the MIT License.
