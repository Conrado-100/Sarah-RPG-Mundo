const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

const GRID_COLS = 12;
const GRID_ROWS = 24;

canvas.width = 480;
canvas.height = 960;

const TILE_SIZE = canvas.width / GRID_COLS; // 40px por bloco

let currentTile = 'grass';
let isDrawing = false;

// Cores base dos Terrenos e detalhes
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
    castle_courtyard: '#64748b', castle_courtyard_detail: '#334155', // Chão do castelo (pedra)
    danger: '#7f1d1d',
    erase: '#0f172a',

    // Cores de Apoio para Unidades Militares
    unit_background: '#0f172a',
    unit_outline: '#1e293b',
    unit_archer: '#22c55e',
    unit_knight: '#38bdf8',
    unit_pikeman: '#ca8a04',
    unit_crossbowman: '#ef4444',
    unit_bow_wood: '#a16207',
    unit_steel: '#94a3b8',
    unit_pike_wood: '#78350f'
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

// Função para desenhar o topo de um pinheiro em camadas (Taiga/Neve)
function drawPineTop(posX, posY, p, mainColor, highlightColor) {
    // Camada 1 (Topo)
    ctx.fillStyle = mainColor;
    ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 2);
    // Camada 2 (Meio)
    ctx.fillRect(posX + p * 2, posY + p * 3, p * 4, p * 2);
    // Camada 3 (Base da copa)
    ctx.fillRect(posX + p * 1, posY + p * 5, p * 6, p * 3);

    // Detalhes / Brilhos (Linhas claras idênticas ao desenho)
    ctx.fillStyle = highlightColor;
    ctx.fillRect(posX + p * 3, posY + p * 2, p, p * 0.8);
    ctx.fillRect(posX + p * 2, posY + p * 4, p * 1.5, p * 0.8);
    ctx.fillRect(posX + p * 2, posY + p * 6, p * 2, p * 0.8);
}

