const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Ajuste fixo de resolução para Celular (12 colunas por 24 linhas)
const GRID_COLS = 12;
const GRID_ROWS = 24;

// Força o Canvas a ter o tamanho proporcional correto
canvas.width = 480;
canvas.height = 960;

const TILE_SIZE = canvas.width / GRID_COLS; // 40px por bloco

let currentTile = 'grass';
let isDrawing = false;

// Cores de fundo e peças
const TILE_COLORS = {
    grass: '#16a34a',
    dirt: '#78350f',
    water: '#0284c7',
    stone: '#64748b',
    wall: '#334155',
    tree: '#16a34a',
    danger: '#7f1d1d',
    erase: '#0f172a',
    house_tl: '#b91c1c',
    house_tr: '#b91c1c',
    house_bl: '#fef08a',
    house_br: '#fef08a'
};

// Matriz do Mapa inicializada com 24 linhas reais
let mapGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('erase'));

// Configurar botões da paleta
document.querySelectorAll('.tile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTile = btn.getAttribute('data-type');
    });
});

// Desenha a textura de cada bloco
function drawTileTexture(type, x, y) {
    const posX = x * TILE_SIZE;
    const posY = y * TILE_SIZE;
    const p = TILE_SIZE / 8;

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
        ctx.fillStyle = '#b45309';
        ctx.fillRect(posX + p * 5, posY + p * 5, p, p);
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
    else if (type === 'tree') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(posX + p * 3, posY + p * 5, p * 2, p * 3);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 6, p * 5);
    } 
    else if (type === 'danger') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 4, p * 3);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(posX + p * 3, posY + p * 3, p, p);
        ctx.fillRect(posX + p * 4, posY + p * 3, p, p);
    }
    // ESTRUTURA DA CASA (2x2)
    else if (type === 'house_tl') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 6, p * 6);
    } 
    else if (type === 'house_tr') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(posX, posY + p * 2, p * 6, p * 6);
        ctx.fillStyle = '#475569';
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 2); // Chaminé
    } 
    else if (type === 'house_bl') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(posX + p * 3, posY + p * 2, p * 3, p * 3); // Janela
    } 
    else if (type === 'house_br') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 3, p * 6); // Porta
    }
}

// Renderiza a grade completa
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

// Lógica de pintura sem erros de limite
function paintTile(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (!clientX || !clientY) return;

    const x = Math.floor(((clientX - rect.left) * scaleX) / TILE_SIZE);
    const y = Math.floor(((clientY - rect.top) * scaleY) / TILE_SIZE);

    if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
        if (currentTile === 'house') {
            // Garante que a casa só pinta se houver espaço 2x2 no mapa
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

// Eventos de Mouse
canvas.addEventListener('mousedown', (e) => { isDrawing = true; paintTile(e); });
canvas.addEventListener('mousemove', (e) => { if (isDrawing) paintTile(e); });
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

// Eventos de Touch (Celular)
canvas.addEventListener('touchstart', (e) => { isDrawing = true; paintTile(e); e.preventDefault(); });
canvas.addEventListener('touchmove', (e) => { if (isDrawing) paintTile(e); e.preventDefault(); });
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
