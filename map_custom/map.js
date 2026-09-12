const mapCanvas = document.getElementById('mapCanvas');
const mapCtx = mapCanvas.getContext('2d');
const jsonInput = document.getElementById('jsonInput');
const btnImportJSON = document.getElementById('btnImportJSON');
const importedPalette = document.getElementById('importedPalette');

const MAP_GRID_SIZE = 16; 
const TILE_SIZE = mapCanvas.width / MAP_GRID_SIZE; // 32px
let activeTileImage = null;

// Acionar seletor de arquivo
btnImportJSON.onclick = () => jsonInput.click();

// Processar Arquivo JSON
jsonInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (data.type === "rpg_custom_structure" && data.pixels) {
                createTileFromJSON(data);
            } else {
                alert("Formato de JSON inválido para estruturas RPG.");
            }
        } catch (err) {
            alert("Erro ao ler o arquivo JSON.");
        }
    };
    reader.readAsText(file);
};

// Converter Matriz JSON em uma Imagem Renderizável
function createTileFromJSON(structureData) {
    const size = structureData.gridSize;
    const pixels = structureData.pixels;

    // Criar canvas temporário off-screen
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (pixels[y][x]) {
                tempCtx.fillStyle = pixels[y][x];
                tempCtx.fillRect(x, y, 1, 1);
            }
        }
    }

    const dataUrl = tempCanvas.toDataURL();

    // Limpar mensagem inicial
    if (importedPalette.querySelector('p')) {
        importedPalette.innerHTML = '';
    }

    // Criar botão do novo Tile na Paleta
    const tileBtn = document.createElement('div');
    tileBtn.className = 'tile-option';
    tileBtn.style.backgroundImage = `url(${dataUrl})`;
    
    const img = new Image();
    img.src = dataUrl;

    tileBtn.onclick = () => {
        document.querySelectorAll('.tile-option').forEach(b => b.classList.remove('selected'));
        tileBtn.classList.add('selected');
        activeTileImage = img;
    };

    importedPalette.appendChild(tileBtn);
    tileBtn.click(); // Selecionar automaticamente
}

// Pintar a estrutura importada no mapa
mapCanvas.onmousedown = (e) => {
    if (!activeTileImage) return;
    const rect = mapCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

    mapCtx.drawImage(activeTileImage, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
};
