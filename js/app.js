import { Plant } from './Plant.js';
import { Herbivore } from './Herbivore.js';
import { Predator } from './Predator.js';
import { Poop } from './Poop.js';

// Configuração do Canvas
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// Arrays para armazenar as entidades
let plants = [];
let herbivores = [];
let predators = [];
let poops = [];

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
    poops = [];

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

// OTIMIZAÇÃO: Particionamento Espacial 
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

    // Agora retorna as próprias entidades, não apenas a contagem
    getEntitiesInRange(x, y, radius, type) {
        const entities = [];
        const centerCol = Math.floor(x / this.cellSize);
        const centerRow = Math.floor(y / this.cellSize);

        for (let col = centerCol - 1; col <= centerCol + 1; col++) {
            for (let row = centerRow - 1; row <= centerRow + 1; row++) {
                const key = `${col},${row}`;
                if (this.cells.has(key)) {
                    const cell = this.cells.get(key);
                    for (let e of cell[type]) {
                        const dx = e.x - x;
                        const dy = e.y - y;
                        if (dx * dx + dy * dy <= radius * radius) {
                            entities.push(e);
                        }
                    }
                }
            }
        }
        return entities;
    }
}

function simulate() {
    if (isPaused) return;

    const grid = new SpatialHashGrid(200);

    plants.forEach(p => grid.insert(p, 'plants'));
    herbivores.forEach(h => grid.insert(h, 'herbivores'));
    predators.forEach(p => grid.insert(p, 'predators'));

    // Processa os Herbívoros (Loop reverso para permitir remoção sem quebrar o índice)
    for (let i = herbivores.length - 1; i >= 0; i--) {
        const h = herbivores[i];

        // 1. Metabolismo: gasta energia a cada frame
        h.energy -= 0.2; 
        
        // 2. Morte por fome
        if (h.energy <= 0) {
            herbivores.splice(i, 1); // Remove a célula morta
            continue; // Pula o resto da lógica para esta célula
        }

        // 3. Reprodução (Mitose)
        if (h.energy >= 200) {
            h.energy = 100; // A célula mãe gasta energia para se dividir
            herbivores.push(h.clone()); // Nasce o filho com mutação
        }

        // 4. Visão
        const nearbyPlants = grid.getEntitiesInRange(h.x, h.y, h.visionRadius, 'plants');
        const nearbyHerb = grid.getEntitiesInRange(h.x, h.y, h.visionRadius, 'herbivores');
        const nearbyPred = grid.getEntitiesInRange(h.x, h.y, h.visionRadius, 'predators');

        // Calcula o vetor direcional (Centro de Massa) para as plantas próximas
        let plantsCMX = 0;
        let plantsCMY = 0;
        if (nearbyPlants.length > 0) {
            nearbyPlants.forEach(p => {
                plantsCMX += (p.x - h.x);
                plantsCMY += (p.y - h.y);
            });
            plantsCMX /= nearbyPlants.length; // Tira a média da posição X
            plantsCMY /= nearbyPlants.length; // Tira a média da posição Y
        }

        const relX = worldCenterX - h.x;
        const relY = worldCenterY - h.y;

        // Atualiza a decisão passando as posições do centro de massa e a energia
        const poopsToDrop = h.update(plantsCMX, plantsCMY, nearbyHerb.length - 1, nearbyPred.length, relX, relY);
        
        for (let j = 0; j < poopsToDrop; j++) {
            poops.push(new Poop(h.x, h.y));
        }

        // 5. Lógica de comer as plantas
        nearbyPlants.forEach(p => {
            const dx = p.x - h.x;
            const dy = p.y - h.y;
            const dist = Math.hypot(dx, dy); 
            
            if (dist + p.radius <= h.radius) {
                if (!p.eaten) { 
                    p.eaten = true;
                    h.energy += 30; // Recupera energia ao comer!
                    h.eatPlant();
                }
            }
        });
    }

    // Remove as plantas que foram comidas do mapa
    plants = plants.filter(p => !p.eaten);

    // Processa os Predadores
    predators.forEach(p => {
        const nearbyPlants = grid.getEntitiesInRange(p.x, p.y, p.visionRadius, 'plants');
        const nearbyHerb = grid.getEntitiesInRange(p.x, p.y, p.visionRadius, 'herbivores');
        const nearbyPred = grid.getEntitiesInRange(p.x, p.y, p.visionRadius, 'predators');

        const relX = worldCenterX - p.x;
        const relY = worldCenterY - p.y;
        p.update(nearbyPlants.length, nearbyHerb.length, Math.max(0, nearbyPred.length - 1), relX, relY);
    });

    // Processa a germinação dos cocôs
    for (let i = poops.length - 1; i >= 0; i--) {
        const readyToHatch = poops[i].update();
        if (readyToHatch) {
            // Nasce uma nova planta onde estava o cocô
            plants.push(new Plant(poops[i].x, poops[i].y));
            poops.splice(i, 1); // Remove o cocô
        }
    }
    
    draw();
    updateStats();
    animationFrameId = requestAnimationFrame(simulate);
}

function draw() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Desenhamos os cocôs primeiro, para ficarem debaixo das células
    poops.forEach(poop => poop.draw(ctx));
    plants.forEach(p => p.draw(ctx));
    herbivores.forEach(h => h.draw(ctx));
    predators.forEach(p => p.draw(ctx));
    
    ctx.restore();
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