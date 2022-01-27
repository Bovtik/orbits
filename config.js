const CONFIG = {
  bubbleGarden: false,
  hyperOrbits: false
}

let rand = Math.random();

if (rand <= 0.1) {
  CONFIG.bubbleGarden = true;
} else if (rand > 0.1 && rand <= 0.2) {
  CONFIG.hyperOrbits = true;
} else if (rand > 0.2 && rand <= 0.23) {
  CONFIG.bubbleGarden = true;
  CONFIG.hyperOrbits = true;
}