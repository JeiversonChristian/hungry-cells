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

// Desenha tudo na tela
function draw() {
    // 1. Salva o estado original e limpa a tela inteira (ignorando o zoom atual)
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // 2. Salva o contexto para aplicar a câmera
    ctx.save();
    
    // 3. Aplica o deslocamento e o zoom
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // 4. Desenha as entidades
    plants.forEach(p => p.draw(ctx));
    herbivores.forEach(h => h.draw(ctx));
    predators.forEach(p => p.draw(ctx));
    
    // 5. Restaura o contexto para não afetar os próximos frames
    ctx.restore();
}

// O Loop Principal (Otimizado para performance com requestAnimationFrame)
function simulate() {
    if (isPaused) return;

    // FUTURO: Aqui entrarão as lógicas de movimento, caça e colisão!
    
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