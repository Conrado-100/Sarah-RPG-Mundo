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
    grass: '#16a34a', grass_detail: '#15803d', grass_highlight: '#4ade80',
    dirt: '#78350f', dirt_detail: '#451a03', dirt_highlight: '#b45309',
    water: '#0284c7', water_detail: '#1e3a8a', water_highlight: '#38bdf8',
    stone: '#64748b', stone_detail: '#334155', stone_highlight: '#94a3b8',
    sand: '#eab308', sand_detail: '#ca8a04', sand_highlight: '#facc15',
    savannah_grass: '#a16207', savannah_grass_detail: '#854d0e', savannah_grass_highlight: '#facc15',
    ice: '#bae6fd', ice_detail: '#ffffff', ice_highlight: '#e0f2fe',
    mountain_rock: '#475569', mountain_rock_detail: '#334155', mountain_rock_highlight: '#64748b',
    taiga: '#3f5e3d', taiga_detail: '#2d4a27', taiga_highlight: '#78350f',
    erase: '#0f172a'
};

// Matrizes Independentes de Duas Camadas: Terreno e Objetos
let terrainGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('grass'));
let objectGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));

// Seleção na Paleta
document.querySelectorAll('.tile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tile-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTile = btn.getAttribute('data-type');
    });
});

// Desenho da Camada de Terreno
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
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 3, p);
        ctx.fillRect(posX + p * 4, posY + p * 5, p * 3, p);
    } else if (type === 'stone') {
        ctx.fillStyle = TILE_COLORS.stone_detail;
        ctx.fillRect(posX + p * 1, posY + p * 3, p * 6, p);
    } else if (type === 'sand') {
        ctx.fillStyle = TILE_COLORS.sand_detail;
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 3, p);
        ctx.fillRect(posX + p * 4, posY + p * 6, p * 3, p);
    } else if (type === 'savannah_grass') {
        ctx.fillStyle = TILE_COLORS.savannah_grass_detail;
        ctx.fillRect(posX + p * 2, posY + p * 1, p, p * 2);
        ctx.fillRect(posX + p * 6, posY + p * 4, p, p * 3);
    } else if (type === 'ice') {
        ctx.fillStyle = TILE_COLORS.ice_highlight;
        ctx.fillRect(posX + p * 3, posY + p * 2, p, p);
    } else if (type === 'mountain_rock') {
        ctx.fillStyle = TILE_COLORS.mountain_rock_detail;
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 2, p * 3);
    } else if (type === 'taiga') {
        ctx.fillStyle = TILE_COLORS.taiga_highlight;
        ctx.fillRect(posX + p * 3, posY + p * 6, p, p);
    }
}

// Tronco Padrão
function drawTrunk(posX, posY, p) {
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(posX + p * 2, posY, p * 4, p * 8);
    ctx.fillStyle = '#3f2e21';
    ctx.fillRect(posX + p * 2, posY + p * 2, p * 3, p * 0.8);
    ctx.fillRect(posX + p * 3, posY + p * 4, p * 3, p * 0.8);
}

// Topo do Pinheiro
function drawPineTop(posX, posY, p, mainColor, highlightColor) {
    ctx.fillStyle = mainColor;
    ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 2);
    ctx.fillRect(posX + p * 2, posY + p * 3, p * 4, p * 2);
    ctx.fillRect(posX + p * 1, posY + p * 5, p * 6, p * 3);
    ctx.fillStyle = highlightColor;
    ctx.fillRect(posX + p * 3, posY + p * 2, p, p * 0.8);
    ctx.fillRect(posX + p * 2, posY + p * 4, p * 1.5, p * 0.8);
}

// Muralha 1x1
function drawImprovedWall(posX, posY, p) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(posX + p * 0.5, posY + p * 2, p * 7, p * 6);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(posX + p * 0.5, posY + p * 4, p * 7, p * 0.8);
    ctx.fillStyle = '#475569';
    ctx.fillRect(posX + p * 0.5, posY + p * 0.5, p * 2, p * 1.5);
    ctx.fillRect(posX + p * 3, posY + p * 0.5, p * 2, p * 1.5);
    ctx.fillRect(posX + p * 5.5, posY + p * 0.5, p * 2, p * 1.5);
}

