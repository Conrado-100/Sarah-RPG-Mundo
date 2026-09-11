const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

const GRID_COLS = 12;
const GRID_ROWS = 24;

canvas.width = 480;
canvas.height = 960;

const TILE_SIZE = canvas.width / GRID_COLS; // 40px por bloco

let currentTile = 'grass';
let isDrawing = false;

// Cores base dos Terrenos
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
    taiga: '#3f5e3d', // Solo escuro com tom de agulhas de pinheiro
    danger: '#7f1d1d',
    erase: '#0f172a',

    // Blocos de apoio para Objetos 1x2 e 2x2
    tree_taiga_top: '#0f172a', tree_taiga_bottom: '#0f172a',
    tree_top: '#0f172a', tree_bottom: '#0f172a',
    cactus_top: '#0f172a', cactus_bottom: '#0f172a',
    tree_savannah_top: '#0f172a', tree_savannah_bottom: '#0f172a',
    tree_snow_top: '#0f172a', tree_snow_bottom: '#0f172a',
    house_tl: '#991b1b', house_tr: '#991b1b', house_bl: '#fef08a', house_br: '#fef08a'
};

// Matriz 12x24
let mapGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('erase'));

// Eventos de clique na paleta
document.querySelectorAll('.tile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTile = btn.getAttribute('data-type');
    });
});

// Função para desenhar o tronco padrão (Estilo da referência do usuário)
function drawTrunk(posX, posY, p) {
    // Tronco marrom centralizado
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(posX + p * 2, posY, p * 4, p * 8);
    
    // Ranhuras pretas horizontais da casca
    ctx.fillStyle = '#3f2e21';
    ctx.fillRect(posX + p * 2, posY + p * 2, p * 3, p * 0.8);
    ctx.fillRect(posX + p * 3, posY + p * 4, p * 3, p * 0.8);
    ctx.fillRect(posX + p * 2, posY + p * 6, p * 3, p * 0.8);
}

// Desenhar Texturas e Pixel Art detalhado
function drawTileTexture(type, x, y) {
    const posX = x * TILE_SIZE;
    const posY = y * TILE_SIZE;
    const p = TILE_SIZE / 8; // 5px por sub-pixel

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
    } 
    else if (type === 'ice') { // Gelo
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 2, p);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(posX + p * 3, posY + p * 2, p, p);
    } 
    else if (type === 'mountain_rock') { // Rocha
        ctx.fillStyle = '#334155';
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 2, p * 3);
    }
    else if (type === 'taiga') { // Terreno da Taiga (Solo escuro com folhas secas)
        ctx.fillStyle = '#2d4a27';
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 2, p);
        ctx.fillRect(posX + p * 5, posY + p * 4, p * 2, p);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(posX + p * 3, posY + p * 6, p, p);
    }
    else if (type === 'danger') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 4, p * 3);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(posX + p * 3, posY + p * 3, p, p);
        ctx.fillRect(posX + p * 4, posY + p * 3, p, p);
    }

    /* --- VEGETAÇÃO 1x2 (ESTILO ILUSTRAÇÃO) --- */

    // 1. PINHEIRO DE TAIGA (Inspirado no desenho enviado)
    else if (type === 'tree_taiga_top') {
        // Camada 1 (Topo)
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 2);
        // Camada 2 (Meio)
        ctx.fillRect(posX + p * 2, posY + p * 3, p * 4, p * 2);
        // Camada 3 (Base da copa)
        ctx.fillRect(posX + p * 1, posY + p * 5, p * 6, p * 3);

        // Detalhes / Brilhos (Linhas claras idênticas ao desenho)
        ctx.fillStyle = '#86efac';
        ctx.fillRect(posX + p * 3, posY + p * 2, p, p * 0.8);
        ctx.fillRect(posX + p * 2, posY + p * 4, p * 1.5, p * 0.8);
        ctx.fillRect(posX + p * 2, posY + p * 6, p * 2, p * 0.8);
    } 
    else if (type === 'tree_taiga_bottom') {
        drawTrunk(posX, posY, p);
    }

    // 2. ÁRVORE COMUM DE FLORESTA (1x2)
    else if (type === 'tree_top') {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 6, p * 7);
        ctx.fillStyle = '#86efac';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 2, p * 2);
    } 
    else if (type === 'tree_bottom') {
        drawTrunk(posX, posY, p);
    }

    // 3. CACTO DO DESERTO (1x2)
    else if (type === 'cactus_top') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 7); // Corpo principal
        ctx.fillRect(posX + p * 1, posY + p * 3, p * 2, p * 3); // Braço esquerdo
        ctx.fillRect(posX + p * 1, posY + p * 3, p, p * 1);
        ctx.fillStyle = '#fef08a'; // Espinhos
        ctx.fillRect(posX + p * 3, posY + p * 2, p * 0.8, p * 0.8);
    } 
    else if (type === 'cactus_bottom') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 3, posY, p * 2, p * 8); // Corpo inferior
        ctx.fillRect(posX + p * 5, posY + p * 1, p * 2, p * 3); // Braço direito
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(posX + p * 4, posY + p * 4, p * 0.8, p * 0.8);
    }

    // 4. ACÁCIA DE SAVANA (1x2)
    else if (type === 'tree_savannah_top') {
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(posX, posY + p * 3, p * 8, p * 4); // Copa larga plana
        ctx.fillStyle = '#facc15';
        ctx.fillRect(posX + p * 1, posY + p * 3, p * 3, p);
    } 
    else if (type === 'tree_savannah_bottom') {
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(posX + p * 3, posY, p * 2, p * 8); // Tronco
    }

    // 5. PINHEIRO DE NEVE (1x2)
    else if (type === 'tree_snow_top') {
        // Pinheiro com neve em cima de cada camada
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 3, posY + p * 2, p * 2, p * 2);
        ctx.fillRect(posX + p * 2, posY + p * 4, p * 4, p * 2);
        ctx.fillRect(posX + p * 1, posY + p * 6, p * 6, p * 2);
        // Neve
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p);
        ctx.fillRect(posX + p * 2, posY + p * 4, p * 4, p * 0.8);
    } 
    else if (type === 'tree_snow_bottom') {
        drawTrunk(posX, posY, p);
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

// Renderiza o mapa completo
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

// Posição de Toque/Clique
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

// Pintura Inteligente (Pinta 1x1, 1x2 e 2x2 sem erros)
function paintTile(e) {
    const { x, y } = getCoordinates(e);

    if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
        // Objetos 2x2 (Casa)
        if (currentTile === 'house') {
            if (x < GRID_COLS - 1 && y < GRID_ROWS - 1) {
                mapGrid[y][x] = 'house_tl';
                mapGrid[y][x + 1] = 'house_tr';
                mapGrid[y + 1][x] = 'house_bl';
                mapGrid[y + 1][x + 1] = 'house_br';
            }
        } 
        // Objetos 1x2 (Vegetações e Cacto de 2 blocos de altura)
        else if (['tree_taiga', 'tree', 'cactus', 'tree_savannah', 'tree_snow'].includes(currentTile)) {
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

// Eventos de Mouse
canvas.addEventListener('mousedown', (e) => { isDrawing = true; paintTile(e); });
canvas.addEventListener('mousemove', (e) => { if (isDrawing) paintTile(e); });
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

// Eventos de Touch (Celular)
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
    link.download = 'cenario-rpg-taiga.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

renderMap();
