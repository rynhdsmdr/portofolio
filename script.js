/* =========================================================
   DATA — ubah bagian ini untuk mengisi portofoliomu
   ========================================================= */
const PROJECTS = [
  {
    title: "Aplikasi Kasir",
    short: "POS sederhana untuk UMKM",
    desc: "Aplikasi kasir berbasis web dengan manajemen stok, laporan harian, dan cetak struk.",
    tags: ["Laravel", "MySQL", "Tailwind"],
    emoji: "🧾",
    tint: "#2b3350",
    link: "#",
  },
  {
    title: "Sistem Perpustakaan",
    short: "Peminjaman buku digital",
    desc: "Sistem informasi perpustakaan kampus: katalog, peminjaman, denda otomatis, dan dashboard admin.",
    tags: ["React", "Node.js", "PostgreSQL"],
    emoji: "📚",
    tint: "#3a2b50",
    link: "#",
  },
  {
    title: "Deteksi Penyakit Daun",
    short: "Klasifikasi citra dengan CNN",
    desc: "Model deep learning untuk mengenali penyakit tanaman dari foto daun, dilengkapi antarmuka web.",
    tags: ["Python", "TensorFlow", "Flask"],
    emoji: "🌿",
    tint: "#1f4030",
    link: "#",
  },
  {
    title: "Aplikasi Catatan",
    short: "Mobile app lintas platform",
    desc: "Aplikasi catatan dengan sinkronisasi cloud, mode gelap, dan pencarian cepat.",
    tags: ["Flutter", "Firebase"],
    emoji: "📝",
    tint: "#4a3a1c",
    link: "#",
  },
  {
    title: "Dashboard Cuaca",
    short: "Visualisasi data real-time",
    desc: "Dashboard yang menampilkan prakiraan cuaca dan grafik historis dari API publik.",
    tags: ["Vue", "Chart.js", "REST API"],
    emoji: "🌦️",
    tint: "#1c3a4a",
    link: "#",
  },
  {
    title: "Game Puzzle",
    short: "Game browser 2D",
    desc: "Game teka-teki orisinal dengan 30 level, dibuat murni dengan Canvas dan JavaScript.",
    tags: ["JavaScript", "Canvas"],
    emoji: "🧩",
    tint: "#4a1c34",
    link: "#",
  },
];

const SKILLS = [
  { icon: "🎨", name: "HTML & CSS", desc: "Layout responsif, animasi, dan aksesibilitas.", level: 90 },
  { icon: "⚡", name: "JavaScript", desc: "ES6+, DOM, dan aplikasi interaktif.", level: 80 },
  { icon: "⚛️", name: "React", desc: "Komponen, hooks, dan state management.", level: 70 },
  { icon: "🐘", name: "PHP & Laravel", desc: "REST API, autentikasi, dan Eloquent.", level: 75 },
  { icon: "🗄️", name: "Basis Data", desc: "Perancangan skema dan query SQL.", level: 70 },
  { icon: "🔧", name: "Git & Linux", desc: "Alur kerja tim dan otomasi sederhana.", level: 80 },
];

/* ========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n) => String(n).padStart(2, "0");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));

/* ---------------------------------------------------------
   1. Kartu identitas: efek bumerang. Awalnya tidak ada, lalu
      dilempar dari dekat pengguna (kiri) menjauh ke kedalaman,
      melengkung, dan kembali mendekat ke samping "Halo, saya"
      dengan kecepatan yang makin melambat saat tiba.
   --------------------------------------------------------- */
/* ---------------------------------------------------------
   Efek suara kartu (disintesis dengan Web Audio, tanpa file).
   - desis lemparan: derau yang volume & nadanya mengikuti kecepatan
     kartu, dan bergeser kiri -> kanan (stereo) mengikuti posisinya
   - "tek" saat dilepas dan "tup" saat mendarat
   Browser mewajibkan klik dulu untuk membunyikan audio, jadi
   suara baru aktif setelah tombol 🔊 ditekan.
   --------------------------------------------------------- */
