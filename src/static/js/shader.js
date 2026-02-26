import * as THREE from "three";

let camera, scene, renderer;
let uniforms;
const multiColor = false;

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float time;
uniform vec3 uColor;

void main() {
  vec2 p = -1.0 + 2.0 * vUv;
  float a = time * 40.0;
  float d, e, f, g = 1.0 / 40.0 ,h ,i ,r ,q;

  e = 400.0 * ( p.x * 0.5 + 0.5 );
  f = 400.0 * ( p.y * 0.5 + 0.5 );
  i = 200.0 + sin( e * g + a / 150.0 ) * 20.0;
  d = 200.0 + cos( f * g / 2.0 ) * 18.0 + cos( e * g ) * 7.0;
  r = sqrt( pow( abs( i - e ), 2.0 ) + pow( abs( d - f ), 2.0 ) );
  q = f / r;
  e = ( r * cos( q ) ) - a / 2.0;
  f = ( r * sin( q ) ) - a / 2.0;
  d = sin( e * g ) * 176.0 + sin( e * g ) * 164.0 + r;
  h = ( ( f + d ) + a / 2.0 ) * g;
  i = cos( h + r * p.x / 1.3 ) * ( e + e + a ) + cos( q * g * 6.0 ) * ( r + h / 3.0 );
  h = sin( f * g ) * 144.0 - sin( e * g ) * 212.0 * p.x;
  h = ( h + ( f - e ) * q + sin( r - ( a + h ) / 7.0 ) * 10.0 + i / 4.0 ) * g;
  i += cos( h * 2.3 * sin( a / 350.0 - q ) ) * 184.0 * sin( q - ( r * 4.3 + a / 12.0 ) * g ) + tan( r * g + h ) * 184.0 * cos( r * g + h );
  i = mod( i / 5.6, 256.0 ) / 64.0;
  if ( i < 0.0 ) i += 4.0;
  if ( i >= 2.0 ) i = 4.0 - i;
  d = r / 350.0;
  d += sin( d * d * 8.0 ) * 0.52;
  f = ( sin( a * g ) + 1.0 ) / 2.0;

  vec3 baseColor =
  vec3( f * i / 1.6, i / 2.0 + d / 13.0, i ) * d * p.x +
  vec3( i / 1.3 + d / 8.0, i / 2.0 + d / 18.0, i ) * d * ( 1.0 - p.x );
  
  gl_FragColor = vec4(baseColor * uColor, 1.0);
}
`;

export function initShader(containerId) {
  const container = document.getElementById(containerId);

  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene = new THREE.Scene();

  const geometry = new THREE.PlaneGeometry(2, 2);

  uniforms = {
    time: { value: 1.0 },
    uColor: { value: new THREE.Color("#00a6f4") },
    // uColor: { value: new THREE.Color("#744FC6") },
    // uColor: { value: new THREE.Color(0x00ffff) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setAnimationLoop(animate);

  container.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  const container = renderer.domElement.parentElement;
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
  if (multiColor) {
    const t = performance.now() / 7000;

    uniforms.uColor.value.setRGB(
      Math.sin(t) * 0.5 + 0.5,
      Math.sin(t + 2.0) * 0.5 + 0.5,
      Math.sin(t + 4.0) * 0.5 + 0.5,
    );
  }
  uniforms.time.value = performance.now() / 1000;

  renderer.render(scene, camera);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!window.__shaderMounted) {
    initShader("background");
    window.__shaderMounted = true;
  }
});
