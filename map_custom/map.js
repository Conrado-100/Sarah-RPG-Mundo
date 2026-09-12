const GRID_SIZE = 12;
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const CELL_SIZE = canvas.width / GRID_SIZE; // 48px

let currentSectorX = 0;
let currentSectorY = 0;
let worldSectors = {}; 

const imageCache = {};

// Som
let soundEnabled = true;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(freq = 400) {
    if (!soundEnabled) return;
    try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    } catch(e){}
}

let selectedElement = { id: 'grama', type: 'terrain', w: 1, h: 1, label: 'Grama' };

function getSectorKey(x, y) { return `${x},${y}`; }

function getOrCreateSector(x, y) {
    const key = getSectorKey(x, y);
    if (!worldSectors[key]) {
        const matrix = Array(GRID_SIZE).fill(null).map(() => 
            Array(GRID_SIZE).fill(null).map(() => ({ terrain: 'grama', item: null }))
        );
        worldSectors[key] = matrix;
    }
    return worldSectors[key];
}

// -------------------------------------------------------------
// MOTOR DE RENDERIZAÇÃO RETRO FOTORREALISTA + ANIMAÇÃO DA ÁGUA
// -------------------------------------------------------------

function renderMap() {
    const matrix = getOrCreateSector(currentSectorX, currentSectorY);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Passo 1: Renderizar Terrenos
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const x = c * CELL_SIZE;
            const y = r * CELL_SIZE;
            const terrain = matrix[r][c].terrain || 'grama';

            drawTerrainTile(terrain, x, y);

            // Grade sutil
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        }
    }

    // Passo 2: Renderizar Objetos, Vegetação e Estruturas
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const item = matrix[r][c].item;
            if (!item) continue;

            const x = c * CELL_SIZE;
            const y = r * CELL_SIZE;
            const w = (item.w || 1) * CELL_SIZE;
            const h = (item.h || 1) * CELL_SIZE;

            if (item.customImg) {
                if (!imageCache[item.customImg]) {
                    const img = new Image();
                    img.src = item.customImg;
                    img.onload = () => renderMap();
                    imageCache[item.customImg] = img;
                } else {
                    ctx.drawImage(imageCache[item.customImg], x, y, w, h);
                }
            } else {
                drawObjectTile(item.id, x, y, w, h);
            }
        }
    }

    updateMinimap();
}

// Loop contínuo de animação (3 quadros para água trocando a cada 250ms)
function gameLoop() {
    renderMap();
    requestAnimationFrame(gameLoop);
}

// Desenhar Terrenos
function drawTerrainTile(type, x, y) {
    if (type === 'grama') {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        // Tufo de grama 1
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 10, y + 12, 3, 6);
        ctx.fillRect(x + 13, y + 10, 3, 8);
        // Tufo de grama 2
        ctx.fillRect(x + 30, y + 26, 3, 8);
        ctx.fillRect(x + 33, y + 28, 3, 6);
    } else if (type === 'terra') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + 8, y + 8, 10, 10);
        ctx.fillRect(x + 26, y + 26, 12, 12);
    } else if (type === 'agua') {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        // Animação das Ondas em Tempo Real
        const waterFrame = Math.floor(Date.now() / 250) % 3;
        ctx.fillStyle = '#38bdf8';

        if (waterFrame === 0) {
            ctx.fillRect(x + 4, y + 12, 18, 4);
            ctx.fillRect(x + 22, y + 30, 20, 4);
            ctx.fillStyle = '#e0f2fe';
            ctx.fillRect(x + 18, y + 12, 4, 4);
        } else if (waterFrame === 1) {
            ctx.fillRect(x + 10, y + 12, 18, 4);
            ctx.fillRect(x + 14, y + 30, 20, 4);
            ctx.fillStyle = '#e0f2fe';
            ctx.fillRect(x + 24, y + 12, 4, 4);
        } else {
            ctx.fillRect(x + 16, y + 12, 18, 4);
            ctx.fillRect(x + 6, y + 30, 20, 4);
            ctx.fillStyle = '#e0f2fe';
            ctx.fillRect(x + 30, y + 12, 4, 4);
        }
    } else if (type === 'pedra') {
        ctx.fillStyle = '#475569';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 2, y + 22, 44, 2);
        ctx.fillRect(x + 22, y + 2, 2, 20);
    } else if (type === 'areia') {
        ctx.fillStyle = '#eab308';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(x + 10, y + 12, 4, 4);
        ctx.fillRect(x + 30, y + 28, 4, 4);
    } else if (type === 'gelo') {
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(x + 4, y + 4, 16, 16);
    } else if (type === 'taiga') {
        ctx.fillStyle = '#14532d';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = '#052e16';
        ctx.fillRect(x + 10, y + 10, 6, 6);
    } else if (type === 'rocha') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 6, y + 6, 36, 36);
    }
}

