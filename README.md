# Tower of Hanoi Solver

A comprehensive Tower of Hanoi puzzle solver with both web interface and command-line versions. This classic puzzle challenges players to move all disks from one peg to another following specific rules.

## Features

### Web Interface
- **Interactive GUI**: Click-to-select peg interface
- **Visual Feedback**: Animated disk movements and real-time board updates
- **Game Controls**: Start, restart, undo, auto-solve, and quit functionality
- **Customizable Difficulty**: Choose 1-10 rings
- **Auto-Solver**: Watch the computer solve the puzzle step-by-step
- **Move History**: Undo previous moves

### Command Line Interface
- **Text-based gameplay**: Perfect for terminal enthusiasts
- **Manual solving**: Move rings step-by-step
- **Computer solver**: Let the algorithm demonstrate the solution
- **Game management**: Start new games, restart, and undo moves

## Game Rules

The Tower of Hanoi follows three simple rules:
1. Only one disk can be moved at a time
2. Each move consists of taking the upper disk from one of the stacks and placing it on top of another stack
3. No disk may be placed on top of a smaller disk

## Installation

### Prerequisites
- Python 3.7+
- FastAPI
- Uvicorn (for web server)

### Setup
1. Clone or download the project files
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn
   ```

## Usage

### Web Interface
1. Start the web server:
   ```bash
   uvicorn app:app --reload
   ```
2. Open your browser and navigate to `http://localhost:8000`
3. Enter the number of rings (1-10) and click "Start Game"
4. Click pegs to select source and destination for moves
5. Use the control buttons:
   - **Restart**: Reset the current game
   - **Undo**: Revert the last move
   - **Solve**: Watch the computer solve the puzzle
   - **Quit**: Return to the start screen

### Command Line Interface
Run the standalone version:
```bash
python main.py
```

Follow the menu prompts to:
- Start a new game with your chosen number of rings
- Make manual moves by specifying source and destination pegs (0, 1, or 2)
- Let the computer solve the puzzle automatically
- Undo moves or restart the game

## File Structure

```
tower-of-hanoi/
├── app.py          # FastAPI web server and API endpoints
├── main.py         # Game logic and command-line interface
├── index.html      # Web interface HTML
├── styles.css      # Web interface styling
├── script.js       # Web interface JavaScript
└── README.md       # This file
```

## Technical Details

### Backend (Python)
- **Game Class**: Core game logic with move validation, history tracking, and solving algorithm
- **FastAPI Server**: RESTful API endpoints for web interface communication
- **Recursive Solver**: Implements the classic recursive solution algorithm

### Frontend (Web)
- **Vanilla JavaScript**: No external frameworks required
- **Responsive Design**: Clean, modern interface that works on different screen sizes
- **Real-time Updates**: Smooth animations and immediate feedback

### API Endpoints
- `POST /start?rings=N`: Initialize a new game with N rings
- `GET /state`: Get current board state
- `POST /move?src=X&dst=Y`: Move ring from peg X to peg Y
- `POST /solve`: Get complete solution sequence
- `POST /undo`: Undo the last move

## Algorithm

The solver uses the classic recursive approach:
1. Move n-1 disks from source to auxiliary peg
2. Move the largest disk from source to destination
3. Move n-1 disks from auxiliary to destination peg

**Time Complexity**: O(2^n)  
**Space Complexity**: O(n) for recursion stack

## Customization

### Difficulty Levels
- **Beginner**: 3-4 rings
- **Intermediate**: 5-6 rings  
- **Advanced**: 7-8 rings
- **Expert**: 9-10 rings

### Styling
Modify `styles.css` to customize:
- Colors and themes
- Ring appearance
- Peg styling
- Animation effects

## Contributing

Feel free to enhance the project by:
- Adding sound effects
- Implementing different visual themes
- Adding move counter and timer
- Creating difficulty-based scoring
- Adding keyboard shortcuts

## License

This project is open source and available under the MIT License.

## Mathematical Background

The minimum number of moves required to solve the Tower of Hanoi with n disks is **2^n - 1**.

Examples:
- 3 disks: 7 moves minimum
- 4 disks: 15 moves minimum
- 5 disks: 31 moves minimum
- 10 disks: 1,023 moves minimum

## Troubleshooting

### Common Issues
1. **Server won't start**: Ensure FastAPI and Uvicorn are installed
2. **Web interface not loading**: Check that you're accessing `http://localhost:8000`
3. **Invalid moves**: Remember that larger rings cannot be placed on smaller ones
4. **Undo not working**: Undo is only available after making at least one move

### Performance Notes
- Games with 10+ rings may take noticeable time to auto-solve
- The web interface is optimized for smooth animations up to 10 rings
- Command-line version can handle any number of rings (memory permitting)

Enjoy solving the Tower of Hanoi puzzle!
