/**
 * 3D model platforme za konfigurator.
 *
 * ZAŠTO PARAMETARSKI, A NE GLB
 * Handoff traži GLB do 1,5 MB. Odustao sam od toga s razlogom: jedini
 * postojeći 3D izvori (zen-*.glb, 2,6-32 MB) su jednomrežni scanovi bez
 * materijala - iz njih se ne mogu izdvojiti osam nezavisno obojivih grupa,
 * a bez toga konfigurator nema što bojati. Parametarski model se gradi u
 * pregledniku, nema mrežu za skinuti, i svaka grupa ima svoj materijal.
 *
 * GEOMETRIJA je izvedena iz fotografija u `images/` i iz proporcija
 * postojećeg konfiguratora proizvođača: trup s izraženom gumenom letvom na
 * spoju, U-klupa sa zaobljenim naslonom, niska tikova podnica s bijelim
 * fugama, ravna tenda s volanom na četiri vitka nosača, četiri vezane
 * zavjese, tikov stol na inox nozi, krmena ljestvica i motor.
 *
 * Osi: X = širina (bok-bok), Z = duljina (krma-pramac), Y = visina,
 * y = 0 je vodna linija.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type ModelConfig = {
  lower: string;
  upper: string;
  fender: string;
  cushion: string;
  awning: string;
  curtain: string;
  teak: string;
  fill: string;
};

export type ModelHandle = {
  set(cfg: Partial<ModelConfig>): void;
  reset(): void;
  setAutoRotate(on: boolean): void;
  /** PNG za ispis, uvijek u istom omjeru - neovisno o veličini prikaza. */
  snapshot(): string;
  dispose(): void;
};

/* --------------------------------------------------------------- mjere (m) */

const HALF_W = 1.25; // širina 2,5 m
const HALF_L = 1.15; // duljina 2,3 m
// Gornja ploha tikovine. Mora biti IZNAD gumene letve: letva je puna kutija
// 2,5 x 2,3 m, a `roundedBox` joj bevelom doda 2 x 2,6 cm visine, pa joj je
// vrh na 0,204 - s podnicom na 0,20 letva je prekrivala cijeli pod i on je
// ispadao crn.
const DECK = 0.24;
const RUB = 0.14; // gumena letva (spoj donjeg i gornjeg trupa)
const SEAT = 0.62; // sjedna ploha
const BACK = 1.04; // vrh pramčanog zida (naslon)
const POST_TOP = 2.35; // tenda iznad vodne linije

/* ------------------------------------------------------------------ alati */

/** Zaobljeni pravokutnik kao Shape - osnova za sve "meke" volumene. */
function roundedRect(w: number, d: number, r: number) {
  const s = new THREE.Shape();
  const x = w / 2;
  const y = d / 2;
  r = Math.min(r, x - 0.001, y - 0.001);
  s.moveTo(-x + r, -y);
  s.lineTo(x - r, -y);
  s.quadraticCurveTo(x, -y, x, -y + r);
  s.lineTo(x, y - r);
  s.quadraticCurveTo(x, y, x - r, y);
  s.lineTo(-x + r, y);
  s.quadraticCurveTo(-x, y, -x, y - r);
  s.lineTo(-x, -y + r);
  s.quadraticCurveTo(-x, -y, -x + r, -y);
  return s;
}

/** Kutija sa zaobljenim tlocrtom i blagim bevelom po visini. */
function roundedBox(w: number, d: number, h: number, r = 0.06) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w, d, r), {
    depth: h,
    bevelEnabled: true,
    bevelThickness: Math.min(0.03, h * 0.35),
    bevelSize: 0.018,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 10,
  });
  g.rotateX(-Math.PI / 2);
  g.center();
  return g;
}

/** Izvučeni poligon iz tlocrta [x, z] u visinu h, s donjom plohom na y0. */
function slabGeometry(pts: [number, number][], h: number) {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], -pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], -pts[i][1]);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, steps: 1 });
  g.rotateX(-Math.PI / 2);
  return g;
}

