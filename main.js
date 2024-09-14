import * as THREE from "./threejs/build/three.module.js";
import { OrbitControls } from "./threejs/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "./threejs/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "./threejs/examples/jsm/geometries/TextGeometry.js";
import { GLTFLoader } from "./threejs/examples/jsm/loaders/GLTFLoader.js";

var scene,
  camera1,
  camera2,
  camera3,
  selectedCamera,
  renderer,
  controls,
  raycasterFirecamp,
  raycasterSawmill;

var gate,
  gateMovement = 0.01;

var windblade;

var fireLight, firecamp, firecampColor;

var village,
  isVillageSpawn = true;

var sawmill, sawmillColor;

var forest,
  isForestSpawn = true;

//Geometry Section ======================================================================================

const createBox = (width, height, depth, repeatX, repeatY) => {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(
    "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/rock_wall_08/rock_wall_08_diff_1k.png"
  );

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);

  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 5,
    map: texture,
  });
  return new THREE.Mesh(geometry, material);
};

const createWindBlade = (width, height, depth, color) => {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshLambertMaterial({
    color: color,
  });

  return new THREE.Mesh(geometry, material);
};

const createRailing = (width, height, depth) => {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshLambertMaterial({
    color: 0x756f64,
  });

  return new THREE.Mesh(geometry, material);
};

const createTowerRailingWall = (radiusTop, radiusBottom, height) => {
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    8,
    1,
    true
  );
  const material = new THREE.MeshLambertMaterial({
    color: 0x756f64,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
};

const createTowerRing = (innerRadius, outerRadius) => {
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius);

  const material = new THREE.MeshLambertMaterial({
    color: 0x756f64,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
};

const createCylinder = (
  radiusTop,
  radiusBottom,
  height,
  radialSegment,
  color
) => {
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    4
  );
  const material = new THREE.MeshPhongMaterial({
    color: color,
  });

  return new THREE.Mesh(geometry, material);
};

const createTower = (radiusTop, radiusBottom, height, color) => {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height);
  const material = new THREE.MeshStandardMaterial({
    color: color,
  });
  return new THREE.Mesh(geometry, material);
};

const createIronBar = (height) => {
  const geometry = new THREE.CylinderGeometry(0.05, 0.05, height);
  const material = new THREE.MeshPhongMaterial({
    color: 0x616161,
  });
  return new THREE.Mesh(geometry, material);
};

const createCone = (radius, height, radialSegments, color, mat) => {
  const geometry = new THREE.ConeGeometry(radius, height, radialSegments);
  var material;
  if (mat === 1) {
    material = new THREE.MeshPhongMaterial({ color: color });
  } else {
    material = new THREE.MeshLambertMaterial({ color: color });
  }

  return new THREE.Mesh(geometry, material);
};

const createSphere = (radius, color) => {
  const geometry = new THREE.SphereGeometry(radius);
  const material = new THREE.MeshLambertMaterial({ color: color });
  return new THREE.Mesh(geometry, material);
};

