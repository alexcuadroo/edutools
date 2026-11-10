import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_pixelRatio;

  float bayer2(vec2 p) {
    p = mod(floor(p), 2.0);
    return mod(2.0 * p.x + 3.0 * p.y, 4.0);
  }

  float bayer8(vec2 p) {
    return (16.0 * bayer2(p) + 4.0 * bayer2(p / 2.0)
      + bayer2(p / 4.0) + 0.5) / 64.0;
  }

  void main() {
    float pixelSize = 3.0 * u_pixelRatio;
    vec2 pixel = floor(gl_FragCoord.xy / pixelSize);
    vec2 uv = (pixel + 0.5) * pixelSize / u_resolution;
    vec2 p = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    float t = u_time * 0.16;

    // Un campo de ondas deformado, convertido en una trama Bayer de 8 × 8.
    p.x += 0.18 * sin(p.y * 4.0 + t);
    p.y += 0.16 * sin(p.x * 3.0 - t * 0.8);
    float wave = sin(p.x * 5.0 + p.y * 6.0 + t);
    float rings = sin(length(p - vec2(0.45, -0.15)) * 11.0 - t * 1.3);
    float field = smoothstep(-0.8, 1.0, wave * 0.55 + rings * 0.45);
    float envelope = smoothstep(0.08, 0.7, uv.x) * (0.5 + 0.5 * sin(uv.y * 3.14159));
    float density = field * envelope * 0.63;
    float threshold = bayer8(pixel);
    vec3 paper = vec3(0.984, 0.980, 0.973);
    vec3 violet = vec3(0.64, 0.51, 0.82);
    vec3 mint = vec3(0.40, 0.69, 0.58);
    vec3 pigment = mix(violet, mint, smoothstep(0.35, 0.88, uv.x + p.y * 0.45));
    vec3 color = mix(paper, pigment, step(threshold, density) * 0.48);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function DitheringBackground({ paused = false }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const syncAnimationRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    syncAnimationRef.current?.();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false });
    if (!gl) return; // El fondo CSS sigue visible si WebGL no está disponible.

    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const dispose = () => {
      shaders.forEach((shader) => gl.deleteShader(shader));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
    if (!vertex || !fragment || !program || !buffer) { dispose(); return; }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { dispose(); return; }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const time = gl.getUniformLocation(program, "u_time");
    const pixelRatio = gl.getUniformLocation(program, "u_pixelRatio");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    let frame = 0;
    let elapsed = 0;
    let previous = 0;
    let lastDraw = -Infinity;

    const draw = () => {
      gl.uniform1f(time, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.style.opacity = "1";
    };
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(pixelRatio, ratio);
      draw();
    };
    const tick = (now: number) => {
      const delta = previous ? Math.min((now - previous) / 1000, 0.1) : 0;
      previous = now;
      if (!pausedRef.current) elapsed += delta;
      if (!pausedRef.current && now - lastDraw >= 1000 / 30) {
        draw();
        lastDraw = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const syncAnimation = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (visible && !document.hidden && !pausedRef.current && !reducedMotion.matches && !gl.isContextLost()) {
        frame = requestAnimationFrame(tick);
      }
    };
    syncAnimationRef.current = syncAnimation;
    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      syncAnimation();
    });
    const onContextLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      canvas.style.opacity = "0";
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    document.addEventListener("visibilitychange", syncAnimation);
    reducedMotion.addEventListener("change", syncAnimation);
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    resize();
    syncAnimation();

    return () => {
      syncAnimationRef.current = null;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", syncAnimation);
      reducedMotion.removeEventListener("change", syncAnimation);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      dispose();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-0" />;
}
