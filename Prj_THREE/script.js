const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setClearColor("#EEEEEE", 1.0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// camera controls
const camControls = new THREE.OrbitControls(camera, renderer.domElement);
camControls.damping = 0.2;
camControls.addEventListener('change', render);
camera.position.x = -35;
camera.position.y = 30;
camera.position.z = 50;
camera.lookAt(scene.position);

// window resize handler
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

/*  const axes = new THREE.AxisHelper(20);
  scene.add(axes);*/

// create the ground plane
const planeGeometry = new THREE.PlaneGeometry(50, 50, 10, 10);
const planeMaterial = new THREE.MeshLambertMaterial({
  color: "#ffffff"
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.position.x = -5;
plane.position.y = 0;
plane.position.z = -5;
scene.add(plane);

// ---- 3D CONTENT CREATION -----------------------------------------------------
let suz, suzanne, tisch

let startColorSuzanne = "#ffdc4e"
let startColorTisch = "#211201"

const loader = new THREE.ColladaLoader();
loader.options.convertUpAxis = true;
loader.load('./vc1_lab3.dae', function (collada) {
  suz = collada.scene;
  suz.position.set(0, 1, 0);
  //suz.scale.set(1, 1, 1);
  scene.add(suz);

  suzanne = suz.getObjectByName("Suzanne").children[0];
  tisch = suz.getObjectByName("Tisch").children[0];

  suzanne.castShadow = true;
  tisch.castShadow = true;

  suzanne.receiveShadow = true;
  tisch.receiveShadow = true;

  suzanne.material = new THREE.MeshPhongMaterial({ color: startColorSuzanne })
  tisch.material = new THREE.MeshPhongMaterial({ color: startColorTisch })

  render();

});

// ---- END OF 3D CONTENT CREATION ---------------------------------------------

// add subtle ambient lighting
const ambientLight = new THREE.AmbientLight("#ccd7e8", 0.40);
scene.add(ambientLight);

// add spotlight for the shadows
const spotLight = new THREE.SpotLight("#E8D6C1", 0.60);
spotLight.angle = 0.60;
spotLight.penumbra = 0.572;
spotLight.position.set( -80, 200, 180 );
scene.add(spotLight);

// add headlight
const headLight = new THREE.PointLight("#FFFFFF", 0.33);
headLight.position.set(camera.position.x, camera.position.y, camera.position.z);
scene.add(headLight);

// add GUI control elements
const guiControls = new function () {
  this.ShowPlane = true;
  this.WithShadow = true;

  this.Scale = 1.0;

  this.PositionX = 0;
  this.PositionY = 0;
  this.PositionZ = 0;

  this.RotationX = 0.00001; // we have to fool gui: Will display integer with 0.0!
  this.RotationY = 0.00001;
  this.RotationZ = 0.00001;
}

const colorControls = new function () {
  this.Suzanne = startColorSuzanne;
  this.Tisch = startColorTisch;
}


const gui = new dat.GUI({
  autoPlace: false
});

const guiContainer = document.getElementById('gui-container');
guiContainer.appendChild(gui.domElement);

gui.add(guiControls, 'ShowPlane').onChange(function (e) {
  showPlane = e;
  if (showPlane) {
    scene.add(plane);
  } else {
    scene.remove(plane);
  }
  render();
});

initShadow(true)
setShadow(true)
render();

const guiColors = gui.addFolder("Colors");

guiColors.addColor(colorControls, "Suzanne").onChange(function (e) {
  suzanne.material = new THREE.MeshPhongMaterial({ color: e })
  render();
});
guiColors.addColor(colorControls, "Tisch").onChange(function (e) {
  tisch.material = new THREE.MeshPhongMaterial({ color: e })
  render();
});
guiColors.open()

gui.add(guiControls,'Scale', 0.1, 5.0).step(0.1).onChange(function (e) {
  suz.scale.set(e,e,e);
  render();
});

guiPosition = gui.addFolder('Position');
guiPosition.add(guiControls,'PositionX', -30.0, 40.0).step(0.1).onChange(function (){
  suz.position.x = guiControls.PositionX;
  render();
});

guiPosition.add(guiControls,'PositionY', -1.0, 15.0).step(0.1).onChange(function (){
  suz.position.y = guiControls.PositionY;
  render();
});

guiPosition.add(guiControls,'PositionZ', -40.0, 30.0).step(0.1).onChange(function (){
  suz.position.z = guiControls.PositionZ;
  render();
});
guiPosition.open();

guiRotation = gui.addFolder('Rotation');
guiRotation.add(guiControls,'RotationX', -4.0, 4.0).step(0.01).onChange(function (){
  suz.rotation.x = guiControls.RotationX;
  render();
});

guiRotation.add(guiControls,'RotationY', -4.0, 4.0).step(0.01).onChange(function (){
  suz.rotation.y = guiControls.RotationY;
  render();
});

guiRotation.add(guiControls,'RotationZ', -4.0, 4.0).step(0.01).onChange(function (){
  suz.rotation.z = guiControls.RotationZ;
  render();
});
guiRotation.open();

// init and call render function
function render() {
  headLight.position.set(camera.position.x, camera.position.y, camera.position.z);
  renderer.render(scene, camera);
}

// shadow cast on plane
function initShadow(value) {
  plane.receiveShadow = value;

  spotLight.castShadow = value;
  spotLight.shadow.mapSize.width = 8192;
  spotLight.shadow.mapSize.height = 8192;
  renderer.shadowMap.enabled = value;
  if (value) {
    gui.add(guiControls, 'WithShadow').onChange(function (e) {
      withShadow = e;
      setShadow(withShadow);
    });
  }
}

function setShadow(value) {
  if (value) {
    renderer.shadowMap.autoUpdate = true;
  } else {
    renderer.shadowMap.autoUpdate = false;
    renderer.clearTarget(spotLight.shadow.map);
  }
  render();
}

