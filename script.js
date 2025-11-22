const boardEl = document.getElementById('board');
const pieceContainer = document.getElementById('piece-container');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const restartBtn = document.getElementById('restart');
const startOverlay = document.getElementById('start-overlay');
const startButton = document.getElementById('start-button');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const finalBestScoreEl = document.getElementById('final-best-score');
const playAgainBtn = document.getElementById('play-again');
const clearSound = document.getElementById('clear-sound');
const headlineEl = document.getElementById('headline');
const headlineOverlay = document.getElementById('headline-overlay');

const BOARD_SIZE = 8;
const EMPTY = 0;
const FILLED = 1;
const BLOCK_VALUE = 1;
const LINE_CLEAR_BASE = 10;
const ALL_CLEAR_BONUS = 1000;
const HEADLINES = ['Fantástico!', 'Incrível!', 'Espetacular!', 'Sensacional!', 'Show!', 'Maravilhoso!'];
const ALL_CLEAR_HEADLINES = ['Tela limpa!', 'All clear!', 'Quadro vazio!', 'Perfeito!'];
const THEMES = [
  {
    bg: 'radial-gradient(circle at 20% 20%, #1f2937, #0b1224 45%)',
    panel: '#111827',
    grid: '#1f2937',
    cell: '#334155',
    block: 'linear-gradient(145deg, #f59e0b, #b45309)',
    accent: '#f59e0b',
  },
  {
    bg: 'radial-gradient(circle at 10% 30%, #0f172a, #111827 45%, #0b1224)',
    panel: '#0f172a',
    grid: '#1e293b',
    cell: '#2c3e50',
    block: 'linear-gradient(145deg, #38bdf8, #0ea5e9)',
    accent: '#38bdf8',
  },
  {
    bg: 'radial-gradient(circle at 80% 10%, #172554, #0b1224 50%, #111827)',
    panel: '#0b1224',
    grid: '#1b2a4a',
    cell: '#243b53',
    block: 'linear-gradient(145deg, #22c55e, #15803d)',
    accent: '#22c55e',
  },
];
const SHAPES = [
  // Linhas horizontais
  [[0, 0], [0, 1]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  // Linhas verticais
  [[0, 0], [1, 0]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  // Quadrados
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  // Retângulos 3x2 e 2x3
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
  // Bloco 3x3
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  // Formas L pequenas
  [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 1], [1, 1], [2, 1], [2, 0]],
  [[0, 0], [0, 1], [0, 2], [1, 0]],
  [[0, 0], [0, 1], [0, 2], [1, 2]],
  // Formas L maiores
  [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]],
  [[0, 1], [1, 1], [2, 1], [3, 1], [3, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]],
  // Formas T
  [[0, 0], [0, 1], [0, 2], [1, 1]],
  [[0, 1], [1, 0], [1, 1], [1, 2]],
  [[0, 1], [1, 0], [1, 1], [2, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 0]],
  // Outras formas
  [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[0, 1], [1, 1], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]],
  [[0, 2], [0, 1], [1, 1], [1, 0], [2, 0]],
];

let board = [];
let currentPieces = [];
let score = 0;
let bestScore = 0;
let previousMilestone = 0;
let themeIndex = 0;
let draggingPiece = null;
let gameStarted = false;

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

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--panel', theme.panel);
  root.style.setProperty('--grid', theme.grid);
  root.style.setProperty('--cell', theme.cell);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--block', theme.block);
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', theme.panel);
  }
}

function updateScore(points) {
  const previousScore = score;
  score += points;
  scoreEl.textContent = score;
  saveBestScore();
  handleMilestone(previousScore, score);
}

let shapeBag = [];
function randomPiece() {
  if (shapeBag.length === 0) {
    shapeBag = [...SHAPES];
  }
  const index = Math.floor(Math.random() * shapeBag.length);
  const shape = shapeBag.splice(index, 1)[0];
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
    if (!gameStarted || !piece) return;
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
    element.classList.remove('board-highlight');
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
    cell.classList.remove('preview-valid', 'preview-invalid', 'preview-clear');
  });
}

function highlightPreview(cells) {
  const valid = isPlacementValid(cells);
  if (!valid) {
    cells.forEach(({ row, col }) => {
      if (row < 0 || col < 0 || row >= BOARD_SIZE || col >= BOARD_SIZE) return;
      const cell = boardEl.children[row * BOARD_SIZE + col];
      cell.classList.add('preview-invalid');
    });
    return;
  }

  cells.forEach(({ row, col }) => {
    const cell = boardEl.children[row * BOARD_SIZE + col];
    cell.classList.add('preview-valid');
  });

  const { rows, cols } = getLinesToClear(cells);
  if (rows.length > 0 || cols.length > 0) {
    highlightClearPreview(rows, cols);
  }
}

