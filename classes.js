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
  setRandomHSV() {
    let h = 360 * Math.random();
    // let sv = 2 * Math.random();
    // let sk = Math.random();

    let hsv = {
      h,
      // s: Math.pow(Math.random(), 0.5) * 100,
      s: 100,
      v: Math.pow(Math.random(), 1) * 100
      // s: sv * sk * 100,
      // v: sv * (1 - sk)
    };

    let rgb = hsvToRgb(hsv)

    this.r = rgb.r;
    this.g = rgb.g;
    this.b = rgb.b;
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
    this.neighbors = []

    this.energy = 0;
    this.worm = null;
  }
  draw(ctx) {
    // ctx.lineWidth = 0.01;
    // ctx.strokeStyle = '#000';
    // ctx.fillStyle = this.color.toString();
    // drawCircle(this.x, this.y, this.size, ctx);
    // ctx.fillStyle = '#000';
    // ctx.stroke();
    // drawCircle(this.x, this.y, 1, ctx);


    let r = (this.energy / MAX_ORBIT_ENERGY) * this.size;
    let astep = 2 * Math.asin(WORM_STEP / (2 * this.size));
    // console.log("ASTEP", astep, r)
    ctx.lineWidth = astep;

    let grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);

    grad.addColorStop(0, this.color.toString());

    if (this.worm) {
      let wormColor = new Color(this.worm.color);
      // wormColor.a = r / this.size;
      wormColor.a = this.worm.energy * 0.75;
      grad.addColorStop(1, wormColor.toString());

      ctx.shadowBlur = 1;
      ctx.shadowColor = wormColor.toString();

      ctx.lineWidth *= (1 - this.worm.energy) * 5;
    }

    ctx.strokeStyle = grad;
    strokeCircle(this.x, this.y, r + astep, ctx);
  }
}
class Worm {
  constructor(props) {
    this.width = props.width || 1;

    this.color = new Color(props.color);
    this.color.setRandomHSV();

    this.points = [];
    this.points.push({
      x: props.x,
      y: props.y,
      color: this.color
    });

    this.pastOrbits = []

    this.setOrbit(props.orbit);
    
    this.clockwise = props.clockwise;

    this.dead = false;
  }
  setOrbit(orbit) {
    this.orbit = orbit;
    if (orbit) {
      this.orbit.worm = this;
      this.pastOrbits.push(orbit);
    }

    this.energy = 0;
  }
  step() {
    if (this.dead || !this.orbit) return;
    let lp = this.points[this.points.length - 1];

    let dv = {
      x: lp.x - this.orbit.x,
      y: lp.y - this.orbit.y,
    }
    let len = dist(dv);

    let a = Math.atan2(dv.y, dv.x);

    
    // let step = 100 * (Math.PI / 64) / Math.pow(len, .5);
    let astep = 2 * Math.asin(WORM_STEP / (2 * len) );

    this.energy += astep / (Math.PI * 2);
    this.orbit.energy += astep / (Math.PI * 2);

    if (this.energy > 1) this.energy = 1;
    
    if (this.energy >= 1.00) {
      this.dead = true;
      return;
    }

    if (this.orbit.energy >= MAX_ORBIT_ENERGY) {
      this.dead = true;
      return;
    }

    if (!this.clockwise) {
      astep *= -1;
    }
    // let step = Math.PI / 64;

    a += astep;

    let newx = Math.cos(a) * len;
    let newy = Math.sin(a) * len;
    let newPoint = {
      x: newx + this.orbit.x,
      y: newy + this.orbit.y,
      color: this.color
    };

    
    this.points.push(newPoint)
  }
  draw(ctx) {
    ctx.lineWidth = 3 * this.energy;
    // ctx.lineWidth = 5;
    ctx.strokeStyle = this.color.toString();
    ctx.shadowColor = this.color.toString();
    ctx.shadowBlur = 15;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(this.points[this.points.length - 2].x, this.points[this.points.length - 2].y);
    ctx.lineTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
    ctx.stroke();
  }
  drawLine(ctx) {
    let lp = this.points[this.points.length - 1];

    ctx.lineWidth = 2 * this.energy;
    // ctx.lineWidth = 1;
    let len = this.energy * 0.5;

    let grad = ctx.createLinearGradient(lp.x, lp.y, this.orbit.x, this.orbit.y);

    let acol = new Color(this.color);
    acol.a = 0;

    grad.addColorStop(0, acol.toString())
    grad.addColorStop(0.2 * len, this.color.toString())
    grad.addColorStop(0.8 * len, this.orbit.color.toString())
    grad.addColorStop(0.81 * len, '#00000000');

    ctx.strokeStyle = grad;
    ctx.shadowBlur = 5;

    ctx.beginPath();
    ctx.moveTo(lp.x, lp.y);
    ctx.lineTo(this.orbit.x, this.orbit.y);
    ctx.stroke();
  }

  drawOrbitTrails(ctx) {
    let lp = this.points[this.points.length - 1];

    this.pastOrbits.forEach(pastOrbit => {
      let r = dist(lp, pastOrbit);
      let k = 0.9 * this.energy / MAX_ORBIT_ENERGY;
      // let k = this.energy * 0.99
      let rr = r * k;
      let g2 = ctx.createRadialGradient(pastOrbit.x, pastOrbit.y, 0, pastOrbit.x, pastOrbit.y, r);

      g2.addColorStop(0, pastOrbit.color.toString());
      g2.addColorStop(rr / r, this.color.toString());
      // g2.addColorStop(1.01 * rr / r, '#00000000');

      ctx.strokeStyle = g2;

      let dd = {
        x: lp.x - pastOrbit.x,
        y: lp.y - pastOrbit.y
      };

      ctx.shadowColor = this.color.toString();
      ctx.shadowBlur = 5;
      let dda = Math.atan2(dd.y, dd.x);
      // let dda = Math.abs(pastOrbit.energy - this.energy) * Math.PI * 2
      ctx.beginPath();
      // ctx.arc(pastOrbit.x, pastOrbit.y, pastOrbit.energy * pastOrbit.size, dda, dda + 0.5 * Math.abs(Math.sin(this.energy * Math.PI * 2)))
      ctx.arc(pastOrbit.x, pastOrbit.y, pastOrbit.energy * rr, dda, dda + 0.1)
      // ctx.moveTo(this.orbit.x, this.orbit.y);
      // ctx.lineTo(lp.x, lp.y);
      ctx.stroke();
    })
  }
}