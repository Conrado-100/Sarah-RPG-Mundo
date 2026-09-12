// Configuração do Canvas Principal
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const minimapCanvas = document.getElementById('minimapCanvas');
const miniCtx = minimapCanvas.getContext('2d');
miniCtx.imageSmoothingEnabled = false;

// Configuração da Grade 12x12
const GRID_COLS = 12;
const GRID_ROWS = 12;
const TILE_SIZE = canvas.width / GRID_COLS; // 50px por célula

let currentTile = 'grass';
let isDrawing = false;
let soundEnabled = true;

// Coordenadas do Setor Atual
let currentChunkX = 0;
let currentChunkY = 0;
const mapChunks = {};

// Cores Base do Terreno
const TILE_COLORS = {
    grass: '#16a34a', grass_detail: '#15803d', grass_highlight: '#4ade80',
    dirt: '#78350f', dirt_detail: '#451a03', dirt_highlight: '#b45309',
    water: '#0284c7', water_detail: '#1e3a8a', water_highlight: '#38bdf8',
    stone: '#64748b', stone_detail: '#334155', stone_highlight: '#94a3b8',
    sand: '#eab308', sand_detail: '#ca8a04', sand_highlight: '#facc15',
    ice: '#bae6fd', ice_detail: '#ffffff', ice_highlight: '#e0f2fe',
    mountain_rock: '#475569', mountain_rock_detail: '#334155', mountain_rock_highlight: '#64748b',
    taiga: '#14532d', taiga_detail: '#052e16', taiga_highlight: '#22c55e',
    erase: '#0f172a'
};

// Sintetizador de Som com Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSynthSound(freq, duration, type = 'sine') {
    if (!soundEnabled) return;
    try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
}

// Obter Dados do Setor
function getChunk(cx, cy) {
    const key = `${cx},${cy}`;
    if (!mapChunks[key]) {
        mapChunks[key] = {
            terrain: Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('grass')),
            objects: Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null))
        };
    }
    return mapChunks[key];
}

// Animação da Água
let animFrame = 0;
setInterval(() => {
    animFrame = (animFrame + 1) % 4;
    renderMap();
}, 300);

// Desenhar Terreno
function drawTerrainTexture(type, x, y) {
    const posX = x * TILE_SIZE;
    const posY = y * TILE_SIZE;
    const p = TILE_SIZE / 8;

    ctx.fillStyle = TILE_COLORS[type] || '#0f172a';
    ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

    if (type === 'grass') {
        ctx.fillStyle = TILE_COLORS.grass_detail;
        ctx.fillRect(posX + p * 1, posY + p * 2, p, p * 2);
        ctx.fillRect(posX + p * 5, posY + p * 4, p, p * 2);
        ctx.fillStyle = TILE_COLORS.grass_highlight;
        ctx.fillRect(posX + p * 1, posY + p * 1, p, p);
    } else if (type === 'dirt') {
        ctx.fillStyle = TILE_COLORS.dirt_detail;
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 2, p);
        ctx.fillRect(posX + p * 5, posY + p * 5, p, p * 2);
    } else if (type === 'water') {
        ctx.fillStyle = TILE_COLORS.water_highlight;
        const offset = (animFrame % 2) * p;
        ctx.fillRect(posX + p * 1 + offset, posY + p * 2, p * 3, p);
        ctx.fillRect(posX + p * 4 - offset, posY + p * 5, p * 3, p);
    } else if (type === 'stone') {
        ctx.fillStyle = TILE_COLORS.stone_detail;
        ctx.fillRect(posX + p * 1, posY + p * 3, p * 6, p);
    } else if (type === 'sand') {
        ctx.fillStyle = TILE_COLORS.sand_detail;
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 3, p);
        ctx.fillRect(posX + p * 4, posY + p * 6, p * 3, p);
    }
}

// Tronco Padrão
function drawTrunk(posX, posY, p) {
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(posX + p * 3, posY, p * 2, p * 8);
}

// Topo do Pinheiro
function drawPineTop(posX, posY, p, mainColor, highlightColor) {
    ctx.fillStyle = mainColor;
    ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 2);
    ctx.fillRect(posX + p * 2, posY + p * 3, p * 4, p * 2);
    ctx.fillRect(posX + p * 1, posY + p * 5, p * 6, p * 3);
    ctx.fillStyle = highlightColor;
    ctx.fillRect(posX + p * 3, posY + p * 2, p, p * 0.8);
}