// Desenhar Objetos, Vegetação e Estruturas
function drawObjectTile(id, x, y, w, h) {
    if (id === 'arvore') {
        // Tronco (1x2)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 18, y + 48, 12, 42);
        // Copa Verde
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 6, y + 6, 36, 48);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 10, y + 10, 12, 12);
    } else if (id === 'pinheiro') {
        // Tronco (1x2)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 20, y + 70, 8, 22);
        // Triângulos de Pinheiro
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 70); ctx.lineTo(x + 24, y + 30); ctx.lineTo(x + 44, y + 70); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 40); ctx.lineTo(x + 24, y + 6); ctx.lineTo(x + 40, y + 40); ctx.fill();
    } else if (id === 'savana') {
        // Savana / Palha Dourada Árida (1x2)
        ctx.fillStyle = '#eab308';
        ctx.fillRect(x + 4, y + 12, 40, 78);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(x + 8, y + 16, 6, 70);
        ctx.fillRect(x + 20, y + 12, 6, 74);
        ctx.fillRect(x + 32, y + 20, 6, 66);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 10, y + 12, 2, 24);
        ctx.fillRect(x + 22, y + 8, 2, 30);
    } else if (id === 'cacto') {
        // Cacto Saguaro Verde (1x2)
        const cx = x + 18;
        ctx.fillStyle = '#15803d';
        // Tronco Principal
        ctx.fillRect(cx, y + 10, 12, 80);
        // Braço Esquerdo
        ctx.fillRect(cx - 12, y + 36, 12, 8);
        ctx.fillRect(cx - 12, y + 20, 8, 24);
        // Braço Direito
        ctx.fillRect(cx + 12, y + 48, 12, 8);
        ctx.fillRect(cx + 16, y + 28, 8, 28);
        // Detalhes / Brilho
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(cx + 2, y + 12, 3, 76);
        ctx.fillRect(cx - 10, y + 22, 2, 20);
        ctx.fillRect(cx + 18, y + 30, 2, 24);
    } else if (id === 'casa') {
        // Casa (2x2)
        ctx.fillStyle = '#ef4444'; // Telhado vermelho
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 44); ctx.lineTo(x + w/2, y + 8); ctx.lineTo(x + w - 4, y + 44); ctx.fill();
        ctx.fillStyle = '#fde047'; // Paredes amarelas
        ctx.fillRect(x + 8, y + 44, w - 16, h - 48);
        ctx.fillStyle = '#0284c7'; ctx.fillRect(x + 18, y + 56, 18, 18); // Janela Azul
        ctx.fillStyle = '#78350f'; ctx.fillRect(x + w - 36, y + 56, 18, 32); // Porta Madeira
    } else if (id === 'muralha') {
        // Muralha de Pedra (1x1)
        ctx.fillStyle = '#64748b'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#334155'; ctx.fillRect(x, y, 12, 10); ctx.fillRect(x + 24, y, 12, 10);
        ctx.strokeStyle = '#1e293b'; ctx.strokeRect(x, y, w, h);
    } else if (id === 'torre') {
        // Torre (2x3)
        ctx.fillStyle = '#64748b'; ctx.fillRect(x + 8, y + 20, w - 16, h - 20);
        ctx.fillStyle = '#334155'; ctx.fillRect(x + 4, y, w - 8, 20);
        ctx.fillStyle = '#0f172a'; ctx.fillRect(x + w/2 - 6, y + 40, 12, 18);
    } else if (id === 'portao') {
        // Portão (2x2)
        ctx.fillStyle = '#475569'; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(x + 16, y + 20, w - 32, h - 20);
        ctx.fillStyle = '#78350f'; ctx.fillRect(x + 20, y + 24, w - 40, h - 24);
    } else if (id === 'castelo') {
        // Castelo (4x4)
        ctx.fillStyle = '#475569'; ctx.fillRect(x + 16, y + 16, w - 32, h - 32);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x, y, 48, 48); ctx.fillRect(x + w - 48, y, 48, 48);
        ctx.fillRect(x, y + h - 48, 48, 48); ctx.fillRect(x + w - 48, y + h - 48, 48, 48);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(x + 20, y - 8, 8, 12); ctx.fillRect(x + w - 28, y - 8, 8, 12);
        ctx.fillStyle = '#78350f'; ctx.fillRect(x + w/2 - 16, y + h - 40, 32, 40);
    } else if (id === 'arqueiro' || id === 'cavaleiro' || id === 'piqueiro' || id === 'besteiro') {
        // Unidades Militares
        const colors = { arqueiro: '#38bdf8', cavaleiro: '#ef4444', piqueiro: '#a855f7', besteiro: '#f97316' };
        ctx.fillStyle = colors[id] || '#38bdf8';
        ctx.beginPath(); ctx.arc(x + w/2, y + h/2, 14, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    }
}

