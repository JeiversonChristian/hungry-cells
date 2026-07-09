export class Poop {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 2.5; // Metade do tamanho da planta
        this.color = '#004d00'; // Verde escuro
        
        // Tempo aleatório para virar planta (entre 180 a 480 frames = ~3 a 8 segundos)
        this.timeToHatch = Math.floor(Math.random() * 300) + 180;
    }

    update() {
        this.timeToHatch--;
        // Retorna true quando o tempo acabar (pronto para germinar)
        return this.timeToHatch <= 0;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}