const createPlane = (width, height, color) => {
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshLambertMaterial({
    color: color,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
};

//Light Section ==================================================================================

const createAmbientLight = () => {
  return new THREE.AmbientLight(0xffffff, 0.1);
};

const createDirectionalLight = (power) => {
  const light = new THREE.DirectionalLight(0xffffff, 2);
  //   light.target = box;
  // light.target.position.set(0, 0, 0);
  // const lightHelper = new THREE.DirectionalLightHelper(light, 1, 0x000000);
  // scene.add(lightHelper);
  // scene.add(light.target);
  return light;
};

const createPointLight = (power) => {
  const light = new THREE.PointLight(0xff0000, power);
  light.decay = 100;
  // light.target = village;
  // const lightHelper = new THREE.PointLightHelper(light, 0.5, 0x000000);
  // scene.add(lightHelper);
  return light;
};

//Font Section =====================================================================================
const createText = (text, x, y, z) => {
  const fontLoader = new FontLoader();

  fontLoader.load(
    "./threejs/examples/fonts/helvetiker_regular.typeface.json",
    (font) => {
      const geometry = new TextGeometry(text, {
        font: font,
        size: 0.5,
        height: 0.1,
      });
      const material = new THREE.MeshLambertMaterial({ color: 0x000000 });
      const object = new THREE.Mesh(geometry, material);

      object.position.set(x, y, z);
      scene.add(object);
    }
  );
};

//Model Section ====================================================================================
const createHorse = (x, z, r) => {
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("./asset/model/scene.gltf", (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.03, 0.03, 0.03);
    model.position.set(x, 0, z);
    model.rotation.set(0, r, 0);
    scene.add(model);
  });
};

const initHorse = () => {
  //createHorse(0, 0, 20, Math.PI / 4);
  const position = [
    { x: -20, z: 20, r: Math.PI / 4 },
    { x: -18, z: 22, r: Math.PI / 2 },
    { x: -20, z: 24, r: (Math.PI / 4) * 3 },
    { x: -22, z: 21, r: Math.PI / 2 },
    { x: -22, z: 23, r: Math.PI / 2 },

    { x: 20, z: -5, r: 0 },
    { x: 16, z: -7, r: 0 },
    { x: 24, z: -7, r: 0 },
    { x: 18, z: -9, r: 0 },
    { x: 22, z: -9, r: 0 },
  ];

  position.forEach((p) => {
    createHorse(p.x, p.z, p.r);
  });
};

//Camera & Render =====================================================================================

const createCamera = (x, y, z, lx, ly, lz) => {
  const cam = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  cam.position.set(x, y, z);
  cam.lookAt(lx, ly, lz);
  return cam;
};

const initRender = () => {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
};

const initCamera = () => {
  camera1 = createCamera(0, 15, 30, 0, 0, 0);
  camera1.layers.enable(1);
  camera1.layers.enable(2);

  camera2 = createCamera(25, 10, 30, 20, 0.7, 18);
  camera2.layers.enable(1);
  camera2.layers.enable(2);

  camera3 = createCamera(-12, 8, -12, -20, 1.5, -20);
  camera3.layers.enable(1);
  camera3.layers.enable(2);

  selectedCamera = camera1;
};

//Init Objects ==========================================================================================

const initCastle = () => {
  const castleBase = createBox(10, 5, 10, 4, 4);
  castleBase.position.set(0, 2.5, 0);
  castleBase.receiveShadow = true;
  castleBase.castShadow = true;

  const castleTop = createBox(7, 3, 7, 4, 4);
  castleTop.position.set(0, 6.5, 0);
  castleTop.receiveShadow = true;
  castleTop.castShadow = true;

  const castleRoof = createCylinder(1, 6, 3, 4, 0x994417);
  castleRoof.position.set(0, 9.5, 0);
  castleRoof.rotation.set(0, Math.PI / 4, 0);
  castleRoof.receiveShadow = true;
  castleRoof.castShadow = true;

  const castleRailingFront = createRailing(11, 1, 0.5);
  castleRailingFront.position.set(0, 5, 5.25);
  castleRailingFront.receiveShadow = true;
  castleRailingFront.castShadow = true;

  const castleRailingBack = createRailing(11, 1, 0.5);
  castleRailingBack.position.set(0, 5, -5.25);
  castleRailingBack.receiveShadow = true;
  castleRailingBack.castShadow = true;

  const castleRailingLeft = createRailing(0.5, 1, 11);
  castleRailingLeft.position.set(-5.25, 5, 0);
  castleRailingLeft.receiveShadow = true;
  castleRailingLeft.castShadow = true;

  const castleRailingRight = createRailing(0.5, 1, 11);
  castleRailingRight.position.set(5.25, 5, 0);
  castleRailingRight.receiveShadow = true;
  castleRailingRight.castShadow = true;

  const objects = [
    castleBase,
    castleTop,
    castleRoof,
    castleRailingFront,
    castleRailingBack,
    castleRailingLeft,
    castleRailingRight,
  ];

  const group = new THREE.Group();

  objects.forEach((obj) => {
    group.add(obj);
  });

  return group;
};

const initTower = (x, z) => {
  const tower = createTower(2, 2, 5, 0x383534);
  tower.position.set(x, 2.5, z);
  tower.receiveShadow = true;
  tower.castShadow = true;

  const towerInnerRailing = createTowerRailingWall(2, 2, 1);
  towerInnerRailing.position.set(x, 5, z);
  towerInnerRailing.receiveShadow = true;
  towerInnerRailing.castShadow = true;

  const towerOuterRailing = createTowerRailingWall(2.5, 2.5, 1);
  towerOuterRailing.position.set(x, 5, z);
  towerOuterRailing.receiveShadow = true;
  towerOuterRailing.castShadow = true;

  const towerTopRing = createTowerRing(2, 2.5);
  towerTopRing.position.set(x, 5.5, z);
  towerTopRing.rotation.set(Math.PI / 2, 0, 0);
  towerTopRing.receiveShadow = true;
  towerTopRing.castShadow = true;

  const towerBotRing = createTowerRing(2, 2.5);
  towerBotRing.position.set(x, 4.5, z);
  towerBotRing.rotation.set(Math.PI / 2, 0, 0);
  towerBotRing.receiveShadow = true;
  towerBotRing.castShadow = true;

  const objects = [
    tower,
    towerInnerRailing,
    towerOuterRailing,
    towerTopRing,
    towerBotRing,
  ];

  const group = new THREE.Group();

  objects.forEach((obj) => {
    group.add(obj);
  });

  return group;
};

const initWall = (x, z, rotate) => {
  const wall = createBox(17, 4, 2, 10, 2);
  wall.position.set(x, 2, z);
  wall.receiveShadow = true;
  wall.castShadow = true;

  const railingFront = createRailing(17, 1, 0.5);
  railingFront.position.set(x, 4, z - 1);
  railingFront.receiveShadow = true;
  railingFront.castShadow = true;

  const railingBack = createRailing(17, 1, 0.5);
  railingBack.position.set(x, 4, z + 1);
  railingBack.receiveShadow = true;
  railingBack.castShadow = true;

  const objects = [wall, railingFront, railingBack];

  const group = new THREE.Group();

  group.rotation.set(0, (Math.PI / 2) * rotate, 0);

  objects.forEach((obj) => {
    group.add(obj);
  });

  return group;
};

const initGateWall = () => {
  const leftWall = createBox(2, 5, 3, 2, 3);
  leftWall.position.set(-2, 2.5, 12.5);
  leftWall.receiveShadow = true;
  leftWall.castShadow = true;

  const rightWall = createBox(2, 5, 3, 2, 3);
  rightWall.position.set(2, 2.5, 12.5);
  rightWall.receiveShadow = true;
  rightWall.castShadow = true;

  const midWall = createBox(2, 3, 2.5, 2, 3);
  midWall.position.set(0, 3.5, 12.5);
  midWall.receiveShadow = true;
  midWall.castShadow = true;

  const railingFront = createRailing(7, 1, 0.5);
  railingFront.position.set(0, 5, 14);
  railingFront.receiveShadow = true;
  railingFront.castShadow = true;

  const railingBack = createRailing(7, 1, 0.5);
  railingBack.position.set(0, 5, 11);
  railingBack.receiveShadow = true;
  railingBack.castShadow = true;

  const railingLeft = createRailing(0.5, 1, 3);
  railingLeft.position.set(-3.25, 5, 12.5);
  railingLeft.receiveShadow = true;
  railingLeft.castShadow = true;

  const railingRight = createRailing(0.5, 1, 3);
  railingRight.position.set(3.25, 5, 12.5);
  railingRight.receiveShadow = true;
  railingRight.castShadow = true;

  const objects = [
    leftWall,
    rightWall,
    midWall,
    railingFront,
    railingBack,
    railingLeft,
    railingRight,
  ];

  const group = new THREE.Group();

  objects.forEach((obj) => {
    group.add(obj);
  });

  return group;
};

const initGate = () => {
  const ironBarV1 = createIronBar(2);
  ironBarV1.position.set(-0.5, 1, 13.5);
  ironBarV1.receiveShadow = true;
  ironBarV1.castShadow = true;

  const ironBarV2 = createIronBar(2);
  ironBarV2.position.set(-0, 1, 13.5);
  ironBarV2.receiveShadow = true;
  ironBarV2.castShadow = true;

  const ironBarV3 = createIronBar(2);
  ironBarV3.position.set(0.5, 1, 13.5);
  ironBarV3.receiveShadow = true;
  ironBarV3.castShadow = true;

  const ironBarH1 = createIronBar(2);
  ironBarH1.position.set(0, 0.5, 13.5);
  ironBarH1.rotation.set(0, 0, Math.PI / 2);
  ironBarH1.receiveShadow = true;
  ironBarH1.castShadow = true;

  const ironBarH2 = createIronBar(2);
  ironBarH2.position.set(0, 1, 13.5);
  ironBarH2.rotation.set(0, 0, Math.PI / 2);
  ironBarH2.receiveShadow = true;
  ironBarH2.castShadow = true;

  const ironBarH3 = createIronBar(2);
  ironBarH3.position.set(0, 1.5, 13.5);
  ironBarH3.rotation.set(0, 0, Math.PI / 2);
  ironBarH3.receiveShadow = true;
  ironBarH3.castShadow = true;

  const objects = [
    ironBarV1,
    ironBarV2,
    ironBarV3,
    ironBarH1,
    ironBarH2,
    ironBarH3,
  ];

  const group = new THREE.Group();

  objects.forEach((obj) => {
    group.add(obj);
  });

  // group.translateY(2);

  return group;
};

const initWindmillTower = () => {
  const tower = createTower(2, 3, 8, 0xd48d4e);
  tower.position.set(20, 4, -20);
  tower.receiveShadow = true;
  tower.castShadow = true;

  const roof = createCone(3, 3, 8, 0x9c3430, 1);
  roof.position.set(20, 9.5, -20);
  roof.receiveShadow = true;
  roof.castShadow = true;

  const joint = createTower(0.5, 0.5, 2, 0x472600);
  joint.position.set(20, 7, -17);
  joint.rotation.set(Math.PI / 2, 0, 0);
  joint.receiveShadow = true;
  joint.castShadow = true;

  const blade1 = createWindBlade(8, 1, 0.1, 0xffd773);
  blade1.position.set(0, 0, 0);
  blade1.rotation.set(0, 0, 0);
  blade1.receiveShadow = true;
  blade1.castShadow = true;

  const blade2 = createWindBlade(8, 1, 0.1, 0xffd773);
  blade2.position.set(0, 0, 0);
  blade2.rotation.set(0, 0, Math.PI / 2);
  blade2.receiveShadow = true;
  blade2.castShadow = true;

  windblade = new THREE.Group();

  const windbladeGroup = [blade1, blade2];

  windbladeGroup.forEach((obj) => {
    windblade.add(obj);
  });

  windblade.position.set(20, 7, -16.5);

  const objects = [tower, roof, joint, windblade];

  const group = new THREE.Group();

  objects.forEach((obj) => {
    group.add(obj);
  });

  return group;
};

const initFirecamp = () => {
  const wood1 = createTower(0.3, 0.3, 2, 0x472600);
  wood1.position.set(20, 0.3, 18);
  wood1.rotation.set(Math.PI / 2, 0, 0);
  wood1.receiveShadow = true;
  wood1.castShadow = true;
  wood1.layers.set(1);

  const wood2 = createTower(0.3, 0.3, 2, 0x472600);
  wood2.position.set(20, 0.3, 18);
  wood2.rotation.set(Math.PI / 2, 0, Math.PI / 2);
  wood2.receiveShadow = true;
  wood2.castShadow = true;
  wood2.layers.set(1);

  const wood3 = createTower(0.3, 0.3, 2, 0x472600);
  wood3.position.set(20, 0.3, 18);
  wood3.rotation.set(Math.PI / 2, 0, Math.PI / 4);
  wood3.receiveShadow = true;
  wood3.castShadow = true;
  wood3.layers.set(1);

  const wood4 = createTower(0.3, 0.3, 2, 0x472600);
  wood4.position.set(20, 0.3, 18);
  wood4.rotation.set(Math.PI / 2, 0, Math.PI / -4);
  wood4.receiveShadow = true;
  wood4.castShadow = true;
  wood4.layers.set(1);

  const fire = createSphere(0.2, 0xed0000);
  fire.position.set(20, 0.7, 18);
  fire.layers.set(1);

  const objects = [wood1, wood2, wood3, wood4, fire];

  const group = new THREE.Group();

  objects.forEach((obj) => {
    group.add(obj);
  });

  return group;
};

const initHouse = (x, z) => {
  const base = createTower(1, 1, 2, 0x5e5445);
  base.position.set(x, 1, z);
  base.receiveShadow = true;
  base.castShadow = true;

  const roof = createCone(1.2, 1, 10, 0x9c3430, 1);
  roof.position.set(x, 2.5, z);
  roof.receiveShadow = true;
  roof.castShadow = true;

  const objects = [base, roof];

  const group = new THREE.Group();

  objects.forEach((obj) => {
    group.add(obj);
  });

  return group;
};

const initVillage = () => {
  const position = [
    { x: 15, z: 7 },
    { x: 23, z: 3 },
    { x: 28, z: 8 },
    { x: 24, z: 11 },
    { x: 27, z: 15 },
    { x: 24, z: 18 },
    { x: 27, z: 21 },
    { x: 24, z: 25 },
    { x: 20, z: 11 },
    { x: 17, z: 15 },
    { x: 14, z: 18 },
    { x: 15, z: 21 },
    { x: 20, z: 25 },
  ];
  const group = new THREE.Group();

  position.forEach((p) => {
    group.add(initHouse(p.x, p.z));
  });

  return group;
};

const initSawmill = () => {
  const base = createWindBlade(3, 3, 3, 0x472600);
  base.position.set(-20, 1.5, -20);
  base.receiveShadow = true;
  base.castShadow = true;
  base.layers.set(2);

  const baseFront = createWindBlade(2, 2, 4, 0x472600);
  baseFront.position.set(-20, 1, -16.5);
  baseFront.receiveShadow = true;
  baseFront.castShadow = true;
  baseFront.layers.set(2);

  const baseBack = createWindBlade(4, 2, 2, 0x472600);
  baseBack.position.set(-16.5, 1, -20);
  baseBack.receiveShadow = true;
  baseBack.castShadow = true;
  baseBack.layers.set(2);

  const roof = createCylinder(1, 3, 2, 4, 0x994417);
  roof.position.set(-20, 4, -20);
  roof.rotation.set(0, Math.PI / 4, 0);
  roof.receiveShadow = true;
  roof.castShadow = true;
  roof.layers.set(2);

  const wood1 = createTower(0.3, 0.3, 2, 0x472600);
  wood1.position.set(-16, 0.3, -16);
  wood1.rotation.set(Math.PI / 2, 0, 0);
  wood1.receiveShadow = true;
  wood1.castShadow = true;
  wood1.layers.set(2);

  const wood2 = createTower(0.3, 0.3, 2, 0x472600);
  wood2.position.set(-16.6, 0.3, -16);
  wood2.rotation.set(Math.PI / 2, 0, 0);
  wood2.receiveShadow = true;
  wood2.castShadow = true;
  wood2.layers.set(2);

  const wood3 = createTower(0.3, 0.3, 2, 0x472600);
  wood3.position.set(-17.2, 0.3, -16);
  wood3.rotation.set(Math.PI / 2, 0, 0);
  wood3.receiveShadow = true;
  wood3.castShadow = true;
  wood3.layers.set(2);

  const wood4 = createTower(0.3, 0.3, 2, 0x472600);
  wood4.position.set(-16.9, 0.8, -16);
  wood4.rotation.set(Math.PI / 2, 0, 0);
  wood4.receiveShadow = true;
  wood4.castShadow = true;
  wood4.layers.set(2);

  const wood5 = createTower(0.3, 0.3, 2, 0x472600);
  wood5.position.set(-16.3, 0.8, -16);
  wood5.rotation.set(Math.PI / 2, 0, 0);
  wood5.receiveShadow = true;
  wood5.castShadow = true;
  wood5.layers.set(2);

  const objects = [
    base,
    roof,
    baseFront,
    baseBack,
    wood1,
    wood2,
    wood3,
    wood4,
    wood5,
  ];

  const group = new THREE.Group();

  objects.forEach((obj) => {
    group.add(obj);
  });

  return group;
};

const initTree = (x, y) => {
  const wood = createTower(0.5, 0.5, 2, 0x472600);
  wood.position.set(x, 1, y);
  wood.receiveShadow = true;
  wood.castShadow = true;

  const leaf1 = createCone(1, 2, 8, 0x2b5428, 2);
  leaf1.position.set(x, 2, y);
  leaf1.receiveShadow = true;
  leaf1.castShadow = true;

  const leaf2 = createCone(1, 2, 8, 0x2b5428, 2);
  leaf2.position.set(x, 3, y);
  leaf2.receiveShadow = true;
  leaf2.castShadow = true;

  const objects = [wood, leaf1, leaf2];

  const group = new THREE.Group();

  objects.forEach((obj) => {
    group.add(obj);
  });

  return group;
};

const initForest = () => {
  const position = [
    { x: -20, z: -24 },
    { x: -23, z: -24 },
    { x: -25, z: -24 },
    { x: -17, z: -24 },
    { x: -15, z: -24 },
    { x: -13, z: -24 },

    { x: -20, z: -13 },
    { x: -23, z: -13 },
    { x: -25, z: -13 },
    { x: -17, z: -13 },
    { x: -15, z: -13 },
    { x: -13, z: -13 },

    { x: -25, z: -20 },
    { x: -25, z: -17 },
    { x: -13, z: -20 },
    { x: -13, z: -17 },

    { x: -10, z: -20 },
    { x: -7, z: -18 },
    { x: -9, z: -24 },
    { x: -8, z: -16 },

    { x: -4, z: -20 },
    { x: -1, z: -18 },
    { x: -3, z: -24 },
    { x: -2, z: -16 },

    { x: 2, z: -20 },
    { x: 5, z: -18 },
    { x: 3, z: -24 },
    { x: 4, z: -16 },

    { x: -24, z: -7 },
    { x: -21, z: -10 },
    { x: -18, z: -8 },
    { x: -15, z: -9 },

    { x: -24, z: -1 },
    { x: -21, z: -4 },
    { x: -18, z: -2 },
    { x: -15, z: -3 },

    { x: -24, z: 5 },
    { x: -21, z: 2 },
    { x: -18, z: 4 },
    { x: -15, z: 3 },

    { x: -24, z: 11 },
    { x: -21, z: 8 },
    { x: -18, z: 10 },
    { x: -15, z: 9 },
  ];

  const group = new THREE.Group();

  position.forEach((p) => {
    group.add(initTree(p.x, p.z));
  });

  return group;
};

const initScatteredTree = () => {
  const position = [
    { x: -20, z: 16 },
    { x: -24, z: 18 },
    { x: -22, z: 26 },
    { x: -10, z: 17 },
    { x: -12, z: 20 },
    { x: -7, z: 25 },

    { x: 5, z: 18 },
    { x: 7, z: 22 },
    { x: 11, z: 14 },
    { x: 15, z: 26 },
    { x: 13, z: 24 },
    { x: 11, z: 27 },

    { x: 14, z: -2 },
    { x: 18, z: 1 },
    { x: 22, z: -1 },
    { x: 17, z: -12 },
    { x: 26, z: -10 },
  ];

  const group = new THREE.Group();

  position.forEach((p) => {
    group.add(initTree(p.x, p.z));
  });

  return group;
};

const initScatteredHouse = () => {
  const position = [
    { x: -13, z: 26 },
    { x: -16, z: 16 },
    { x: -8, z: 21 },

    { x: 10, z: -25 },
    { x: 8, z: -20 },
    { x: 12, z: -17 },
  ];

  const group = new THREE.Group();

  position.forEach((p) => {
    group.add(initHouse(p.x, p.z));
  });

  return group;
};

//Skybox ==========================================================================

const createSkyboxSide = (text) => {
  const textureLoader = new THREE.TextureLoader();

  const texture = textureLoader.load("./asset/skybox/bay_" + text + ".jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  if (text !== "up") {
    texture.repeat.set(-1, 1);
  } else {
    texture.rotation = -Math.PI / 2;
    texture.repeat.set(1, -1);
  }

  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: texture,
    side: THREE.BackSide,
  });

  return mat;
};

