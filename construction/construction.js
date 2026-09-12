// Configurações Globais do Canvas de Construção
const mainCanvas = document.getElementById('mainCanvas');
const ctx = mainCanvas.getContext('2d');

const prevSingle = document.getElementById('prevSingle').getContext('2d');
const prevWall = document.getElementById('prevWall').getContext('2d');
const prevContext = document.getElementById('prevContext').getContext('2d');

let gridSize = 16; 
let pixelSize = mainCanvas.width / gridSize;

let currentColor = '#78350f';
let currentTool = 'pencil';
let isDrawing = false;
let showGrid = true;
let startX = 0, startY = 0;

// Matriz de Pixels
let pixelMatrix = createMatrix(gridSize);
let historyStack = [];
let redoStack = [];

// Paletas por Material de Construção
const materials = {
    stone: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#0f172a', '#1c1917', '#292524', '#44403c', '#78716c', '#a8a29e'],
    wood: ['#271206', '#451a03', '#78350f', '#9a3412', '#b45309', '#d97706', '#f59e0b', '#fef3c7', '#3f2305', '#5c330a', '#854d0e', '#ca8a04'],
    roof: ['#450a0a', '#7f1d1d', '#991b1b', '#dc2626', '#ef4444', '#f87171', '#0c4a6e', '#075985', '#0284c7', '#38bdf8', '#14532d', '#166534'],
    metal: ['#09090b', '#18181b', '#27272a', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7', '#fef08a', '#eab308', '#ca8a04', '#a16207', '#713f12']
};

function createMatrix(size) {
    return Array(size).fill(null).map(() => Array(size).fill(null));
}

// Inicializar Paleta de Materiais
function renderPalette(matKey = 'stone') {
    const grid = document.getElementById('paletteGrid');
    grid.innerHTML = '';
    materials[matKey].forEach(hex => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hex;
        swatch.onclick = () => setColor(hex);
        grid.appendChild(swatch);
    });
}

function setColor(hex) {
    currentColor = hex;
    document.getElementById('colorPicker').value = hex;
    document.getElementById('hexLabel').innerText = hex;
}

document.getElementById('colorPicker').oninput = (e) => setColor(e.target.value);

// Troca de Abas de Material
document.querySelectorAll('.mat-tab').forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll('.mat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderPalette(tab.getAttribute('data-mat'));
    };
});

// Ações do Canvas
function getCoords(e) {
    const rect = mainCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / gridSize));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / gridSize));
    return { x: Math.max(0, Math.min(gridSize - 1, x)), y: Math.max(0, Math.min(gridSize - 1, y)) };
}

function saveState() {
    historyStack.push(JSON.stringify(pixelMatrix));
    if (historyStack.length > 25) historyStack.shift();
    redoStack = [];
}

// Manipulação das Ferramentas
function applyTool(x, y) {
    if (currentTool === 'pencil') pixelMatrix[y][x] = currentColor;
    else if (currentTool === 'eraser') pixelMatrix[y][x] = null;
    else if (currentTool === 'eyedropper') {
        if (pixelMatrix[y][x]) setColor(pixelMatrix[y][x]);
    }
    else if (currentTool === 'bucket') floodFill(x, y, pixelMatrix[y][x], currentColor);
    else if (currentTool === 'darken') adjustColor(x, y, -20);
    else if (currentTool === 'lighten') adjustColor(x, y, 20);
}

function adjustColor(x, y, percent) {
    const color = pixelMatrix[y][x];
    if (!color) return;
    let num = parseInt(color.replace('#',''), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    
    R = Math.min(255, Math.max(0, R));
    G = Math.min(255, Math.max(0, G));
    B = Math.min(255, Math.max(0, B));
    
    pixelMatrix[y][x] = "#" + (16777216 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

function floodFill(x, y, target, replacement) {
    if (target === replacement) return;
    if (pixelMatrix[y][x] !== target) return;
    pixelMatrix[y][x] = replacement;
    if (x > 0) floodFill(x - 1, y, target, replacement);
    if (x < gridSize - 1) floodFill(x + 1, y, target, replacement);
    if (y > 0) floodFill(x, y - 1, target, replacement);
    if (y < gridSize - 1) floodFill(x, y + 1, target, replacement);
}

// Desenhar Linha Reta e Retângulo (Muros rápidos)
function drawShape(endX, endY) {
    render();
    ctx.fillStyle = currentColor;
    if (currentTool === 'line') {
        let dx = Math.abs(endX - startX), dy = Math.abs(endY - startY);
        let sx = startX < endX ? 1 : -1, sy = startY < endY ? 1 : -1;
        let err = dx - dy, x = startX, y = startY;
        while (true) {
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            if (x === endX && y === endY) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x += sx; }
            if (e2 < dx) { err += dx; y += sy; }
        }
    } else if (currentTool === 'rect') {
        let minX = Math.min(startX, endX), maxX = Math.max(startX, endX);
        let minY = Math.min(startY, endY), maxY = Math.max(startY, endY);
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    }
}

function commitShape(endX, endY) {
    if (currentTool === 'line') {
        let dx = Math.abs(endX - startX), dy = Math.abs(endY - startY);
        let sx = startX < endX ? 1 : -1, sy = startY < endY ? 1 : -1;
        let err = dx - dy, x = startX, y = startY;
        while (true) {
            pixelMatrix[y][x] = currentColor;
            if (x === endX && y === endY) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x += sx; }
            if (e2 < dx) { err += dx; y += sy; }
        }
    } else if (currentTool === 'rect') {
        let minX = Math.min(startX, endX), maxX = Math.max(startX, endX);
        let minY = Math.min(startY, endY), maxY = Math.max(startY, endY);
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                pixelMatrix[y][x] = currentColor;
            }
        }
    }
}