// Desenhar Objetos
function drawObjectTexture(type, x, y) {
    const posX = x * TILE_SIZE;
    const posY = y * TILE_SIZE;
    const p = TILE_SIZE / 8;

    /* VEGETAÇÃO */
    if (type === 'tree_taiga_top') drawPineTop(posX, posY, p, '#15803d', '#86efac');
    else if (type === 'tree_taiga_bottom') drawTrunk(posX, posY, p);
    else if (type === 'tree_top') {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 6, p * 7);
        ctx.fillStyle = '#86efac';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 2, p * 2);
    } 
    else if (type === 'tree_bottom') drawTrunk(posX, posY, p);
    else if (type === 'cactus_top') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 7);
        ctx.fillRect(posX + p * 1, posY + p * 3, p * 2, p * 3);
    } 
    else if (type === 'cactus_bottom') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 3, posY, p * 2, p * 8);
        ctx.fillRect(posX + p * 5, posY + p * 1, p * 2, p * 3);
    } 
    else if (type === 'tree_savannah_top') {
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(posX, posY + p * 3, p * 8, p * 4);
    } 
    else if (type === 'tree_savannah_bottom') drawTrunk(posX, posY, p);

    /* MURALHA (1x1) */
    else if (type === 'wall_improved') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(posX, posY + p * 2, p * 8, p * 6);
        ctx.fillStyle = '#475569';
        ctx.fillRect(posX, posY, p * 2, p * 2);
        ctx.fillRect(posX + p * 3, posY, p * 2, p * 2);
        ctx.fillRect(posX + p * 6, posY, p * 2, p * 2);
    }

    /* CASA (2x2) */
    else if (type === 'house_tl') { ctx.fillStyle = '#dc2626'; ctx.fillRect(posX + p * 1, posY + p * 2, p * 7, p * 6); }
    else if (type === 'house_tr') {
        ctx.fillStyle = '#dc2626'; ctx.fillRect(posX, posY + p * 2, p * 7, p * 6);
        ctx.fillStyle = '#475569'; ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 3);
    }
    else if (type === 'house_bl') {
        ctx.fillStyle = '#fef08a'; ctx.fillRect(posX + p * 1, posY, p * 7, p * 8);
        ctx.fillStyle = '#0284c7'; ctx.fillRect(posX + p * 3, posY + p * 2, p * 3, p * 3);
    }
    else if (type === 'house_br') {
        ctx.fillStyle = '#fef08a'; ctx.fillRect(posX, posY, p * 7, p * 8);
        ctx.fillStyle = '#78350f'; ctx.fillRect(posX + p * 2, posY + p * 2, p * 3, p * 6);
    }

    /* TORRE 2x3 */
    else if (type.startsWith('tower_2x3_')) {
        const parts = type.split('_r')[1].split('c');
        const r = parseInt(parts[0]);
        const c = parseInt(parts[1]);

        if (r === 0) {
            ctx.fillStyle = '#64748b'; ctx.fillRect(posX, posY + p * 3, p * 8, p * 5);
            ctx.fillStyle = '#94a3b8';
            if (c === 0) { ctx.fillRect(posX, posY + p * 1, p * 3, p * 2); ctx.fillRect(posX + p * 5, posY + p * 1, p * 3, p * 2); }
            else { ctx.fillRect(posX + p * 1, posY + p * 1, p * 3, p * 2); ctx.fillRect(posX + p * 6, posY + p * 1, p * 2, p * 2); }
        } else if (r === 1) {
            ctx.fillStyle = '#64748b'; ctx.fillRect(posX, posY, p * 8, p * 8);
            ctx.fillStyle = '#0f172a';
            if (c === 0) ctx.fillRect(posX + p * 5, posY + p * 2, p * 3, p * 4);
            else ctx.fillRect(posX, posY + p * 2, p * 3, p * 4);
        } else if (r === 2) {
            ctx.fillStyle = '#475569'; ctx.fillRect(posX, posY, p * 8, p * 8);
        }
    }

    /* CASTELO IMPONENTE (4x4) */
    else if (type.startsWith('castle_6x6_')) {
        const parts = type.split('_r')[1].split('c');
        const r = parseInt(parts[0]);
        const c = parseInt(parts[1]);

        ctx.fillStyle = '#475569';
        ctx.fillRect(posX, posY, p * 8, p * 8);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(posX, posY, p * 8, p * 8);

        if (r === 0 && (c === 0 || c === 3)) {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(posX + p * 2, posY + p * 1, p * 4, p * 3);
        } else if (r === 3 && (c === 1 || c === 2)) {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(posX + p * 1, posY + p * 2, p * 6, p * 6);
        }
    }

    /* UNIDADES MILITARES */
    else if (type.startsWith('soldier_')) {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();

        let col = '#22c55e';
        if (type === 'soldier_knight') col = '#38bdf8';
        if (type === 'soldier_pikeman') col = '#eab308';
        if (type === 'soldier_crossbowman') col = '#ef4444';

        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE / 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Renderização do Mapa Principal
function renderMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const chunk = getChunk(currentChunkX, currentChunkY);

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            drawTerrainTexture(chunk.terrain[y][x], x, y);
        }
    }

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            if (chunk.objects[y][x]) {
                drawObjectTexture(chunk.objects[y][x], x, y);
            }
            ctx.strokeStyle = 'rgba(30, 41, 59, 0.25)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    renderMinimap();
}

