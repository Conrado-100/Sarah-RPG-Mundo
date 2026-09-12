const canvas = document.getElementById('spriteCanvas');
const ctx = canvas.getContext('2d');
const preview1x = document.getElementById('preview1x').getContext('2d');
const previewTile = document.getElementById('previewTile').getContext('2d');

const GRID_SIZE = 16;
const PIXEL_SIZE = canvas.width / GRID_SIZE; // 20px

let currentColor = '#16a34a';
let currentTool = 'pencil';
let isDrawing = false;
let showGrid = true;

// Matriz de Pixels (16x16)
let pixelMatrix = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
let historyStack = [];

// Paleta de Cores RPG
const paletteColors = [
    '#16a34a', '#15803d', '#4ade80', '#78350f', '#451a03',
    '#0284c7', '#1e3a8a', '#38bdf8', '#64748b', '#334155',
    '#eab308', '#ca8a04', '#bae6fd', '#dc2626', '#1e293b'
];

// Inicializar Paleta
const paletteGrid = document.getElementById('paletteGrid');
paletteColors.forEach(hex => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = hex;
    swatch.onclick = () => setColor(hex);
    paletteGrid.appendChild(swatch);
});

function setColor(hex) {
    currentColor = hex;
    document.getElementById('customColorPicker').value = hex;
    document.getElementById('hexDisplay').innerText = hex;
}

document.getElementById('customColorPicker').oninput = (e) => setColor(e.target.value);

// Desenhar no Canvas
function drawPixel(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / GRID_SIZE));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / GRID_SIZE));

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        if (currentTool === 'pencil') pixelMatrix[y][x] = currentColor;
        else if (currentTool === 'eraser') pixelMatrix[y][x] = null;
        else if (currentTool === 'bucket') floodFill(x, y, pixelMatrix[y][x], currentColor);

        render();
    }
}

function floodFill(x, y, targetColor, replacementColor) {
    if (targetColor === replacementColor) return;
    if (pixelMatrix[y][x] !== targetColor) return;

    pixelMatrix[y][x] = replacementColor;

    if (x > 0) floodFill(x - 1, y, targetColor, replacementColor);
    if (x < GRID_SIZE - 1) floodFill(x + 1, y, targetColor, replacementColor);
    if (y > 0) floodFill(x, y - 1, targetColor, replacementColor);
    if (y < GRID_SIZE - 1) floodFill(x, y + 1, targetColor, replacementColor);
}

function saveState() {
    historyStack.push(JSON.stringify(pixelMatrix));
    if (historyStack.length > 20) historyStack.shift();
}

document.getElementById('btnUndo').onclick = () => {
    if (historyStack.length > 0) {
        pixelMatrix = JSON.parse(historyStack.pop());
        render();
    }
};

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    preview1x.clearRect(0, 0, 16, 16);
    previewTile.clearRect(0, 0, 96, 96);

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const color = pixelMatrix[y][x];
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);

                preview1x.fillStyle = color;
                preview1x.fillRect(x, y, 1, 1);

                // Repetição 3x3 no teste de textura
                previewTile.fillStyle = color;
                for (let tx = 0; tx < 3; tx++) {
                    for (let ty = 0; ty < 3; ty++) {
                        previewTile.fillRect(tx * 32 + x * 2, ty * 32 + y * 2, 2, 2);
                    }
                }
            }

            if (showGrid) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.strokeRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            }
        }
    }
}

// Eventos do Mouse
canvas.onmousedown = (e) => { saveState(); isDrawing = true; drawPixel(e); };
canvas.onmousemove = (e) => { if (isDrawing) drawPixel(e); };
canvas.onmouseup = () => isDrawing = false;
canvas.onmouseleave = () => isDrawing = false;

// Alternar Ferramentas
document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.getAttribute('data-tool');
    };
});

document.getElementById('chkGrid').onchange = (e) => {
    showGrid = e.target.checked;
    render();
};

document.getElementById('btnClearCanvas').onclick = () => {
    saveState();
    pixelMatrix = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    render();
};

document.getElementById('btnExportPNG').onclick = () => {
    const link = document.createElement('a');
    link.download = 'sprite-16x16.png';
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 16;
    tempCanvas.height = 16;
    const tCtx = tempCanvas.getContext('2d');
    
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (pixelMatrix[y][x]) {
                tCtx.fillStyle = pixelMatrix[y][x];
                tCtx.fillRect(x, y, 1, 1);
            }
        }
    }
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
};

render();
