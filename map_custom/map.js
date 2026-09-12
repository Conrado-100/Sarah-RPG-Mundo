<script>
        const GRID_SIZE = 12;
        const canvas = document.getElementById('mapCanvas');
        const ctx = canvas.getContext('2d');
        const CELL_SIZE = canvas.width / GRID_SIZE; // 48px por célula

        // Sistema de Setores Infinitos
        let currentSectorX = 0;
        let currentSectorY = 0;
        let worldSectors = {}; // Armazena os dados do mapa: "x,y": Matrix12x12

        // Som
        let soundEnabled = true;
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playBeep(freq = 400) {
            if (!soundEnabled) return;
            try {
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.08);
            } catch(e){}
        }

        // Elemento Ativo Selecionado
        let selectedElement = {
            id: 'grama',
            type: 'terrain',
            color: '#15803d',
            w: 1,
            h: 1,
            label: 'Grama'
        };

        function getSectorKey(x, y) { return `${x},${y}`; }

        function getOrCreateSector(x, y) {
            const key = getSectorKey(x, y);
            if (!worldSectors[key]) {
                // Preenche por padrão com grama
                const matrix = Array(GRID_SIZE).fill(null).map(() => 
                    Array(GRID_SIZE).fill(null).map(() => ({ type: 'terrain', id: 'grama', color: '#15803d' }))
                );
                worldSectors[key] = matrix;
            }
            return worldSectors[key];
        }

        // Renderização do Mapa
        function renderMap() {
            const matrix = getOrCreateSector(currentSectorX, currentSectorY);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    const cell = matrix[r][c];
                    
                    // Desenhar Terreno
                    if (cell && cell.color) {
                        ctx.fillStyle = cell.color;
                        ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    }

                    // Se for textura customizada importada
                    if (cell && cell.customImg) {
                        const img = new Image();
                        img.src = cell.customImg;
                        ctx.drawImage(img, c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE * (cell.w || 1), CELL_SIZE * (cell.h || 1));
                    }

                    // Linhas da Grade
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                    ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);

                    // Padrão de detalhes nos blocos de grama
                    if (cell.id === 'grama') {
                        ctx.fillStyle = '#166534';
                        ctx.fillRect(c * CELL_SIZE + 12, r * CELL_SIZE + 12, 4, 8);
                        ctx.fillRect(c * CELL_SIZE + 28, r * CELL_SIZE + 28, 4, 8);
                    }
                }
            }

            updateMinimap();
        }

        // Minimapa
        function updateMinimap() {
            const minimap = document.getElementById('minimap');
            minimap.innerHTML = '';
            
            for (let my = -2; my <= 2; my++) {
                for (let mx = -2; mx <= 2; mx++) {
                    const sx = currentSectorX + mx;
                    const sy = currentSectorY + my;
                    const key = getSectorKey(sx, sy);
                    const cellDiv = document.createElement('div');
                    
                    const isCurrent = (mx === 0 && my === 0);
                    const exists = !!worldSectors[key];

                    cellDiv.className = `w-full h-full rounded-sm ${
                        isCurrent ? 'bg-sky-500 border border-white' : exists ? 'bg-emerald-800' : 'bg-slate-900 border border-slate-800'
                    }`;
                    minimap.appendChild(cellDiv);
                }
            }
        }

        // Pintura no Canvas
        let isMouseDown = false;
        canvas.onmousedown = (e) => { isMouseDown = true; paint(e); };
        canvas.onmousemove = (e) => { if (isMouseDown) paint(e); };
        window.onmouseup = () => { isMouseDown = false; };

        function paint(e) {
            const rect = canvas.getBoundingClientRect();
            const col = Math.floor((e.clientX - rect.left) / (rect.width / GRID_SIZE));
            const row = Math.floor((e.clientY - rect.top) / (rect.height / GRID_SIZE));

            if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return;

            const matrix = getOrCreateSector(currentSectorX, currentSectorY);

            if (selectedElement.type === 'clear') {
                matrix[row][col] = { type: 'terrain', id: 'grama', color: '#15803d' };
            } else {
                matrix[row][col] = {
                    type: selectedElement.type,
                    id: selectedElement.id,
                    color: selectedElement.color,
                    customImg: selectedElement.customImg,
                    w: selectedElement.w || 1,
                    h: selectedElement.h || 1
                };
            }

            playBeep(selectedElement.type === 'clear' ? 200 : 500);
            renderMap();
        }

        // Troca de Elemento Selecionado
        document.querySelectorAll('.palette-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                selectedElement = {
                    id: btn.getAttribute('data-id'),
                    type: btn.getAttribute('data-type'),
                    color: btn.getAttribute('data-color') || '#15803d',
                    w: parseInt(btn.getAttribute('data-w') || '1'),
                    h: parseInt(btn.getAttribute('data-h') || '1'),
                    label: btn.innerText
                };

                document.getElementById('activeElementLabel').innerText = btn.innerText.replace(/^[^\s]+\s/, '');
                playBeep(600);
            };
        });

        // Controle de Som
        document.getElementById('btnSoundToggle').onclick = () => {
            soundEnabled = !soundEnabled;
            document.getElementById('soundLabel').innerText = soundEnabled ? 'LIGADO' : 'DESLIGADO';
        };

        // Navegação D-Pad
        document.getElementById('btnNavUp').onclick = () => changeSector(0, -1);
        document.getElementById('btnNavDown').onclick = () => changeSector(0, 1);
        document.getElementById('btnNavLeft').onclick = () => changeSector(-1, 0);
        document.getElementById('btnNavRight').onclick = () => changeSector(1, 0);
        document.getElementById('btnNavCenter').onclick = () => { currentSectorX = 0; currentSectorY = 0; updateSectorUI(); };

        function changeSector(dx, dy) {
            currentSectorX += dx;
            currentSectorY += dy;
            updateSectorUI();
        }

        function updateSectorUI() {
            document.getElementById('sectorX').innerText = currentSectorX;
            document.getElementById('sectorY').innerText = currentSectorY;
            playBeep(350);
            renderMap();
        }

        // Limpar Setor / Resetar Mundo
        document.getElementById('btnClearSector').onclick = () => {
            delete worldSectors[getSectorKey(currentSectorX, currentSectorY)];
            renderMap();
        };

        document.getElementById('btnResetWorld').onclick = () => {
            if (confirm("Tem certeza que deseja resetar todo o mundo RPG?")) {
                worldSectors = {};
                currentSectorX = 0;
                currentSectorY = 0;
                updateSectorUI();
            }
        };

        // --- IMPORTAR JSON DO CONSTRUCTION ---
        const jsonInput = document.getElementById('jsonInput');
        document.getElementById('btnImportJSON').onclick = () => jsonInput.click();

        jsonInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.pixels) {
                        importStructureFromJSON(data);
                    } else {
                        alert("Arquivo JSON inválido.");
                    }
                } catch(err) {
                    alert("Erro ao ler o arquivo JSON.");
                }
            };
            reader.readAsText(file);
        };

        function importStructureFromJSON(data) {
            const size = data.gridSize || 16;
            const pixels = data.pixels;

            // Renderiza pixels JSON em Data URL PNG
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

            const imgUrl = tempCanvas.toDataURL();
            const uniqueId = 'custom_' + Date.now();

            // Adiciona novo botão na lista de Estruturas
            const container = document.getElementById('structuresContainer');
            const newBtn = document.createElement('button');
            newBtn.className = 'palette-btn col-span-2 border-amber-500/50 text-amber-300 active';
            newBtn.setAttribute('data-id', uniqueId);
            newBtn.setAttribute('data-type', 'custom');
            newBtn.innerHTML = `<img src="${imgUrl}" class="w-4 h-4 rounded" style="image-rendering: pixelated;"> Custom (${size}x${size})`;

            // Remove classe ativa dos outros
            document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));

            selectedElement = {
                id: uniqueId,
                type: 'custom',
                customImg: imgUrl,
                w: 1,
                h: 1,
                label: `Custom (${size}x${size})`
            };

            newBtn.onclick = () => {
                document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
                newBtn.classList.add('active');
                selectedElement = {
                    id: uniqueId,
                    type: 'custom',
                    customImg: imgUrl,
                    w: 1,
                    h: 1,
                    label: `Custom (${size}x${size})`
                };
                document.getElementById('activeElementLabel').innerText = `Custom (${size}x${size})`;
            };

            container.appendChild(newBtn);
            document.getElementById('activeElementLabel').innerText = `Custom (${size}x${size})`;
            playBeep(800);
            alert("Estrutura do Construction importada com sucesso!");
        }

        // Salvar e Carregar Projeto Completo do Mundo
        document.getElementById('btnSaveProject').onclick = () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(worldSectors));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `mapa_rpg_mundo.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        };

        const fileLoadProject = document.getElementById('fileLoadProject');
        document.getElementById('btnLoadProject').onclick = () => fileLoadProject.click();

        fileLoadProject.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    worldSectors = JSON.parse(event.target.result);
                    renderMap();
                    alert("Projeto do mapa carregado com sucesso!");
                } catch(err) { alert("Erro ao carregar o arquivo de projeto."); }
            };
            reader.readAsText(file);
        };

        // Exportar PNG
        document.getElementById('btnExportPNG').onclick = () => {
            const link = document.createElement('a');
            link.download = `setor_${currentSectorX}_${currentSectorY}.png`;
            link.href = canvas.toDataURL();
            link.click();
        };

        // Inicialização
        getOrCreateSector(0, 0);
        renderMap();
    </script>
