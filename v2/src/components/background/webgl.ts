import { FRAGMENT_SHADER, SHADER_DARK, SHADER_LIGHT, VERTEX_SHADER } from "./shader.glsl";

/**
 * The shader is a soft, low-frequency gradient, so rendering at half the device
 * resolution and letting CSS scale it up is imperceptible while roughly
 * quartering mobile GPU fill cost.
 */
const RESOLUTION_SCALE = 0.5;
const MAX_DEVICE_PIXEL_RATIO = 2;

/**
 * The viewport shape the pattern is drawn undistorted at, filling p ∈ [-1, 1]
 * on both axes. Any other shape crops it like `object-fit: cover` — a wider
 * window shows a horizontal band, a phone a vertical slice from the middle —
 * so resizing never stretches it. p also never leaves [-1, 1], the only range
 * the v1 math was designed for.
 */
const REFERENCE_ASPECT = 16 / 9;

export interface ShaderHandle {
  dispose: () => void;
}

/**
 * highp is optional for fragment shaders in WebGL1, so check before asking for
 * it and fall back the way three.js does. The animation needs it: see the note
 * in shader.glsl.ts on how mediump quantises the growing `time` uniform.
 */
function fragmentPrecision(gl: WebGLRenderingContext): "highp" | "mediump" {
  const highp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  return highp && highp.precision > 0 ? "highp" : "mediump";
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function initShader(container: HTMLElement): ShaderHandle {
  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });

  if (!gl) return { dispose: () => canvas.remove() };

  const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compile(
    gl,
    gl.FRAGMENT_SHADER,
    `precision ${fragmentPrecision(gl)} float;\n${FRAGMENT_SHADER}`,
  );
  const program = gl.createProgram();

  if (!vertexShader || !fragmentShader || !program) {
    canvas.remove();
    return { dispose: () => {} };
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Shader link failed:", gl.getProgramInfoLog(program));
    canvas.remove();
    return { dispose: () => {} };
  }

  // Shader objects are retained by the linked program; the handles are not needed.
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  gl.useProgram(program);

  // One fullscreen triangle strip, replacing three.js' PlaneGeometry(2, 2).
  // uv is supplied explicitly so the GLSL stays byte-identical to v1.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    // x, y, z, u, v
    new Float32Array([-1, -1, 0, 0, 0, 1, -1, 0, 1, 0, -1, 1, 0, 0, 1, 1, 1, 0, 1, 1]),
    gl.STATIC_DRAW,
  );

  const stride = 5 * Float32Array.BYTES_PER_ELEMENT;
  const positionLocation = gl.getAttribLocation(program, "position");
  const uvLocation = gl.getAttribLocation(program, "uv");

  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(uvLocation);
  gl.vertexAttribPointer(
    uvLocation,
    2,
    gl.FLOAT,
    false,
    stride,
    3 * Float32Array.BYTES_PER_ELEMENT,
  );

  const timeLocation = gl.getUniformLocation(program, "time");
  const scaleLocation = gl.getUniformLocation(program, "uScale");
  gl.uniform3f(gl.getUniformLocation(program, "uColorDark"), ...SHADER_DARK);
  gl.uniform3f(gl.getUniformLocation(program, "uColorLight"), ...SHADER_LIGHT);

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    const width = Math.max(1, Math.round(container.clientWidth * ratio * RESOLUTION_SCALE));
    const height = Math.max(1, Math.round(container.clientHeight * ratio * RESOLUTION_SCALE));

    if (canvas.width === width && canvas.height === height) return;

    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);

    const aspect = width / height;
    if (aspect > REFERENCE_ASPECT) {
      gl.uniform2f(scaleLocation, 1, REFERENCE_ASPECT / aspect);
    } else {
      gl.uniform2f(scaleLocation, aspect / REFERENCE_ASPECT, 1);
    }
  };

  const draw = (seconds: number) => {
    gl.uniform1f(timeLocation, seconds);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  resize();

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;

  const loop = () => {
    frame = requestAnimationFrame(loop);
    draw(performance.now() / 1000);
  };

  const stop = () => {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const start = () => {
    if (frame || reducedMotion.matches || document.hidden) return;
    frame = requestAnimationFrame(loop);
  };

  // A still frame is enough when motion is unwelcome, or while the tab is hidden.
  const onVisibilityChange = () => (document.hidden ? stop() : start());
  const onReducedMotionChange = () => {
    if (reducedMotion.matches) {
      stop();
      draw(performance.now() / 1000);
    } else {
      start();
    }
  };
  const onResize = () => {
    resize();
    if (!frame) draw(performance.now() / 1000);
  };

  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  reducedMotion.addEventListener("change", onReducedMotionChange);

  draw(performance.now() / 1000);
  start();

  return {
    dispose: () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onReducedMotionChange);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    },
  };
}
