const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Grade expansível para telas de celular (12 colunas x 24 linhas)
const GRID_COLS = 12;
const GRID_ROWS = 24;
const TILE_SIZE = canvas.width / GRID_COLS; // 40px por bloco

let currentTile = 'grass';
let isDrawing = false;

// Cores Base dos Terrenos
const TILE_COLORS = {
    grass: '#16a34a',
    dirt: '#78350f',
    water: '#0284c7',
    stone: '#64748b',
    wall: '#334155',
    tree: '#16a34a',
    danger: '#7f1d1d',
    erase: '#0f172a',
    // Partes da Casa Humana 2x2
    house_tl: '#b91c1c', // Telhado esquerdo
    house_tr: '#b91c1c', // Telhado direito + chaminé
    house_bl: '#fef08a', // Parede + janela
    house_br: '#fef08a'  // Parede + porta de madeira
};

// Matriz do Mapa (12x24)
let mapGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('erase'));

// Configurar Seleção da Paleta
document.querySelectorAll('.tile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTile = btn.getAttribute('data-type');
    });
});

// Desenho de Texturas e Pixel Art
function drawTileTexture(type, x, y) {
    const posX = x * TILE_SIZE;
    const posY = y * TILE_SIZE;
    const p = TILE_SIZE / 8; // Sub-pixel (5px)

    // Fundo Base
    ctx.fillStyle = TILE_COLORS[type] || '#0f172a';
    ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

    if (type === 'grass') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 1, posY + p * 2, p, p * 2);
        ctx.fillRect(posX + p * 5, posY + p * 4, p, p * 2);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(posX + p * 1, posY + p * 1, p, p);
        ctx.fillRect(posX + p * 5, posY + p * 3, p, p);
    } 
    else if (type === 'dirt') {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 2, p);
        ctx.fillRect(posX + p * 5, posY + p * 5, p, p * 2);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(posX + p * 6, posY + p * 1, p, p);
    } 
    else if (type === 'water') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 3, p);
        ctx.fillRect(posX + p * 4, posY + p * 5, p * 3, p);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(posX + p * 2, posY + p * 3, p * 3, p);
    } 
    else if (type === 'stone') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(posX + p * 1, posY + p * 3, p * 6, p);
        ctx.fillRect(posX + p * 4, posY + p * 4, p, p * 3);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 2, p);
    } 
    else if (type === 'wall') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(posX, posY + p * 3, TILE_SIZE, p);
        ctx.fillRect(posX, posY + p * 7, TILE_SIZE, p);
        ctx.fillRect(posX + p * 4, posY, p, p * 3);
    } 
    else if (type === 'tree') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(posX + p * 3, posY + p * 5, p * 2, p * 3);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 6, p * 5);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 3, p * 2);
    } 
    else if (type === 'danger') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 4, p * 3);
        ctx.fillRect(posX + p * 3, posY + p * 5, p * 2, p * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(posX + p * 3, posY + p * 3, p, p);
        ctx.fillRect(posX + p * 4, posY + p * 3, p, p);
    }

    /* --- CASA HUMANA 2x2 --- */
    else if (type === 'house_tl') {
        // Telhado superior esquerdo
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 6, p * 6);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(posX + p * 2, posY + p * 6, p * 6, p * 2); // Sombra das telhas
    } 
    else if (type === 'house_tr') {
        // Telhado superior direito + Chaminé
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(posX, posY + p * 2, p * 6, p * 6);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(posX, posY + p * 6, p * 6, p * 2);
        // Chaminé de tijolo com fumaça
        ctx.fillStyle = '#475569';
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 3);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(posX + p * 4, posY, p, p); // Fumaça
    } 
    else if (type === 'house_bl') {
        // Parede inferior esquerda + Janela
        ctx.fillStyle = '#475569'; // Rodapé de pedra
        ctx.fillRect(posX + p * 2, posY + p * 6, p * 6, p * 2);
        // Janela de vidro iluminada
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(posX + p * 4, posY + p * 2, p * 3, p * 3);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(posX + p * 5, posY + p * 2, p, p * 3); // Armação da janela
    } 
    else if (type === 'house_br') {
        // Parede inferior direita + Porta de Madeira
        ctx.fillStyle = '#475569';
        ctx.fillRect(posX, posY + p * 6, p * 6, p * 2);
        // Porta de madeira com maçaneta dourada
        ctx.fillStyle = '#78350f';
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 3, p * 6);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(posX + p * 3, posY + p * 4, p, p); // Maçaneta
    }
}

// Renderização Geral
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

// Pintura inteligente (Lógica para objetos de 2x2 blocos)
function paintTile(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor(((e.clientX - rect.left) * scaleX) / TILE_SIZE);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / TILE_SIZE);

    if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
        if (currentTile === 'house') {
            // Garante que a casa não saia da borda do mapa
            if (x < GRID_COLS - 1 && y < GRID_ROWS - 1) {
                mapGrid[y][x] = 'house_tl';
                mapGrid[y][x + 1] = 'house_tr';
                mapGrid[y + 1][x] = 'house_bl';
                mapGrid[y + 1][x + 1] = 'house_br';
            }
        } else {
            mapGrid[y][x] = currentTile;
        }
        renderMap();
    }
}

// Controles de Mouse e Touch
canvas.addEventListener('mousedown', (e) => { isDrawing = true; paintTile(e); });
canvas.addEventListener('mousemove', (e) => { if (isDrawing) paintTile(e); });
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

canvas.addEventListener('touchstart', (e) => { isDrawing = true; paintTile(e.touches[0]); e.preventDefault(); });
canvas.addEventListener('touchmove', (e) => { if (isDrawing) paintTile(e.touches[0]); e.preventDefault(); });
canvas.addEventListener('touchend', () => isDrawing = false);

function clearMap() {
    if (confirm("Deseja mesmo apagar todo o cenário?")) {
        mapGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('erase'));
        renderMap();
    }
}

function exportMap() {
    const link = document.createElement('a');
    link.download = 'cenario-rpg-mobile.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

renderMap();
