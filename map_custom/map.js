const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 12; // Grid de 12x12 blocos
const TILE_SIZE = canvas.width / GRID_SIZE;

let currentTile = 'grass';
let isDrawing = false;

// Cores Base dos Terrenos
const TILE_COLORS = {
    grass: '#16a34a',
    dirt: '#78350f',
    water: '#0284c7',
    stone: '#64748b',
    wall: '#334155',
    tree: '#16a34a', // Fundo da floresta é grama
    danger: '#7f1d1d',
    erase: '#0f172a'
};

// Matriz do Mapa
let mapGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('erase'));

// Configurar Seleção da Paleta
document.querySelectorAll('.tile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTile = btn.getAttribute('data-type');
    });
});

// Função para desenhar detalhes e texturas em Pixel Art
function drawTileTexture(type, x, y) {
    const posX = x * TILE_SIZE;
    const posY = y * TILE_SIZE;
    const p = TILE_SIZE / 8; // Unidade de sub-pixel (divisão 8x8 dentro do bloco)

    // 1. Fundo Base
    ctx.fillStyle = TILE_COLORS[type] || '#0f172a';
    ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

    // 2. Desenho das texturas detalhadas em Pixel Art
    if (type === 'grass') {
        // Lâminas de mato/grama escura
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 1, posY + p * 2, p, p * 2);
        ctx.fillRect(posX + p * 5, posY + p * 4, p, p * 2);
        ctx.fillRect(posX + p * 3, posY + p * 6, p, p);

        // Pontas de mato iluminadas (brilho)
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(posX + p * 1, posY + p * 1, p, p);
        ctx.fillRect(posX + p * 5, posY + p * 3, p, p);
        ctx.fillRect(posX + p * 6, posY + p * 6, p, p);
    } 
    else if (type === 'dirt') {
        // Pedrinhas e irregularidades na terra
        ctx.fillStyle = '#451a03';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 2, p);
        ctx.fillRect(posX + p * 5, posY + p * 5, p, p * 2);

        ctx.fillStyle = '#b45309';
        ctx.fillRect(posX + p * 6, posY + p * 1, p, p);
        ctx.fillRect(posX + p * 1, posY + p * 6, p, p);
    } 
    else if (type === 'water') {
        // Marolas e reflexos na água
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 3, p);
        ctx.fillRect(posX + p * 4, posY + p * 5, p * 3, p);

        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(posX + p * 2, posY + p * 3, p * 3, p);
    } 
    else if (type === 'stone') {
        // Ranhuras e rachaduras da pedra
        ctx.fillStyle = '#334155';
        ctx.fillRect(posX + p * 1, posY + p * 3, p * 6, p);
        ctx.fillRect(posX + p * 4, posY + p * 4, p, p * 3);

        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 2, p);
    } 
    else if (type === 'wall') {
        // Tijolos de masmorra
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(posX, posY + p * 3, TILE_SIZE, p);
        ctx.fillRect(posX, posY + p * 7, TILE_SIZE, p);
        ctx.fillRect(posX + p * 4, posY, p, p * 3);
        ctx.fillRect(posX + p * 2, posY + p * 4, p, p * 3);
    } 
    else if (type === 'tree') {
        // Tronco da árvore
        ctx.fillStyle = '#78350f';
        ctx.fillRect(posX + p * 3, posY + p * 5, p * 2, p * 3);

        // Copa de folhas da árvore
        ctx.fillStyle = '#14532d';
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 6, p * 5);

        // Folhas superiores mais claras
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 3, p * 2);
    } 
    else if (type === 'danger') {
        // Símbolo de Perigo / Caveira em Pixel Art
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 4, p * 3);
        ctx.fillRect(posX + p * 3, posY + p * 5, p * 2, p * 2);

        // Olhos da caveira
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(posX + p * 3, posY + p * 3, p, p);
        ctx.fillRect(posX + p * 4, posY + p * 3, p, p);
    }
}

// Renderiza o mapa completo com a grade
function renderMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            let tileType = mapGrid[y][x];

            // Desenha o bloco com textura
            drawTileTexture(tileType, x, y);

            // Desenha a linha sutil da grade
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

// Pinta o bloco selecionado
function paintTile(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor(((e.clientX - rect.left) * scaleX) / TILE_SIZE);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / TILE_SIZE);

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        mapGrid[y][x] = currentTile;
        renderMap();
    }
}

// Eventos de Mouse/Toque
canvas.addEventListener('mousedown', (e) => { isDrawing = true; paintTile(e); });
canvas.addEventListener('mousemove', (e) => { if (isDrawing) paintTile(e); });
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

// Suporte para Mobile/Touch
canvas.addEventListener('touchstart', (e) => { isDrawing = true; paintTile(e.touches[0]); e.preventDefault(); });
canvas.addEventListener('touchmove', (e) => { if (isDrawing) paintTile(e.touches[0]); e.preventDefault(); });
canvas.addEventListener('touchend', () => isDrawing = false);

// Limpar Mapa
function clearMap() {
    if (confirm("Deseja mesmo apagar todo o cenário?")) {
        mapGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('erase'));
        renderMap();
    }
}

// Exportar Imagem em PNG
function exportMap() {
    const link = document.createElement('a');
    link.download = 'meu-mapa-rpg.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Renderização Inicial
renderMap();
