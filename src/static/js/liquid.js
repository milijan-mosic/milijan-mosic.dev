import LiquidBackground from "/static/js/liquid.min.js";

const app = LiquidBackground(document.getElementById("canvas"));

app.loadImage("/static/images/background.webp");
app.liquidPlane.material.metalness = 0.75;
app.liquidPlane.material.roughness = 0.25;
app.liquidPlane.uniforms.displacementScale.value = 5;
app.setRain(true);