// Renderização do Minimapa
function renderMinimap() {
    miniCtx.fillStyle = '#020617';
    miniCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

    const miniSize = 20; // 5x5 grid no minimapa
    const center = 2;

    for (let my = -2; my <= 2; my++) {
        for (let mx = -2; mx <= 2; mx++) {
            const targetX = currentChunkX + mx;
            const targetY = currentChunkY + my;
            const key = `${targetX},${targetY}`;

            const drawX = (mx + center) * miniSize;
            const drawY = (my + center) * miniSize;

            if (mapChunks[key]) {
                miniCtx.fillStyle = '#1e293b';
                miniCtx.fillRect(drawX + 1, drawY + 1, miniSize - 2, miniSize - 2);
            }

            if (mx === 0 && my === 0) {
                miniCtx.strokeStyle = '#38bdf8';
                miniCtx.lineWidth = 2;
                miniCtx.strokeRect(drawX + 2, drawY + 2, miniSize - 4, miniSize - 4);
            }
        }
    }
}

// Mapeamento do Clique
function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor(((clientX - rect.left) * scaleX) / TILE_SIZE);
    const y = Math.floor(((clientY - rect.top) * scaleY) / TILE_SIZE);

    return { x, y };
}

// Pintar no Canvas
function paintTile(e) {
    const { x, y } = getCoordinates(e);

    if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
        const chunk = getChunk(currentChunkX, currentChunkY);

        if (TILE_COLORS[currentTile] && currentTile !== 'erase') {
            chunk.terrain[y][x] = currentTile;
            playSynthSound(300, 0.05, 'sine');
        } 
        else if (currentTile === 'erase') {
            if (chunk.objects[y][x]) chunk.objects[y][x] = null;
            else chunk.terrain[y][x] = 'grass';
            playSynthSound(150, 0.08, 'sawtooth');
        }
        else if (currentTile === 'castle_6x6' && x <= GRID_COLS - 4 && y <= GRID_ROWS - 4) {
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    chunk.objects[y + r][x + c] = `castle_6x6_r${r}c${c}`;
                }
            }
            playSynthSound(500, 0.15, 'square');
        }
        else if (currentTile === 'tower_2x3' && x <= GRID_COLS - 2 && y <= GRID_ROWS - 3) {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 2; c++) {
                    chunk.objects[y + r][x + c] = `tower_2x3_r${r}c${c}`;
                }
            }
            playSynthSound(450, 0.1, 'square');
        }
        else if (['house', 'gatehouse'].includes(currentTile) && x <= GRID_COLS - 2 && y <= GRID_ROWS - 2) {
            chunk.objects[y][x] = currentTile + '_tl';
            chunk.objects[y][x + 1] = currentTile + '_tr';
            chunk.objects[y + 1][x] = currentTile + '_bl';
            chunk.objects[y + 1][x + 1] = currentTile + '_br';
            playSynthSound(400, 0.1, 'square');
        }
        else if (['tree_taiga', 'tree', 'cactus', 'tree_savannah'].includes(currentTile) && y <= GRID_ROWS - 2) {
            chunk.objects[y][x] = currentTile + '_top';
            chunk.objects[y + 1][x] = currentTile + '_bottom';
            playSynthSound(350, 0.08, 'triangle');
        }
        else if (currentTile.startsWith('soldier_') || currentTile === 'wall_improved') {
            chunk.objects[y][x] = currentTile;
            playSynthSound(600, 0.05, 'triangle');
        }

        renderMap();
    }
}