// Minimapa 5x5
function updateMinimap() {
    const minimap = document.getElementById('minimap');
    minimap.innerHTML = '';
    
    for (let my = -2; my <= 2; my++) {
        for (let mx = -2; mx <= 2; mx++) {
            const sx = currentSectorX + mx;
            const sy = currentSectorY + my;
            const key = getSectorKey(sx, sy);
            const cellDiv = document.createElement('div');
            
            const isCurrent = (mx === 0 && my === 0);
            const exists = !!worldSectors[key];

            cellDiv.className = `w-full h-full rounded-sm ${
                isCurrent ? 'bg-sky-500 border border-white' : exists ? 'bg-emerald-800' : 'bg-slate-900 border border-slate-800'
            }`;
            minimap.appendChild(cellDiv);
        }
    }
}

// Eventos do Mouse / Pintura
let isMouseDown = false;
canvas.onmousedown = (e) => { isMouseDown = true; paint(e); };
canvas.onmousemove = (e) => { if (isMouseDown) paint(e); };
window.onmouseup = () => { isMouseDown = false; };

function paint(e) {
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / (rect.width / GRID_SIZE));
    const row = Math.floor((e.clientY - rect.top) / (rect.height / GRID_SIZE));

    if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return;

    const matrix = getOrCreateSector(currentSectorX, currentSectorY);

    if (selectedElement.type === 'terrain') {
        matrix[row][col].terrain = selectedElement.id;
    } else if (selectedElement.type === 'clear') {
        matrix[row][col].item = null;
    } else {
        matrix[row][col].item = {
            id: selectedElement.id,
            w: selectedElement.w || 1,
            h: selectedElement.h || 1,
            customImg: selectedElement.customImg || null
        };
    }

    playBeep(selectedElement.type === 'clear' ? 200 : 550);
}

// Seleção na Paleta
document.querySelectorAll('.palette-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        selectedElement = {
            id: btn.getAttribute('data-id'),
            type: btn.getAttribute('data-type'),
            w: parseInt(btn.getAttribute('data-w') || '1'),
            h: parseInt(btn.getAttribute('data-h') || '1'),
            label: btn.innerText
        };

        document.getElementById('activeElementLabel').innerText = btn.innerText.replace(/^[^\s]+\s/, '');
        playBeep(650);
    };
});

// Som Toggle
document.getElementById('btnSoundToggle').onclick = () => {
    soundEnabled = !soundEnabled;
    document.getElementById('soundLabel').innerText = soundEnabled ? 'LIGADO' : 'DESLIGADO';
};

