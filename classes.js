class Color {
  constructor(r, g, b, a) {
    if (typeof r == 'string' && r[0] == "#") {
      cc = hexToRgb(r);
      g = cc.g;
      b = cc.b;
      a = cc.a;
      r = cc.r;
    } else if (typeof r == 'object' && r.r !== undefined && r.g !== undefined && r.b !== undefined) {
      g = r.g;
      b = r.b;
      a = r.a;
      r = r.r;
    }

    if (!r && r != 0)
      this.r = (Math.random() * 255) | 0;
    else
      this.r = r;

    if (!g && g != 0)
      this.g = (Math.random() * 255) | 0;
    else
      this.g = g;

    if (!b && b != 0)
      this.b = (Math.random() * 255) | 0;
    else
      this.b = b;

    if (a == undefined) {
      this.a = 1;
    } else {
      this.a = a
    }
  }
  toString() {
    return `rgba(${this.r | 0}, ${this.g | 0}, ${this.b | 0}, ${this.a})`;
  }
}

class Circle {
  constructor(props) {
    this.x = props.x || 0;
    this.y = props.y || 0;
    this.size = props.size || 0;
    
    this.color = new Color(props.color)
  }

  draw(ctx) {
    ctx.lineWidth = 0.01;
    ctx.strokeStyle = '#000';
    ctx.fillStyle = this.color.toString();
    drawCircle(this.x, this.y, this.size, ctx);
    ctx.fillStyle = '#000';
    ctx.stroke();
    // drawCircle(this.x, this.y, 1, ctx);
  }
}