const sfx = (() => {
  let ctx = null, master, noiseBuf, bp, gain, pan;
  let on = false;

  function init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.Q.value = 0.9; bp.frequency.value = 400;
    gain = ctx.createGain(); gain.gain.value = 0;
    src.connect(bp); bp.connect(gain);
    if (ctx.createStereoPanner) { pan = ctx.createStereoPanner(); gain.connect(pan); pan.connect(master); }
    else gain.connect(master);
    src.start();
  }

  const burst = (type, freq, dur, vol) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = ctx.createGain(), t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.05);
  };

  return {
    get on() { return on; },
    enable() {
      try { if (!ctx) init(); ctx.resume(); on = true; this.flick(); } catch (e) { on = false; }
      return on;
    },
    disable() {
      on = false;
      if (ctx) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
    },
    suspend(hidden) {
      if (!ctx) return;
      if (hidden) ctx.suspend(); else if (on) ctx.resume();
    },
    // level 0..1, freq Hz, panVal -1..1
    update(level, freq, panVal) {
      if (!on || !ctx) return;
      const t = ctx.currentTime;
      gain.gain.setTargetAtTime(Math.pow(level, 0.8) * 0.5, t, 0.04);
      bp.frequency.setTargetAtTime(freq, t, 0.05);
      if (pan) pan.pan.setTargetAtTime(panVal, t, 0.05);
    },
    flick() { if (on && ctx) burst("highpass", 2500, 0.09, 0.35); },
    thump() {
      if (!on || !ctx) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(170, t);
      o.frequency.exponentialRampToValueAtTime(48, t + 0.2);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.7, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.3);
      burst("lowpass", 1200, 0.07, 0.3);
    },
  };
})();

(() => {
  const btn = document.getElementById("soundBtn");
  if (!btn || reduceMotion) { if (btn) btn.hidden = true; return; }
  const label = () => {
    btn.textContent = sfx.on ? "🔊 Suara: nyala" : "🔇 Suara: mati";
    btn.setAttribute("aria-pressed", String(sfx.on));
  };
  btn.addEventListener("click", () => { if (sfx.on) sfx.disable(); else sfx.enable(); label(); });
  document.addEventListener("visibilitychange", () => sfx.suspend(document.hidden));
  label();
})();

/* ---------------------------------------------------------
   Kartu 3D asli (GLB) dengan Three.js.
   Kamera disetel agar identik dengan perspektif CSS (1400px, titik hilang
   di slot kartu), jadi semua angka animasi di pose() dipakai apa adanya.
   Bila model/WebGL gagal dimuat (mis. halaman dibuka lewat file://),
   kartu CSS lama tetap tampil sebagai cadangan.
   --------------------------------------------------------- */