// Renderização Geral no Canvas e Previews
function render() {
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    prevSingle.clearRect(0, 0, 32, 32);
    prevWall.clearRect(0, 0, 96, 96);
    prevContext.clearRect(0, 0, 96, 96);

    const scale = 32 / gridSize;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const color = pixelMatrix[y][x];
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

                prevSingle.fillStyle = color;
                prevSingle.fillRect(x * scale, y * scale, scale, scale);

                // Teste de Repetição 3x3
                prevWall.fillStyle = color;
                prevContext.fillStyle = color;
                for (let tx = 0; tx < 3; tx++) {
                    for (let ty = 0; ty < 3; ty++) {
                        prevWall.fillRect(tx * 32 + x * scale, ty * 32 + y * scale, scale, scale);
                        prevContext.fillRect(tx * 32 + x * scale, ty * 32 + y * scale, scale, scale);
                    }
                }
            }

            if (showGrid) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    }
}

// Eventos do Mouse
mainCanvas.onmousedown = (e) => {
    saveState();
    isDrawing = true;
    const { x, y } = getCoords(e);
    startX = x; startY = y;

    if (['line', 'rect'].includes(currentTool)) return;
    applyTool(x, y);
    render();
};

mainCanvas.onmousemove = (e) => {
    const { x, y } = getCoords(e);
    document.getElementById('posX').innerText = x;
    document.getElementById('posY').innerText = y;

    if (!isDrawing) return;
    if (['line', 'rect'].includes(currentTool)) {
        drawShape(x, y);
    } else {
        applyTool(x, y);
        render();
    }
};

mainCanvas.onmouseup = (e) => {
    if (isDrawing && ['line', 'rect'].includes(currentTool)) {
        const { x, y } = getCoords(e);
        commitShape(x, y);
        render();
    }
    isDrawing = false;
};

// Trocar Ferramentas
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.getAttribute('data-tool');
        document.getElementById('activeToolLabel').innerText = btn.title;
    };
});

// Desfazer / Refazer
document.getElementById('btnUndo').onclick = () => {
    if (historyStack.length > 0) {
        redoStack.push(JSON.stringify(pixelMatrix));
        pixelMatrix = JSON.parse(historyStack.pop());
        render();
    }
};

document.getElementById('btnRedo').onclick = () => {
    if (redoStack.length > 0) {
        historyStack.push(JSON.stringify(pixelMatrix));
        pixelMatrix = JSON.parse(redoStack.pop());
        render();
    }
};

document.getElementById('btnClear').onclick = () => {
    saveState();
    pixelMatrix = createMatrix(gridSize);
    render();
};

document.getElementById('chkGrid').onchange = (e) => {
    showGrid = e.target.checked;
    render();
};

document.getElementById('gridSizeSelect').onchange = (e) => {
    saveState();
    gridSize = parseInt(e.target.value);
    pixelSize = mainCanvas.width / gridSize;
    pixelMatrix = createMatrix(gridSize);
    render();
};

// Carregador de Presets Arquitetônicos
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.onclick = () => {
        saveState();
        const type = btn.getAttribute('data-preset');
        pixelMatrix = createMatrix(gridSize);

        if (type === 'stoneWall') {
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    if (y % 4 === 0 || (x + (y % 8 < 4 ? 0 : 2)) % 4 === 0) pixelMatrix[y][x] = '#1e293b';
                    else pixelMatrix[y][x] = '#475569';
                }
            }
        } else if (type === 'brickWall') {
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    if (y % 3 === 0 || (x + (y % 6 < 3 ? 0 : 2)) % 4 === 0) pixelMatrix[y][x] = '#450a0a';
                    else pixelMatrix[y][x] = '#991b1b';
                }
            }
        } else if (type === 'woodDoor') {
            for (let y = 2; y < gridSize - 1; y++) {
                for (let x = 3; x < gridSize - 3; x++) {
                    if (x === 3 || x === gridSize - 4 || y === 2) pixelMatrix[y][x] = '#271206';
                    else pixelMatrix[y][x] = '#78350f';
                }
            }
            pixelMatrix[8][10] = '#eab308'; // Fechadura
        }

        render();
    };
});

// Exportar Imagem PNG
document.getElementById('btnExportPNG').onclick = () => {
    const link = document.createElement('a');
    link.download = `estrutura-${gridSize}x${gridSize}.png`;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = gridSize;
    tempCanvas.height = gridSize;
    const tCtx = tempCanvas.getContext('2d');
    
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (pixelMatrix[y][x]) {
                tCtx.fillStyle = pixelMatrix[y][x];
                tCtx.fillRect(x, y, 1, 1);
            }
        }
    }
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
};
// Exportar Estrutura em formato JSON
document.getElementById('btnExportJSON').onclick = () => {
    const jsonPayload = {
        type: "rpg_custom_structure",
        version: "1.0",
        gridSize: gridSize,
        pixels: pixelMatrix
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `estrutura_custom_${gridSize}x${gridSize}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};
// Inicialização
renderPalette('stone');
render();
