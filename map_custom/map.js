const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

const GRID_COLS = 12;
const GRID_ROWS = 24;

canvas.width = 480;
canvas.height = 960;

const TILE_SIZE = canvas.width / GRID_COLS; // 40px por bloco

let currentTile = 'grass';
let isDrawing = false;

// Cores base do terreno
const TILE_COLORS = {
    grass: '#16a34a',
    dirt: '#78350f',
    water: '#0284c7',
    stone: '#64748b',
    wall: '#334155',
    sand: '#eab308',
    savannah_grass: '#a16207',
    ice: '#bae6fd',
    mountain_rock: '#475569',
    danger: '#7f1d1d',
    erase: '#0f172a',

    // Objetos 1x2 e 2x2 (fundo transparente/padrão)
    tree_top: '#15803d', tree_bottom: '#15803d',
    cactus_top: '#16a34a', cactus_bottom: '#16a34a',
    tree_savannah_top: '#ca8a04', tree_savannah_bottom: '#a16207',
    tree_snow_top: '#064e3b', tree_snow_bottom: '#064e3b',
    tree_mountain_top: '#0f766e', tree_mountain_bottom: '#0f766e',
    house_tl: '#991b1b', house_tr: '#991b1b', house_bl: '#fef08a', house_br: '#fef08a'
};

// Matriz de 24 linhas por 12 colunas
let mapGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('erase'));

// Eventos de clique na paleta
document.querySelectorAll('.tile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTile = btn.getAttribute('data-type');
    });
});

// Desenha Texturas e Pixel Art detalhado
function drawTileTexture(type, x, y) {
    const posX = x * TILE_SIZE;
    const posY = y * TILE_SIZE;
    const p = TILE_SIZE / 8; // Sub-pixel (5px)

    ctx.fillStyle = TILE_COLORS[type] || '#0f172a';
    ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

    /* --- TERRENOS BASE --- */
    if (type === 'grass') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 1, posY + p * 2, p, p * 2);
        ctx.fillRect(posX + p * 5, posY + p * 4, p, p * 2);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(posX + p * 1, posY + p * 1, p, p);
    } 
    else if (type === 'dirt') {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 2, p);
        ctx.fillRect(posX + p * 5, posY + p * 5, p, p * 2);
    } 
    else if (type === 'water') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 3, p);
        ctx.fillRect(posX + p * 4, posY + p * 5, p * 3, p);
    } 
    else if (type === 'stone') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(posX + p * 1, posY + p * 3, p * 6, p);
    } 
    else if (type === 'wall') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(posX, posY + p * 3, TILE_SIZE, p);
        ctx.fillRect(posX, posY + p * 7, TILE_SIZE, p);
    } 
    else if (type === 'sand') { // Deserto
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 3, p);
        ctx.fillRect(posX + p * 4, posY + p * 6, p * 3, p);
    } 
    else if (type === 'savannah_grass') { // Savana
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(posX + p * 2, posY + p * 1, p, p * 2);
        ctx.fillRect(posX + p * 6, posY + p * 4, p, p * 3);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(posX + p * 2, posY + p * 1, p, p);
    } 
    else if (type === 'ice') { // Gelo / Neve
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 2, p);
        ctx.fillRect(posX + p * 5, posY + p * 5, p * 2, p);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(posX + p * 3, posY + p * 2, p, p);
    } 
    else if (type === 'mountain_rock') { // Rocha Montanhosa
        ctx.fillStyle = '#334155';
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 2, p * 3);
        ctx.fillRect(posX + p * 4, posY + p * 4, p * 3, p * 2);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(posX + p * 2, posY + p * 1, p, p);
    }
    else if (type === 'danger') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 4, p * 3);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(posX + p * 3, posY + p * 3, p, p);
        ctx.fillRect(posX + p * 4, posY + p * 3, p, p);
    }

    /* --- VEGETAÇÃO 1x2 (2 BLOCOS DE ALTURA) --- */

    // 1. Árvore Normal (1x2)
    else if (type === 'tree_top') {
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 6, p * 7);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 2, p * 2);
    } 
    else if (type === 'tree_bottom') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 1, posY, p * 6, p * 3);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(posX + p * 3, posY + p * 2, p * 2, p * 6); // Tronco
    }

    // 2. Cacto do Deserto (1x2)
    else if (type === 'cactus_top') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 7); // Hastes principal
        ctx.fillRect(posX + p * 1, posY + p * 3, p * 2, p * 3); // Braço esquerdo
        ctx.fillRect(posX + p * 1, posY + p * 3, p, p * 1);
        ctx.fillStyle = '#fef08a'; // Espinhos
        ctx.fillRect(posX + p * 3, posY + p * 2, p, p);
    } 
    else if (type === 'cactus_bottom') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 3, posY, p * 2, p * 8); // Haste principal
        ctx.fillRect(posX + p * 5, posY + p * 1, p * 2, p * 3); // Braço direito
        ctx.fillStyle = '#451a03'; // Chão/Sombra
        ctx.fillRect(posX + p * 2, posY + p * 7, p * 4, p);
    }

    // 3. Acácia de Savana (1x2)
    else if (type === 'tree_savannah_top') {
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(posX, posY + p * 2, p * 8, p * 4); // Copa achatada larga
        ctx.fillStyle = '#facc15';
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 3, p);
    } 
    else if (type === 'tree_savannah_bottom') {
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(posX + p * 1, posY, p * 6, p * 2);
        ctx.fillStyle = '#78350f'; // Tronco curvado
        ctx.fillRect(posX + p * 2, posY + p * 1, p, p * 3);
        ctx.fillRect(posX + p * 3, posY + p * 3, p * 2, p * 5);
    }

    // 4. Pinheiro de Gelo / Neve (1x2)
    else if (type === 'tree_snow_top') {
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 4, p * 6);
        ctx.fillStyle = '#ffffff'; // Neve no topo
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 2);
        ctx.fillRect(posX + p * 2, posY + p * 4, p * 4, p);
    } 
    else if (type === 'tree_snow_bottom') {
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(posX + p * 1, posY, p * 6, p * 5);
        ctx.fillStyle = '#ffffff'; // Neve na base da copa
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 6, p);
        ctx.fillStyle = '#451a03'; // Tronco
        ctx.fillRect(posX + p * 3, posY + p * 5, p * 2, p * 3);
    }

    // 5. Pinheiro de Montanha Escuro (1x2)
    else if (type === 'tree_mountain_top') {
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 7);
        ctx.fillRect(posX + p * 2, posY + p * 4, p * 4, p * 4);
    } 
    else if (type === 'tree_mountain_bottom') {
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(posX + p * 1, posY, p * 6, p * 5);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(posX + p * 3, posY + p * 4, p * 2, p * 4);
    }

    /* --- CASA 2x2 --- */
    else if (type === 'house_tl') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 7, p * 6);
    } 
    else if (type === 'house_tr') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(posX, posY + p * 2, p * 7, p * 6);
        ctx.fillStyle = '#475569';
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 3);
    } 
    else if (type === 'house_bl') {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(posX + p * 1, posY, p * 7, p * 8);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(posX + p * 3, posY + p * 2, p * 3, p * 3);
    } 
    else if (type === 'house_br') {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(posX, posY, p * 7, p * 8);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 3, p * 6);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(posX + p * 4, posY + p * 5, p, p);
    }
}

