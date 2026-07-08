export class Plant {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.color = '#4CAF50'; // Verde
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}