const glCard = (() => {
  const MODEL_URL = "assets/ktp_lutung.glb";
  const PERSP = 1400;                       // harus sama dengan perspective di .scene (CSS)
  const DEG = Math.PI / 180;
  const hero = document.querySelector("#beranda .hero");
  const slot = document.getElementById("idScene");
  const cssCard = document.getElementById("idCard");

  let ready = false, THREE_ = null, canvas, renderer, scene, camera, pivot;
  let sizeKey = "", lastKey = "";

  async function init() {
    try {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
      THREE_ = THREE;

      canvas = document.createElement("canvas");
      canvas.className = "gl-card";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", cssCard.getAttribute("aria-label") || "Kartu identitas 3D");
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      const key = new THREE.DirectionalLight(0xffffff, 1.1);
      key.position.set(-300, 500, 800);
      scene.add(key);
      camera = new THREE.PerspectiveCamera(30, 1, 100, 9000);

      const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
      const model = gltf.scene;
      const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      model.traverse((o) => {
        if (o.name === "Plane") o.quaternion.identity();     // buang kemiringan ~8° bawaan model
        if (o.isMesh) {
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
            m.envMapIntensity = 0.8;
            if (m.map) m.map.anisotropy = aniso;
          });
        }
      });
      // pusatkan model di titik (0,0,0) dan normalkan lebarnya menjadi 1 satuan
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      const holder = new THREE.Group();
      holder.add(model);
      holder.scale.setScalar(1 / size.x);
      pivot = new THREE.Group();
      pivot.add(holder);
      scene.add(pivot);

      hero.insertBefore(canvas, hero.firstChild);
      hero.classList.add("gl-on");
      cssCard.style.visibility = "hidden";   // tetap mengisi tata letak, tapi tidak digambar
      ready = true;
    } catch (err) {
      console.warn("Model 3D tidak dapat dimuat, memakai kartu CSS sebagai cadangan.", err);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      hero.classList.remove("gl-on");
      cssCard.style.visibility = "";
    }
  }

  // v: { tx, ty, tz, rx, ry, rz, opacity, z }  (satuan & arah sama dengan transform CSS)
  function render(v) {
    if (!ready) return;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (!W || !H) return;
    const cr = canvas.getBoundingClientRect();
    const sr = slot.getBoundingClientRect();
    const sx = sr.left + sr.width / 2 - cr.left;      // titik hilang = pusat slot kartu
    const sy = sr.top + sr.height / 2 - cr.top;
    const width = cssCard.offsetWidth;                // lebar kartu mengikuti slot (responsif)

    const key = [v.tx, v.ty, v.tz, v.rx, v.ry, v.rz, v.opacity, v.z, W, H, sx | 0, sy | 0, width].join("|");
    if (key === lastKey) return;
    lastKey = key;

    if (sizeKey !== W + "x" + H) { renderer.setSize(W, H, false); sizeKey = W + "x" + H; }
    const Fw = 2 * Math.max(sx, W - sx), Fh = 2 * Math.max(sy, H - sy);
    camera.fov = (2 * Math.atan(Fh / 2 / PERSP)) / DEG;
    camera.aspect = Fw / Fh;
    camera.position.set(0, 0, PERSP);
    camera.setViewOffset(Fw, Fh, Fw / 2 - sx, Fh / 2 - sy, W, H);
    camera.updateProjectionMatrix();

    // CSS: sumbu y ke bawah. Three: y ke atas -> y dan sudut x/z dibalik.
    pivot.position.set(v.tx, -v.ty, v.tz);
    pivot.rotation.set(-v.rx * DEG, v.ry * DEG, -v.rz * DEG, "XYZ");
    pivot.scale.setScalar(width);

    canvas.style.opacity = v.opacity;
    canvas.style.zIndex = v.z;
    renderer.render(scene, camera);
  }

  init();
  return { render };
})();

