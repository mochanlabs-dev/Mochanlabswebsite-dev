// "Ink" wipe: a WebGL overlay that floods the screen with a solid colour from
// the bottom up. The edge is a noise field thresholded against a moving front
// line, which produces the jagged, splashy boundary with detached blobs ahead
// of it. The noise drifts over time so the edge looks liquid while scrolling.

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uProgress;
uniform float uTime;
uniform vec3 uColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 q = vec2(uv.x * uRes.x / uRes.y, uv.y);

  float coarse = fbm(q * 3.6 + vec2(0.0, -uTime * 0.25));
  float fine = fbm(q * 12.0 + vec2(uTime * 0.12, 0.0));

  // Front travels from below the screen (-0.4) to above it (1.4), so the
  // overlay is fully clear at progress 0 and fully solid at progress 1.
  float front = mix(-0.4, 1.4, uProgress);
  float d = (front - uv.y) + (coarse - 0.5) * 0.55 + (fine - 0.5) * 0.24;
  float a = smoothstep(0.0, 0.004, d);

  gl_FragColor = vec4(uColor * a, a);
}
`;

export type Ink = {
  setProgress: (p: number) => void;
  resize: () => void;
  destroy: () => void;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Ink overlay with a plain bottom-up wipe as fallback (no WebGL, or reduced
 * motion). `fallback` is an element filled with the same colour and
 * `transform-origin: bottom`. Returns a progress setter (clamped to 0–1).
 */
export function attachInk(
  canvas: HTMLCanvasElement,
  fallback: HTMLElement,
  color: [number, number, number],
  useWebGL = true,
) {
  const ink = useWebGL ? createInk(canvas, color) : null;
  canvas.style.display = ink ? "" : "none";
  const onResize = () => ink?.resize();
  window.addEventListener("resize", onResize);
  return {
    set(p: number) {
      p = Math.min(1, Math.max(0, p));
      if (ink) ink.setProgress(p);
      else fallback.style.transform = `scaleY(${p})`;
    },
    destroy() {
      ink?.destroy();
      window.removeEventListener("resize", onResize);
    },
  };
}

/**
 * Creates the ink overlay on `canvas`. Returns null when WebGL is unavailable
 * so the caller can fall back to a plain wipe.
 */
export function createInk(
  canvas: HTMLCanvasElement,
  color: [number, number, number] = [1, 1, 1],
): Ink | null {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, "uRes");
  const uProgress = gl.getUniformLocation(program, "uProgress");
  const uTime = gl.getUniformLocation(program, "uTime");
  gl.uniform3fv(gl.getUniformLocation(program, "uColor"), color);

  let progress = 0;
  let raf = 0;
  const start = performance.now();

  const draw = () => {
    gl.uniform1f(uProgress, progress);
    gl.uniform1f(uTime, (performance.now() - start) / 1000);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Only animate while the wipe is in progress; idle otherwise.
  const loop = () => {
    draw();
    raf = progress > 0 && progress < 1 ? requestAnimationFrame(loop) : 0;
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    draw();
  };

  resize();

  return {
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
      if (!raf) loop();
    },
    resize,
    // The GL context is left alive: the canvas may be reused by a remount
    // (React re-runs effects in development), and getContext would then
    // return the lost context.
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    },
  };
}
