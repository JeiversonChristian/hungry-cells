export class Predator {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.color = '#F44336';
        
        this.speed = 2.5;
        this.visionRadius = 200;

        // Genética da célula: Fator (peso) e Viés
        this.factor = 0.5 + Math.random(); // Multiplicador entre 0.5 e 1.5
        this.biasX = (Math.random() - 0.5) * 5; 
        this.biasY = (Math.random() - 0.5) * 5; 
    }

    update(plantsCount, herbivoresCount, predatorsCount, relCenterX, relCenterY) {
        let moveX = 0;
        let moveY = 0;

        if (herbivoresCount > 0) {
            moveX = relCenterX;
            moveY = relCenterY;
        } else {
            moveX = predatorsCount > 0 ? -relCenterX : relCenterX;
            moveY = predatorsCount > 0 ? -relCenterY : relCenterY;
        }

        // Aplica o fator e o viés únicos da célula
        moveX = (moveX * this.factor) + this.biasX;
        moveY = (moveY * this.factor) + this.biasY;

        // Ruído minúsculo
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