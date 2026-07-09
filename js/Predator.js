export class Predator {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.color = '#F44336';
        
        this.speed = 2.5;
        this.visionRadius = 200;

        // Parâmetro de Vida/Energia
        this.energy = 100;

        // GENÉTICA: Pesos que determinam como a célula reage ao ambiente
        this.w_herbivores = (Math.random() - 0.5) * 2; // Como reage ao centro de massa da presa
        this.w_center = (Math.random() - 0.5) * 2;     // Como reage ao centro do mundo
        this.w_energyX = (Math.random() - 0.5) * 0.1;   // Como a própria energia afeta o eixo X
        this.w_energyY = (Math.random() - 0.5) * 0.1;   // Como a própria energia afeta o eixo Y
        this.biasX = (Math.random() - 0.5) * 5;        // Tendência de movimento X
        this.biasY = (Math.random() - 0.5) * 5;        // Tendência de movimento Y

        this.digestionQueue = []; 
    }

    // Função de Mitose
    clone() {
        const child = new Predator(this.x, this.y);
        child.energy = 100; 
        
        const mut = 0.2; 

        // O filho herda os genes da mãe com mutação
        child.w_herbivores = this.w_herbivores + (Math.random() * mut - mut/2);
        child.w_center = this.w_center + (Math.random() * mut - mut/2);
        child.w_energyX = this.w_energyX + (Math.random() * mut - mut/2);
        child.w_energyY = this.w_energyY + (Math.random() * mut - mut/2);
        child.biasX = this.biasX + (Math.random() * mut - mut/2);
        child.biasY = this.biasY + (Math.random() * mut - mut/2);

        return child;
    }

    eatHerbivore() {
        // Gera de 2 a 5 cocôs por herbívoro comido (refeição maior que a planta)
        const poopCount = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < poopCount; i++) {
            this.digestionQueue.push(Math.floor(Math.random() * 120) + 60);
        }
    }

    update(herbivoresCMX, herbivoresCMY, predatorsCount, relCenterX, relCenterY) {
        // CÉREBRO DA CÉLULA: Toma a decisão com base na presa (célula azul)
        let moveX = (herbivoresCMX * this.w_herbivores) + (relCenterX * this.w_center) + (this.energy * this.w_energyX) + this.biasX;
        let moveY = (herbivoresCMY * this.w_herbivores) + (relCenterY * this.w_center) + (this.energy * this.w_energyY) + this.biasY;

        // Ruído minúsculo para desempate
        moveX += (Math.random() - 0.5) * 0.1;

        if (Math.abs(moveX) > Math.abs(moveY)) {
            if (moveX > 0) this.x += this.speed;
            else this.x -= this.speed;
        } else if (Math.abs(moveY) > Math.abs(moveX)) {
            if (moveY > 0) this.y += this.speed;
            else this.y -= this.speed;
        } 

        // Processa a digestão
        let poopsDropped = 0;
        for (let i = this.digestionQueue.length - 1; i >= 0; i--) {
            this.digestionQueue[i]--;
            if (this.digestionQueue[i] <= 0) {
                poopsDropped++;
                this.digestionQueue.splice(i, 1);
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