const idCard = (() => {
  const card = document.getElementById("idCard");
  const wrap = card.closest(".hero-card-wrap");
  const slotEl = document.getElementById("idScene");
  const heading = document.querySelector("#beranda h1");
  const hintText = document.getElementById("hintText");
  const hintCta = document.getElementById("hintCta");
  const track = document.getElementById("beranda");
  const stage = track.querySelector(".hero");
  const nav = document.querySelector(".nav");

  const PERSP = 1400;    // harus sama dengan perspective di .scene (CSS)
  const Z_START = 260;   // posisi awal: dekat dengan pengguna
  const Z_FAR = 3000;    // titik terjauh bumerang
  const END_SHIFT = 25;  // geser posisi akhir ke kiri (px, desktop)
  const Z_END = 400;     // posisi akhir: lebih dekat ke pengguna dari slot normalnya
  const FLIGHT = 0.8;    // porsi scroll untuk penerbangan; sisanya kartu diam
  const SMOOTH_MS = 110; // kelembaman: mengikuti scroll tanpa patah-patah

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeOutSine = (t) => Math.sin(t * Math.PI / 2);

  let cur = reduceMotion ? 1 : 0;
  let prev = cur;
  let lastNow = 0;
  let lastPan = 0, thrown = false, landed = false;

  function targetProgress() {
    if (reduceMotion) return 1;
    const range = track.offsetHeight - stage.offsetHeight;
    if (range <= 0) return 0;
    return clamp((nav.offsetHeight - track.getBoundingClientRect().top) / range);
  }

  function pose(p, vel, now) {
    const t = clamp(p / FLIGHT);
    // kecepatan: cepat saat dilempar, makin lambat mendekati akhir
    const k = easeOutSine(t);
    // puncak jarak tercapai di ~40% jalur, sehingga perjalanan pulang lebih panjang & pelan
    const arc = Math.sin(Math.PI * Math.pow(k, 0.75));

    // titik awal di luar layar sebelah kiri (dihitung dari posisi slot kartu)
    const r = slotEl.getBoundingClientRect();   // pusat slot kartu (belum terkena transform)
    const cx = r.left + r.width / 2;
    const tx0 = -(cx + 340) / (PERSP / (PERSP - Z_START));


    // di titik terjauh, kartu harus tampak di ~84% lebar layar (sisi kanan, tapi tidak sampai ujung).
    // Simpangan dihitung mundur dari rumus perspektif supaya tetap tepat di layar berukuran apa pun.
    const mob = window.matchMedia("(max-width: 860px)").matches;
    const zEnd = mob ? Z_END * 0.6 : Z_END;
    const kp = Math.pow(0.5, 1 / 0.75);                       // nilai k saat arc = 1
    const zp = Z_START * (1 - kp) + zEnd * kp - Z_FAR;
    const fp = PERSP / (PERSP - zp);
    const bulge = (window.innerWidth * (mob ? 0.78 : 0.84) - cx) / fp - tx0 * (1 - kp);

    // HP: titik terjauh ada tepat di atas tulisan "Halo, saya", sehingga saat pergi kartu lewat di
    // BELAKANG tulisan (naik dari slot menembus baris judul) dan saat pulang lewat di DEPANNYA.
    let amp = 320;
    if (mob) {
      const hr = heading.getBoundingClientRect();
      const hyRel = hr.top + hr.height / 2 - (r.top + r.height / 2);
      amp = 140 * (1 - kp) - (hyRel - 140) / fp;
    }
    const zIdx = mob && k < kp ? "0" : "2";
    wrap.style.zIndex = zIdx;

    const tz = Z_START * (1 - k) + zEnd * k - Z_FAR * arc;   // berakhir lebih dekat ke pengguna dari slotnya
    const tx = tx0 * (1 - k) + bulge * arc - (mob ? 0 : END_SHIFT) * k;   // posisi akhir digeser sedikit ke kiri
    const ty = 140 * (1 - k) - amp * arc;
    // posisi horizontal kartu di layar -> panning stereo untuk efek suara
    lastPan = clamp(((cx + tx * (PERSP / (PERSP - tz))) / window.innerWidth) * 2 - 1, -1, 1);
    // gaya frisbee: kartu rebah miring ke belakang lalu berputar datar pada porosnya
    // (rotateZ dipasang paling dalam, jadi putarannya terjadi di bidang kartu yang miring)
    const rz = 1066 * k + clamp(vel * 250, -5, 5) * (1 - k);                              // 3 putaran, berhenti miring -14°
    const rx = 62 - 22 * k + Math.sin(k * Math.PI * 3) * 5 * (1 - k);          // rebah 62° saat terbang, 40° saat diam
    const ry = -10 * k + Math.sin(k * Math.PI * 2) * 12 * (1 - k); // oleng kiri-kanan seperti frisbee

    const op = smooth(0, 0.14, t).toFixed(3);
    card.style.opacity = op;
    card.style.setProperty("--tx", tx.toFixed(1) + "px");
    card.style.setProperty("--ty", ty.toFixed(1) + "px");
    card.style.setProperty("--tz", tz.toFixed(1) + "px");
    card.style.setProperty("--rx", rx.toFixed(2) + "deg");
    card.style.setProperty("--ry", ry.toFixed(2) + "deg");
    card.style.setProperty("--rz", rz.toFixed(2) + "deg");
    const g = (((rz % 360) + 360) % 360) / 360 * 100;
    card.style.setProperty("--gx", (100 - g).toFixed(1) + "%");
    glCard.render({ tx: +tx.toFixed(1), ty: +ty.toFixed(1), tz: +tz.toFixed(1), rx: +rx.toFixed(2), ry: +ry.toFixed(2), rz: +rz.toFixed(2), opacity: op, z: zIdx });

    // petunjuk scroll memudar saat mulai digulir; tombol "Lihat proyek" muncul setelah kartu mendarat
    hintText.style.opacity = (1 - smooth(0, 0.06, p)).toFixed(2);
    const ctaO = smooth(0.7, 0.85, p);
    hintCta.style.opacity = ctaO.toFixed(2);
    hintCta.style.visibility = ctaO > 0.02 ? "visible" : "hidden";
  }

  function tick(now) {
    const dt = lastNow ? Math.min(64, now - lastNow) : 16;
    lastNow = now;
    // pelembutan berbasis waktu: sama di layar 60Hz maupun 144Hz
    const a = reduceMotion ? 1 : 1 - Math.exp(-dt / SMOOTH_MS);
    cur += (targetProgress() - cur) * a;
    const vel = cur - prev;
    prev = cur;
    pose(cur, vel, now);

    // ---- suara: volume & nada mengikuti kecepatan kartu (cepat saat dilempar, pelan saat mendarat)
    const t = clamp(cur / FLIGHT);
    const perSec = Math.abs(vel) / (dt / 1000);                          // kecepatan scroll (progres/detik)
    const dk = t < 1 ? (Math.PI / 2) * Math.cos(t * Math.PI / 2) / FLIGHT : 0;
    const lvl = clamp((dk * perSec) / 2);
    sfx.update(lvl, 350 + 2200 * lvl, lastPan);
    if (!thrown && cur > 0.012 && vel > 0) { thrown = true; sfx.flick(); }
    if (cur < 0.004) thrown = false;
    if (!landed && t >= 0.985 && vel >= 0) { landed = true; sfx.thump(); }
    if (t < 0.9) landed = false;
  }
  return { tick };
})();