// Desenho da Camada Superior (Objetos e Tropas)
function drawObjectTexture(type, x, y) {
    const posX = x * TILE_SIZE;
    const posY = y * TILE_SIZE;
    const p = TILE_SIZE / 8;

    /* --- VEGETAÇÃO 1x2 --- */
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
    else if (type === 'tree_savannah_bottom') {
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(posX + p * 3, posY, p * 2, p * 8);
    } 
    else if (type === 'tree_snow_top') drawPineTop(posX, posY, p, '#15803d', '#ffffff');
    else if (type === 'tree_snow_bottom') drawTrunk(posX, posY, p);

    /* --- MURALHA & PERIGO --- */
    else if (type === 'wall_improved') drawImprovedWall(posX, posY, p);
    else if (type === 'danger') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 4, p * 3);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(posX + p * 3, posY + p * 3, p, p);
        ctx.fillRect(posX + p * 4, posY + p * 3, p, p);
    }

    /* --- CASA 2x2 --- */
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

    /* --- NOVA TORRE DE PEDRA (2 LARGURA x 3 ALTURA) --- */
    else if (type.startsWith('tower_2x3_')) {
        const parts = type.split('_r')[1].split('c');
        const r = parseInt(parts[0]);
        const c = parseInt(parts[1]);

        // Row 0: Topo alargado com Ameias (Crenellations)
        if (r === 0) {
            ctx.fillStyle = '#64748b';
            ctx.fillRect(posX, posY + p * 3, p * 8, p * 5); 
            ctx.fillStyle = '#334155';
            ctx.fillRect(posX, posY + p * 7, p * 8, p); 

            ctx.fillStyle = '#94a3b8';
            if (c === 0) {
                ctx.fillRect(posX, posY + p * 1, p * 2.5, p * 2);
                ctx.fillRect(posX + p * 4, posY + p * 1, p * 2.5, p * 2);
            } else {
                ctx.fillRect(posX + p * 1.5, posY + p * 1, p * 2.5, p * 2);
                ctx.fillRect(posX + p * 5.5, posY + p * 1, p * 2.5, p * 2);
            }
        }
        // Row 1: Corpo vertical com Janela Arqueada
        else if (r === 1) {
            ctx.fillStyle = '#64748b';
            ctx.fillRect(posX + p * 1, posY, p * 6, p * 8); 
            
            ctx.fillStyle = '#334155';
            ctx.fillRect(posX + p * 1, posY + p * 2, p * 6, p * 0.8);
            ctx.fillRect(posX + p * 1, posY + p * 5, p * 6, p * 0.8);

            // Janela no Centro entre as duas colunas
            if (c === 0) {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(posX + p * 4.5, posY + p * 3, p * 2.5, p * 3.5);
                ctx.fillStyle = '#e2e8f0'; 
                ctx.fillRect(posX + p * 4, posY + p * 3, p * 0.5, p * 4);
            } else {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(posX, posY + p * 3, p * 2.5, p * 3.5);
                ctx.fillStyle = '#e2e8f0';
                ctx.fillRect(posX + p * 2.5, posY + p * 3, p * 0.5, p * 4);
            }
        }
        // Row 2: Base alargada (Pedestal)
        else if (r === 2) {
            ctx.fillStyle = '#64748b';
            ctx.fillRect(posX + p * 1, posY, p * 6, p * 3);
            ctx.fillRect(posX, posY + p * 3, p * 8, p * 5); 
            
            ctx.fillStyle = '#334155';
            ctx.fillRect(posX, posY + p * 3, p * 8, p * 0.8);
            ctx.fillRect(posX, posY + p * 7, p * 8, p);
        }
    }

    /* --- PORTÃO DA MURALHA (2x2) --- */
    else if (type === 'gatehouse_tl' || type === 'gatehouse_tr') drawImprovedWall(posX, posY, p);
    else if (type === 'gatehouse_bl') {
        ctx.fillStyle = '#334155'; ctx.fillRect(posX + p * 1, posY, p * 7, p * 8);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(posX + p * 5, posY, p * 3, p * 8);
    }
    else if (type === 'gatehouse_br') {
        ctx.fillStyle = '#334155'; ctx.fillRect(posX, posY, p * 7, p * 8);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(posX, posY, p * 3, p * 8);
        ctx.fillStyle = '#78350f'; ctx.fillRect(posX, posY + p * 2, p * 3, p * 6);
    }

    /* --- CASTELO MEDIEVAL REDESENHADO (6x6) --- */
    else if (type.startsWith('castle_6x6_')) {
        const parts = type.split('_r')[1].split('c');
        const r = parseInt(parts[0]);
        const c = parseInt(parts[1]);

        const isLeftTower = (c === 0 || c === 1);
        const isRightTower = (c === 4 || c === 5);
        const isCenterWall = (c === 2 || c === 3);

        // Row 0: Bandeiras e Topo dos Telhados Cônicos
        if (r === 0) {
            if (isLeftTower) {
                if (c === 0) {
                    ctx.fillStyle = '#334155'; ctx.fillRect(posX + p * 6, posY + p * 1, p * 0.8, p * 7);
                    ctx.fillStyle = '#dc2626'; ctx.fillRect(posX + p * 1, posY + p * 2, p * 5, p * 3);
                } else {
                    ctx.fillStyle = '#1e293b';
                    ctx.beginPath(); ctx.moveTo(posX, posY + p * 8); ctx.lineTo(posX + p * 2, posY + p * 5); ctx.lineTo(posX + p * 4, posY + p * 8); ctx.fill();
                }
            } else if (isRightTower) {
                if (c === 4) {
                    ctx.fillStyle = '#1e293b';
                    ctx.beginPath(); ctx.moveTo(posX + p * 4, posY + p * 8); ctx.lineTo(posX + p * 6, posY + p * 5); ctx.lineTo(posX + p * 8, posY + p * 8); ctx.fill();
                } else {
                    ctx.fillStyle = '#334155'; ctx.fillRect(posX + p * 2, posY + p * 1, p * 0.8, p * 7);
                    ctx.fillStyle = '#dc2626'; ctx.fillRect(posX + p * 2.8, posY + p * 2, p * 5, p * 3);
                }
            }
        }
        // Row 1: Telhados Cônicos Escuros
        else if (r === 1) {
            if (isLeftTower || isRightTower) {
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(posX, posY, p * 8, p * 8);
                ctx.fillStyle = '#334155';
                ctx.fillRect(posX + p * 2, posY + p * 2, p * 4, p * 4);
            }
        }
        // Row 2: Borda das Torres e Ameias da Muralha Central
        else if (r === 2) {
            if (isLeftTower || isRightTower) {
                ctx.fillStyle = '#64748b'; ctx.fillRect(posX, posY, p * 8, p * 8);
                ctx.fillStyle = '#334155'; ctx.fillRect(posX, posY + p * 7, p * 8, p);
            } else if (isCenterWall) {
                ctx.fillStyle = '#64748b'; ctx.fillRect(posX, posY + p * 3, p * 8, p * 5);
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(posX + p * 1, posY + p * 1, p * 2.5, p * 2);
                ctx.fillRect(posX + p * 4.5, posY + p * 1, p * 2.5, p * 2);
            }
        }
        // Row 3: Corpo Principal das Torres e Muralha com Janelas Arqueadas
        else if (r === 3) {
            ctx.fillStyle = '#64748b'; ctx.fillRect(posX, posY, p * 8, p * 8);
            ctx.fillStyle = '#475569'; ctx.fillRect(posX, posY + p * 4, p * 8, p * 0.8);

            if (c === 0 || c === 5) {
                ctx.fillStyle = '#0f172a'; ctx.fillRect(posX + p * 3, posY + p * 2, p * 2.5, p * 4);
            } else if (c === 2 || c === 3) {
                ctx.fillStyle = '#0f172a'; ctx.fillRect(posX + p * 2.5, posY + p * 2, p * 3, p * 4.5);
            }
        }
        // Row 4: Parte Inferior da Alvenaria e Arco do Portão
        else if (r === 4) {
            ctx.fillStyle = '#64748b'; ctx.fillRect(posX, posY, p * 8, p * 8);
            ctx.fillStyle = '#475569'; ctx.fillRect(posX, posY + p * 3, p * 8, p * 0.8);

            if (c === 2) {
                ctx.fillStyle = '#78350f'; ctx.fillRect(posX + p * 3, posY + p * 4, p * 5, p * 4);
                ctx.fillStyle = '#451a03'; ctx.fillRect(posX + p * 3, posY + p * 4, p * 5, p * 0.8);
            } else if (c === 3) {
                ctx.fillStyle = '#78350f'; ctx.fillRect(posX, posY + p * 4, p * 5, p * 4);
                ctx.fillStyle = '#451a03'; ctx.fillRect(posX, posY + p * 4, p * 5, p * 0.8);
            }
        }
        // Row 5: Grande Portão Arqueado de Madeira com Detalhes de Ferro
        else if (r === 5) {
            ctx.fillStyle = '#64748b'; ctx.fillRect(posX, posY, p * 8, p * 8);

            if (c === 2) {
                ctx.fillStyle = '#78350f'; ctx.fillRect(posX + p * 3, posY, p * 5, p * 8);
                ctx.fillStyle = '#0f172a'; ctx.fillRect(posX + p * 3, posY + p * 3, p * 5, p * 0.8);
                ctx.fillRect(posX + p * 7, posY, p * 1, p * 8);
            } else if (c === 3) {
                ctx.fillStyle = '#78350f'; ctx.fillRect(posX, posY, p * 5, p * 8);
                ctx.fillStyle = '#0f172a'; ctx.fillRect(posX, posY + p * 3, p * 5, p * 0.8);
                ctx.fillStyle = '#facc15'; ctx.fillRect(posX + p * 1.5, posY + p * 4, p, p * 1.5);
            }
        }
    }

    /* --- UNIDADES MILITARES --- */
    else if (type.startsWith('soldier_')) {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();

        if (type === 'soldier_archer') {
            ctx.fillStyle = '#22c55e';
            ctx.beginPath(); ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE / 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#a16207'; ctx.fillRect(posX + p * 2, posY + p * 5, p * 1, p * 2);
        }
        else if (type === 'soldier_knight') {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath(); ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE / 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#94a3b8'; ctx.fillRect(posX + p * 5.5, posY + p * 1.5, p * 1, p * 5);
        }
        else if (type === 'soldier_pikeman') {
            ctx.fillStyle = '#ca8a04';
            ctx.beginPath(); ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE / 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#78350f'; ctx.fillRect(posX + p * 5, posY + p * 1, p * 1, p * 6);
        }
        else if (type === 'soldier_crossbowman') {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.arc(posX + TILE_SIZE / 2, posY + TILE_SIZE / 2, TILE_SIZE / 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#a16207'; ctx.fillRect(posX + p * 2, posY + p * 4, p * 4, p * 1.5);
        }
    }
}