// Função para desenhar uma muralha clássica com ameias (1x1 melhorada)
function drawImprovedWall(posX, posY, p) {
    // Base da muralha (pedra escura)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(posX + p * 1, posY + p * 2, p * 6, p * 6);
    
    // Ranhuras de pedra horizontais
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(posX + p * 1, posY + p * 4, p * 6, p * 0.8);
    ctx.fillRect(posX + p * 1, posY + p * 6, p * 6, p * 0.8);

    // Ameias (Topo com dentes)
    ctx.fillStyle = '#334155';
    ctx.fillRect(posX + p * 1, posY + p * 1, p * 1.5, p * 1.5);
    ctx.fillRect(posX + p * 3.25, posY + p * 1, p * 1.5, p * 1.5);
    ctx.fillRect(posX + p * 5.5, posY + p * 1, p * 1.5, p * 1.5);
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
        ctx.fillStyle = TILE_COLORS.grass_detail;
        ctx.fillRect(posX + p * 1, posY + p * 2, p, p * 2);
        ctx.fillRect(posX + p * 5, posY + p * 4, p, p * 2);
        ctx.fillStyle = TILE_COLORS.grass_highlight;
        ctx.fillRect(posX + p * 1, posY + p * 1, p, p);
    } 
    else if (type === 'dirt') {
        ctx.fillStyle = TILE_COLORS.dirt_detail;
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 2, p);
        ctx.fillRect(posX + p * 5, posY + p * 5, p, p * 2);
    } 
    else if (type === 'water') {
        ctx.fillStyle = TILE_COLORS.water_highlight;
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 3, p);
        ctx.fillRect(posX + p * 4, posY + p * 5, p * 3, p);
    } 
    else if (type === 'stone') {
        ctx.fillStyle = TILE_COLORS.stone_detail;
        ctx.fillRect(posX + p * 1, posY + p * 3, p * 6, p);
    } 
    else if (type === 'sand') { // Deserto
        ctx.fillStyle = TILE_COLORS.sand_detail;
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 3, p);
        ctx.fillRect(posX + p * 4, posY + p * 6, p * 3, p);
    } 
    else if (type === 'savannah_grass') { // Savana
        ctx.fillStyle = TILE_COLORS.savannah_grass_detail;
        ctx.fillRect(posX + p * 2, posY + p * 1, p, p * 2);
        ctx.fillRect(posX + p * 6, posY + p * 4, p, p * 3);
    } 
    else if (type === 'ice') { // Gelo
        ctx.fillStyle = TILE_COLORS.ice_highlight;
        ctx.fillRect(posX + p * 3, posY + p * 2, p, p);
    } 
    else if (type === 'mountain_rock') { // Rocha
        ctx.fillStyle = TILE_COLORS.mountain_rock_detail;
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 2, p * 3);
    }
    else if (type === 'taiga') { // Terreno da Taiga (Solo escuro com folhas secas)
        ctx.fillStyle = TILE_COLORS.taiga_highlight;
        ctx.fillRect(posX + p * 3, posY + p * 6, p, p);
    }
    else if (type === 'castle_courtyard') { // Chão do castelo (Pedra)
        ctx.fillStyle = TILE_COLORS.castle_courtyard_detail;
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 6, p * 6);
    }
    else if (type === 'wall_improved') {
        drawImprovedWall(posX, posY, p);
    }
    else if (type === 'danger') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 4, p * 3);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(posX + p * 3, posY + p * 3, p, p);
        ctx.fillRect(posX + p * 4, posY + p * 3, p, p);
    }

    /* --- VEGETAÇÃO 1x2 (COM TERRENO DE FUNDO CORRETO) --- */

    // 1. PINHEIRO DE TAIGA (Inspirado no desenho enviado)
    else if (type === 'tree_taiga_top') {
        // TERRENO DE FUNDO: Taiga
        ctx.fillStyle = TILE_COLORS.taiga;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = TILE_COLORS.taiga_highlight;
        ctx.fillRect(posX + p * 3, posY + p * 6, p, p);

        // Árvore
        drawPineTop(posX, posY, p, '#15803d', '#86efac');
    } 
    else if (type === 'tree_taiga_bottom') {
        // TERRENO DE FUNDO: Taiga
        ctx.fillStyle = TILE_COLORS.taiga;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = TILE_COLORS.taiga_highlight;
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 2, p);

        // Tronco
        drawTrunk(posX, posY, p);
    }

    // 2. ÁRVORE COMUM DE FLORESTA (1x2)
    else if (type === 'tree_top') {
        // TERRENO DE FUNDO: Grama
        ctx.fillStyle = TILE_COLORS.grass;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = TILE_COLORS.grass_highlight;
        ctx.fillRect(posX + p * 1, posY + p * 1, p, p);

        // Árvore
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(posX + p * 1, posY + p * 1, p * 6, p * 7);
        ctx.fillStyle = '#86efac';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 2, p * 2);
    } 
    else if (type === 'tree_bottom') {
        // TERRENO DE FUNDO: Grama
        ctx.fillStyle = TILE_COLORS.grass;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = TILE_COLORS.grass_detail;
        ctx.fillRect(posX + p * 5, posY + p * 4, p, p * 2);

        // Tronco
        drawTrunk(posX, posY, p);
    }

    // 3. CACTO DO DESERTO (1x2)
    else if (type === 'cactus_top') {
        // TERRENO DE FUNDO: Areia
        ctx.fillStyle = TILE_COLORS.sand;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = TILE_COLORS.sand_detail;
        ctx.fillRect(posX + p * 4, posY + p * 6, p * 3, p);

        // Cacto
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 7); // Corpo principal
        ctx.fillRect(posX + p * 1, posY + p * 3, p * 2, p * 3); // Braço esquerdo
        ctx.fillStyle = '#fef08a'; // Espinhos
        ctx.fillRect(posX + p * 3, posY + p * 2, p * 0.8, p * 0.8);
    } 
    else if (type === 'cactus_bottom') {
        // TERRENO DE FUNDO: Areia
        ctx.fillStyle = TILE_COLORS.sand;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = TILE_COLORS.sand_detail;
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 3, p);

        // Cacto
        ctx.fillStyle = '#15803d';
        ctx.fillRect(posX + p * 3, posY, p * 2, p * 8); // Corpo inferior
        ctx.fillRect(posX + p * 5, posY + p * 1, p * 2, p * 3); // Braço direito
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(posX + p * 4, posY + p * 4, p * 0.8, p * 0.8);
    }

    // 4. ACÁCIA DE SAVANA (1x2)
    else if (type === 'tree_savannah_top') {
        // TERRENO DE FUNDO: Savana
        ctx.fillStyle = TILE_COLORS.savannah_grass;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = TILE_COLORS.savannah_grass_detail;
        ctx.fillRect(posX + p * 2, posY + p * 1, p, p * 2);

        // Árvore
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(posX, posY + p * 3, p * 8, p * 4); // Copa larga plana
        ctx.fillStyle = '#facc15';
        ctx.fillRect(posX + p * 1, posY + p * 3, p * 3, p);
    } 
    else if (type === 'tree_savannah_bottom') {
        // TERRENO DE FUNDO: Savana
        ctx.fillStyle = TILE_COLORS.savannah_grass;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = TILE_COLORS.savannah_grass_detail;
        ctx.fillRect(posX + p * 6, posY + p * 4, p, p * 3);

        // Tronco
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(posX + p * 3, posY, p * 2, p * 8); // Tronco
    }

    // 5. PINHEIRO DE NEVE (1x2)
    else if (type === 'tree_snow_top') {
        // TERRENO DE FUNDO: Gelo
        ctx.fillStyle = TILE_COLORS.ice;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = TILE_COLORS.ice_highlight;
        ctx.fillRect(posX + p * 3, posY + p * 2, p, p);

        // Pinheiro com neve
        drawPineTop(posX, posY, p, '#15803d', '#ffffff');
    } 
    else if (type === 'tree_snow_bottom') {
        // TERRENO DE FUNDO: Gelo
        ctx.fillStyle = TILE_COLORS.ice;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = TILE_COLORS.ice_detail;
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 2, p);

        // Tronco
        drawTrunk(posX, posY, p);
    }

    /* --- ESTRUTURAS & MORADIAS (FUNDO: CHÃO DE PEDRA DO CASTELO) --- */

    // 1. CASA COMUM 2x2
    else if (type === 'house_tl') {
        // TERRENO DE FUNDO: Chão de pedra
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        
        // Telhado Esquerdo
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 7, p * 6);
    } 
    else if (type === 'house_tr') {
        // TERRENO DE FUNDO: Chão de pedra
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

        // Telhado Direito + Chaminé
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(posX, posY + p * 2, p * 7, p * 6);
        ctx.fillStyle = '#475569';
        ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 3);
    } 
    else if (type === 'house_bl') {
        // TERRENO DE FUNDO: Chão de pedra
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

        // Parede Esquerda + Janela
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(posX + p * 1, posY, p * 7, p * 8);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(posX + p * 3, posY + p * 2, p * 3, p * 3);
    } 
    else if (type === 'house_br') {
        // TERRENO DE FUNDO: Chão de pedra
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

        // Parede Direita + Porta
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(posX, posY, p * 7, p * 8);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(posX + p * 2, posY + p * 2, p * 3, p * 6);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(posX + p * 4, posY + p * 5, p, p);
    }

    // 2. TORRE MILITAR (2x2)
    else if (type === 'tower_tl') {
        // TERRENO DE FUNDO: Pedra
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

        // Topo Esquerdo da Torre (ameias)
        ctx.fillStyle = '#1e293b'; // Base da ameia
        ctx.fillRect(posX + p * 1, posY + p * 2, p * 7, p * 6);
        ctx.fillStyle = '#334155'; // Dente da ameia
        ctx.fillRect(posX + p * 2, posY + p * 1, p * 2, p * 2);
    }
    else if (type === 'tower_tr') {
        // TERRENO DE FUNDO: Pedra
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

        // Topo Direito da Torre (ameias)
        ctx.fillStyle = '#1e293b'; 
        ctx.fillRect(posX, posY + p * 2, p * 7, p * 6);
        ctx.fillStyle = '#334155'; // Dente
        ctx.fillRect(posX + p * 4, posY + p * 1, p * 2, p * 2);
    }
    else if (type === 'tower_bl') {
        // TERRENO DE FUNDO: Pedra
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

        // Base Esquerda + Janela
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(posX + p * 1, posY, p * 7, p * 8);
        ctx.fillStyle = TILE_COLORS.water_detail; // Janela estreita
        ctx.fillRect(posX + p * 4, posY + p * 3, p * 2, p * 3);
    }
    else if (type === 'tower_br') {
        // TERRENO DE FUNDO: Pedra
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

        // Base Direita + Janela
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(posX, posY, p * 7, p * 8);
        ctx.fillStyle = TILE_COLORS.water_detail; // Janela estreita
        ctx.fillRect(posX + p * 2, posY + p * 3, p * 2, p * 3);
    }

    // 3. PORTÃO DA MURALHA (Gatehouse) (2x2)
    else if (type === 'gatehouse_tl') {
        // TERRENO DE FUNDO: Pedra
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

        // Muralha superior esquerda melhorada (AMEIAS)
        drawImprovedWall(posX, posY, p);
    }
    else if (type === 'gatehouse_tr') {
        // TERRENO DE FUNDO: Pedra
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

        // Muralha superior direita melhorada (AMEIAS)
        drawImprovedWall(posX, posY, p);
    }
    else if (type === 'gatehouse_bl') {
        // TERRENO DE FUNDO: Pedra
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

        // Parede Esquerda + Início do Arco do Portão
        ctx.fillStyle = '#334155'; // Muralha escura
        ctx.fillRect(posX + p * 1, posY, p * 7, p * 8);
        ctx.fillStyle = '#1e293b'; // Borda do arco
        ctx.fillRect(posX + p * 5, posY, p * 3, p * 8);
    }
    else if (type === 'gatehouse_br') {
        // TERRENO DE FUNDO: Pedra
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

        // Parede Direita + Fim do Arco
        ctx.fillStyle = '#334155'; // Muralha escura
        ctx.fillRect(posX, posY, p * 7, p * 8);
        ctx.fillStyle = '#1e293b'; // Borda do arco
        ctx.fillRect(posX, posY, p * 3, p * 8);
        
        // Ponte Levadiça/Porta de Madeira
        ctx.fillStyle = '#78350f'; // Madeira
        ctx.fillRect(posX, posY + p * 2, p * 3, p * 6);
        ctx.fillStyle = TILE_COLORS.danger; // Ferragens
        ctx.fillRect(posX + p * 1, posY + p * 3, p, p * 4);
    }

    /* --- CASTELO GRANDE ÚNICO (6x6) --- */
    else if (type.startsWith('castle_p')) {
        const pNum = type.split('_p')[1];
        const row = parseInt(pNum[0]);
        const col = parseInt(pNum[1]);

        // TERRENO DE FUNDO: Chão de pedra do pátio
        ctx.fillStyle = TILE_COLORS.castle_courtyard;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

        // Modelo de castelo único 6x6 (Brute Force):
        // P00-P01/P10-P11: Torre Canto Superior Esquerdo
        // P02-P03/P12-P13: Muralha Superior Central Melhorada (Ameias)
        // P04-P05/P14-P15: Torre Canto Superior Direito
        // P20-P21/P30-P31: Torre Canto Inferior Esquerdo
        // P22-P23/P32-P33: Fortaleza Central Grande (Telhado Vermelho, Torre Central, Janelas)
        // P24-P25/P34-P35: Torre Canto Inferior Direito
        // P40-P41/P50-P51: Muralha Inferior Esquerda Melhorada (Ameias)
        // P42-P43/P52-P53: Portão Grande da Frente Melhorado (Arco e Madeira)
        // P44-P45/P52-P53: Muralha Inferior Direita Melhorada (Ameias)

        // Lógica de desenho para cada quadrante 1x1:

        // 1. TORRES DE CANTO (Usando desenho de 2x2 para torres):
        // Torre Canto Superior Esquerdo (TLT)
        if (row < 2 && col < 2) {
            if (row===0 && col===0) drawImprovedWall(posX, posY, p); // Ameia Esquerda
            if (row===0 && col===1) drawImprovedWall(posX, posY, p); // Ameia Direita
            if (row===1 && col===0) { ctx.fillStyle = '#94a3b8'; ctx.fillRect(posX + p * 1, posY, p * 7, p * 8); ctx.fillStyle = TILE_COLORS.water_detail; ctx.fillRect(posX + p * 4, posY + p * 3, p * 2, p * 3); } // Base Esquerda + Janela
            if (row===1 && col===1) { ctx.fillStyle = '#94a3b8'; ctx.fillRect(posX, posY, p * 7, p * 8); ctx.fillStyle = TILE_COLORS.water_detail; ctx.fillRect(posX + p * 2, posY + p * 3, p * 2, p * 3); } // Base Direita + Janela
        }
        // Torre Canto Superior Direito (TRT)
        else if (row < 2 && col >= 4) {
            const colIdx = col-4;
            if (row===0 && colIdx===0) drawImprovedWall(posX, posY, p); 
            if (row===0 && colIdx===1) drawImprovedWall(posX, posY, p);
            if (row===1 && colIdx===0) { ctx.fillStyle = '#94a3b8'; ctx.fillRect(posX + p * 1, posY, p * 7, p * 8); ctx.fillStyle = TILE_COLORS.water_detail; ctx.fillRect(posX + p * 4, posY + p * 3, p * 2, p * 3); }
            if (row===1 && colIdx===1) { ctx.fillStyle = '#94a3b8'; ctx.fillRect(posX, posY, p * 7, p * 8); ctx.fillStyle = TILE_COLORS.water_detail; ctx.fillRect(posX + p * 2, posY + p * 3, p * 2, p * 3); }
        }
        // Torre Canto Inferior Esquerdo (BLT)
        else if (row >= 2 && row < 4 && col < 2) {
            const rowIdx = row-2;
            if (rowIdx===0 && col===0) drawImprovedWall(posX, posY, p);
            if (rowIdx===0 && col===1) drawImprovedWall(posX, posY, p);
            if (rowIdx===1 && col===0) { ctx.fillStyle = '#94a3b8'; ctx.fillRect(posX + p * 1, posY, p * 7, p * 8); ctx.fillStyle = TILE_COLORS.water_detail; ctx.fillRect(posX + p * 4, posY + p * 3, p * 2, p * 3); }
            if (rowIdx===1 && col===1) { ctx.fillStyle = '#94a3b8'; ctx.fillRect(posX, posY, p * 7, p * 8); ctx.fillStyle = TILE_COLORS.water_detail; ctx.fillRect(posX + p * 2, posY + p * 3, p * 2, p * 3); }
        }
        // Torre Canto Inferior Direito (BRT)
        else if (row >= 2 && row < 4 && col >= 4) {
            const rowIdx = row-2;
            const colIdx = col-4;
            if (rowIdx===0 && colIdx===0) drawImprovedWall(posX, posY, p);
            if (rowIdx===0 && colIdx===1) drawImprovedWall(posX, posY, p);
            if (rowIdx===1 && colIdx===0) { ctx.fillStyle = '#94a3b8'; ctx.fillRect(posX + p * 1, posY, p * 7, p * 8); ctx.fillStyle = TILE_COLORS.water_detail; ctx.fillRect(posX + p * 4, posY + p * 3, p * 2, p * 3); }
            if (rowIdx===1 && colIdx===1) { ctx.fillStyle = '#94a3b8'; ctx.fillRect(posX, posY, p * 7, p * 8); ctx.fillStyle = TILE_COLORS.water_detail; ctx.fillRect(posX + p * 2, posY + p * 3, p * 2, p * 3); }
        }

        // 2. MURALHAS MELHORADAS (Usando desenho de muralha 1x1):
        else if ( (row < 2 && col >= 2 && col < 4) || (row >= 4 && col < 2) || (row >= 4 && col >= 4) ) {
            drawImprovedWall(posX, posY, p);
        }

        // 3. FORTALEZA CENTRAL GRANDE (Keep) (4 quadrantes 2x2):
        else if (row >= 2 && row < 4 && col >= 2 && col < 4) {
            const rowIdx = row-2;
            const colIdx = col-2;
            // Quadrante Superior Esquerdo da Fortaleza
            if (rowIdx===0 && colIdx===0) { ctx.fillStyle = TILE_COLORS.danger; ctx.fillRect(posX + p * 1, posY + p * 2, p * 7, p * 6); } // Telhado Vermelho
            // Quadrante Superior Direito da Fortaleza (Torre Central Fortificada)
            if (rowIdx===0 && colIdx===1) { ctx.fillStyle = TILE_COLORS.danger; ctx.fillRect(posX, posY + p * 2, p * 7, p * 6); ctx.fillStyle = '#475569'; ctx.fillRect(posX + p * 3, posY + p * 1, p * 2, p * 3); } // Telhado + Chaminé
            // Quadrante Inferior Esquerdo da Fortaleza + Janela
            if (rowIdx===1 && colIdx===0) { ctx.fillStyle = '#fef08a'; ctx.fillRect(posX + p * 1, posY, p * 7, p * 8); ctx.fillStyle = '#0284c7'; ctx.fillRect(posX + p * 3, posY + p * 2, p * 3, p * 3); } // Parede + Janela
            // Quadrante Inferior Direito da Fortaleza + Porta de Madeira
            if (rowIdx===1 && colIdx===1) { ctx.fillStyle = '#fef08a'; ctx.fillRect(posX, posY, p * 7, p * 8); ctx.fillStyle = '#78350f'; ctx.fillRect(posX + p * 2, posY + p * 2, p * 3, p * 6); ctx.fillStyle = '#facc15'; ctx.fillRect(posX + p * 4, posY + p * 5, p, p); } // Parede + Porta
        }

        // 4. PORTÃO GRANDE DA FRENTE (Gatehouse) (Usando desenho de 2x2 portão):
        else if (row >= 4 && col >= 2 && col < 4) {
            const rowIdx = row-4;
            const colIdx = col-2;
            if (rowIdx===0 && colIdx===0) drawImprovedWall(posX, posY, p); // Muralha superior esquerda (Ameia)
            if (rowIdx===0 && colIdx===1) drawImprovedWall(posX, posY, p); // Muralha superior direita (Ameia)
            if (rowIdx===1 && colIdx===0) { ctx.fillStyle = '#334155'; ctx.fillRect(posX + p * 1, posY, p * 7, p * 8); ctx.fillStyle = '#1e293b'; ctx.fillRect(posX + p * 5, posY, p * 3, p * 8); } // Parede Esquerda + Início do Arco
            if (rowIdx===1 && colIdx===1) { ctx.fillStyle = '#334155'; ctx.fillRect(posX, posY, p * 7, p * 8); ctx.fillStyle = '#1e293b'; ctx.fillRect(posX, posY, p * 3, p * 8); ctx.fillStyle = '#78350f'; ctx.fillRect(posX, posY + p * 2, p * 3, p * 6); ctx.fillStyle = TILE_COLORS.danger; ctx.fillRect(posX + p * 1, posY + p * 3, p, p * 4); } // Parede Direita + Fim do Arco + Madeira
        }
    }

    /* --- UNIDADES MILITARES (1x1) (COM FUNDO DE GRAMA) --- */
    else if (type.startsWith('soldier_')) {
        // TERRENO DE FUNDO: Grama
        ctx.fillStyle = TILE_COLORS.grass;
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = TILE_COLORS.grass_detail;
        ctx.fillRect(posX + p * 1, posY + p * 1, p, p * 2);

        // Corpo da Unidade (Círculo padrão)
        ctx.fillStyle = TILE_COLORS.erase;
        ctx.beginPath();
        ctx.arc(posX + TILE_SIZE/2, posY + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = TILE_COLORS.erase;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Armamento (Símbolos minimalistas idênticos à ilustração)
        if (type === 'soldier_archer') {
            // Túnica Verde
            ctx.fillStyle = TILE_COLORS.unit_archer;
            ctx.beginPath(); ctx.arc(posX + TILE_SIZE/2, posY + TILE_SIZE/2, TILE_SIZE/4, 0, Math.PI*2); ctx.fill();
            // Arco de madeira minimalista
            ctx.fillStyle = TILE_COLORS.unit_bow_wood;
            ctx.fillRect(posX + p*2, posY + p*5, p*0.8, p*2); // Arco curvado
            ctx.fillRect(posX + p*2, posY + p*5, p*1, p*0.8);
            ctx.fillStyle = TILE_COLORS.danger; // Ponta de flecha
            ctx.fillRect(posX + p*6, posY + p*2, p, p);
        }
        else if (type === 'soldier_knight') {
            // Armadura de Aço Minimalista
            ctx.fillStyle = TILE_COLORS.erase;
            ctx.fillStyle = TILE_COLORS.unit_knight;
            ctx.beginPath(); ctx.arc(posX + TILE_SIZE/2, posY + TILE_SIZE/2, TILE_SIZE/4, 0, Math.PI*2); ctx.fill();
            // Escudo de aço minimalista
            ctx.fillStyle = TILE_COLORS.unit_knight;
            ctx.fillRect(posX + p*2.5, posY + p*2.5, p*3, p*4);
            ctx.fillStyle = TILE_COLORS.unit_archer; // Detalhe verde no escudo
            ctx.fillRect(posX + p*3.5, posY + p*3.5, p*1, p*1);
            // Espada de aço minimalista
            ctx.fillStyle = TILE_COLORS.unit_knight;
            ctx.fillRect(posX + p*5.5, posY + p*1.5, p*0.8, p*5);
        }
        else if (type === 'soldier_pikeman') {
            // Túnica Seca Minimalista
            ctx.fillStyle = TILE_COLORS.erase;
            ctx.fillStyle = TILE_COLORS.unit_pikeman;
            ctx.beginPath(); ctx.arc(posX + TILE_SIZE/2, posY + TILE_SIZE/2, TILE_SIZE/4, 0, Math.PI*2); ctx.fill();
            // Pique de madeira longo minimalista
            ctx.fillStyle = TILE_COLORS.unit_bow_wood;
            ctx.fillRect(posX + p*5, posY + p*1, p*1, p*6);
            ctx.fillStyle = TILE_COLORS.erase; // Ponta de aço minimalista
            ctx.fillRect(posX + p*5, posY + p*0.8, p, p);
        }
        else if (type === 'soldier_crossbowman') {
            // Túnica Vermelha Minimalista
            ctx.fillStyle = TILE_COLORS.erase;
            ctx.fillStyle = TILE_COLORS.unit_crossbowman;
            ctx.beginPath(); ctx.arc(posX + TILE_SIZE/2, posY + TILE_SIZE/2, TILE_SIZE/4, 0, Math.PI*2); ctx.fill();
            // Besteiro de madeira minimalista
            ctx.fillStyle = TILE_COLORS.unit_bow_wood;
            ctx.fillRect(posX + p*2, posY + p*4, p*4, p*1.5);
            ctx.fillRect(posX + p*3.5, posY + p*3.5, p*1, p*1);
            ctx.fillStyle = TILE_COLORS.danger; // Ponta de virote minimalista
            ctx.fillRect(posX + p*6.5, posY + p*3.5, p, p);
        }
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

// Pintura Inteligente (Suporta 1x1, 1x2, 2x2 e 6x6 sem erros de limite)
function paintTile(e) {
    const { x, y } = getCoordinates(e);

    if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
        // Objetos 6x6 (CASTELO GRANDE ÚNICO)
        if (currentTile === 'castle_6x6') {
            // Pinta os 36 blocos do castelo se houver espaço 6x6
            if (x < GRID_COLS - 5 && y < GRID_ROWS - 5) {
                for (let row = 0; row < 6; row++) {
                    for (let col = 0; col < 6; col++) {
                        mapGrid[y + row][x + col] = `castle_p${row}${col}`;
                    }
                }
            }
        } 
        // Objetos 2x2 (Casa, Torre, Portão)
        else if (['house', 'tower', 'gatehouse'].includes(currentTile)) {
            // Garante que o objeto só pinta se houver espaço 2x2 no mapa
            if (x < GRID_COLS - 1 && y < GRID_ROWS - 1) {
                mapGrid[y][x] = currentTile + '_tl';
                mapGrid[y][x + 1] = currentTile + '_tr';
                mapGrid[y + 1][x] = currentTile + '_bl';
                mapGrid[y + 1][x + 1] = currentTile + '_br';
            }
        } 
        // Objetos 1x2 (Vegetações e Cacto de 2 blocos de altura)
        else if (['tree_taiga', 'tree', 'cactus', 'tree_savannah', 'tree_snow'].includes(currentTile)) {
            if (y < GRID_ROWS - 1) {
                mapGrid[y][x] = currentTile + '_top';
                mapGrid[y + 1][x] = currentTile + '_bottom';
            }
        } 
        // Terrenos 1x1, Muralha e Unidades
        else {
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

function clearMap() {
    if (confirm("Deseja mesmo apagar todo o cenário?")) {
        mapGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill('erase'));
        renderMap();
    }
}

function exportMap() {
    const link = document.createElement('a');
    link.download = 'cenario-rpg-medieval.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

renderMap();