/* ---------------------------------------------------------
   2. Korsel proyek 3D
   --------------------------------------------------------- */
const carousel = (() => {
  const el = document.getElementById("carousel");
  const ring = document.getElementById("ring");
  const counter = document.getElementById("counter");
  const N = PROJECTS.length;
  const step = 360 / N;

  ring.innerHTML = PROJECTS.map((p, i) => `
    <article class="pcard" data-i="${i}">
      <div class="pcard-inner">
        <div class="pface pface-front" style="--tint:${esc(p.tint)}">
          <span class="mono pnum">${pad(i + 1)}</span>
          <span class="mono flip-hint">klik ⟲</span>
          <div class="pemoji" aria-hidden="true">${esc(p.emoji)}</div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.short)}</p>
        </div>
        <div class="pface pface-back">
          <span class="mono pnum">${pad(i + 1)} · DETAIL</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.desc)}</p>
          <a class="plink" href="${esc(p.link)}" target="_blank" rel="noopener" tabindex="-1">Lihat proyek →</a>
          <div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        </div>
      </div>
    </article>`).join("");

  const cards = [...ring.children];
  let radius = 300;
  let angle = 0;          // rotasi ring (derajat)
  let v = 0;              // kecepatan
  let target = 0;         // sudut tujuan atau null saat inersia
  let dragging = false, moved = 0, lastX = 0;
  let active = -1;
  let drawnAngle = null;

  function layout() {
    const w = ring.offsetWidth;
    radius = Math.round(w / 2 / Math.tan(Math.PI / N)) + 46;
    cards.forEach((c, i) => {
      c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`;
    });
    drawnAngle = null;
  }
  window.addEventListener("resize", layout);
  layout();

  const mod = (a, n) => ((a % n) + n) % n;
  const snapAngle = (a) => Math.round(a / step) * step;

  function setActive(i) {
    if (i === active) return;
    active = i;
    cards.forEach((c, j) => {
      c.classList.toggle("active", j === i);
      if (j !== i) c.classList.remove("flipped");
      const link = c.querySelector(".plink");
      link.tabIndex = -1;
    });
    counter.textContent = `${pad(i + 1)} / ${pad(N)}`;
  }

  function draw() {
    if (angle === drawnAngle) return;
    drawnAngle = angle;
    ring.style.transform = `translateZ(${-radius}px) rotateY(${angle}deg)`;
    cards.forEach((c, i) => {
      let d = mod(i * step + angle + 180, 360) - 180; // jarak sudut dari depan
      d = Math.abs(d);
      c.style.visibility = d > 92 ? "hidden" : "visible";
      c.style.setProperty("--dim", Math.min(0.8, d / 110).toFixed(2));
    });
    setActive(mod(Math.round(-angle / step), N));
  }

  function go(dir) {
    v = 0;
    target = snapAngle(target === null ? angle : target) - dir * step;
  }

  function toggleFlip() {
    const c = cards[active];
    const flipped = c.classList.toggle("flipped");
    c.querySelector(".plink").tabIndex = flipped ? 0 : -1;
  }

  el.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".plink")) return;
    dragging = true; moved = 0; v = 0; target = null;
    lastX = e.clientX;
    el.setPointerCapture(e.pointerId);
    el.classList.add("dragging");
  });
  el.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    moved += Math.abs(dx);
    v = dx * 0.22;
    angle += v;
  });
  const release = (e) => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove("dragging");
    if (reduceMotion) v = 0;
    // dianggap klik bila hampir tidak bergeser
    if (e.type === "pointerup" && moved < 6) {
      target = snapAngle(angle);
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const c = hit && hit.closest(".pcard");
      if (!c) return;
      const i = Number(c.dataset.i);
      if (i === active) toggleFlip();
      else {
        // putar lewat jalur terpendek ke kartu yang diklik
        const d = mod(i * step + angle + 180, 360) - 180;
        target = snapAngle(angle - d);
      }
    }
  };
  el.addEventListener("pointerup", release);
  el.addEventListener("pointercancel", release);

  el.addEventListener("keydown", (e) => {
    if (e.target !== el) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleFlip(); }
  });
  document.getElementById("prevBtn").addEventListener("click", () => go(-1));
  document.getElementById("nextBtn").addEventListener("click", () => go(1));

  function tick() {
    if (!dragging) {
      if (target === null) {
        angle += v;
        v *= 0.95;
        if (Math.abs(v) < 0.15) target = snapAngle(angle);
      } else {
        const diff = target - angle;
        if (Math.abs(diff) < 0.02) angle = target;
        else angle += diff * (reduceMotion ? 1 : 0.1);
      }
    }
    draw();
  }
  return { tick };
})();

/* ---------------------------------------------------------
   3. Kartu keahlian: miring mengikuti kursor
   --------------------------------------------------------- */
(() => {
  const wrap = document.getElementById("skills");
  wrap.innerHTML = SKILLS.map((s) => `
    <div class="skill">
      <div class="icon" aria-hidden="true">${esc(s.icon)}</div>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.desc)}</p>
      <div class="level" role="img" aria-label="Tingkat penguasaan ${Number(s.level)}%"><i style="width:${Number(s.level)}%"></i></div>
    </div>`).join("");

  if (reduceMotion) return;
  wrap.querySelectorAll(".skill").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.classList.add("tilting");
      card.style.setProperty("--ry", ((px - 0.5) * 18).toFixed(2) + "deg");
      card.style.setProperty("--rx", ((0.5 - py) * 18).toFixed(2) + "deg");
      card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("tilting");
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
})();

/* ---------------------------------------------------------
   Loop animasi utama
   --------------------------------------------------------- */
function frame(now) {
  idCard.tick(now);
  carousel.tick();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
