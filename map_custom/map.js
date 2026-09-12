const GRID_SIZE = 12;
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const CELL_SIZE = canvas.width / GRID_SIZE; // 48px por célula

// Estado do Mundo e Setores
let currentSectorX = 0;
let currentSectorY = 0;
let worldSectors = {}; 

// Sistema de Som Synthesizer
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

// -------------------------------------------------------------
// GERADOR PROCEDURAL DE TEXTURAS RETRO 16-BIT (CANVAS CACHE)
// -------------------------------------------------------------
const textureCache = {};

function createPixelTexture(type, id) {
    const key = `${type}_${id}`;
    if (textureCache[key]) return textureCache[key];

    const tCanvas = document.createElement('canvas');
    tCanvas.width = 16;
    tCanvas.height = 16;
    const tCtx = tCanvas.getContext('2d');

    if (id === 'grama') {
        tCtx.fillStyle = '#1e863d'; tCtx.fillRect(0, 0, 16, 16);
        tCtx.fillStyle = '#135c28';
        tCtx.fillRect(2, 3, 2, 4); tCtx.fillRect(10, 8, 2, 4); tCtx.fillRect(6, 12, 2, 3);
        tCtx.fillStyle = '#34d399';
        tCtx.fillRect(3, 2, 1, 2); tCtx.fillRect(11, 7, 1, 2);
    } else if (id === 'terra') {
        tCtx.fillStyle = '#78350f'; tCtx.fillRect(0, 0, 16, 16);
        tCtx.fillStyle = '#542307';
        tCtx.fillRect(1, 2, 3, 2); tCtx.fillRect(8, 10, 4, 2); tCtx.fillRect(12, 4, 2, 2);
        tCtx.fillStyle = '#92400e';
        tCtx.fillRect(5, 6, 2, 2); tCtx.fillRect(10, 2, 2, 2);
    } else if (id === 'agua') {
        tCtx.fillStyle = '#0284c7'; tCtx.fillRect(0, 0, 16, 16);
        tCtx.fillStyle = '#38bdf8';
        tCtx.fillRect(2, 4, 4, 1); tCtx.fillRect(10, 11, 5, 1); tCtx.fillRect(7, 2, 3, 1);
        tCtx.fillStyle = '#0369a1';
        tCtx.fillRect(0, 8, 6, 1); tCtx.fillRect(8, 14, 6, 1);
    } else if (id === 'pedra') {
        tCtx.fillStyle = '#475569'; tCtx.fillRect(0, 0, 16, 16);
        tCtx.fillStyle = '#334155';
        tCtx.fillRect(0, 7, 16, 1); tCtx.fillRect(7, 0, 1, 7); tCtx.fillRect(11, 8, 1, 8);
        tCtx.fillStyle = '#64748b';
        tCtx.fillRect(1, 1, 5, 1); tCtx.fillRect(8, 9, 3, 1);
    } else if (id === 'areia') {
        tCtx.fillStyle = '#eab308'; tCtx.fillRect(0, 0, 16, 16);
        tCtx.fillStyle = '#ca8a04';
        tCtx.fillRect(3, 4, 2, 2); tCtx.fillRect(11, 9, 3, 1); tCtx.fillRect(6, 13, 2, 2);
    } else if (id === 'gelo') {
        tCtx.fillStyle = '#38bdf8'; tCtx.fillRect(0, 0, 16, 16);
        tCtx.fillStyle = '#e0f2fe';
        tCtx.fillRect(2, 2, 4, 4); tCtx.fillRect(10, 10, 3, 3);
        tCtx.fillStyle = '#0284c7';
        tCtx.fillRect(0, 15, 16, 1); tCtx.fillRect(15, 0, 1, 16);
    } else if (id === 'taiga') {
        tCtx.fillStyle = '#14532d'; tCtx.fillRect(0, 0, 16, 16);
        tCtx.fillStyle = '#052e16';
        tCtx.fillRect(1, 1, 4, 4); tCtx.fillRect(9, 8, 5, 4);
    } else if (id === 'rocha') {
        tCtx.fillStyle = '#1e293b'; tCtx.fillRect(0, 0, 16, 16);
        tCtx.fillStyle = '#0f172a';
        tCtx.fillRect(2, 2, 12, 12);
        tCtx.fillStyle = '#334155';
        tCtx.fillRect(4, 4, 4, 4);
    }

    textureCache[key] = tCanvas;
    return tCanvas;
}

// -------------------------------------------------------------
// ESTRUTURA DO MUNDO & SETORES
// -------------------------------------------------------------
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

// Renderização Principal do Mapa
function renderMap() {
    const matrix = getOrCreateSector(currentSectorX, currentSectorY);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Passagem 1: Renderizar Terrenos
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = matrix[r][c];
            const tImg = createPixelTexture('terrain', cell.terrain || 'grama');
            ctx.drawImage(tImg, c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);

            // Grade Suave
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }

    // Passagem 2: Renderizar Objetos, Estruturas e Unidades
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const item = matrix[r][c].item;
            if (!item) continue;

            const x = c * CELL_SIZE;
            const y = r * CELL_SIZE;
            const w = (item.w || 1) * CELL_SIZE;
            const h = (item.h || 1) * CELL_SIZE;

            if (item.customImg) {
                // Renderizar Imagem JSON do Construction
                const img = new Image();
                img.src = item.customImg;
                ctx.drawImage(img, x, y, w, h);
            } else {
                // Desenho Procedural Retro dos Objetos Internos
                renderDefaultObject(item.id, x, y, w, h);
            }
        }
    }

    updateMinimap();
}

