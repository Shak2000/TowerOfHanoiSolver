// Tower of Hanoi 3D UI using Three.js
import * as THREE from 'https://unpkg.com/three@0.153.0/build/three.module.js?module';
import { OrbitControls } from 'https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js?module';

let scene, camera, renderer, controls;
let pegs = [], rings = [];
let numDisks = 0;
let dragging = null, dragOffset = null;
let boardState = [[], [], []];
let animating = false;

const PEG_HEIGHT = 120, PEG_RADIUS = 4, RING_HEIGHT = 10, BASE_Y = 0;
const PEG_POSITIONS = [-40, 0, 40];
const BOARD_Y = 0; // Y position of the board base

function showInGame(show) {
  document.querySelectorAll('.in-game').forEach(btn => {
    btn.style.display = show ? 'inline-block' : 'none';
  });
  document.getElementById('start-btn').style.display = show ? 'none' : 'inline-block';
  document.getElementById('num-disks').style.display = show ? 'none' : 'inline-block';
}

function getCanvasSize() {
  const container = document.getElementById('three-canvas');
  return [container.clientWidth, container.clientHeight];
}

function init3D() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);
  const [w, h] = getCanvasSize();
  camera = new THREE.PerspectiveCamera(45, w/h, 1, 1000);
  camera.position.set(0, 60, 180); // Lowered Y for better centering
  camera.lookAt(0, 40, 0); // Lowered lookAt for better centering
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(window.devicePixelRatio);
  const container = document.getElementById('three-canvas');
  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enablePan = false;
  controls.minDistance = 80;
  controls.maxDistance = 300;
  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(0, 100, 100);
  scene.add(dirLight);
  // Base
  const baseGeo = new THREE.BoxGeometry(100, 4, 30);
  const baseMat = new THREE.MeshPhongMaterial({ color: 0x8d6e63 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = BOARD_Y + 2;
  scene.add(base);
  // Pegs
  pegs = [];
  for (let i = 0; i < 3; i++) {
    const pegGeo = new THREE.CylinderGeometry(PEG_RADIUS, PEG_RADIUS, PEG_HEIGHT, 32);
    const pegMat = new THREE.MeshPhongMaterial({ color: 0x1976d2 });
    const peg = new THREE.Mesh(pegGeo, pegMat);
    peg.position.set(PEG_POSITIONS[i], BOARD_Y + PEG_HEIGHT/2 + 2, 0);
    scene.add(peg);
    pegs.push(peg);
  }
  // Add grid helper for debugging
  const gridHelper = new THREE.GridHelper(200, 10);
  scene.add(gridHelper);
  // (Removed debug red cube)
}

function onWindowResize() {
  const [w, h] = getCanvasSize();
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  camera.lookAt(0, 40, 0);
}

function clearRings() {
  rings.forEach(r => scene.remove(r.mesh));
  rings = [];
}

function createRings(board) {
  clearRings();
  if (!numDisks) return;
  // Calculate ring radii
  const pegSpacing = PEG_POSITIONS[1] - PEG_POSITIONS[0];
  const maxRadius = Math.abs(pegSpacing) / 2 - 4; // 4px margin from peg
  const minRadius = maxRadius * 0.4; // Smallest ring is 40% of largest
  const colors = [0xff7043, 0x66bb6a, 0x29b6f6, 0xffca28, 0xab47bc, 0x26a69a, 0x8d6e63, 0x789262, 0xba68c8, 0xd4e157];
  for (let pegIdx = 0; pegIdx < 3; pegIdx++) {
    const peg = board[pegIdx];
    for (let i = 0; i < peg.length; i++) {
      const disk = peg[i];
      // disk: 1 (smallest) ... numDisks (largest)
      const t = (disk - 1) / (numDisks - 1 || 1); // 0 for smallest, 1 for largest
      const radius = minRadius + t * (maxRadius - minRadius);
      const geo = new THREE.CylinderGeometry(radius, radius, RING_HEIGHT, 32);
      const mat = new THREE.MeshPhongMaterial({ color: colors[(disk-1)%colors.length] });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(PEG_POSITIONS[pegIdx], BOARD_Y + RING_HEIGHT/2 + i*RING_HEIGHT, 0);
      mesh.userData = { peg: pegIdx, index: i, disk };
      scene.add(mesh);
      rings.push({ mesh, peg: pegIdx, index: i, disk });
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

async function render3D(forcedBoard = null) {
  const board = forcedBoard || (await (await fetch('/state')).json()).board;
  boardState = board.map(peg => peg.slice());
  createRings(board);
}

async function startGame() {
  const input = document.getElementById("num-disks");
  numDisks = parseInt(input.value, 10);
  if (isNaN(numDisks) || numDisks < 1) {
    alert("Please enter a valid number of rings (1–10).");
    return;
  }
  await fetch(`/start?rings=${numDisks}`, { method: "POST" });
  document.getElementById('status').textContent = '';
  showInGame(true);
  await render3D();
}

async function restartGame() {
  await fetch(`/start?rings=${numDisks}`, { method: "POST" });
  document.getElementById('status').textContent = 'Game restarted.';
  await render3D();
}

async function undoMove() {
  await fetch("/undo", { method: "POST" });
  document.getElementById('status').textContent = 'Last move undone.';
  await render3D();
}

function quitGame() {
  clearRings();
  document.getElementById("status").textContent = "Game quit.";
  showInGame(false);
}

// Drag & drop logic
let raycaster = null, mouse = null, dragRing = null, dragOrig = null;
function enableDragDrop() {
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
}

function getIntersectedRing(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(rings.map(r => r.mesh));
  if (intersects.length > 0) {
    // Only allow dragging the top ring of a peg
    const mesh = intersects[0].object;
    const { peg, index } = mesh.userData;
    if (index === boardState[peg].length - 1) return mesh;
  }
  return null;
}

function getPegFromPosition(x) {
  let minDist = Infinity, pegIdx = 0;
  for (let i = 0; i < PEG_POSITIONS.length; i++) {
    const d = Math.abs(x - PEG_POSITIONS[i]);
    if (d < minDist) { minDist = d; pegIdx = i; }
  }
  return pegIdx;
}

function onPointerDown(event) {
  if (animating) return;
  const mesh = getIntersectedRing(event);
  if (mesh) {
    dragRing = mesh;
    dragOrig = mesh.position.clone();
    controls.enabled = false;
  }
}

function onPointerMove(event) {
  if (!dragRing) return;
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const planeY = BOARD_Y + RING_HEIGHT/2 + (numDisks-1)*RING_HEIGHT/2;
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
  const intersect = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersect);
  dragRing.position.x = intersect.x;
  dragRing.position.z = intersect.z;
}

async function onPointerUp(event) {
  if (!dragRing) return;
  // Snap to nearest peg
  const pegIdx = getPegFromPosition(dragRing.position.x);
  const fromPeg = dragRing.userData.peg;
  // Only allow legal move
  const dstPeg = pegIdx;
  if (fromPeg !== dstPeg) {
    const res = await fetch(`/move?src=${fromPeg}&dst=${dstPeg}`, { method: "POST" });
    const [success, msg] = await res.json();
    document.getElementById('status').textContent = msg;
    await render3D();
  } else {
    dragRing.position.copy(dragOrig);
  }
  dragRing = null;
  controls.enabled = true;
}

async function autoSolve() {
  if (!numDisks) {
    alert("You need to start a game first!");
    return;
  }
  animating = true;
  await fetch(`/start?rings=${numDisks}`, { method: "POST" });
  await render3D();
  await new Promise(r => setTimeout(r, 600));
  const res = await fetch("/solve", { method: "POST" });
  if (!res.ok) {
    alert("Error solving the puzzle");
    animating = false;
    return;
  }
  const { steps } = await res.json();
  for (const board of steps) {
    await render3D(board);
    await new Promise(r => setTimeout(r, 600));
  }
  document.getElementById("status").textContent = "Solved!";
  animating = false;
}

// Only initialize 3D scene and drag logic on load
// Do NOT start a game or render rings until user clicks Start

document.addEventListener('DOMContentLoaded', async () => {
  init3D();
  animate();
  enableDragDrop();
  showInGame(false);
});

// At the end of the file, expose UI functions globally for HTML onclick
window.startGame = startGame;
window.restartGame = restartGame;
window.undoMove = undoMove;
window.autoSolve = autoSolve;
window.quitGame = quitGame;
