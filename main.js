const main = function main(canvas, ctx, margin) {
  let amountK = Math.random();
  let amount = Math.floor(95 * amountK) + 5;
  let circles = [];

  // canvas.width = canvas.offsetWidth;
  // canvas.height = canvas.offsetHeight;

  canvas.width = 960;
  canvas.height = 960;

  // ctx.fillStyle = '#000';
  // ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.clearRect(0, 0, canvas.width, canvas.height)


  //  Init

  let pp = MitchellsSampler(canvas.width, canvas.height, 100, 100);
  for (let i = 0; i < amount; i++) {
    let ppp = pp();

    if (!ppp) continue;

    let cc = new Circle({
      x: ppp.x,
      y: ppp.y,
      // size: ppp.d
    });

    circles.push(cc)
    // cc.draw(ctx);
  }

  circles.forEach((circle, i, arr) => {
    let closest = arr.reduce((accum, item) => {
      if (circle != item && dist(circle, item) - item.size < dist(circle, accum) - accum.size) {
        accum = item;
      }

      return accum;
    }, arr[(i + 1) % arr.length])

    circle.size = dist(circle, closest) - margin - closest.size;
    // circle.size = 10;

    if (closest.size == 0) {
      circle.size *= Math.random();
      // circle.noClosest = true;
    }

    // circle.size = 10;


    circle.closest = closest;
  })

  //  Need second and third pass to inflate small circles
  circles.forEach((circle, i, arr) => {
    let closest = arr.reduce((accum, item) => {
      if (circle != item && dist(circle, item) - item.size < dist(circle, accum) - accum.size) {
        accum = item;
      }

      return accum;
    }, arr[(i + 1) % arr.length])

    circle.size = dist(circle, closest) - margin - closest.size;

    circle.closest = closest;
  })
  circles.forEach((circle, i, arr) => {
    let closest = arr.reduce((accum, item) => {
      if (circle != item && dist(circle, item) - item.size < dist(circle, accum) - accum.size) {
        accum = item;
      }

      return accum;
    }, arr[(i + 1) % arr.length])

    circle.size = dist(circle, closest) - margin - closest.size;

    // ctx.lineWidth = circle.size * 0.1;
    // circle.color.a = 0.5;
    // ctx.strokeStyle = circle.color.toString();
    // ctx.beginPath();
    // ctx.moveTo(circle.x, circle.y);
    // ctx.lineTo(closest.x, closest.y);
    // ctx.stroke();

    circle.closest = closest;
  })

  circles.forEach(circle => {
    circle.neighbors = circles.filter(inc => {
      return inc != circle && (dist(circle, inc) - circle.size - inc.size - margin < 0.1);
    })

    // circle.neighbors.forEach( nei => {
    //   ctx.lineWidth = circle.size * 0.1;
    //   // circle.color.a = 0.5;
    //   ctx.strokeStyle = circle.color.toString();
    //   ctx.beginPath();
    //   ctx.moveTo(circle.x, circle.y);
    //   ctx.lineTo(nei.x, nei.y);
    //   ctx.stroke();
    // })
  });

  let worms = [];

  circles.forEach(circle => {
    let clockwise = false;
    let r = circle.size + margin / 2;
    let k = 1;

    if (Math.random() > 0.5) {
      clockwise = true;
      k = -1;
    }

    let wx = 0, wy = 0;

    if (dist(circle, { x: circle.x, y: canvas.height }) < circle.size) {
      wx = k * Math.pow(r * r - Math.pow(circle.y - canvas.height, 2), 0.5) + circle.x;
      wy = canvas.height;
    } else if (dist(circle, { x: circle.x, y: 0 }) < circle.size) {
      wx = -1 * k * Math.pow(r * r - Math.pow(circle.y, 2), 0.5) + circle.x;
      wy = 0;
    } else if (dist(circle, { x: 0, y: circle.y }) < circle.size) {
      wx = 0;
      wy = k * Math.pow(r * r - Math.pow(circle.x, 2), 0.5) + circle.y;
    } else if (dist(circle, { x: canvas.width, y: circle.y }) < circle.size) {
      wx = canvas.width;
      wy = -1 * k * Math.pow(r * r - Math.pow(circle.x - canvas.width, 2), 0.5) + circle.y;
    } else {
      return false
    }

    let worm = new Worm({
      x: wx,
      y: wy,
      orbit: circle,
      clockwise: clockwise
    })

    // worm.nextOrbit = circle.neighbors[Math.floor(Math.random() * circle.neighbors.length)];

    worms.push(worm);
  });

  //  Add worm for circle closest to center
  let centerCircle = circles[0];
  let center = {
    x: canvas.width / 2,
    y: canvas.height / 2
  };

  let cr = canvas.width / 2;

  circles.forEach(circle => {
    if (dist(circle, center) < cr) {
      centerCircle = circle;

      let angle = Math.random() * Math.PI * 2;

      let wx = Math.cos(angle) * (centerCircle.size + margin / 2);
      let wy = Math.sin(angle) * (centerCircle.size + margin / 2);

      let centerWorm = new Worm({
        x: wx + centerCircle.x,
        y: wy + centerCircle.y,
        orbit: centerCircle,
        clockwise: (angle < Math.PI)
      })

      worms.push(centerWorm)
    }
  })


  //  Start
  circles.forEach(circle => circle.draw(ctx));

  let interval = setInterval(() => {
    let allDead = true;

    ctx.globalCompositeOperation = 'destination-over'
    circles
      .filter(circle => circle.enableBg)
      .forEach(circle => circle.draw(ctx));
    ctx.globalCompositeOperation = 'source-over'

    worms.forEach(worm => {
      allDead = allDead && worm.dead;
      worm.drawOrbitTrails(ctx);
      if (worm.dead) return;
      worm.step();
      worm.draw(ctx);

      ctx.globalCompositeOperation = 'destination-over'
      worm.drawLine(ctx);
      ctx.globalCompositeOperation = 'source-over'

      if (
        !CONFIG.bubbleGarden &&
        !CONFIG.hyperOrbits) {
        worm.drawTrails(ctx);
      }

      let lp = worm.points[worm.points.length - 1];

      let dv = {
        x: lp.x - worm.orbit.x,
        y: lp.y - worm.orbit.y,
      }

      let variants = worm.orbit.neighbors;

      variants.forEach(variant => {
        if (worm.pastOrbits.includes(variant)) {
          return;
        }
        let dv2 = {
          x: lp.x - variant.x,
          y: lp.y - variant.y,
        }

        if (Math.abs((dist(dv) + dist(dv2) - (worm.orbit.size + variant.size + margin))) < 0.1) {
          // if (Math.abs(Math.atan2(dv.y, dv.x) + Math.atan2(dv2.y, dv2.x)) < 0.1) {
          worm.setOrbit(variant);
          worm.clockwise = !worm.clockwise;
        }
      })
    })

    if (allDead) {
      // let cum = worms.reduce( (accum, item) => accum += item.cumulativeEnergy, 0);
      // cum /= worms.length;

      clearInterval(interval);

      // fxpreview();

      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
    }
  }, 1000 / FPS);

  return interval
}


