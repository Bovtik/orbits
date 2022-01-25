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

    this.petalWidth = 5 + Math.random() * (MAX_PETAL_WIDTH - 5);
    // this.petalWidth = 70;

    this.enablePetals = Math.random() < 0.57;
    

    this.enableBg = Math.random() < 0.77;
    this.enableLines = Math.random() < 0.63;
    
    if (CONFIG.bubbleGarden) {
      this.enableLines = false;
      this.enableBg = false;
      this.enablePetals = true;
    }

    if (this.enablePetals) {
      let typeRandom = Math.random();
      if (typeRandom < 0.33) {
        this.petalsWiggle = true;
      }
    }
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

    this.lastOrbitTrail = [];
    this.lastTails = [];

    this.cumulativeEnergy = 0;
  }
  setOrbit(orbit) {
    this.orbit = orbit;
    if (orbit) {
      this.orbit.worm = this;
      this.pastOrbits.push(orbit);
    }

    this.energy = 0;
    this.petalEnergy = 0;
  }
  step() {
    let lp = this.points[this.points.length - 1];

    let dv = {
      x: lp.x - this.orbit.x,
      y: lp.y - this.orbit.y,
    }
    let len = dist(dv);

    let a = Math.atan2(dv.y, dv.x);

    let astep = 2 * Math.asin(WORM_STEP / (2 * len));
    this.petalEnergy += astep;
    if (this.dead || !this.orbit) return;
    

    
    // let step = 100 * (Math.PI / 64) / Math.pow(len, .5);

    this.energy += astep / (Math.PI * 2);
    this.cumulativeEnergy += astep / (Math.PI * 2);
    this.orbit.energy += astep / (Math.PI * 2);

    // if (this.energy > MAX_WORM_ENERGY) {
    //   this.dead = true;
    //   this.energy = MAX_WORM_ENERGY;
    //   return;
    // }

    if (this.cumulativeEnergy >= MAX_CUMULATIVE) {
      this.dead = true;
      this.cumulativeEnergy = MAX_CUMULATIVE;
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
    if (!this.orbit.enableLines) return;

    let lp = this.points[this.points.length - 1];

    ctx.lineWidth = 2 * this.energy;
    // ctx.lineWidth = 1;
    let x = Math.PI * this.orbit.size * this.orbit.energy;
    let len = (this.energy + 0.1) * 0.5 * (Math.sin(this.orbit.energy * x * 0.5) * Math.cos(0.35 * this.energy * x) + 1) / 1.1;

    let grad = ctx.createLinearGradient(lp.x, lp.y, this.orbit.x, this.orbit.y);

    let acol = new Color(this.color);
    acol.a = 0;

    grad.addColorStop(0, acol.toString())
    grad.addColorStop(0.2 * len, this.color.toString())
    grad.addColorStop(0.8 * len, this.orbit.color.toString())
    grad.addColorStop(0.81 * len, '#00000000');

    ctx.strokeStyle = grad;
    ctx.shadowBlur = WORM_STEP * 0.5;

    ctx.beginPath();
    ctx.moveTo(lp.x, lp.y);
    ctx.lineTo(this.orbit.x, this.orbit.y);
    ctx.stroke();
  }

  drawOrbitTrails(ctx) {
    let maxStep = 3;
    let lp = this.points[this.points.length - 1];

    this.pastOrbits
    .filter( pastOrbit => pastOrbit.enablePetals )
    .forEach( (pastOrbit, i) => {
      let r = dist(lp, pastOrbit);
      let k = pastOrbit.energy * this.petalEnergy / MAX_ORBIT_ENERGY;
      // let k = this.energy * 0.99
      let rr = r * k;

      let arcRad = 1 * rr;
      if (arcRad > pastOrbit.size) arcRad = pastOrbit.size;
      // arcRad -= 20;
      // if (arcRad < 0) arcRad = 0;

      let radK = arcRad / pastOrbit.size;

      let g2 = ctx.createRadialGradient(pastOrbit.x, pastOrbit.y, 0, pastOrbit.x, pastOrbit.y, pastOrbit.size);

      let or = this.lastOrbitTrail[i] ? this.lastOrbitTrail[i].r : 0;
      // or *= 0.9
      or -= 0.1;
      if (or < 0) or = 0;

      if (arcRad - or > maxStep) arcRad = or + maxStep;


      // g2.addColorStop(0, "#00000000");
      // g2.addColorStop(or / (arcRad > 0 ? arcRad : pastOrbit.size), "#00000000");
      // g2.addColorStop(1, this.color.toString());
      // g2.addColorStop(arcRad / pastOrbit.size, "#00000000");
      // g2.addColorStop(1, "#00000000");

      g2.addColorStop(0, this.color.toString());
      g2.addColorStop(1, this.orbit.color.toString());
      // g2.addColorStop(1.01 * rr / r, '#00000000');

      ctx.fillStyle = g2;
      ctx.lineWidth = 0;

      let dd = {
        x: lp.x - pastOrbit.x,
        y: lp.y - pastOrbit.y
      };
      
      let shadowColor = new Color(this.color);
      shadowColor.a = 0.2;
      ctx.shadowColor = shadowColor.toString();
      ctx.shadowBlur = 0;

      
      
      let dda = Math.atan2(dd.y, dd.x);

      if (pastOrbit.petalsWiggle) {
        // let ddaOffset = Math.cos(pastOrbit.energy * Math.PI * pastOrbit.size / 12) * 0.2 * Math.log(pastOrbit.energy * 1);
        let tSize = 25;
        let ddaOffsetX = radK * Math.PI * 2 * (pastOrbit.size / tSize);
        let ddaOffsetK = 0.22;
        let ddaOffset = Math.cos(ddaOffsetX) * ddaOffsetK;
        dda += ddaOffset;
      }
      
      // let dda = this.lastOrbitTrail[i] ? this.lastOrbitTrail[i].angle : Math.atan2(dd.y, dd.x);
      let dda2 = this.lastOrbitTrail[i] ? this.lastOrbitTrail[i].angle : dda;

      let ddd = Math.abs(or - arcRad) / pastOrbit.size;
      if (Math.abs(arcRad - or) > maxStep + 1) {
        this.lastOrbitTrail[i] = {
          r: arcRad,
          angle: dda
        }
        return;
      }

      let astep = 2 * Math.asin(pastOrbit.petalWidth / (2 * pastOrbit.size));
      // let astep = this.orbit.energy * pastOrbit.size * 0.001;
      let angleWidth = astep * Math.sin(radK * Math.PI);
      let angleOffset = angleWidth / 2;
      let oldOffset = this.lastOrbitTrail[i] ? this.lastOrbitTrail[i].offset : angleOffset;

      ctx.beginPath();

      ctx.moveTo(pastOrbit.x + Math.cos(dda - angleOffset) * arcRad, pastOrbit.y + Math.sin(dda - angleOffset) * arcRad);
      ctx.lineTo(pastOrbit.x + Math.cos(dda + angleOffset) * arcRad, pastOrbit.y + Math.sin(dda + angleOffset) * arcRad);

      ctx.lineTo(pastOrbit.x + Math.cos(dda2 + oldOffset) * (or - 1), pastOrbit.y + Math.sin(dda2 + oldOffset) * (or - 1));
      ctx.lineTo(pastOrbit.x + Math.cos(dda2 - oldOffset) * (or - 1), pastOrbit.y + Math.sin(dda2 - oldOffset) * (or - 1));
      
      ctx.closePath();
      // ctx.arc(pastOrbit.x, pastOrbit.y, or, dda, dda + 0.1)
      // ctx.arc(pastOrbit.x, pastOrbit.y, arcRad, dda, dda + 0.1)

      ctx.fill();

      this.lastOrbitTrail[i] = {
        r: arcRad,
        angle: dda,
        offset: angleOffset
      }
    })
  }

  drawTrails(ctx) {
    let lp = this.points[this.points.length - 1];


    this.pastOrbits.forEach( (pastOrbit, i) => {
      let dv = {
        x: pastOrbit.x - lp.x,
        y: pastOrbit.y - lp.y
      };

      let angle = Math.atan2(dv.y, dv.x);
      angle -= (this.cumulativeEnergy / MAX_CUMULATIVE) * Math.PI * 17 + pastOrbit.energy * Math.PI * 2;
      
      // let r = dist(dv) - pastOrbit.size;
      let r = 30;
      let k = 1 - this.cumulativeEnergy / MAX_CUMULATIVE;
      let kk = this.cumulativeEnergy / MAX_CUMULATIVE;
      r *= Math.pow(kk - 1, 2);

      let newPoint = {
        x: lp.x + Math.cos(angle) * r,
        y: lp.y + Math.sin(angle) * r
      }

      let oldPoint = this.lastTails[i] ? this.lastTails[i] : newPoint;

      let g2 = ctx.createRadialGradient(lp.x, lp.y, 0, lp.x, lp.y, dist(dv));

      // g2.addColorStop(0, "#00000000");
      // g2.addColorStop(or / (arcRad > 0 ? arcRad : pastOrbit.size), "#00000000");
      // g2.addColorStop(1, this.color.toString());
      // g2.addColorStop(arcRad / pastOrbit.size, "#00000000");
      // g2.addColorStop(1, "#00000000");
      
      let colorK = Math.pow(1 - k, 1.5) * pastOrbit.energy;
      let poColor = new Color(pastOrbit.color);
      poColor.a = colorK;
      let color = new Color(this.color);
      color.a = colorK;

      g2.addColorStop(0, poColor.toString());
      g2.addColorStop(1, color.toString());

      ctx.lineWidth = this.cumulativeEnergy;
      ctx.strokeStyle = g2;

      ctx.shadowBlur = this.cumulativeEnergy;
      ctx.shadowColor = g2;

      ctx.beginPath();

      ctx.moveTo(oldPoint.x, oldPoint.y);
      ctx.lineTo(newPoint.x, newPoint.y);
      // ctx.arc(lp.x, lp.y, 100, angle, angle + 0.3);

      ctx.stroke();

      this.lastTails[i] = newPoint;
    })
  }
}