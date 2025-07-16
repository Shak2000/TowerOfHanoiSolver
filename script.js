let selectedPeg = null;
let numDisks = 0;

function showInGame(show) {
  document.querySelectorAll('.in-game').forEach(btn => {
    btn.style.display = show ? 'inline-block' : 'none';
  });
  document.getElementById('start-btn').style.display = show ? 'none' : 'inline-block';
  // hide the number‑of‑rings input when in‑game
  document.getElementById('num-disks').style.display = show ? 'none' : 'inline-block';
}

async function startGame() {
  const input = document.getElementById("num-disks");
  numDisks = parseInt(input.value, 10);
  if (isNaN(numDisks) || numDisks < 1) {
    alert("Please enter a valid number of rings (1–10).");
    return;
  }

  const res = await fetch(`/start?rings=${numDisks}`, {
    method: "POST"
  });
  if (!res.ok) {
    const err = await res.text();
    alert("Error starting game: " + err);
    return;
  }

  document.getElementById('status').textContent = '';
  showInGame(true);
  await render();
}

async function moveRing(src, dst) {
  const res = await fetch(`/move?src=${src}&dst=${dst}`, {
    method: "POST"
  });
  const [success, message] = await res.json();
  document.getElementById('status').textContent = message;
  await render();
}

async function undoMove() {
  await fetch("/undo", { method: "POST" });
  document.getElementById('status').textContent = 'Last move undone.';
  await render();
}

async function restartGame() {
  await fetch(`/start?rings=${numDisks}`, {
    method: "POST"
  });
  document.getElementById('status').textContent = 'Game restarted.';
  selectedPeg = null;
  await render();
}

async function autoSolve() {
  if (!numDisks) {
    alert("You need to start a game first!");
    return;
  }

  // 1. Reset the board to full-left
  await fetch(`/start?rings=${numDisks}`, { method: "POST" });

  // 2. Show that reset state immediately
  await render();
  await new Promise(r => setTimeout(r, 600));

  // 3. Fetch the full sequence of steps (including the reset state)
  const res = await fetch("/solve", { method: "POST" });
  if (!res.ok) {
    alert("Error solving the puzzle");
    return;
  }
  const { steps } = await res.json();

  // 4. Animate through all steps
  for (const board of steps) {
    await render(board);
    await new Promise(r => setTimeout(r, 600));
  }

  document.getElementById("status").textContent = "Solved!";
}

function quitGame() {
  document.getElementById("pegs-container").innerHTML = "";
  document.getElementById("status").textContent = "Game quit.";
  showInGame(false);
  selectedPeg = null;
}

async function render(forcedBoard = null) {
  const res = await fetch("/state");
  const data = await res.json();
  const board = forcedBoard || data.board;

  // compute peg width: a little extra space around the biggest disk
  const allDisks = board.flat();
  const maxDisk = allDisks.length ? Math.max(...allDisks) : numDisks;
  const pegWidth = maxDisk * 20 + 40; // disk*20px + padding

  const container = document.getElementById("pegs-container");
  container.innerHTML = "";

  board.forEach((peg, i) => {
    const pegDiv = document.createElement("div");
    pegDiv.className = "peg";
    pegDiv.style.width = pegWidth + "px";
    pegDiv.onclick = () => handlePegClick(i);

    peg.forEach(disk => {
      const ring = document.createElement("div");
      ring.className = "ring";
      ring.style.width = (disk * 20 + 20) + "px";
      ring.textContent = disk;
      pegDiv.appendChild(ring);
    });

    container.appendChild(pegDiv);
  });
}

function handlePegClick(pegIndex) {
  if (selectedPeg === null) {
    selectedPeg = pegIndex;
    document.getElementById('status').textContent = `Selected source peg ${pegIndex + 1}`;
  } else if (selectedPeg === pegIndex) {
    selectedPeg = null;
    document.getElementById('status').textContent = `Selection cleared`;
  } else {
    moveRing(selectedPeg, pegIndex);
    selectedPeg = null;
  }
}

// initially hide in-game buttons
showInGame(false);
