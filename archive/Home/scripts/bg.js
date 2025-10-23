// Expose a single initializer the page can call after settings.html is loaded
window.initFluidBG = function initFluidBG(){
  const main = document.getElementById('main');
  const canvas = document.getElementById('gl');
  if (!main || !canvas) { console.warn('Main or canvas not found.'); return; }

  const dpr = () => Math.min(2, window.devicePixelRatio || 1);

  // UI from Settings fragment
  const ui = {
    visc: document.getElementById('visc'), vVal: document.getElementById('vVal'),
    speed: document.getElementById('speed'), sVal: document.getElementById('sVal'),
    swirl: document.getElementById('swirl'), wVal: document.getElementById('wVal'),
    diss: document.getElementById('diss'), dVal: document.getElementById('dVal'),
    kappa: document.getElementById('kappa'), kVal: document.getElementById('kVal'),
    iters: document.getElementById('iters'), iVal: document.getElementById('iVal'),
    spac: document.getElementById('spacing'), spVal: document.getElementById('spVal'),
    siz: document.getElementById('dot'), dotVal: document.getElementById('dotVal'),
    res: document.getElementById('res'), rVal: document.getElementById('rVal'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
  };

  const fmt = (n, p=2) => (+n).toFixed(p);
  const syncLabels = ()=>{
    if(!ui.visc) return; // settings not found
    ui.vVal.textContent = fmt(ui.visc.value);
    ui.sVal.textContent = fmt(ui.speed.value);
    ui.wVal.textContent = fmt(ui.swirl.value);
    ui.dVal.textContent = fmt(ui.diss.value,3);
    ui.kVal.textContent = fmt(ui.kappa.value,3);
    ui.iVal.textContent = ui.iters.value;
    ui.rVal.textContent = fmt(ui.res.value) + '×';
    ui.spVal.textContent = fmt(ui.spac.value);
    ui.dotVal.textContent = fmt(ui.siz.value);
  };
  ['input','change'].forEach(evt=>{
    ui.visc?.addEventListener(evt, syncLabels);
    ui.speed?.addEventListener(evt, syncLabels);
    ui.swirl?.addEventListener(evt, syncLabels);
    ui.diss?.addEventListener(evt, syncLabels);
    ui.kappa?.addEventListener(evt, syncLabels);
    ui.iters?.addEventListener(evt, syncLabels);
    ui.res?.addEventListener(evt, ()=>{ syncLabels(); resize(); });
    ui.spac?.addEventListener(evt, syncLabels);
    ui.siz?.addEventListener(evt, syncLabels);
  });
  syncLabels();

  // WebGL2 setup
  const gl = canvas.getContext('webgl2', { antialias:false, depth:false, stencil:false, premultipliedAlpha:false, alpha:false });
  if (!gl) { console.warn('WebGL2 not supported'); return; }
  canvas.style.cursor = 'default';

  // Helpers
  const $ = (t)=>gl.createShader(t);
  const prog = (vsSrc, fsSrc)=>{
    const vs = $(gl.VERTEX_SHADER); gl.shaderSource(vs, vsSrc); gl.compileShader(vs);
    if(!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(vs));
    const fs = $(gl.FRAGMENT_SHADER); gl.shaderSource(fs, fsSrc); gl.compileShader(fs);
    if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(fs));
    const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if(!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  };

  const quad = ()=>{
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1, 1,-1, -1,1,
      -1,1, 1,-1, 1,1
    ]), gl.STATIC_DRAW);
    const loc = 0; gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return { vao };
  };

  const TEX = (w,h,intFmt,fmt,typ)=>{
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, intFmt, w, h, 0, fmt, typ, null);
    return tex;
  };

  const FBO = (w,h,intFmt=gl.RG16F, fmt=gl.RG, typ=gl.HALF_FLOAT)=>{
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    const tex = TEX(w,h,intFmt,fmt,typ);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.warn('Framebuffer incomplete');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fb, tex, w, h };
  };

  const VS = `#version 300 es
  layout(location=0) in vec2 a;
  out vec2 uv;
  void main(){ uv = a*0.5+0.5; gl_Position = vec4(a,0.0,1.0); }`;

  const FS_UPDATE = `#version 300 es
  precision highp float; precision highp sampler2D;
  in vec2 uv; out vec2 outFlow;
  uniform sampler2D uPrev;
  uniform vec2 uPx;
  uniform vec2 uMouse;
  uniform vec2 uDelta;
  uniform float uDown;
  uniform float uHover;
  uniform float uVisc;
  uniform float uDiss;
  uniform float uForce;
  uniform float uSwirl;
  uniform float uTime;
  float gauss(vec2 p, float s){ return exp(-dot(p,p)/(2.0*s*s)); }
  void main(){
    vec2 v = texture(uPrev, uv).xy;
    vec2 lap = texture(uPrev, uv + vec2(uPx.x,0)).xy + texture(uPrev, uv - vec2(uPx.x,0)).xy +
               texture(uPrev, uv + vec2(0,uPx.y)).xy + texture(uPrev, uv - vec2(0,uPx.y)).xy - 4.0*v;
    v += uVisc * lap;
    v *= (1.0 - uDiss);
    if (uHover > 0.5 || uDown > 0.5) {
      vec2 p = uv - uMouse;
      float r = max(uPx.x, uPx.y) * 40.0;
      float g = gauss(p, r);
      vec2 impulse = uDelta * 2.0;
      vec2 perp = vec2(-impulse.y, impulse.x) * uSwirl;
      float press = mix(0.6, 1.0, step(0.5, uDown));
      v += (impulse + perp) * g * uForce * press;
    }
    outFlow = v;
  }`;

  const FS_RENDER = `#version 300 es
  precision highp float; precision highp sampler2D;
  in vec2 uv; out vec4 outColor;
  uniform sampler2D uField; uniform vec2 uRes; uniform float uKappa; uniform float uTime;
  uniform float uSpacing; uniform float uDotR;
  void main(){
    vec2 flow = texture(uField, uv).xy;
    vec2 p = uv + uKappa * flow;
    vec2 px = p * uRes;
    vec2 g = mod(px + 0.5*uSpacing, uSpacing) - 0.5*uSpacing;
    float d = length(g);
    vec3 bg = vec3(0.06,0.07,0.11);
    float m = smoothstep(uDotR, uDotR-1.0, d);
    vec3 col = mix(bg, vec3(1.0), m);
    outColor = vec4(col, 1.0);
  }`;

  // State & setup
  let W = 0, H = 0, scale = 1.0;
  let A = null, B = null;
  let running = true;

  const full = quad();
  const P_UPDATE = prog(VS, FS_UPDATE);
  const P_RENDER = prog(VS, FS_RENDER);

  function alloc(){
    const intFmt = gl.RG16F; const fmt = gl.RG; const typ = gl.HALF_FLOAT;
    A = FBO(W, H, intFmt, fmt, typ);
    B = FBO(W, H, intFmt, fmt, typ);
    gl.bindFramebuffer(gl.FRAMEBUFFER, A.fb); gl.viewport(0,0,W,H);
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, B.fb); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function resize(){
    const rs = parseFloat(ui.res.value);
    scale = rs;
    const rect = main.getBoundingClientRect();
    const w = Math.max(2, Math.floor(rect.width * dpr() * rs));
    const h = Math.max(2, Math.floor(rect.height * dpr() * rs));
    if (w === W && h === H) { fitCanvas(); return; }
    W = w; H = h; fitCanvas(); alloc();
  }
  function fitCanvas(){
    const rect = main.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr());
    canvas.height = Math.floor(rect.height * dpr());
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  }
  window.addEventListener('resize', resize, { passive: true });
  const ro = new ResizeObserver(resize); ro.observe(main);

  // Pointer input (global so foreground elements don't block)
  const pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, down: 0, alt: 0, shift: 0, over: 0 };
  let lastX = null, lastY = null;
  const getUV = (e)=>{
    const rect = canvas.getBoundingClientRect();
    const x = (('touches' in e)? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (('touches' in e)? e.touches[0].clientY : e.clientY) - rect.top;
    return { u: x/rect.width, v: 1 - y/rect.height, rect };
  };
  const onMove = (e)=>{
    const { u, v, rect } = getUV(e);
    const nx = u, ny = v;
    if (lastX !== null) { pointer.dx = (nx - lastX); pointer.dy = (ny - lastY); }
    lastX = pointer.x = nx; lastY = pointer.y = ny;
    pointer.alt = e.altKey ? 1 : 0; pointer.shift = e.shiftKey ? 1 : 0;
    pointer.over = (e.clientX>=rect.left && e.clientX<=rect.right && e.clientY>=rect.top && e.clientY<=rect.bottom) ? 1 : 0;
  };
  const onDown = (e)=>{ pointer.down = 1; onMove(e); };
  const onUp = ()=>{ pointer.down = 0; pointer.dx = pointer.dy = 0; lastX = lastY = null; };

  window.addEventListener('mousemove', onMove, {passive:true});
  window.addEventListener('mousedown', onDown);
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchstart', e=>{ pointer.down = 1; pointer.over = 1; onMove(e); }, {passive:true});
  window.addEventListener('touchmove', onMove, {passive:true});
  window.addEventListener('touchend', ()=>{ pointer.over = 0; onUp(); }, {passive:true});

  // Buttons
  ui.pauseBtn?.addEventListener('click', ()=>{
    running = !running;
    ui.pauseBtn.textContent = running ? 'Pause' : 'Resume';
    ui.pauseBtn.setAttribute('aria-pressed', String(!running));
    if (running) raf();
  });
  ui.resetBtn?.addEventListener('click', ()=>{ alloc(); });

  // Main loop
  let lastT = performance.now();
  resize();

  function step(){
    const now = performance.now();
    const dt = Math.min(0.033, (now - lastT)/1000);
    lastT = now;

    const iters = parseInt(ui.iters.value);
    const visc = parseFloat(ui.visc.value) * 0.35 * dt;
    const diss = parseFloat(ui.diss.value) * dt * 60.0;
    const force = parseFloat(ui.speed.value) * (pointer.shift? -1.0: 1.0);
    const swirl = parseFloat(ui.swirl.value) * (pointer.alt? 1.4: 1.0);

    gl.bindVertexArray(full.vao);
    for (let i=0;i<iters;i++){
      gl.useProgram(P_UPDATE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, B.fb);
      gl.viewport(0,0,W,H);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.tex);
      gl.uniform1i(gl.getUniformLocation(P_UPDATE,'uPrev'), 0);
      gl.uniform2f(gl.getUniformLocation(P_UPDATE,'uPx'), 1.0/W, 1.0/H);
      gl.uniform2f(gl.getUniformLocation(P_UPDATE,'uMouse'), pointer.x, pointer.y);
      gl.uniform2f(gl.getUniformLocation(P_UPDATE,'uDelta'), pointer.dx, pointer.dy);
      gl.uniform1f(gl.getUniformLocation(P_UPDATE,'uDown'), pointer.down);
      gl.uniform1f(gl.getUniformLocation(P_UPDATE,'uHover'), pointer.over);
      gl.uniform1f(gl.getUniformLocation(P_UPDATE,'uVisc'), visc);
      gl.uniform1f(gl.getUniformLocation(P_UPDATE,'uDiss'), diss);
      gl.uniform1f(gl.getUniformLocation(P_UPDATE,'uForce'), force);
      gl.uniform1f(gl.getUniformLocation(P_UPDATE,'uSwirl'), swirl);
      gl.uniform1f(gl.getUniformLocation(P_UPDATE,'uTime'), now*0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      let T = A; A = B; B = T;
    }

    // Render pass
    gl.useProgram(P_RENDER);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.tex);
    gl.uniform1i(gl.getUniformLocation(P_RENDER,'uField'), 0);
    gl.uniform2f(gl.getUniformLocation(P_RENDER,'uRes'), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(P_RENDER,'uKappa'), parseFloat(ui.kappa.value));
    gl.uniform1f(gl.getUniformLocation(P_RENDER,'uTime'), now*0.001);
    const cssMM = 3.78; // px per mm at 96dpi
    const spacingMM = Math.max(0.1, parseFloat(ui.spac.value));
    const spacingPX = spacingMM * cssMM * dpr();
    gl.uniform1f(gl.getUniformLocation(P_RENDER,'uSpacing'), spacingPX);
    const dotMM = Math.max(0.01, parseFloat(ui.siz.value));
    const dotRadiusPx = dotMM * cssMM * dpr();
    gl.uniform1f(gl.getUniformLocation(P_RENDER,'uDotR'), dotRadiusPx);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // decay pointer velocity
    pointer.dx *= 0.85; pointer.dy *= 0.85;
  }

  function raf(){ if(!running) return; step(); requestAnimationFrame(raf); }
  raf();
};