// Renderiza o mapa
function renderMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            drawTileTexture(mapGrid[y][x], x, y);

            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

// Posição do Toque/Clique
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

// Pintura Inteligente (Suporta 1x1, 1x2 e 2x2)
function paintTile(e) {
    const { x, y } = getCoordinates(e);

    if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
        // Objetos 2x2
        if (currentTile === 'house') {
            if (x < GRID_COLS - 1 && y < GRID_ROWS - 1) {
                mapGrid[y][x] = 'house_tl';
                mapGrid[y][x + 1] = 'house_tr';
                mapGrid[y + 1][x] = 'house_bl';
                mapGrid[y + 1][x + 1] = 'house_br';
            }
        } 
        // Objetos 1x2 (Vegetações e Cacto de 2 blocos de altura)
        else if (['tree', 'cactus', 'tree_savannah', 'tree_snow', 'tree_mountain'].includes(currentTile)) {
            if (y < GRID_ROWS - 1) {
                mapGrid[y][x] = currentTile + '_top';
                mapGrid[y + 1][x] = currentTile + '_bottom';
            }
        } 
        // Terrenos e Objetos 1x1
        else {
            mapGrid[y][x] = currentTile;
        }
        renderMap();
    }
}

// Eventos Mouse
canvas.addEventListener('mousedown', (e) => { isDrawing = true; paintTile(e); });
canvas.addEventListener('mousemove', (e) => { if (isDrawing) paintTile(e); });
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

// Eventos Touch
canvas.addEventListener('touchstart', (e) => { isDrawing = true; paintTile(e); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { if (isDrawing) paintTile(e); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchend', () => isDrawing = false);

function clearMap() {
    if (confirm("Deseja mesmo apagar todo o cenário?")) {
        mapGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('erase'));
        renderMap();
    }
}

function exportMap() {
    const link = document.createElement('a');
    link.download = 'cenario-rpg-biomas.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

renderMap();