// Navegação do D-Pad
document.getElementById('btnNavUp').onclick = () => changeSector(0, -1);
document.getElementById('btnNavDown').onclick = () => changeSector(0, 1);
document.getElementById('btnNavLeft').onclick = () => changeSector(-1, 0);
document.getElementById('btnNavRight').onclick = () => changeSector(1, 0);
document.getElementById('btnNavCenter').onclick = () => { currentSectorX = 0; currentSectorY = 0; updateSectorUI(); };

function changeSector(dx, dy) {
    currentSectorX += dx;
    currentSectorY += dy;
    updateSectorUI();
}

function updateSectorUI() {
    document.getElementById('sectorX').innerText = currentSectorX;
    document.getElementById('sectorY').innerText = currentSectorY;
    playBeep(350);
}

// Limpeza
document.getElementById('btnClearSector').onclick = () => {
    delete worldSectors[getSectorKey(currentSectorX, currentSectorY)];
};

document.getElementById('btnResetWorld').onclick = () => {
    if (confirm("Tem certeza que deseja resetar todo o mundo RPG?")) {
        worldSectors = {};
        currentSectorX = 0;
        currentSectorY = 0;
        updateSectorUI();
    }
};

// -------------------------------------------------------------
// IMPORTAR ESTRUTURA DO CONSTRUCTION (JSON)
// -------------------------------------------------------------
const jsonInput = document.getElementById('jsonInput');
document.getElementById('btnImportJSON').onclick = () => jsonInput.click();

jsonInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (data.pixels) {
                importStructureFromJSON(data);
            } else {
                alert("Arquivo JSON inválido.");
            }
        } catch(err) {
            alert("Erro ao ler o arquivo JSON.");
        }
    };
    reader.readAsText(file);
};

function importStructureFromJSON(data) {
    const size = data.gridSize || 16;
    const pixels = data.pixels;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (pixels[y][x]) {
                tempCtx.fillStyle = pixels[y][x];
                tempCtx.fillRect(x, y, 1, 1);
            }
        }
    }

    const imgUrl = tempCanvas.toDataURL();
    const uniqueId = 'custom_' + Date.now();

    const container = document.getElementById('structuresContainer');
    const newBtn = document.createElement('button');
    newBtn.className = 'palette-btn col-span-2 border-amber-500/50 text-amber-300 active';
    newBtn.innerHTML = `<img src="${imgUrl}" class="w-4 h-4 rounded" style="image-rendering: pixelated;"> Custom (${size}x${size})`;

    document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));

    selectedElement = {
        id: uniqueId,
        type: 'custom',
        customImg: imgUrl,
        w: 1,
        h: 1,
        label: `Custom (${size}x${size})`
    };

    newBtn.onclick = () => {
        document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
        newBtn.classList.add('active');
        selectedElement = {
            id: uniqueId,
            type: 'custom',
            customImg: imgUrl,
            w: 1,
            h: 1,
            label: `Custom (${size}x${size})`
        };
        document.getElementById('activeElementLabel').innerText = `Custom (${size}x${size})`;
    };

    container.appendChild(newBtn);
    document.getElementById('activeElementLabel').innerText = `Custom (${size}x${size})`;
    playBeep(800);
    alert("Estrutura importada com sucesso!");
}

// Salvar / Carregar / Exportar
document.getElementById('btnSaveProject').onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(worldSectors));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mapa_rpg_mundo.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};

const fileLoadProject = document.getElementById('fileLoadProject');
document.getElementById('btnLoadProject').onclick = () => fileLoadProject.click();

fileLoadProject.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            worldSectors = JSON.parse(event.target.result);
            alert("Projeto do mapa carregado com sucesso!");
        } catch(err) { alert("Erro ao carregar o arquivo de projeto."); }
    };
    reader.readAsText(file);
};

document.getElementById('btnExportPNG').onclick = () => {
    const link = document.createElement('a');
    link.download = `setor_${currentSectorX}_${currentSectorY}.png`;
    link.href = canvas.toDataURL();
    link.click();
};

// Inicialização e Animação Principal
getOrCreateSector(0, 0);
gameLoop();
