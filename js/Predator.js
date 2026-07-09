export class Predator {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.color = '#F44336';
        
        this.speed = 2.5;
        this.visionRadius = 200; // Predadores enxergam mais longe
    }

    update(plantsCount, herbivoresCount, predatorsCount, relCenterX, relCenterY) {
        let moveX = 0;
        let moveY = 0;

        if (herbivoresCount > 0) {
            // Caça: se aproxima do centro da tela
            moveX = relCenterX;
            moveY = relCenterY;
        } else {
            // Patrulha/espalha baseada na presença de outros predadores
            moveX = predatorsCount > 0 ? -relCenterX : relCenterX;
            moveY = predatorsCount > 0 ? -relCenterY : relCenterY;
        }

        // Adiciona um ruído minúsculo para evitar empates matemáticos perfeitos
        moveX += (Math.random() - 0.5);

        // Traduzindo para as 5 opções restritas
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