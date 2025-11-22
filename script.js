const boardEl = document.getElementById('board');
const pieceContainer = document.getElementById('piece-container');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const restartBtn = document.getElementById('restart');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again');

const BOARD_SIZE = 10;
const EMPTY = 0;
const FILLED = 1;
const SHAPES = [
  [[0, 0]],
  [[0, 0], [1, 0]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  [[0, 0], [1, 0], [0, 1]],
  [[0, 0], [1, 0], [2, 0], [0, 1]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1]],
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1]],
];

let board = [];
let currentPieces = [];
let score = 0;
let bestScore = 0;
let draggingPiece = null;

function createBoard() {
  boardEl.innerHTML = '';
  board = new Array(BOARD_SIZE)
    .fill(0)
    .map(() => new Array(BOARD_SIZE).fill(EMPTY));

  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    boardEl.appendChild(cell);
  }
}

function loadBestScore() {
  const saved = localStorage.getItem('best-score');
  bestScore = saved ? parseInt(saved, 10) : 0;
  bestScoreEl.textContent = bestScore;
}

function saveBestScore() {
  if (score > bestScore) {
    bestScore = score;
    bestScoreEl.textContent = bestScore;
    localStorage.setItem('best-score', String(bestScore));
  }
}

function updateScore(points) {
  score += points;
  scoreEl.textContent = score;
  saveBestScore();
}

function randomPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape };
}

function spawnPieces() {
  currentPieces = [randomPiece(), randomPiece(), randomPiece()];
  renderPieces();
  checkGameOver();
}

function renderPieces() {
  pieceContainer.innerHTML = '';
  currentPieces.forEach((piece, idx) => {
    if (!piece) return;
    const { shape } = piece;
    const cols = Math.max(...shape.map((b) => b[1])) + 1;
    const rows = Math.max(...shape.map((b) => b[0])) + 1;
    const element = document.createElement('div');
    element.className = 'piece';
    element.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    element.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    element.dataset.index = idx;
    shape.forEach((block) => {
      const blockEl = document.createElement('div');
      blockEl.className = 'piece-block';
      blockEl.style.gridRowStart = block[0] + 1;
      blockEl.style.gridColumnStart = block[1] + 1;
      element.appendChild(blockEl);
    });
    addDragEvents(element, piece);
    pieceContainer.appendChild(element);
  });
}

function addDragEvents(element, piece) {
  element.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    draggingPiece = piece;
    element.classList.add('board-highlight');
    element.setPointerCapture(event.pointerId);
  });

  element.addEventListener('pointermove', (event) => {
    if (!draggingPiece) return;
    const boardRect = boardEl.getBoundingClientRect();
    const x = event.clientX - boardRect.left;
    const y = event.clientY - boardRect.top;
    const targetCell = getCellFromPosition(x, y);
    clearPreview();
    if (targetCell) {
      const cells = getCellsForPiece(targetCell.row, targetCell.col, draggingPiece.shape);
      highlightPreview(cells);
    }
  });

  element.addEventListener('pointerleave', () => {
    if (!draggingPiece) return;
    clearPreview();
  });

  element.addEventListener('pointercancel', () => {
    draggingPiece = null;
    clearPreview();
  });

  element.addEventListener('pointerup', (event) => {
    if (!draggingPiece) return;
    const boardRect = boardEl.getBoundingClientRect();
    const x = event.clientX - boardRect.left;
    const y = event.clientY - boardRect.top;
    const targetCell = getCellFromPosition(x, y);
    element.classList.remove('board-highlight');
    if (targetCell && placePiece(targetCell.row, targetCell.col, draggingPiece.shape)) {
      const pieceIndex = currentPieces.indexOf(draggingPiece);
      currentPieces[pieceIndex] = null;
      renderPieces();
      afterPlacement(draggingPiece.shape.length);
    }
    draggingPiece = null;
    clearPreview();
  });
}

function getCellFromPosition(x, y) {
  const boardRect = boardEl.getBoundingClientRect();
  if (x < 0 || y < 0 || x > boardRect.width || y > boardRect.height) return null;
  const cellSize = boardRect.width / BOARD_SIZE;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  return { row, col };
}

function getCellsForPiece(startRow, startCol, shape) {
  return shape.map(([r, c]) => ({ row: startRow + r, col: startCol + c }));
}

function isPlacementValid(cells) {
  return cells.every(({ row, col }) =>
    row >= 0 && col >= 0 && row < BOARD_SIZE && col < BOARD_SIZE && board[row][col] === EMPTY,
  );
}

function placePiece(row, col, shape) {
  const cells = getCellsForPiece(row, col, shape);
  if (!isPlacementValid(cells)) return false;
  cells.forEach(({ row: r, col: c }) => {
    board[r][c] = FILLED;
    const cellIndex = r * BOARD_SIZE + c;
    boardEl.children[cellIndex].classList.add('filled');
  });
  return true;
}

function clearPreview() {
  Array.from(boardEl.children).forEach((cell) => {
    cell.classList.remove('preview-valid', 'preview-invalid');
  });
}

function highlightPreview(cells) {
  const valid = isPlacementValid(cells);
  cells.forEach(({ row, col }) => {
    if (row < 0 || col < 0 || row >= BOARD_SIZE || col >= BOARD_SIZE) return;
    const cell = boardEl.children[row * BOARD_SIZE + col];
    cell.classList.add(valid ? 'preview-valid' : 'preview-invalid');
  });
}

function afterPlacement(blocksPlaced) {
  const lines = clearCompletedLines();
  const gained = blocksPlaced + lines * 10;
  updateScore(gained);
  if (currentPieces.every((p) => p === null)) {
    spawnPieces();
  } else {
    checkGameOver();
  }
}

function clearCompletedLines() {
  const filledRows = [];
  const filledCols = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every((cell) => cell === FILLED)) filledRows.push(r);
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    const colFull = board.every((row) => row[c] === FILLED);
    if (colFull) filledCols.push(c);
  }

  filledRows.forEach((r) => {
    for (let c = 0; c < BOARD_SIZE; c++) {
      board[r][c] = EMPTY;
      boardEl.children[r * BOARD_SIZE + c].classList.remove('filled');
    }
  });

  filledCols.forEach((c) => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      board[r][c] = EMPTY;
      boardEl.children[r * BOARD_SIZE + c].classList.remove('filled');
    }
  });

  return filledRows.length + filledCols.length;
}

function checkGameOver() {
  const playable = currentPieces.some((piece) => piece && pieceFits(piece.shape));
  if (!playable) {
    showGameOver();
  }
}

function pieceFits(shape) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isPlacementValid(getCellsForPiece(r, c, shape))) return true;
    }
  }
  return false;
}

function showGameOver() {
  finalScoreEl.textContent = `Você fez ${score} pontos.`;
  gameOverEl.classList.remove('hidden');
}

function resetGame() {
  gameOverEl.classList.add('hidden');
  score = 0;
  scoreEl.textContent = score;
  createBoard();
  spawnPieces();
}

function addButtonEvents() {
  restartBtn.addEventListener('click', resetGame);
  playAgainBtn.addEventListener('click', resetGame);
}

function init() {
  createBoard();
  loadBestScore();
  spawnPieces();
  addButtonEvents();
}

init();
