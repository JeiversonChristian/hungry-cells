export class Herbivore {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.color = '#2196F3';
        
        this.speed = 2;
        this.visionRadius = 150;

        // Genética da célula: Fator (peso) e Viés
        this.factor = 0.5 + Math.random(); // Multiplicador entre 0.5 e 1.5
        this.biasX = (Math.random() - 0.5) * 5; // Tendência natural no eixo X
        this.biasY = (Math.random() - 0.5) * 5; // Tendência natural no eixo Y
    }

    update(plantsCount, herbivoresCount, predatorsCount, relCenterX, relCenterY) {
        let moveX = 0;
        let moveY = 0;

        if (predatorsCount > 0) {
            moveX = -relCenterX;
            moveY = -relCenterY;
        } else if (plantsCount > 0) {
            moveX = relCenterX; 
            moveY = relCenterY;
        } else {
            moveX = herbivoresCount % 2 === 0 ? 10 : -10;
            moveY = herbivoresCount % 3 === 0 ? 10 : -10;
        }

        // Aplica o fator e o viés únicos da célula sobre a decisão tomada
        moveX = (moveX * this.factor) + this.biasX;
        moveY = (moveY * this.factor) + this.biasY;

        // Ruído minúsculo para evitar empates matemáticos perfeitos
        moveX += (Math.random() - 0.5);

        // 5 Opções de Decisão
        if (Math.abs(moveX) > Math.abs(moveY)) {
            if (moveX > 0) this.x += this.speed;
            else this.x -= this.speed;
        } else if (Math.abs(moveY) > Math.abs(moveX)) {
            if (moveY > 0) this.y += this.speed;
            else this.y -= this.speed;
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