// Eventos da Paleta
document.querySelectorAll('.tile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTile = btn.getAttribute('data-type');
        document.getElementById('activeTileName').innerText = btn.getAttribute('data-name');
        playSynthSound(700, 0.04, 'sine');
    });
});

// Eventos de Desenho no Canvas
canvas.addEventListener('mousedown', (e) => { isDrawing = true; paintTile(e); });
canvas.addEventListener('mousemove', (e) => { if (isDrawing) paintTile(e); });
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

canvas.addEventListener('touchstart', (e) => { isDrawing = true; paintTile(e); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { if (isDrawing) paintTile(e); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchend', () => isDrawing = false);

// Navegação do D-Pad
function changeChunk(dx, dy) {
    currentChunkX += dx;
    currentChunkY += dy;
    document.getElementById('chunkDisplay').innerText = `Setor (${currentChunkX}, ${currentChunkY})`;
    playSynthSound(250, 0.08, 'sine');
    renderMap();
}

document.getElementById('btnNavN').onclick = () => changeChunk(0, -1);
document.getElementById('btnNavS').onclick = () => changeChunk(0, 1);
document.getElementById('btnNavW').onclick = () => changeChunk(-1, 0);
document.getElementById('btnNavE').onclick = () => changeChunk(1, 0);
document.getElementById('btnNavReset').onclick = () => { currentChunkX = 0; currentChunkY = 0; changeChunk(0, 0); };

// Alternar Som
document.getElementById('btnSound').onclick = () => {
    soundEnabled = !soundEnabled;
    document.getElementById('soundStatus').innerText = soundEnabled ? 'LIGADO' : 'DESLIGADO';
};

// Modal Customizado
function showModal(title, message, onConfirm) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    const modal = document.getElementById('customModal');
    modal.classList.remove('hidden');

    document.getElementById('btnModalConfirm').onclick = () => {
        onConfirm();
        modal.classList.add('hidden');
    };
    document.getElementById('btnModalCancel').onclick = () => {
        modal.classList.add('hidden');
    };
}

document.getElementById('btnClearSector').onclick = () => {
    showModal("Limpar Setor", "Deseja apagar os dados do setor atual?", () => {
        mapChunks[`${currentChunkX},${currentChunkY}`] = {
            terrain: Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('grass')),
            objects: Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null))
        };
        renderMap();
    });
};

document.getElementById('btnClearWorld').onclick = () => {
    showModal("Resetar Mundo", "Deseja apagar TODO o mapa em todos os setores?", () => {
        for (let k in mapChunks) delete mapChunks[k];
        currentChunkX = 0;
        currentChunkY = 0;
        document.getElementById('chunkDisplay').innerText = `Setor (0, 0)`;
        renderMap();
    });
};

// Salvar / Carregar JSON e Exportar PNG
document.getElementById('btnExportPNG').onclick = () => {
    const link = document.createElement('a');
    link.download = `setor-rpg-(${currentChunkX},${currentChunkY}).png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
};

document.getElementById('btnSaveJSON').onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapChunks));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "mundo-rpg.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};

document.getElementById('fileInputJSON').onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedChunks = JSON.parse(event.target.result);
                for (let k in mapChunks) delete mapChunks[k];
                Object.assign(mapChunks, loadedChunks);
                renderMap();
            } catch (err) {
                alert("Erro ao ler o arquivo JSON.");
            }
        };
        reader.readAsText(file);
    }
};

renderMap();
