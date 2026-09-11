
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 12; // Grid de 12x12 blocos
const TILE_SIZE = canvas.width / GRID_SIZE;

let currentTile = 'grass';
let isDrawing = false;

// Cores dos Terrenos
const TILE_COLORS = {
    grass: '#22c55e',
    dirt: '#78350f',
    water: '#0284c7',
    stone: '#64748b',
    wall: '#334155',
    tree: '#15803d',
    danger: '#ef4444',
    erase: '#0f172a'
};

// Matriz do Mapa
let mapGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('erase'));

// Configurar Seleção da Paleta
document.querySelectorAll('.tile-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTile = btn.getAttribute('data-type');
    });
});

// Desenha a grelha e os blocos
function renderMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            let tileType = mapGrid[y][x];
            let posX = x * TILE_SIZE;
            let posY = y * TILE_SIZE;

            // Preenche a cor do terreno
            ctx.fillStyle = TILE_COLORS[tileType];
            ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

            // Linha da grade (grid)
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.strokeRect(posX, posY, TILE_SIZE, TILE_SIZE);
        }
    }
}

// Pinta a célula selecionada
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

// Eventos de Mouse/Toque para desenhar arrastando
canvas.addEventListener('mousedown', (e) => { isDrawing = true; paintTile(e); });
canvas.addEventListener('mousemove', (e) => { if (isDrawing) paintTile(e); });
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

// Suporte para Telas de Celular (Touch)
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

// Baixar o Mapa como Imagem (PNG)
function exportMap() {
    const link = document.createElement('a');
    link.download = 'meu-mapa-rpg.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Renderização Inicial
renderMap();
