// Corre dentro de sim/generado/carrito_3d.html?sim#armado: mete letras 3D reales en la escena del carrito,
// añade reflejo de piso, bloom y desenfoque de movimiento, y entrega cada cuadro como JPEG.
window.__initStage = async (fontB64, BEAT) => {
  const THREE = await import("three");
  const { TextGeometry } = await import("three/addons/geometries/TextGeometry.js");
  const { FontLoader } = await import("three/addons/loaders/FontLoader.js");
  const { TTFLoader } = await import("three/addons/loaders/TTFLoader.js");
  const { EffectComposer } = await import("three/addons/postprocessing/EffectComposer.js");
  const { RenderPass } = await import("three/addons/postprocessing/RenderPass.js");
  const { UnrealBloomPass } = await import("three/addons/postprocessing/UnrealBloomPass.js");
  const { OutputPass } = await import("three/addons/postprocessing/OutputPass.js");
  const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
  const { Reflector } = await import("three/addons/objects/Reflector.js");

  window.requestAnimationFrame = () => 0;                         // paro el bucle de la página: yo dirijo cada cuadro
  const A = window.__aether, { scene, camera, renderer, controls, ui } = A;
  controls.enabled = false; ui.labels = false; ui.dims = false;
  document.querySelectorAll(".labels, .tag, .dim").forEach(e => e.remove());
  document.documentElement.style.setProperty("--scene", "#05070a");
  document.documentElement.style.setProperty("--floor", "#07090e");

  const W = 1920, H = 1080, FPS = 30, SUB = 5, SHUTTER = 0.5;     // SUB subcuadros por cuadro = desenfoque de movimiento real
  const BG = new THREE.Color("#05070a");
  scene.background = BG;

  // ── iluminación más dramática y reflejos de entorno ──
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.traverse(o => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.isMeshStandardMaterial) m.envMapIntensity = 0.3; }); });
  let sun = null, floor = null, grid = null;
  scene.children.forEach(o => {
    if (o.type === "HemisphereLight") o.intensity = 0.28;
    if (o.isDirectionalLight && o.castShadow) sun = o;
    if (o.isDirectionalLight && !o.castShadow) o.intensity = 0.25;
    if (o.isMesh && o.geometry.type === "CircleGeometry") floor = o;
    if (o.type === "GridHelper") grid = o;
  });
  sun.intensity = 1.7; sun.position.set(2.6, 5.2, 3.2);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 18 });
  sun.shadow.camera.updateProjectionMatrix(); sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.map?.dispose(); sun.shadow.map = null;
  { const c = grid.geometry.attributes.color; for (let i = 0; i < c.count; i++) c.setXYZ(i, 0.42, 0.37, 1); c.needsUpdate = true; grid.material.opacity = 0.42; }
  const rimL = new THREE.PointLight(0x7a6bff, 9, 0, 2); rimL.position.set(-2.6, 1.7, -2.3); scene.add(rimL);
  const rimR = new THREE.PointLight(0x9d90ff, 7, 0, 2); rimR.position.set(3.0, 1.2, -1.6); scene.add(rimR);

  // Piso pulido: el reflejo se suma encima del piso, que sigue recibiendo sombras.
  const refl = new Reflector(new THREE.CircleGeometry(9, 64), {
    textureWidth: 1280, textureHeight: 720, clipBias: 0.002, multisample: 4,
    shader: {
      name: "ReflejoAditivo",
      uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null } },
      vertexShader: "uniform mat4 textureMatrix; varying vec4 vUv; void main(){ vUv=textureMatrix*vec4(position,1.0); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: "uniform sampler2D tDiffuse; varying vec4 vUv; void main(){ vec2 uv=vUv.xy/vUv.w; vec3 c=vec3(0.0); float w=0.0; for(int i=-3;i<=3;i++){ for(int j=-1;j<=1;j++){ c+=texture2D(tDiffuse,uv+vec2(float(j)*0.0013,float(i)*0.0032)).rgb; w+=1.0; } } gl_FragColor=vec4(c/w*0.3,1.0); }",
    },
  });
  refl.rotateX(-Math.PI / 2); refl.position.y = 0.002;
  refl.material.transparent = true; refl.material.blending = THREE.AdditiveBlending; refl.material.depthWrite = false;
  scene.add(refl);

  const stage = new THREE.Group(); scene.add(stage);
  const worldGroups = scene.children.filter(o => o.type === "Group" && o !== stage);
  const setCart = on => { worldGroups.forEach(g => (g.visible = on)); floor.visible = on; grid.visible = on; refl.visible = on; };

  // ── bloom y salida ──
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 8 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.42, 0.6, 1.5);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const acc = document.createElement("canvas"); acc.width = W; acc.height = H;
  const ctx = acc.getContext("2d");

  // ── tipografía sólida ──
  const buf = Uint8Array.from(atob(fontB64), c => c.charCodeAt(0)).buffer;
  const font = new FontLoader().parse(new TTFLoader().parse(buf));
  const res = font.data.resolution;
  const geoCache = new Map();
  const glyphGeo = (txt, size, depth, bevel = true) => {
    const k = `${txt}|${size}|${depth}|${bevel}`;
    if (!geoCache.has(k)) geoCache.set(k, new TextGeometry(txt, { font, size, height: depth, curveSegments: 7, bevelEnabled: bevel, bevelThickness: depth * 0.07, bevelSize: size * 0.006, bevelSegments: 2 }));
    return geoCache.get(k);
  };
  const mk = (color, faceEm, faceEmI, sideEm, sideEmI) => {
    const face = new THREE.MeshStandardMaterial({ color, metalness: 0.25, roughness: 0.42, emissive: faceEm, emissiveIntensity: faceEmI, envMapIntensity: 0.3 });
    const side = new THREE.MeshStandardMaterial({ color: 0x120e38, metalness: 0.6, roughness: 0.35, emissive: sideEm, emissiveIntensity: sideEmI, envMapIntensity: 0.3 });
    return { face, side, arr: [face, side], base: sideEmI };
  };
  const MAT = {
    white: mk(0xe6e7f0, 0xffffff, 0.04, 0x4a3bff, 0.85),
    violet: mk(0x7f70ff, 0x5b4cff, 0.38, 0x3a2ce0, 0.9),
    red: mk(0xff4a58, 0xff1f38, 0.42, 0xff1f38, 1.1),
    dim: mk(0x3a3d52, 0x000000, 0, 0x2f26a8, 0.6),
  };
  const word = (str, { size = 1, depth = 0.2, mat = MAT.white, track = 0 } = {}) => {
    const g = new THREE.Group(), letters = []; let x = 0;
    for (const ch of str) {
      const adv = ((font.data.glyphs[ch]?.ha ?? res * 0.3) / res) * size + track * size;
      if (ch !== " ") {
        const m = new THREE.Mesh(glyphGeo(ch, size, depth), mat.arr);
        m.position.x = x; m.castShadow = true; m.receiveShadow = true; letters.push(m); g.add(m);
      }
      x += adv;
    }
    letters.forEach(m => { m.position.x -= x / 2; m.userData.x0 = m.position.x; m.userData.y0 = 0; m.userData.z0 = 0; });
    g.userData = { letters, width: x };
    return g;
  };

  // ── utilidades de animación ──
  const clamp = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const outExpo = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const outBack = (t, s = 1.9) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
  const ioCub = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const inCub = t => t * t * t;
  const kick = b => (b < 0 ? 0 : Math.exp(-(b % 1) * 5));
  const pulse = (b, gain = 2.2) => Object.values(MAT).forEach(M => (M.side.emissiveIntensity = M.base * (1 + gain * kick(b))));
  const shake = (t, amt) => (amt <= 0 ? [0, 0] : [Math.sin(t * 91.7) * amt, Math.sin(t * 73.3 + 1.2) * amt]);
  const setCam = (p, q, fov = 36, roll = 0) => {
    camera.position.set(...p); camera.up.set(0, 1, 0); camera.lookAt(...q); if (roll) camera.rotateZ(roll);
    if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  };
  const rise = (w, b, start, { stag = 0.09, dur = 0.8, h = 1.4 } = {}) => w.userData.letters.forEach((m, i) => {
    const k = clamp((b - start - i * stag) / dur), e = outBack(k);
    m.visible = k > 0; m.position.y = m.userData.y0 + (e - 1) * h; m.rotation.x = -0.75 * (1 - clamp(k * 1.5));
  });
  const sink = (w, b, start, { stag = 0.02, dur = 0.4, h = 1.6 } = {}) => w.userData.letters.forEach((m, i) => {
    const k = clamp((b - start - i * stag) / dur);
    if (k > 0) { m.position.y = m.userData.y0 - k * k * h; m.rotation.x = 0.5 * k; m.visible = k < 1; }
  });

  const hazeTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 512; const x = c.getContext("2d"); const g = x.createRadialGradient(256, 256, 0, 256, 256, 256); g.addColorStop(0, "rgba(108,92,255,0.2)"); g.addColorStop(0.45, "rgba(70,55,210,0.07)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 512, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: hazeTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }));
  haze.renderOrder = -1;
  const C = [0.16, 0.52, 0];
  const SHOTS = {};

  // 1 ── ÓRBITA: muros de letras detrás del carrito; el carrito las tapa de verdad.
  SHOTS.orbita = {
    beats: 8, cart: true, fog: [7, 20],
    build() {
      this.a1 = word("ROBOT", { size: 0.66, depth: 0.22 }); this.a2 = word("AUTÓNOMO.", { size: 0.38, depth: 0.17, mat: MAT.violet });
      this.b1 = word("CUENTA", { size: 0.5, depth: 0.2 }); this.b2 = word("INVENTARIO", { size: 0.3, depth: 0.15, mat: MAT.violet });
      for (const [w, y, x, ry] of [[this.a1, 0.4, 1.42, -0.2], [this.a2, 0.02, 1.42, -0.2], [this.b1, 0.36, -1.12, 0.2], [this.b2, 0.02, -1.12, 0.2]]) { w.position.set(x, y, -1.9); w.rotation.y = ry; stage.add(w); }
    },
    update(t) {
      const b = t / BEAT;
      const a = b < 3.7 ? lerp(0.98, 1.3, b / 3.7) : b < 4.4 ? lerp(1.3, 1.72, ioCub((b - 3.7) / 0.7)) : lerp(1.72, 2.1, (b - 4.4) / 3.6);
      const r = 3.05, [sx, sy] = shake(t, 0.012 * kick(b));
      const tx = b < 3.7 ? 0.72 : b < 4.4 ? lerp(0.72, -0.42, ioCub((b - 3.7) / 0.7)) : -0.42;
      setCam([C[0] + Math.cos(a) * r + sx, 0.55 + 0.16 * Math.sin(b * 0.4) + sy, Math.sin(a) * r], [tx, 0.58, -0.3], 37);
      rise(this.a2, b, 0, { h: 0.9 }); rise(this.a1, b, 0.5, { h: 2.0 });
      sink(this.a1, b, 3.45); sink(this.a2, b, 3.5);
      rise(this.b2, b, 4, { h: 0.9 }); rise(this.b1, b, 4.5, { h: 2.0 });
      pulse(b, 1.8);
    },
  };

  // 2 ── DEFECTUOSO: la palabra viaja en una banda, un pistón la expulsa hacia la cámara y cae FUERA.
  SHOTS.defecto = {
    beats: 4, cart: true, fog: [7, 18],
    build() {
      const belt = new THREE.Mesh(new THREE.BoxGeometry(16, 0.2, 1.0), new THREE.MeshStandardMaterial({ color: 0x0c0e15, metalness: 0.5, roughness: 0.5, envMapIntensity: 0.2 }));
      belt.position.set(0, 0.1, 1.5); belt.castShadow = belt.receiveShadow = true; stage.add(belt);
      this.slats = [];
      const sm = new THREE.MeshStandardMaterial({ color: 0x2b2f42, metalness: 0.8, roughness: 0.4, emissive: 0x3a30a8, emissiveIntensity: 0.25, envMapIntensity: 0.2 });
      for (let i = 0; i < 40; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.98), sm); s.position.set(-8 + i * 0.4, 0.206, 1.5); stage.add(s); this.slats.push(s); }
      for (const z of [0.98, 2.02]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(16, 0.045, 0.03), new THREE.MeshStandardMaterial({ color: 0x1a1740, emissive: 0x5b4cff, emissiveIntensity: 1.3 })); rail.position.set(0, 0.215, z); stage.add(rail); }
      const chrome = new THREE.MeshStandardMaterial({ color: 0xc8ccd8, metalness: 1, roughness: 0.16 });
      this.rod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 24), chrome); this.rod.rotation.x = Math.PI / 2; this.rod.position.y = 0.4; stage.add(this.rod);
      this.head = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.3, 0.09), new THREE.MeshStandardMaterial({ color: 0x20222e, metalness: 0.8, roughness: 0.35, emissive: 0x5b4cff, emissiveIntensity: 0.06, envMapIntensity: 0.4 })); this.head.position.y = 0.4; this.head.castShadow = true; stage.add(this.head);
      this.body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.7, 24), new THREE.MeshStandardMaterial({ color: 0x3a3e50, metalness: 0.9, roughness: 0.3 })); this.body.rotation.x = Math.PI / 2; this.body.position.set(0, 0.4, 0.1); this.body.castShadow = true; stage.add(this.body);
      this.bad = word("DEFECTUOSO", { size: 0.3, depth: 0.12, mat: MAT.red }); this.bad.position.y = 0.21; stage.add(this.bad);
      this.out = word("FUERA.", { size: 0.46, depth: 0.18 }); this.out.position.set(0, 0.21, 1.5); stage.add(this.out);
      this.alarm = new THREE.PointLight(0xff2d45, 0, 0, 2); this.alarm.position.set(0, 1.0, 1.9); stage.add(this.alarm);
    },
    update(t) {
      const b = t / BEAT;
      const land = 2.8, hit = b >= land ? Math.exp(-(b - land) * 7) : 0, [sx, sy] = shake(t, 0.05 * hit + (b >= 2 ? 0.02 * Math.exp(-(b - 2) * 7) : 0));
      setCam([lerp(0.72, 0.1, b / 4) + sx, lerp(1.3, 1.16, b / 4) + sy, lerp(4.05, 3.65, b / 4)], [0.08, 0.5, 0.6], 40);
      const bx = lerp(-6, 0, outExpo(clamp(b / 1.45)));
      this.slats.forEach((s, i) => { let x = -8 + i * 0.4 + (bx + 6); s.position.x = ((x + 8) % 16) - 8; });
      const ext = b < 1.95 ? 0 : outExpo(clamp((b - 1.95) / 0.16)), ret = clamp((b - 2.6) / 0.7);
      const hz = 0.42 + (1.02 - 0.42) * ext * (1 - ret * 0.8);
      this.head.position.z = hz; this.rod.position.z = hz - 0.75;
      const fly = clamp((b - 2.02) / 0.82);
      this.bad.position.x = bx;
      this.bad.position.z = 1.5 + inCub(fly) * 3.6 + fly * 0.5;
      this.bad.position.y = 0.21 + fly * 0.65;
      this.bad.rotation.y = fly * 0.9; this.bad.rotation.x = -fly * 1.5; this.bad.rotation.z = fly * 0.3;
      this.bad.userData.letters.forEach((m, i) => { m.position.y = fly * Math.sin(i * 1.7) * 0.35; m.rotation.z = fly * Math.sin(i * 2.3) * 0.9; });
      this.bad.visible = fly < 1;
      this.alarm.intensity = b > 1.9 && b < 3 ? 22 * Math.exp(-(b - 1.95) * 2.5) : 0;
      // FUERA cae con gravedad y rebota
      this.out.userData.letters.forEach((m, i) => {
        const s = 2.42 + i * 0.045, k = clamp((b - s) / 0.42); m.visible = b > s;
        const y = k < 1 ? (1 - k * k) * 3.2 : Math.abs(Math.sin((b - s - 0.42) * 7)) * 0.07 * Math.exp(-(b - s - 0.42) * 5);
        m.position.y = y; m.rotation.z = (1 - clamp(k * 1.1)) * (i % 2 ? 0.3 : -0.3);
      });
      pulse(b, 1.4);
    },
  };

  // 3 ── ANILLO: el carrito se despieza y un anillo de letras orbita alrededor, pasando por detrás de las piezas.
  SHOTS.anillo = {
    beats: 8, cart: true, fog: [8, 22],
    build() {
      this.tilt = new THREE.Group(); this.tilt.position.set(C[0], 0.72, 0); this.tilt.rotation.x = 0.34; stage.add(this.tilt);
      this.spin = new THREE.Group(); this.tilt.add(this.spin);
      this.all = [];
      const arc = (str, size, mat, base) => {
        const w = word(str, { size, depth: 0.2, mat }); const R = 2.45;
        w.userData.letters.forEach(m => {
          const x = m.userData.x0 + size * 0.3, phi = x / R + base;
          const p = new THREE.Group(); p.position.set(Math.sin(phi) * R, -0.1, -Math.cos(phi) * R); p.rotation.y = -phi;
          m.position.set(-size * 0.3, 0, 0); p.add(m); this.spin.add(p); this.all.push({ m, p, phi });
        });
      };
      arc("HARDWARE REAL.", 0.46, MAT.white, 0);
      arc("NO UNA SIMULACIÓN.", 0.38, MAT.violet, Math.PI);
    },
    update(t) {
      const b = t / BEAT;
      ui.explodeAmt = ioCub(clamp(b / 3.2)) * (1 - 0.0 * b);
      const a = lerp(1.22, 1.78, b / 8), r = lerp(3.85, 3.35, ioCub(b / 8));
      setCam([C[0] + Math.cos(a) * r, lerp(1.0, 1.2, b / 8), Math.sin(a) * r], [C[0], 0.78, 0], 42);
      const sw = ioCub(clamp((b - 3.55) / 0.95));
      const phiCam = a - Math.PI / 2; this.spin.rotation.y = -phiCam + sw * Math.PI + 0.1 * Math.sin(b * 0.7);
      this.all.forEach(({ m, p, phi }, i) => { m.position.y = Math.sin(b * Math.PI * 0.5 + i * 0.5) * 0.035; const k = clamp((Math.cos(phi - this.spin.rotation.y - phiCam) + 0.12) / 0.34); p.scale.setScalar(Math.max(0.001, outExpo(k))); p.visible = k > 0.002; });
      pulse(b, 1.6);
    },
  };

  // 4 ── CENITAL: el registro se escribe en el piso; las letras crecen desde el suelo con un escáner.
  SHOTS.cenital = {
    beats: 4, cart: true, fog: [8, 22],
    build() {
      this.rows = [];
      const lay = (s, z) => {
        const w = word(s, { size: 0.37, depth: 0.1 }); w.rotation.x = -Math.PI / 2; w.position.set(0.1, 0.006, z); stage.add(w);
        w.userData.letters.forEach(m => { m.material = [MAT.white.face.clone(), MAT.white.side]; });
        this.rows.push(w);
      };
      lay("TODO QUEDA", 1.3); lay("REGISTRADO.", 1.82);
      this.bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 1.45), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xa79dff, emissiveIntensity: 3.2 })); this.bar.position.set(0, 0.012, 1.55); stage.add(this.bar);
      this.light = new THREE.PointLight(0x9d90ff, 0, 0, 2); stage.add(this.light);
    },
    update(t) {
      const b = t / BEAT, e = ioCub(clamp(b / 4));
      setCam([lerp(0.75, 0.3, e), lerp(3.6, 2.45, e), lerp(2.6, 3.55, e)], [0.14, lerp(0.3, 0.42, e), lerp(0.55, 0.75, e)], 42);
      const sx = lerp(-2.4, 2.4, clamp(b / 3.1));
      this.bar.position.x = sx; this.light.position.set(sx, 0.3, 1.55); this.light.intensity = b < 3.3 ? 2.4 : 0;
      this.bar.visible = b < 3.3;
      this.rows.forEach(w => w.userData.letters.forEach(m => {
        const x = m.userData.x0 + 0.1, age = (sx - x) / 0.9;              // qué tan atrás quedó el escáner
        const k = clamp(age * 1.6);
        m.visible = k > 0; m.scale.z = Math.max(0.02, outBack(k));
        m.material[0].emissive.set(0xa79dff); m.material[0].emissiveIntensity = 2.6 * Math.exp(-Math.max(0, age) * 2.2) + 0.1;
      }));
      pulse(b, 1.3);
    },
  };

  // ── túnel hexagonal (el hexágono del logo) con las paredes hechas de palabras ──
  const R = 2.6;
  const buildTunnel = (words, L, gateEvery = 7) => {
    const root = new THREE.Group(); stage.add(root);
    const shellG = new THREE.Group(); shellG.rotation.z = Math.PI / 6; root.add(shellG);
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(R / Math.cos(Math.PI / 6), R / Math.cos(Math.PI / 6), L + 40, 6, 1, true), new THREE.MeshStandardMaterial({ color: 0x0a0b14, metalness: 0.85, roughness: 0.38, side: THREE.BackSide }));
    shell.rotation.x = Math.PI / 2; shell.position.z = -L / 2 + 10; shellG.add(shell);
    let n = 0;
    for (let k = 0; k < 6; k++) {
      const face = new THREE.Group(); face.rotation.z = (k * Math.PI) / 3; root.add(face);
      for (let z = 4, row = 0; z > -L; z -= 1.55, row++) {
        const s = words[(n++ * 7 + k * 3 + row) % words.length], size = Math.min(0.62, 2.55 / (s.length * 0.68));
        const m = new THREE.Mesh(glyphGeo(s, size, 0.16, false), (row + k) % 3 === 0 ? MAT.violet.arr : MAT.dim.arr);
        m.geometry.computeBoundingBox(); const cx = (m.geometry.boundingBox.max.x + m.geometry.boundingBox.min.x) / 2;
        m.rotation.x = -Math.PI / 2; m.position.set(-cx, -R + 0.002, z); face.add(m);
      }
    }
    const gates = [], gm = new THREE.MeshStandardMaterial({ color: 0x8b7fff, emissive: 0x8b7fff, emissiveIntensity: 2.4 });
    for (let z = 0; z > -L; z -= gateEvery) { const g = new THREE.Mesh(new THREE.TorusGeometry(R / Math.cos(Math.PI / 6) - 0.03, 0.045, 8, 6), gm); g.position.z = z; root.add(g); gates.push(g); }
    const lamp = new THREE.PointLight(0xc4bcff, 9, 0, 1.7); root.add(lamp);
    return { root, gates, gm, lamp };
  };
  // Separa las letras como puertas para que la cámara las cruce limpio.
  const doors = (w, s) => w.userData.letters.forEach(m => { const x = m.userData.x0; m.position.x = x + Math.sign(x || 1) * (0.7 + Math.abs(x) * 0.6) * s * 3.2; m.rotation.y = -Math.sign(x || 1) * s * 1.1; });

  // 5 ── TÚNEL A: AETHER LO CAMBIA al fondo; la cámara frena para leerlo y lo atraviesa.
  SHOTS.tunelA = {
    beats: 3, cart: false, fog: [4, 36],
    build() {
      this.t = buildTunnel(["AETHER", "VISIÓN", "SISTEMA", "DATOS", "ROBOT", "LÍNEA"], 80);
      this.g = -46;
      this.w1 = word("AETHER", { size: 0.98, depth: 0.34, mat: MAT.violet }); this.w1.position.set(0, -0.04, this.g); stage.add(this.w1);
      this.w2 = word("LO CAMBIA.", { size: 0.52, depth: 0.2 }); this.w2.position.set(0, -0.62, this.g); stage.add(this.w2);
    },
    update(t) {
      const b = t / BEAT;
      const d = b < 1.05 ? lerp(46, 6.4, outExpo(b / 1.05)) : b < 2.45 ? lerp(6.4, 5.2, (b - 1.05) / 1.4) : lerp(5.2, -3, inCub((b - 2.45) / 0.55));
      const z = this.g + d, roll = lerp(-0.55, 0, outExpo(clamp(b / 1.1))) + (b > 2.45 ? inCub((b - 2.45) / 0.55) * 0.8 : 0.02 * (b - 1.05));
      setCam([0, 0, z], [0, -0.1, z - 10], 44, roll);
      this.t.lamp.position.z = z - 2.5;
      const s = clamp((3.2 - d) / 3.2); doors(this.w1, s); doors(this.w2, s);
      this.t.gm.emissiveIntensity = 1.8 + 3 * kick(b);
      pulse(b, 1.6);
    },
  };

  // 6 ── TÚNEL DE VERBOS: cada golpe una compuerta de letras que se abre al pasar.
  SHOTS.verbos = {
    beats: 4, cart: false, fog: [4, 30],
    build() {
      this.t = buildTunnel(["INSPECCIONA", "DECIDE", "TRANSPORTA", "REGISTRA", "AETHER"], 62, 5);
      this.sp = 12;
      this.ws = ["INSPECCIONA.", "DECIDE.", "TRANSPORTA.", "REGISTRA."].map((s, k) => {
        const size = Math.min(1.1, 4.3 / (s.length * 0.82));
        const w = word(s, { size, depth: 0.28, mat: k === 3 ? MAT.violet : MAT.white }); w.position.set(0, -size * 0.36, -k * this.sp - this.sp); stage.add(w); return w;
      });
    },
    update(t) {
      const b = t / BEAT, k = Math.min(3, Math.floor(b)), u = b - k;
      const gz = -k * this.sp - this.sp;                                // compuerta de este tiempo
      const d = u < 0.3 ? lerp(this.sp, 4.7, outExpo(u / 0.3)) : u < 0.8 ? lerp(4.7, 3.9, (u - 0.3) / 0.5) : lerp(3.9, 0, inCub((u - 0.8) / 0.2));
      const z = gz + d;
      setCam([0, 0, z], [0, 0, z - 10], 46, (k % 2 ? 1 : -1) * lerp(0.42, 0, outExpo(clamp(u / 0.32))));
      this.t.lamp.position.z = z - 2.5;
      this.ws.forEach((w, i) => { const dd = w.position.z - z; doors(w, clamp((dd + 2.6) / 2.6)); w.visible = i === k || (i === k + 1 && u > 0.82); });
      this.t.gm.emissiveIntensity = 1.8 + 4 * kick(b);
      pulse(b, 2);
    },
  };

  // 7 ── TÚNEL FINAL: aceleración máxima hacia la luz; empalma con el logo del cierre.
  SHOTS.final = {
    beats: 2, cart: false, fog: [4, 40],
    build() { this.t = buildTunnel(["AETHER", "INSPECCIÓN", "VISIÓN", "MANUFACTURA", "ROBOT", "REGISTRO"], 110, 4); },
    update(t) {
      const b = t / BEAT, u = clamp(b / 2), z = -inCub(u) * 90 - u * 14;
      setCam([0, 0, z], [0, 0, z - 10], lerp(44, 78, inCub(u)), u * u * 1.6);
      this.t.lamp.position.z = z - 3;
      this.t.gm.emissiveIntensity = 2 + 40 * inCub(u);
      renderer.toneMappingExposure = 0.92 + 9 * Math.pow(u, 7);
      pulse(b, 2);
    },
  };

  let cur = null;
  window.__begin = name => {
    while (stage.children.length) stage.remove(stage.children[0]);
    cur = SHOTS[name]; setCart(cur.cart);
    ui.explodeAmt = 0; renderer.toneMappingExposure = 0.92; camera.far = 220; camera.updateProjectionMatrix();
    scene.fog = new THREE.Fog(BG, cur.fog[0], cur.fog[1]);
    Object.values(MAT).forEach(M => (M.side.emissiveIntensity = M.base));
    cur.build();
    if (cur.cart) { haze.scale.set(26, 13, 1); haze.position.set(0, 1.9, -9); stage.add(haze); }
    return Math.round(cur.beats * BEAT * FPS) + 2;
  };
  window.__frame = (i, sub = SUB) => {
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    for (let s = 0; s < sub; s++) {
      cur.update((i + (s / sub) * SHUTTER) / FPS);
      if (cur.cart) A.applyAt(ui.T, 0.016);
      composer.render();
      ctx.globalAlpha = 1 / (s + 1);
      ctx.drawImage(renderer.domElement, 0, 0, W, H);
    }
    return acc.toDataURL("image/jpeg", 0.94);
  };
  return Object.keys(SHOTS);
};
