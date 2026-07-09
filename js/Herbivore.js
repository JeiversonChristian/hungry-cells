export class Herbivore {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.color = '#2196F3';
        
        this.speed = 2;
        this.visionRadius = 150; // Raio de visão da célula
    }

    // Recebe os 4 parâmetros requisitados
    update(plantsCount, herbivoresCount, predatorsCount, relCenterX, relCenterY) {
        let moveX = 0;
        let moveY = 0;

        // Lógica de sobrevivência:
        if (predatorsCount > 0) {
            // Foge do centro (inverte o vetor relativo ao centro)
            moveX = -relCenterX;
            moveY = -relCenterY;
        } else if (plantsCount > 0) {
            // Vai em direção ao centro para buscar comida
            moveX = relCenterX; 
            moveY = relCenterY;
        } else {
            // Movimento de exploração guiado pela quantidade da própria espécie
            moveX = herbivoresCount % 2 === 0 ? 10 : -10;
            moveY = herbivoresCount % 3 === 0 ? 10 : -10;
        }

        // Adiciona um ruído minúsculo para evitar empates matemáticos perfeitos
        moveX += (Math.random() - 0.5);

        // 5 Opções de Decisão: Parada, Cima, Baixo, Direita, Esquerda
        if (Math.abs(moveX) > Math.abs(moveY)) {
            if (moveX > 0) this.x += this.speed;      // Direita
            else this.x -= this.speed;                // Esquerda
        } else if (Math.abs(moveY) > Math.abs(moveX)) {
            if (moveY > 0) this.y += this.speed;      // Baixo
            else this.y -= this.speed;                // Cima
        } 
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}