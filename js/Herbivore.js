export class Herbivore {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.color = '#2196F3';
        
        this.speed = 2;
        this.visionRadius = 150;
        
        // Parâmetro de Vida/Energia
        this.energy = 100;

        // GENÉTICA: Pesos que determinam como a célula reage ao ambiente
        this.w_plants = (Math.random() - 0.5) * 2;   // Como reage ao centro de massa da comida
        this.w_center = (Math.random() - 0.5) * 2;   // Como reage ao centro do mundo
        this.w_energyX = (Math.random() - 0.5) * 0.1; // Como a própria energia afeta o eixo X
        this.w_energyY = (Math.random() - 0.5) * 0.1; // Como a própria energia afeta o eixo Y
        this.biasX = (Math.random() - 0.5) * 5;      // Tendência de movimento X
        this.biasY = (Math.random() - 0.5) * 5;      // Tendência de movimento Y

        this.digestionQueue = []; 
    }

    // Função de Mitose
    clone() {
        const child = new Herbivore(this.x, this.y);
        child.energy = 100; // O filho nasce com metade da energia da mãe
        
        const mut = 0.2; // Taxa de mutação (o quanto os genes podem variar do original)

        // O filho herda os genes da mãe, mas com uma pequena mutação aleatória
        child.w_plants = this.w_plants + (Math.random() * mut - mut/2);
        child.w_center = this.w_center + (Math.random() * mut - mut/2);
        child.w_energyX = this.w_energyX + (Math.random() * mut - mut/2);
        child.w_energyY = this.w_energyY + (Math.random() * mut - mut/2);
        child.biasX = this.biasX + (Math.random() * mut - mut/2);
        child.biasY = this.biasY + (Math.random() * mut - mut/2);

        return child;
    }

    eatPlant() {
        const poopCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < poopCount; i++) {
            this.digestionQueue.push(Math.floor(Math.random() * 120) + 60);
        }
    }

    // Agora recebe as coordenadas do Centro de Massa das plantas
    update(plantsCMX, plantsCMY, herbivoresCount, predatorsCount, relCenterX, relCenterY) {
        // CÉREBRO DA CÉLULA: Soma linear dos estímulos multiplicados pela genética
        let moveX = (plantsCMX * this.w_plants) + (relCenterX * this.w_center) + (this.energy * this.w_energyX) + this.biasX;
        let moveY = (plantsCMY * this.w_plants) + (relCenterY * this.w_center) + (this.energy * this.w_energyY) + this.biasY;

        // Fuga rudimentar de predadores usando peso fixo (por enquanto)
        if (predatorsCount > 0) {
            moveX += -relCenterX;
            moveY += -relCenterY;
        }

        // Ruído minúsculo para desempate
        moveX += (Math.random() - 0.5) * 0.1;

        // Executa o movimento
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