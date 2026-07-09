import { Plant } from './Plant.js';
import { Herbivore } from './Herbivore.js';
import { Predator } from './Predator.js';

// Configuração do Canvas
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// Arrays para armazenar as entidades
let plants = [];
let herbivores = [];
let predators = [];

// Estado da simulação
let isPaused = true;
let animationFrameId;

// Variáveis de Câmera (Zoom e Pan)
let scale = 1;
let offsetX = 0;
let offsetY = 0;

// Variáveis do Mundo (Referencial Absoluto)
let worldCenterX = 0;
let worldCenterY = 0;

// Elementos de UI
const btnPlayPause = document.getElementById('btn-play-pause');
const btnReset = document.getElementById('btn-reset');
const btnConfig = document.getElementById('btn-toggle-config');
const btnStats = document.getElementById('btn-toggle-stats');
const panelConfig = document.getElementById('panel-config');
const panelStats = document.getElementById('panel-stats');
const btnToggleUI = document.getElementById('btn-toggle-ui');
const mainControls = document.getElementById('main-controls');

// Função para ajustar o tamanho do canvas para a tela atual
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (isPaused) draw(); // Redesenha se estiver pausado e redimensionar a tela
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Função auxiliar para gerar posições aleatórias
function randomPos(max) {
    return Math.random() * max;
}

// Inicializa ou Reseta a simulação
function initSimulation() {
    plants = [];
    herbivores = [];
    predators = [];

    // O centro do mundo é fixado no momento do spawn
    worldCenterX = canvas.width / 2;
    worldCenterY = canvas.height / 2;

    const numPlants = parseInt(document.getElementById('input-plants').value) || 0;
    const numHerb = parseInt(document.getElementById('input-herbivores').value) || 0;
    const numPred = parseInt(document.getElementById('input-predators').value) || 0;

    for (let i = 0; i < numPlants; i++) {
        plants.push(new Plant(randomPos(canvas.width), randomPos(canvas.height)));
    }
    for (let i = 0; i < numHerb; i++) {
        herbivores.push(new Herbivore(randomPos(canvas.width), randomPos(canvas.height)));
    }
    for (let i = 0; i < numPred; i++) {
        predators.push(new Predator(randomPos(canvas.width), randomPos(canvas.height)));
    }

    updateStats();
    draw();
}

// Atualiza o painel de contagem
function updateStats() {
    document.getElementById('stat-plants').innerText = plants.length;
    document.getElementById('stat-herbivores').innerText = herbivores.length;
    document.getElementById('stat-predators').innerText = predators.length;
}

// Desenha tudo na tela (o update foi removido daqui e levado para o simulate)
function draw() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    plants.forEach(p => p.draw(ctx));
    herbivores.forEach(h => h.draw(ctx));
    predators.forEach(p => p.draw(ctx));
    
    ctx.restore();
}

// OTIMIZAÇÃO: Particionamento Espacial para evitar cálculos O(N^2)
class SpatialHashGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }

    _getKey(x, y) {
        return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
    }

    insert(entity, type) {
        const key = this._getKey(entity.x, entity.y);
        if (!this.cells.has(key)) {
            this.cells.set(key, { plants: [], herbivores: [], predators: [] });
        }
        this.cells.get(key)[type].push(entity);
    }

    // Busca vizinhos apenas no setor da célula e nos 8 setores ao redor
    getNeighbors(x, y, radius) {
        const neighbors = { plants: 0, herbivores: 0, predators: 0 };
        const centerCol = Math.floor(x / this.cellSize);
        const centerRow = Math.floor(y / this.cellSize);

        for (let col = centerCol - 1; col <= centerCol + 1; col++) {
            for (let row = centerRow - 1; row <= centerRow + 1; row++) {
                const key = `${col},${row}`;
                if (this.cells.has(key)) {
                    const cell = this.cells.get(key);
                    
                    // Conta filtrando pelo raio real (usando teorema de pitágoras rápido)
                    const countType = (entities) => {
                        let count = 0;
                        for (let e of entities) {
                            const dx = e.x - x;
                            const dy = e.y - y;
                            if (dx * dx + dy * dy <= radius * radius) count++;
                        }
                        return count;
                    };

                    neighbors.plants += countType(cell.plants);
                    neighbors.herbivores += countType(cell.herbivores);
                    neighbors.predators += countType(cell.predators);
                }
            }
        }
        return neighbors;
    }
}

