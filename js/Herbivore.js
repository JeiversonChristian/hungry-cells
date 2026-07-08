export class Herbivore {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.color = '#2196F3'; // Azul
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}