const initSkybox = () => {
  const side = ["rt", "lf", "up", "dn", "ft", "bk"];

  const skybox = new THREE.BoxGeometry(60, 60, 60);

  const rtMat = createSkyboxSide(side[0]);
  const lfMat = createSkyboxSide(side[1]);
  const upMat = createSkyboxSide(side[2]);
  const dnMat = createSkyboxSide(side[3]);
  const ftMat = createSkyboxSide(side[4]);
  const bkMat = createSkyboxSide(side[5]);

  const skyboxMesh = new THREE.Mesh(skybox, [
    rtMat,
    lfMat,
    upMat,
    dnMat,
    ftMat,
    bkMat,
  ]);
  skyboxMesh.position.set(0, 0, 0);

  scene.add(skyboxMesh);
};

//Based Init ======================================================================

const initObjects = () => {
  const ground = createPlane(60, 60, 0xffffff);
  ground.position.set(0, 0, 0);
  ground.rotation.set(Math.PI / 2, 0, 0);
  ground.receiveShadow = true;

  const castle = initCastle();
  const towerFrontLeft = initTower(-10, 10);
  const towerFrontRight = initTower(10, 10);
  const towerBackLeft = initTower(-10, -10);
  const towerBackRight = initTower(10, -10);
  const wallBack = initWall(0, -10, 0);
  const wallLeft = initWall(0, -10, -1);
  const wallRight = initWall(0, -10, 1);
  const wallFront = initWall(0, -10, 2);
  const gateWall = initGateWall();

  gate = new THREE.Group();
  gate = initGate();

  const windmill = initWindmillTower();
  firecamp = new THREE.Group();
  firecamp = initFirecamp();
  firecamp.layers.set(1);
  firecampColor = new Map();
  firecamp.children.forEach((object) => {
    if (object.material) {
      firecampColor.set(object, object.material.color.clone());
    }
  });

  sawmill = new THREE.Group();
  sawmill = initSawmill();
  sawmill.layers.set(1);
  sawmillColor = new Map();
  sawmill.children.forEach((object) => {
    if (object.material) {
      sawmillColor.set(object, object.material.color.clone());
    }
  });

  village = new THREE.Group();
  village = initVillage();

  forest = new THREE.Group();
  forest = initForest();

  var scatteredTree = new THREE.Group();
  scatteredTree = initScatteredTree();

  var scatteredHouse = new THREE.Group();
  scatteredHouse = initScatteredHouse();

  const ambientLight = createAmbientLight();

  //Sun
  const directionalLight = createDirectionalLight(1);
  directionalLight.position.set(-30, 7, 18);
  // directionalLight.rotation.set((Math.PI / 4) * 9, 0, 0);
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.castShadow = true;

  //Fire
  fireLight = createPointLight(0.8);
  fireLight.position.set(20, 2, 18);

  const objects = [
    ambientLight,
    directionalLight,
    fireLight,

    ground,
    castle,
    towerFrontLeft,
    towerFrontRight,
    towerBackLeft,
    towerBackRight,
    wallBack,
    wallLeft,
    wallRight,
    wallFront,
    gateWall,
    gate,
    windmill,
    firecamp,
    sawmill,

    village,
    forest,

    scatteredTree,
    scatteredHouse,
  ];

  objects.forEach((obj) => {
    scene.add(obj);
  });
};