/**
 * Tekstura tikovine: boja dekora + uzdužne fuge u boji ispune.
 * Fuge su svakih ~8 cm, kao na stvarnoj palubi.
 */
function teakTexture(decor: string, fill: string) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const x = c.getContext('2d')!;
  x.fillStyle = decor;
  x.fillRect(0, 0, 512, 512);

  // Suptilna tekstura drva da ploha ne bude mrtva.
  x.globalAlpha = 0.06;
  for (let i = 0; i < 1400; i++) {
    x.fillStyle = i % 2 ? '#000' : '#fff';
    x.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 1);
  }
  x.globalAlpha = 1;

  x.fillStyle = fill;
  for (let i = 0; i < 8; i++) x.fillRect(i * 64 + 30, 0, 5, 512);

  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  // 8 fuga po tileu; 1,5 tilea po metru -> letvica ~8 cm, kao na palubi.
  t.repeat.set(1.5, 1.5);
  t.anisotropy = 8;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Zavjesa: ravnina s naborima i strukom na mjestu veza. */
const CURTAIN_W = 0.5;

function curtainGeometry(height: number) {
  const g = new THREE.PlaneGeometry(CURTAIN_W, height, 48, 36);
  const p = g.attributes.position;
  const half = CURTAIN_W / 2;
  for (let i = 0; i < p.count; i++) {
    const vx = p.getX(i);
    const vy = p.getY(i);
    const t = (vy + height / 2) / height;
    // Struk: zavjesa je vezana malo ispod sredine.
    const ty = vy + height * 0.08;
    const pinch = 1 - 0.52 * Math.exp(-(ty * ty) / 0.045);
    const folds = (Math.sin(vx * 30) * 0.036 + Math.sin(vx * 13 + 0.6) * 0.022) * (0.5 + 0.5 * pinch);
    const bulge = 0.075 * (1 - Math.min(1, Math.abs(vx) / half)) * (0.45 + 0.55 * t);
    p.setX(i, vx * pinch);
    p.setZ(i, folds + bulge);
  }
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ scena */

export function mount(el: HTMLElement, initial: ModelConfig): ModelHandle {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true, // treba za snapshot u PDF
    powerPreference: 'high-performance',
  });
  const mobile = window.matchMedia('(max-width: 1000px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 2 : 2));
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const ABYSS = new THREE.Color('#0B1622');
  scene.background = ABYSS;
  scene.fog = new THREE.Fog(ABYSS, 9, 22);

  const camera = new THREE.PerspectiveCamera(38, el.clientWidth / el.clientHeight, 0.1, 100);
  const HOME: [number, number, number] = [3.9, 3.3, 4.9];
  camera.position.set(...HOME);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 3.2;
  controls.maxDistance = 11;
  controls.maxPolarAngle = Math.PI / 2 - 0.06; // ne ispod horizonta
  controls.minPolarAngle = 0.2;
  controls.target.set(0, 0.95, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;

  // Inox je metal; metal bez okoline nema što reflektirati i ispadne CRN.
  // Zato mala proceduralna soba kao `environment` - ne kao pozadina, i
  // prigušena, da scena ostane tamna kako brand traži.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.14;

  scene.add(new THREE.HemisphereLight(0xdfeaf5, 0x14324c, 1.15));
  const sun = new THREE.DirectionalLight(0xfff2e0, 2.1);
  sun.position.set(4.5, 7.5, 3.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 20;
  const sc = sun.shadow.camera as THREE.OrthographicCamera;
  sc.left = -3.5;
  sc.right = 3.5;
  sc.top = 3.5;
  sc.bottom = -3.5;
  sun.shadow.bias = -0.0008;
  scene.add(sun);
  scene.add(new THREE.DirectionalLight(0x9fc4e0, 0.35).translateX(-5).translateY(2));

  // Voda
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(26, 64),
    new THREE.MeshStandardMaterial({ color: '#1B4462', roughness: 0.18, metalness: 0.1 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.receiveShadow = true;
  scene.add(water);

  /* ------------------------------------------------------------ materijali */

  const glossy = (hex: string) =>
    new THREE.MeshStandardMaterial({ color: hex, roughness: 0.22, metalness: 0.04 });
  const fabric = (hex: string) =>
    new THREE.MeshStandardMaterial({ color: hex, roughness: 0.92, metalness: 0 });

  const mats = {
    lower: glossy(initial.lower),
    upper: glossy(initial.upper),
    fender: new THREE.MeshStandardMaterial({ color: initial.fender, roughness: 0.75 }),
    cushion: fabric(initial.cushion),
    awning: fabric(initial.awning),
    curtain: new THREE.MeshStandardMaterial({
      color: initial.curtain,
      roughness: 0.95,
      side: THREE.DoubleSide,
    }),
    teak: new THREE.MeshStandardMaterial({
      map: teakTexture(initial.teak, initial.fill),
      roughness: 0.6,
    }),
  };
  const inox = new THREE.MeshStandardMaterial({ color: '#D2D6DA', roughness: 0.28, metalness: 0.78 });
  const dark = new THREE.MeshStandardMaterial({ color: '#2A2E33', roughness: 0.5 });
  const glass = new THREE.MeshStandardMaterial({ color: '#0E1A24', roughness: 0.15, metalness: 0.4 });

  const boat = new THREE.Group();
  scene.add(boat);

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
    rot?: { x?: number; y?: number; z?: number },
    parent: THREE.Object3D = boat,
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (rot) {
      m.rotation.x = rot.x ?? 0;
      m.rotation.y = rot.y ?? 0;
      m.rotation.z = rot.z ?? 0;
    }
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  const slab = (pts: [number, number][], y0: number, h: number, mat: THREE.Material) => {
    const m = new THREE.Mesh(slabGeometry(pts, h), mat);
    m.position.y = y0;
    m.castShadow = true;
    m.receiveShadow = true;
    boat.add(m);
    return m;
  };

  /* ----------------------------------------------------- DONJI TRUP (katamaran) */
  // Dva bočna plovka + središnji nosač, sve ispod gumene letve. Na fotografiji
  // se ispod vode nazire upravo taj raspored.
  add(roundedBox(0.52, 2.24, 0.34, 0.16), mats.lower, -0.82, -0.06, 0);
  add(roundedBox(0.52, 2.24, 0.34, 0.16), mats.lower, 0.82, -0.06, 0);
  add(roundedBox(0.5, 2.16, 0.3, 0.14), mats.lower, 0, -0.08, 0);
  // Ploča koja spaja plovke i nosi palubu.
  add(roundedBox(2.46, 2.26, 0.14, 0.1), mats.lower, 0, 0.05, 0);

  /* ------------------------------------------------- GUMENA LETVA (fender) */
  // Izražena, tamna, ide oko cijelog trupa - najuočljiviji detalj na fotkama.
  add(roundedBox(2.5, 2.3, 0.075, 0.11), mats.fender, 0, RUB, 0);

  /* ------------------------------------------------------ PALUBA (tikovina) */
  // Širi od samog kokpita: rubovi ulaze pod klupe, pa se ni iz jednog kuta
  // ne vidi traka letve između podnice i boka.
  const deckPts: [number, number][] = [
    [-1.1, 1.1],
    [1.1, 1.1],
    [1.1, -1.15],
    [-1.1, -1.15],
  ];
  slab(deckPts, DECK - 0.03, 0.03, mats.teak);

  /* ---------------------------------------------------------- GORNJI TRUP */
  // U-klupa: pramčani modul + dva kraka, koso rezana prema krmi.
  // BOW_F je prednji rub pramčane ležaljke. Bila je na 0,52 - dubina sjedala
  // 0,52 m, dakle klupa. Na 0,26 je dubina 0,87 m, što je ležaljka.
  const BOW_F = 0.26;
  const bowP: [number, number][] = [
    [-1.18, 1.13],
    [1.18, 1.13],
    [1.18, BOW_F],
    [-1.18, BOW_F],
  ];
  const portP: [number, number][] = [
    [-1.18, BOW_F],
    [-0.42, BOW_F],
    [-0.42, -0.4],
    [-0.86, -1.13],
    [-1.18, -1.13],
  ];
  const stbdP: [number, number][] = [
    [1.18, BOW_F],
    [0.42, BOW_F],
    [0.42, -0.4],
    [0.86, -1.13],
    [1.18, -1.13],
  ];
  slab(bowP, RUB, SEAT - RUB, mats.upper);
  slab(portP, RUB, SEAT - RUB, mats.upper);
  slab(stbdP, RUB, SEAT - RUB, mats.upper);

  // Naslon: puni pramčani zid. Bez drvene kape na vrhu - u ovoj razini
  // detalja čita se kao zasebna daska položena na zid.
  add(roundedBox(2.36, 0.2, BACK - RUB, 0.05), mats.upper, 0, (BACK + RUB) / 2, 1.04);
  // Bočni coaming, niži od naslona.
  add(roundedBox(0.09, 1.5, 0.26, 0.04), mats.upper, -1.16, SEAT + 0.11, 0.3);
  add(roundedBox(0.09, 1.5, 0.26, 0.04), mats.upper, 1.16, SEAT + 0.11, 0.3);

  /* ------------------------------------------------------------- JASTUCI */
  const bowC: [number, number][] = [
    [-1.14, 1.09],
    [1.14, 1.09],
    [1.14, BOW_F + 0.04],
    [-1.14, BOW_F + 0.04],
  ];
  const portC: [number, number][] = [
    [-1.14, BOW_F + 0.04],
    [-0.46, BOW_F + 0.04],
    [-0.46, -0.38],
    [-0.84, -1.09],
    [-1.14, -1.09],
  ];
  const stbdC: [number, number][] = [
    [1.14, BOW_F + 0.04],
    [0.46, BOW_F + 0.04],
    [0.46, -0.38],
    [0.84, -1.09],
    [1.14, -1.09],
  ];
  slab(bowC, SEAT, 0.14, mats.cushion);
  slab(portC, SEAT, 0.14, mats.cushion);
  slab(stbdC, SEAT, 0.14, mats.cushion);
  // Naslon za leđa: nakošen unatrag ~15 stupnjeva. Uspravan naslon je ono
  // što je ovo činilo klupom; nakošen ga čini ležaljkom. Gornji rub naslanja
  // se na pramčani zid, donji izlazi naprijed nad sjedalo.
  // Uži od pramčanog zida (1,92 naspram 2,36 m): nakošen naslon pokriva mjesto
  // gdje su stajali zvučnici, pa oni idu u uglove zida pokraj njega.
  //
  // Visina i z prate `BACK`: donji rub ostaje utonuo u jastuk sjedala (0,726),
  // gornji staje 3 cm ispod vrha zida, a stražnja ploha pod nagibom od 15°
  // ne smije proći kroz zid (prednje lice zida je na z = 0,922).
  add(roundedBox(1.92, 0.16, 0.18, 0.05), mats.cushion, 0, 0.868, 0.79, { x: 0.26 });
  // Ukrasnih jastučića nema: u ovoj razini detalja čitaju se kao lebdeće
  // kutije, a ionako nisu dio konfiguracije.

  /* ---------------------------------------------------------------- STOL */
  const TT = SEAT + 0.3; // iznad jastuka (jastuk završava na SEAT + 0,14)
  const TABLE_Z = -0.22; // dalje od pramca - ležaljka je sada dublja
  add(new THREE.CylinderGeometry(0.035, 0.042, TT - DECK, 20), inox, 0, DECK + (TT - DECK) / 2, TABLE_Z);
  add(new THREE.CylinderGeometry(0.13, 0.15, 0.02, 24), inox, 0, DECK + 0.01, TABLE_Z);
  // Duža os ide UZDUŽ broda - na fotografijama stol stoji paralelno s bokom.
  const top = add(new THREE.ExtrudeGeometry(roundedRect(0.44, 0.76, 0.1), {
    depth: 0.04, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, steps: 1, curveSegments: 10,
  }), mats.teak, 0, TT, TABLE_Z);
  top.geometry.rotateX(-Math.PI / 2);

  /* ------------------------------------------------------------ LOGOTIP */
  /**
   * Mono logotip kao decal: jedan na pramcu (~100 cm) i po jedan na svakom
   * boku (~40 cm), simetricno.
   *
   * ⚠ Pramcani je ranije bio na z = 1,145, a vanjsko lice pramcanog zida je na
   * 1,158 (0,2 m debljine + 2 x 0,018 bevela koje `roundedBox` doda) - decal je
   * dakle stajao UNUTAR zida i nije se vidio nigdje. Sve tri plohe sada stoje
   * 4 mm ispred svoje stijenke.
   *
   * Tekstura se ucitava asinkrono; ako padne, plohe ostaju prozirne - model je
   * i bez oznake ispravan.
   */
  const LOGO_AR = 454.34 / 99.97;
  const logoMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

  const addDecal = (w: number, x: number, y: number, z: number, ry = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / LOGO_AR), logoMat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    boat.add(m);
  };

  // Pramac: 1,00 m, na sredini vanjskog lica zida.
  addDecal(1.0, 0, (RUB + BACK) / 2, 1.162);
  // Bokovi: 0,40 m, ista visina i isti z s obje strane.
  addDecal(0.4, 1.184, 0.4, -0.45, Math.PI / 2);
  addDecal(0.4, -1.184, 0.4, -0.45, -Math.PI / 2);

  void (async () => {
    try {
      const svg = await (await fetch('/logo/tquilo-primary-mono.svg')).text();
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace(/currentColor/g, '#FFFFFF'));
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = 1024;
      cv.height = Math.round((1024 * img.height) / img.width) || 226;
      cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height);
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      logoMat.map = tex;
      logoMat.opacity = 0.9;
      logoMat.needsUpdate = true;
    } catch {
      /* bez logotipa - model ostaje ispravan */
    }
  })();

  /* ------------------------------------------------------------- ZVUČNICI */
  for (const x of [-1.06, 1.06]) {
    add(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 24), inox, x, BACK - 0.16, 0.935, { x: Math.PI / 2 });
    add(new THREE.CylinderGeometry(0.052, 0.052, 0.032, 24), dark, x, BACK - 0.16, 0.93, { x: Math.PI / 2 });
  }

  /* -------------------------------------------------------------- RUKOHVAT */
  // Tanka inox cijev uzduž boka, na dvije kratke nogice - kao na fotkama.
  // (Prije polukružni luk; čitao se kao crni luk koji strši iz klupe.)
  // Vrh bočnog coaminga; rukohvat mora biti IZNAD njega, inače se cijev
  // izgubi u njemu i iz modela viri samo patrljak.
  const COAM_TOP = SEAT + 0.11 + 0.13;
  const RAIL_Y = COAM_TOP + 0.13;
  const RAIL_Z0 = 0.25;
  // Ograda, ne ručka: ide gotovo cijelom dužinom coaminga (1,5 m), na tri
  // nogice. Kratki komad od 0,52 m čitao se kao zaboravljeni štap.
  const RAIL_LEN = 1.1;
  for (const x of [-1.16, 1.16]) {
    add(new THREE.CylinderGeometry(0.014, 0.014, RAIL_LEN, 12), inox, x, RAIL_Y, RAIL_Z0, { x: Math.PI / 2 });
    for (const dz of [-RAIL_LEN / 2 + 0.05, 0, RAIL_LEN / 2 - 0.05]) {
      add(
        new THREE.CylinderGeometry(0.012, 0.012, RAIL_Y - COAM_TOP, 10),
        inox,
        x,
        (RAIL_Y + COAM_TOP) / 2,
        RAIL_Z0 + dz,
      );
    }
  }

  // Tikova kapa po vrhu coaminga, ispod ograde - to je ploha koju ruka hvata.
  for (const x of [-1.16, 1.16]) {
    add(roundedBox(0.12, 1.5, 0.028, 0.03), mats.teak, x, COAM_TOP + 0.014, 0.3);
  }

  /* ------------------------------------------------------ STUPOVI I TENDA */
  const px = 1.13;
  const pz = 1.03;
  for (const [x, z] of [
    [-px, pz],
    [px, pz],
    [-px, -pz],
    [px, -pz],
  ] as [number, number][]) {
    add(new THREE.CylinderGeometry(0.015, 0.018, POST_TOP - SEAT, 14), inox, x, (POST_TOP + SEAT) / 2, z);
  }
  // Ravna tenda, malo veća od tlocrta, s volanom (skirt) po obodu.
  add(roundedBox(2.56, 2.38, 0.035, 0.1), mats.awning, 0, POST_TOP, 0);
  const skirtH = 0.09;
  add(new THREE.BoxGeometry(2.56, skirtH, 0.025), mats.awning, 0, POST_TOP - skirtH / 2 - 0.012, 1.19);
  add(new THREE.BoxGeometry(2.56, skirtH, 0.025), mats.awning, 0, POST_TOP - skirtH / 2 - 0.012, -1.19);
  add(new THREE.BoxGeometry(0.025, skirtH, 2.38), mats.awning, 1.28, POST_TOP - skirtH / 2 - 0.012, 0);
  add(new THREE.BoxGeometry(0.025, skirtH, 2.38), mats.awning, -1.28, POST_TOP - skirtH / 2 - 0.012, 0);

  /* ------------------------------------------------------------- ZAVJESE */
  // Zavjesa visi IZVAN trupa, uz sam rub tende. Stup stoji na klupi, pa bi
  // zavjesa centrirana na stup donjom trećinom ulazila u trup i tamo nestajala.
  // Zato se središte pomakne prema van po dijagonali ugla (`OUT`), toliko da
  // cijeli panel padne izvan gabarita gumene letve (2,5 x 2,3 m).
  // 0,14 m je najbliže što ide: izmjereno, panel tada ima jos ~2 cm zraka do
  // zaobljenog ugla gumene letve. Na 0,10 bi ulazio u trup.
  const OUT = 0.14;
  const cTop = POST_TOP - 0.03;
  const cBottom = 0.07; // do vodne linije, kao na fotografijama
  const cGeo = curtainGeometry(cTop - cBottom);
  const cy = (cTop + cBottom) / 2;
  const rPost = Math.hypot(px, pz);
  for (const [x, z] of [
    [-px, pz],
    [px, pz],
    [-px, -pz],
    [px, -pz],
  ] as [number, number][]) {
    // `atan2(x, z)` je smjer od sredine prema stupu - zavjesa je okomita na
    // njega, pa gleda van i vidi se i s pramca i s boka.
    add(cGeo, mats.curtain, x * (1 + OUT / rPost), cy, z * (1 + OUT / rPost), { y: Math.atan2(x, z) });
  }

  /* -------------------------------------------------------- KRMA: motor + ljestve */
  const stern = new THREE.Group();
  stern.position.set(0, 0, -1.2);
  boat.add(stern);
  // Neutralan električni vanbrodski - bez ikakvih tuđih oznaka.
  add(roundedBox(0.26, 0.14, 0.2, 0.04), dark, 0, 0.26, 0.02, undefined, stern);
  add(roundedBox(0.2, 0.22, 0.26, 0.05), dark, 0, 0.16, -0.14, undefined, stern);
  add(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 14), dark, 0, -0.14, -0.14, undefined, stern);
  add(new THREE.CylinderGeometry(0.07, 0.05, 0.14, 16), dark, 0, -0.4, -0.12, { x: Math.PI / 2 }, stern);
  // Ljestvica za izlazak iz vode. Drži se unutar gabarita trupa - ranija je
  // verzija rukohvatima probijala bok i izgledala kao zaboravljeni štap.
  for (const x of [-0.17, 0.17]) {
    add(new THREE.CylinderGeometry(0.013, 0.013, 0.42, 10), inox, x, -0.12, 0.1, { x: 0.3 }, stern);
  }
  for (let i = 0; i < 2; i++) {
    add(new THREE.BoxGeometry(0.36, 0.018, 0.06), inox, 0, -0.04 - i * 0.18, 0.16 + i * 0.05, undefined, stern);
  }

  /* --------------------------------------------------------------- render */

  let raf = 0;
  const loop = () => {
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const ro = new ResizeObserver(() => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(el);

  let current: ModelConfig = { ...initial };

  return {
    set(next) {
      current = { ...current, ...next };
      mats.lower.color.set(current.lower);
      mats.upper.color.set(current.upper);
      mats.fender.color.set(current.fender);
      mats.cushion.color.set(current.cushion);
      mats.awning.color.set(current.awning);
      mats.curtain.color.set(current.curtain);
      // Tikovina i ispuna dijele jednu teksturu, pa se pregenerira zajedno.
      if (next.teak !== undefined || next.fill !== undefined) {
        mats.teak.map?.dispose();
        mats.teak.map = teakTexture(current.teak, current.fill);
        mats.teak.needsUpdate = true;
      }
    },
    reset() {
      camera.position.set(...HOME);
      controls.target.set(0, 0.95, 0);
      controls.update();
    },
    setAutoRotate(on) {
      controls.autoRotate = on;
    },
    snapshot() {
      // Prikaz je visok i uzak na mobitelu, a širok na desktopu - snimka bi
      // onda u PDF-u bila čas pruga, čas panorama. Zato se za snimku platno
      // nakratko postavi na omjer okvira u ispisu (178 x 108 mm), snimi, pa
      // vrati. `updateStyle = false`: CSS veličina platna se ne dira, pa na
      // ekranu nema ni trzaja.
      const PW = 1760;
      const PH = 1068;
      const size = new THREE.Vector2();
      renderer.getSize(size);
      const pr = renderer.getPixelRatio();

      // Kut gledanja ostaje korisnikov, ali se udaljenost postavi tako da
      // platforma uvijek ispuni kadar jednako. Bez toga PDF nosi i korisnikov
      // zum, pa je model čas sitan u praznoj vodi, čas odrezan.
      const camPos = camera.position.clone();
      const dir = camPos.clone().sub(controls.target).normalize();
      const FIT = new THREE.Vector3(0, 1.1, 0);
      camera.position.copy(FIT).addScaledVector(dir, 7.0);
      camera.lookAt(FIT);

      renderer.setPixelRatio(1);
      renderer.setSize(PW, PH, false);
      camera.aspect = PW / PH;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      const url = renderer.domElement.toDataURL('image/png');

      camera.position.copy(camPos);
      camera.lookAt(controls.target);
      renderer.setPixelRatio(pr);
      renderer.setSize(size.x, size.y, false);
      camera.aspect = size.x / size.y;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      return url;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      for (const m of Object.values(mats)) {
        const mm = m as THREE.MeshStandardMaterial;
        mm.map?.dispose();
        mm.dispose();
      }
      renderer.dispose();
      el.removeChild(renderer.domElement);
    },
  };
}