function getLinesToClear(cells) {
  const cellSet = new Set(cells.map(({ row, col }) => `${row}-${col}`));
  const rows = [];
  const cols = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    const isCandidateRow = cells.some((cell) => cell.row === r);
    if (!isCandidateRow) continue;
    let full = true;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === EMPTY && !cellSet.has(`${r}-${c}`)) {
        full = false;
        break;
      }
    }
    if (full) rows.push(r);
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    const isCandidateCol = cells.some((cell) => cell.col === c);
    if (!isCandidateCol) continue;
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] === EMPTY && !cellSet.has(`${r}-${c}`)) {
        full = false;
        break;
      }
    }
    if (full) cols.push(c);
  }

  return { rows, cols };
}

function highlightClearPreview(rows, cols) {
  rows.forEach((r) => {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = boardEl.children[r * BOARD_SIZE + c];
      cell.classList.add('preview-clear');
    }
  });

  cols.forEach((c) => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const cell = boardEl.children[r * BOARD_SIZE + c];
      cell.classList.add('preview-clear');
    }
  });
}

function afterPlacement(blocksPlaced) {
  const clearResult = clearCompletedLines();
  const lines = clearResult.clearedRows.length + clearResult.clearedCols.length;
  const blocksScore = blocksPlaced * BLOCK_VALUE;
  let lineScore = lines * LINE_CLEAR_BASE;
  if (lines >= 2) {
    lineScore *= lines;
  }
  let gained = blocksScore + lineScore;

  if (lines > 0) {
    showHeadline();
  }

  if (isBoardEmpty()) {
    gained += ALL_CLEAR_BONUS;
    showHeadline(ALL_CLEAR_HEADLINES[Math.floor(Math.random() * ALL_CLEAR_HEADLINES.length)]);
  }

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

  return { clearedRows: filledRows, clearedCols: filledCols };
}

function checkGameOver() {
  if (!gameStarted) return;
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
  if (finalBestScoreEl) {
    finalBestScoreEl.textContent = bestScore;
  }
  gameOverEl.classList.remove('hidden');
  gameStarted = false;
}

function showHeadline(text) {
  const content = text || HEADLINES[Math.floor(Math.random() * HEADLINES.length)];
  if (headlineEl) {
    headlineEl.textContent = content;
    headlineEl.classList.remove('headline-animate');
    // eslint-disable-next-line no-unused-expressions
    headlineEl.offsetWidth;
    headlineEl.classList.add('headline-animate');
  }
  if (headlineOverlay) {
    headlineOverlay.textContent = content;
    headlineOverlay.classList.remove('headline-overlay-animate');
    // eslint-disable-next-line no-unused-expressions
    headlineOverlay.offsetWidth;
    headlineOverlay.classList.add('headline-overlay-animate');
  }
}

function isBoardEmpty() {
  return board.every((row) => row.every((cell) => cell === EMPTY));
}

function resetGame() {
  gameOverEl.classList.add('hidden');
  startOverlay.classList.add('hidden');
  score = 0;
  previousMilestone = 0;
  scoreEl.textContent = score;
  themeIndex = 0;
  applyTheme(THEMES[themeIndex]);
  shapeBag = [];
  createBoard();
  spawnPieces();
  gameStarted = true;
}

function addButtonEvents() {
  restartBtn.addEventListener('click', resetGame);
  playAgainBtn.addEventListener('click', resetGame);
  startButton.addEventListener('click', resetGame);
}

function handleMilestone(oldScore, newScore) {
  const oldMilestone = Math.floor(oldScore / 1000);
  const newMilestone = Math.floor(newScore / 1000);
  if (newMilestone > oldMilestone) {
    themeIndex = (themeIndex + 1) % THEMES.length;
    applyTheme(THEMES[themeIndex]);
    if (clearSound) {
      clearSound.currentTime = 0;
      clearSound.play();
    }
  }
  previousMilestone = newMilestone;
}

function init() {
  document.title = 'Tetris do Thiago';
  applyTheme(THEMES[themeIndex]);
  createBoard();
  loadBestScore();
  addButtonEvents();
}

init();