const init = () => {
  scene = new THREE.Scene();
  initSkybox();
  initCamera();
  initRender();
  createText("Eldengrove", -1.5, 3, 14);
  initHorse();

  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera1, renderer.domElement);

  initObjects();

  raycasterFirecamp = new THREE.Raycaster();
  raycasterSawmill = new THREE.Raycaster();
};

const render = () => {
  requestAnimationFrame(render);
  animate();
  controls.update();
  renderer.setClearColor(0xcfcfcf);
  renderer.render(scene, selectedCamera);
};

const animate = () => {
  gate.translateY(gateMovement);

  if (gate.position.y >= 2 || gate.position.y <= 0) {
    gateMovement *= -1;
  }

  windblade.rotation.z -= 0.01;
};

//Window Section ===============================================================================

window.onload = () => {
  init();
  render();
};

window.onresize = () => {
  camera1.aspect = window.innerWidth / window.innerHeight;
  camera1.updateProjectionMatrix();

  camera2.aspect = window.innerWidth / window.innerHeight;
  camera2.updateProjectionMatrix();

  camera3.aspect = window.innerWidth / window.innerHeight;
  camera3.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

const initHover = (objects, group, colorGroup) => {
  if (objects.length > 0) {
    group.children.forEach((object) => {
      if (object.material) {
        object.material.color.set(0xffffff);
      }
    });
  } else {
    group.children.forEach((object) => {
      if (object.material && colorGroup.has(object)) {
        object.material.color.copy(colorGroup.get(object));
      }
    });
  }
};

window.addEventListener("mousemove", (e) => {
  const pointer = new THREE.Vector2();

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycasterFirecamp.setFromCamera(pointer, selectedCamera);
  raycasterFirecamp.layers.set(1);

  raycasterSawmill.setFromCamera(pointer, selectedCamera);
  raycasterSawmill.layers.set(2);

  const objects = raycasterFirecamp.intersectObjects(scene.children);
  const objects2 = raycasterSawmill.intersectObjects(scene.children);

  initHover(objects, firecamp, firecampColor);
  initHover(objects2, sawmill, sawmillColor);
});

window.addEventListener("click", (e) => {
  const pointer = new THREE.Vector2();

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycasterFirecamp.setFromCamera(pointer, selectedCamera);
  raycasterFirecamp.layers.set(1);

  raycasterSawmill.setFromCamera(pointer, selectedCamera);
  raycasterSawmill.layers.set(2);

  const objects = raycasterFirecamp.intersectObjects(firecamp.children);
  const objects2 = raycasterSawmill.intersectObjects(scene.children);

  if (objects.length > 0) {
    if (!isVillageSpawn) {
      scene.add(village);
      isVillageSpawn = true;
    } else {
      scene.remove(village);
      isVillageSpawn = false;
    }
  }

  if (objects2.length > 0) {
    if (!isForestSpawn) {
      scene.add(forest);
      isForestSpawn = true;
    } else {
      scene.remove(forest);
      isForestSpawn = false;
    }
  }
});

window.addEventListener("keypress", (e) => {
  if (e.key.charCodeAt(0) === 49) {
    selectedCamera = camera1;
    controls.enabled = true;
  } else if (e.key.charCodeAt(0) === 50) {
    selectedCamera = camera2;
    controls.enabled = false;
  } else if (e.key.charCodeAt(0) === 51) {
    selectedCamera = camera3;
    controls.enabled = false;
  }
});
