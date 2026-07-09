export class Herbivore {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.color = '#2196F3';
        
        this.speed = 2;
        this.visionRadius = 150;

        this.factor = 0.5 + Math.random(); 
        this.biasX = (Math.random() - 0.5) * 5; 
        this.biasY = (Math.random() - 0.5) * 5; 

        // Sistema Digestivo
        this.digestionQueue = []; 
    }

    // Função chamada quando engloba uma planta
    eatPlant() {
        // Gera de 1 a 3 cocôs por planta comida
        const poopCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < poopCount; i++) {
            // Tempo de digestão aleatório para cada cocô (ex: ~1 a 3 segundos)
            this.digestionQueue.push(Math.floor(Math.random() * 120) + 60);
        }
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

        moveX = (moveX * this.factor) + this.biasX;
        moveY = (moveY * this.factor) + this.biasY;
        moveX += (Math.random() - 0.5);

        if (Math.abs(moveX) > Math.abs(moveY)) {
            if (moveX > 0) this.x += this.speed;
            else this.x -= this.speed;
        } else if (Math.abs(moveY) > Math.abs(moveX)) {
            if (moveY > 0) this.y += this.speed;
            else this.y -= this.speed;
        } 

        // Processa a digestão e devolve quantos cocôs caíram neste frame
        let poopsDropped = 0;
        for (let i = this.digestionQueue.length - 1; i >= 0; i--) {
            this.digestionQueue[i]--;
            if (this.digestionQueue[i] <= 0) {
                poopsDropped++;
                this.digestionQueue.splice(i, 1); // Remove da fila
            }
        }
        return poopsDropped;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}