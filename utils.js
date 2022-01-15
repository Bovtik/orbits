function hexToRgb(hexStr) {
  let r = 0, g = 0, b = 0;

  if (!typeof hexStr == 'string' || !hexStr.startsWith('#')) return { r, g, b };

  r = parseInt(hexStr.substring(1, 3), 16);
  g = parseInt(hexStr.substring(3, 5), 16);
  b = parseInt(hexStr.substring(5, 7), 16);
  a = parseInt(hexStr.substring(7, 9), 16) || 0;

  return { r, g, b, a };
}

function hsvToRgb(hsv) {
  let h = hsv.h / 360,
    s = hsv.s / 100,
    v = 1;

  let r, g, b;

  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

const drawCircle = function drawCircle (x, y, radius, ctx) {
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI);
  ctx.fill();
}

const strokeCircle = function drawCircle(x, y, radius, ctx) {
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI);
  ctx.stroke();
}

function dist(a, b) {
  if (!b) {
    b = {
      x: 0,
      y: 0
    }
  }
  return Math.pow(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2), 0.5)
}

//  Mitchells best-candidate
function MitchellsSampler(width, height, maxRadius, minRadius) {
  let baseCandidates = 20,
      samples = [];

  return function () {
    let n = baseCandidates * samples.length + 1;
    let bestDistance = 0,
        bestCandidate = null;

    for (let i = 0; i < n; i++) {
      let candidate = {
        x: Math.random() * width,
        y: Math.random() * height
      };
      // if (!bestCandidate) {
      //   bestCandidate = candidate;
      // }

      if (!samples.length) {
        samples.push(candidate);
        return candidate;
      }

      let d = width + height;

      // samples.forEach( sample => {
      //   let ds = dist(sample, candidate);

      //   if (ds < d) {
      //     d = ds;
      //   }
      // })\
      for (let j = 0; j < samples.length; j++) {
        let ds = dist(samples[j], candidate);

        if (ds < d) {
          d = ds;
        }
      }

      if (d > bestDistance && d > minRadius && d > maxRadius) {
        bestDistance = d;
        bestCandidate = candidate;
        bestCandidate.d = bestDistance;

        // console.log(bestCandidate)
      }
    }

    if (bestCandidate == null) {
      return null;
    }
    
    samples.push(bestCandidate);
    
    return bestCandidate;
  }
}