// Renderizar o Mapa Completo
function renderMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            drawTerrainTexture(terrainGrid[y][x], x, y);
        }
    }

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            if (objectGrid[y][x]) {
                drawObjectTexture(objectGrid[y][x], x, y);
            }
            ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

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

function paintTile(e) {
    const { x, y } = getCoordinates(e);

    if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
        if (TILE_COLORS[currentTile] && currentTile !== 'erase') {
            terrainGrid[y][x] = currentTile;
        } 
        else if (currentTile === 'erase') {
            if (objectGrid[y][x]) objectGrid[y][x] = null;
            else terrainGrid[y][x] = 'grass';
        }
        else if (currentTile === 'castle_6x6') {
            if (x < GRID_COLS - 5 && y < GRID_ROWS - 5) {
                for (let r = 0; r < 6; r++) {
                    for (let c = 0; c < 6; c++) {
                        objectGrid[y + r][x + c] = `castle_6x6_r${r}c${c}`;
                    }
                }
            }
        }
        // TORRE 2x3 (2 Colunas por 3 Linhas)
        else if (currentTile === 'tower_2x3') {
            if (x < GRID_COLS - 1 && y < GRID_ROWS - 2) {
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 2; c++) {
                        objectGrid[y + r][x + c] = `tower_2x3_r${r}c${c}`;
                    }
                }
            }
        }
        else if (['house', 'gatehouse'].includes(currentTile)) {
            if (x < GRID_COLS - 1 && y < GRID_ROWS - 1) {
                objectGrid[y][x] = currentTile + '_tl';
                objectGrid[y][x + 1] = currentTile + '_tr';
                objectGrid[y + 1][x] = currentTile + '_bl';
                objectGrid[y + 1][x + 1] = currentTile + '_br';
            }
        }
        else if (['tree_taiga', 'tree', 'cactus', 'tree_savannah', 'tree_snow'].includes(currentTile)) {
            if (y < GRID_ROWS - 1) {
                objectGrid[y][x] = currentTile + '_top';
                objectGrid[y + 1][x] = currentTile + '_bottom';
            }
        }
        else {
            objectGrid[y][x] = currentTile;
        }

        renderMap();
    }
}

canvas.addEventListener('mousedown', (e) => { isDrawing = true; paintTile(e); });
canvas.addEventListener('mousemove', (e) => { if (isDrawing) paintTile(e); });
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

canvas.addEventListener('touchstart', (e) => { isDrawing = true; paintTile(e); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { if (isDrawing) paintTile(e); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchend', () => isDrawing = false);

function clearMap() {
    if (confirm("Deseja apagar todo o cenário?")) {
        terrainGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('grass'));
        objectGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
        renderMap();
    }
}

function exportMap() {
    const link = document.createElement('a');
    link.download = 'cenario-rpg.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

renderMap();