document.addEventListener('DOMContentLoaded', () => {
  //  consts 

  let canvas = document.getElementById('main');
  let ctx = canvas.getContext('2d');
  const margin = 20;
  // ctx.translate(0.5, 0.5);
  
  let intervalId = main(canvas, ctx, margin)

  function resizeHandler() {
    canvas.style.width = 'auto';
    canvas.style.height = 'auto';

    let size = Math.min(canvas.offsetWidth, canvas.offsetHeight);

    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
  }

  resizeHandler();
  window.addEventListener('resize', resizeHandler);

  function getOrbitPopulationFeat(pop) {
    if (pop < 0.15) {
      return "very low"
    } else if (pop >= 0.15 && pop < 0.3) {
      return "low"
    } else if (pop >= 0.3 && pop < 0.6) {
      return "medium"
    } else if (pop >= 0.6 && pop < 0.9) {
      return "high"
    } else {
      return "very high"
    }
  };

  document.body.addEventListener('mousemove', (e) => {
    let hw = document.body.offsetWidth / 2;
    let hh = document.body.offsetHeight / 2;

    let maxShadowOffset = 8;

    let kw = -1 * (e.screenX - hw) / hw;
    let kh = -1 * (e.screenY - hh) / hh;

    let xshad = (kw * maxShadowOffset);
    let yshad = (kh * maxShadowOffset);

    const sbg = new Color({
      r: 0,
      g: 0,
      b: 0,
      a: .65
    })

    canvas.style['box-shadow'] = `${xshad}px ${yshad}px 25px 0 ${sbg.toString()}`;
  })

  canvas.addEventListener('click', () => {
    clearInterval(intervalId)
    intervalId = main(canvas, ctx, margin)
  })

  // window.$fxhashFeatures = {
  //   "orbit amount": getOrbitPopulationFeat(amountK),
  //   "bubble garden": CONFIG.bubbleGarden,
  //   "hyper orbits": CONFIG.hyperOrbits,
  // }
})

