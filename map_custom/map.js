const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

const GRID_COLS = 12;
const GRID_ROWS = 24;

// Força a resolução interna do Canvas para 480x960
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
    tree: '#16a34a',
    danger: '#7f1d1d',
    erase: '#0f172a',
    // Peças da Casa
    house_tl: '#991b1b',
    house_tr: '#991b1b',
    house_bl: '#fef08a',
    house_br: '#fef08a'
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

// Desenhar Texturas e Pixel Art
function drawTileTexture(type, x, y) {
    const posX = x * TILE_SIZE;
    const posY = y * TILE_SIZE;
    const p = TILE_SIZE / 8; // Tamanho do sub-pixel (5px)

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
    /* --- ESTRUTURA DA CASA 2x2 --- */
    else if (type === 'house_tl') { // Telhado Esquerdo
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 7, p * 6);
    } 
    else if (type === 'house_tr') { // Telhado Direito + Chaminé
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(posX, posY + p * 2, p * 7, p * 6);
        ctx.fillStyle = '#475569';
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 3); // Chaminé
    } 
    else if (type === 'house_bl') { // Parede Esquerda + Janela
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(posX + p * 1, posY, p * 7, p * 8);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(posX + p * 3, posY + p * 2, p * 3, p * 3); // Janela
    } 
    else if (type === 'house_br') { // Parede Direita + Porta
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(posX, posY, p * 7, p * 8);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 3, p * 6); // Porta
        ctx.fillStyle = '#facc15';
        ctx.fillRect(posX + p * 4, posY + p * 5, p, p); // Maçaneta
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

// Calcula as coordenadas exatas do toque ou do clique
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

// Lógica de pintura
function paintTile(e) {
    const { x, y } = getCoordinates(e);

    if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
        if (currentTile === 'house') {
            // Pinta os 4 blocos da casa se houver espaço 2x2
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

// Eventos do Mouse
canvas.addEventListener('mousedown', (e) => { isDrawing = true; paintTile(e); });
canvas.addEventListener('mousemove', (e) => { if (isDrawing) paintTile(e); });
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

// Eventos de Toque (Celular)
canvas.addEventListener('touchstart', (e) => { isDrawing = true; paintTile(e); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { if (isDrawing) paintTile(e); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchend', () => isDrawing = false);

// Limpar Mapa
function clearMap() {
    if (confirm("Deseja mesmo apagar todo o cenário?")) {
        mapGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('erase'));
        renderMap();
    }
}

// Exportar Imagem PNG
function exportMap() {
    const link = document.createElement('a');
    link.download = 'meu-mapa-rpg.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

renderMap();