// O Loop Principal Atualizado
function simulate() {
    if (isPaused) return;

    // 1. Cria a grade espacial (Tamanho do setor = maior raio de visão para segurança)
    const grid = new SpatialHashGrid(200);

    // 2. Popula a grade com a posição atual de todas as células
    plants.forEach(p => grid.insert(p, 'plants'));
    herbivores.forEach(h => grid.insert(h, 'herbivores'));
    predators.forEach(p => grid.insert(p, 'predators'));

    // 3. Calcula as decisões e move os herbívoros usando o referencial absoluto
    herbivores.forEach(h => {
        const neighbors = grid.getNeighbors(h.x, h.y, h.visionRadius);
        const relX = worldCenterX - h.x;
        const relY = worldCenterY - h.y;
        h.update(neighbors.plants, Math.max(0, neighbors.herbivores - 1), neighbors.predators, relX, relY);
    });

    // 4. Calcula as decisões e move os predadores usando o referencial absoluto
    predators.forEach(p => {
        const neighbors = grid.getNeighbors(p.x, p.y, p.visionRadius);
        const relX = worldCenterX - p.x;
        const relY = worldCenterY - p.y;
        p.update(neighbors.plants, neighbors.herbivores, Math.max(0, neighbors.predators - 1), relX, relY);
    });
    
    draw();
    updateStats();
    animationFrameId = requestAnimationFrame(simulate);
}

// Event Listeners dos Botões
btnPlayPause.addEventListener('click', () => {
    isPaused = !isPaused;
    btnPlayPause.innerText = isPaused ? "Play" : "Pause";
    
    if (!isPaused) {
        // Se deu play pela primeira vez e não há células, inicializa
        if (plants.length === 0 && herbivores.length === 0 && predators.length === 0) {
            initSimulation();
        }
        simulate();
    } else {
        cancelAnimationFrame(animationFrameId);
    }
});

btnReset.addEventListener('click', () => {
    initSimulation();
});

btnConfig.addEventListener('click', () => {
    panelConfig.classList.toggle('hidden');
});

btnStats.addEventListener('click', () => {
    panelStats.classList.toggle('hidden');
});

btnToggleUI.addEventListener('click', () => {
    // Alterna a visibilidade dos controles principais do topo
    mainControls.classList.toggle('hidden');
    
    // Opcional: Se quiser que o botão de esconder UI também esconda 
    // os painéis laterais quando ativos, descomente as duas linhas abaixo:
    panelConfig.classList.add('hidden');
    panelStats.classList.add('hidden');
});

// Event Listener para Zoom com a Roda do Mouse
canvas.addEventListener('wheel', (e) => {
    e.preventDefault(); // Previne a rolagem da página inteira

    // Define a intensidade do zoom
    const zoomSensitivity = 0.1;
    const zoomIn = e.deltaY < 0;
    const zoomFactor = zoomIn ? (1 + zoomSensitivity) : (1 - zoomSensitivity);

    // Pega a posição do mouse relativa ao canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calcula a posição lógica do mouse (no mundo da simulação) antes do zoom
    const logicalX = (mouseX - offsetX) / scale;
    const logicalY = (mouseY - offsetY) / scale;

    // Atualiza a escala
    scale *= zoomFactor;

    // Limita o zoom máximo e mínimo para a tela não sumir
    scale = Math.max(0.1, Math.min(scale, 10)); 

    // Recalcula o offset para que o mouse continue apontando para o mesmo ponto lógico
    offsetX = mouseX - logicalX * scale;
    offsetY = mouseY - logicalY * scale;

    // Se a simulação estiver pausada, forçamos um redesenho para o usuário ver o zoom acontecendo na hora
    if (isPaused) {
        draw();
    }
});

// A simulação começa em estado inicial, aguardando o usuário
initSimulation();