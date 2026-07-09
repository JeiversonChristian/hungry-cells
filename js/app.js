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
    // Limpa o frame anterior (fundo escuro)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenha as entidades
    plants.forEach(p => p.draw(ctx));
    herbivores.forEach(h => h.draw(ctx));
    predators.forEach(p => p.draw(ctx));
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
    // panelConfig.classList.add('hidden');
    // panelStats.classList.add('hidden');
});

// A simulação começa em estado inicial, aguardando o usuário
initSimulation();