// Desenhar Objetos Padronizados RPG (Sombra e Cores 16-bit)
function renderDefaultObject(id, x, y, w, h) {
    ctx.save();
    if (id === 'arvore' || id === 'pinheiro') {
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(x + w/2, y + h - 6, w/3, 6, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#78350f'; ctx.fillRect(x + w/2 - 4, y + h/2, 8, h/2 - 4);
        ctx.fillStyle = id === 'arvore' ? '#16a34a' : '#15803d';
        ctx.beginPath(); ctx.arc(x + w/2, y + h/3, w/2.2, 0, Math.PI*2); ctx.fill();
    } else if (id === 'casa') {
        ctx.fillStyle = '#b45309'; ctx.fillRect(x + 4, y + h/3, w - 8, h*2/3 - 4);
        ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.moveTo(x, y + h/3); ctx.lineTo(x + w/2, y); ctx.lineTo(x + w, y + h/3); ctx.fill();
        ctx.fillStyle = '#451a03'; ctx.fillRect(x + w/2 - 6, y + h - 20, 12, 16);
    } else if (id === 'torre' || id === 'castelo') {
        ctx.fillStyle = '#64748b'; ctx.fillRect(x + 4, y + 8, w - 8, h - 12);
        ctx.fillStyle = '#334155'; ctx.fillRect(x, y, w, 12);
        ctx.fillStyle = '#0284c7'; ctx.fillRect(x + w/2 - 2, y - 8, 4, 10);
    } else if (id === 'muralha') {
        ctx.fillStyle = '#475569'; ctx.fillRect(x, y + 4, w, h - 4);
        ctx.fillStyle = '#64748b'; ctx.fillRect(x, y, w/3, 6); ctx.fillRect(x + w*2/3, y, w/3, 6);
    } else if (id === 'arqueiro' || id === 'cavaleiro' || id === 'piqueiro' || id === 'besteiro') {
        ctx.fillStyle = id === 'cavaleiro' ? '#f43f5e' : '#38bdf8';
        ctx.beginPath(); ctx.arc(x + w/2, y + h/2, 10, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
    } else {
        ctx.fillStyle = '#d97706'; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    }
    ctx.restore();
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

// Pintura no Canvas
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
    renderMap();
}

// Seleção de Botões da Paleta
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

// Som
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
    renderMap();
}

// Botões de Limpeza
document.getElementById('btnClearSector').onclick = () => {
    delete worldSectors[getSectorKey(currentSectorX, currentSectorY)];
    renderMap();
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
                alert("Arquivo JSON inválido. Certifique-se de que exportou pelo Construction.");
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

    // Converte a matriz de cores em uma Imagem PNG base64
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

    // Cria o botão da estrutura importada na barra de edifícios
    const container = document.getElementById('structuresContainer');
    const newBtn = document.createElement('button');
    newBtn.className = 'palette-btn col-span-2 border-amber-500/50 text-amber-300 active';
    newBtn.innerHTML = `<img src="${imgUrl}" class="w-4 h-4 rounded border border-slate-700" style="image-rendering: pixelated;"> Customizada (${size}x${size})`;

    document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));

    selectedElement = {
        id: uniqueId,
        type: 'custom',
        customImg: imgUrl,
        w: 1,
        h: 1,
        label: `Customizada (${size}x${size})`
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
            label: `Customizada (${size}x${size})`
        };
        document.getElementById('activeElementLabel').innerText = `Customizada (${size}x${size})`;
    };

    container.appendChild(newBtn);
    document.getElementById('activeElementLabel').innerText = `Customizada (${size}x${size})`;
    playBeep(800);
    alert("Estrutura importada com sucesso e adicionada à paleta!");
}

// Salvar Projeto
document.getElementById('btnSaveProject').onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(worldSectors));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mapa_rpg_mundo.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};

// Carregar Projeto
const fileLoadProject = document.getElementById('fileLoadProject');
document.getElementById('btnLoadProject').onclick = () => fileLoadProject.click();

fileLoadProject.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            worldSectors = JSON.parse(event.target.result);
            renderMap();
            alert("Projeto do mapa carregado com sucesso!");
        } catch(err) { alert("Erro ao carregar o arquivo de projeto."); }
    };
    reader.readAsText(file);
};

// Exportar Imagem PNG
document.getElementById('btnExportPNG').onclick = () => {
    const link = document.createElement('a');
    link.download = `setor_${currentSectorX}_${currentSectorY}.png`;
    link.href = canvas.toDataURL();
    link.click();
};

// Inicialização
getOrCreateSector(0, 0);
renderMap();
