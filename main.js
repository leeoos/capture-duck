import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import fontSrc from 'three/examples/fonts/helvetiker_bold.typeface.json?url'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { compressNormals } from 'three/examples/jsm/utils/GeometryCompressionUtils.js';
import Character from './src/Character.js';

const isMobile = window.innerWidth <= 768

// load fonts
const fontLoader = new FontLoader()
let font
fontLoader.load(fontSrc, function (loadedFont) {
	font = loadedFont
})

// set up color palette
const palettes = {
	main: {
		groundColor: 'black', //0x56f854,
		fogColor: 'black', //0x39c09f,
		rockColor: 0xebebeb, //0x7a95ff,
		treeColor: 0x639541, //0x1d5846,
		candyColor: 0x1d5846, //0x614bdd,
		snakeColor: 0x1d5846, //0xff470a,
		mouthColor: 0x39c09f,
	}
}
let paletteName = localStorage.getItem('paletteName') || 'main'
let selectedPalette = palettes[paletteName]
const params = {
	...selectedPalette,
}

// set up grid helper
const resolution = new THREE.Vector2(10, 10) 
const gridHelper = new THREE.GridHelper(
	resolution.x,
	resolution.y,
	0xffffff,
	0xffffff
)
gridHelper.position.set(resolution.x / 2 - 0.5, -0.49, resolution.y / 2 - 0.5)
gridHelper.material.transparent = true
gridHelper.material.opacity = isMobile ? 0.75 : 0.3


// set up scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(params.fogColor)
scene.fog = new THREE.Fog(params.fogColor, 5, 40)
scene.add(gridHelper)

// set up ref cube
const material = new THREE.MeshNormalMaterial()
const geometry = new THREE.BoxGeometry(1, 1, 1)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// load main charater from class
const modelUrl = '3d_models/wolf/scene.gltf';
const mainCharater = new Character(modelUrl, resolution);

// Add the model to the scene when it is loaded
const checkModelLoaded = setInterval(() => {
  if (mainCharater.modelLoaded) {
    scene.add(mainCharater.character);
    clearInterval(checkModelLoaded);
  }
}, 100);

// rendering sizes
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

// set up camera
const fov = 60
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1)
const finalPosition = isMobile
	? new THREE.Vector3(resolution.x / 2 - 0.5, resolution.x + 15, resolution.y)
	: new THREE.Vector3(
			-8 + resolution.x / 2,
			resolution.x / 2 + 4,
			resolution.y + 6
	  )
const initialPosition = new THREE.Vector3(
	resolution.x / 2 + 5,
	4,
	resolution.y / 2 + 4
)
camera.position.copy(initialPosition)
// camera.lookAt(new THREE.Vector3(0, 2.5, 0))

// set up lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
const directionalLight = new THREE.DirectionalLight(0xffffff, 4.5)
directionalLight.position.set(3, 10, 7)
scene.add(ambientLight, directionalLight)


// DUBUG: show the axes of coordinates system
const axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)

// set up renderer
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
	logarithmicDepthBuffer: true,
})
document.body.appendChild(renderer.domElement)
handleResize()

renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.2
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.VSMShadowMap


// set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
// controls.enableZoom = false
// controls.enablePan = false
// controls.enableRotate = false
controls.target.set(
	resolution.x / 2 - 2,
	0,
	resolution.y / 2 + (isMobile ? 0 : 2)
)

// set three js Clock
// const clock = new THREE.Clock()

// add grid
const planeGeometry = new THREE.PlaneGeometry(
	resolution.x * 50,
	resolution.y * 50
)
planeGeometry.rotateX(-Math.PI * 0.5)
const planeMaterial = new THREE.MeshStandardMaterial({
	color: params.groundColor,
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.position.x = resolution.x / 2 - 0.5
plane.position.z = resolution.y / 2 - 0.5
plane.position.y = -0.5
scene.add(plane)
plane.receiveShadow = true


// EXPERIMENTS //


// starting game
// let isRunning = false;

// function start_game(){
//   if(!isRunning){ //if the game is not already started
//     isRunning = setInterval( () => {
//       mainCharater.updatePosition()
//     },400)
//   }
// }

// function stop_game(){
//   clearInterval(isRunning);
// }

// perform motion
// window.addEventListener('click',function(){
// 	!isRunning ? start_game(): stop_game();
// 	console.log("running ? : ", isRunning);
// })


window.addEventListener('keyup', function(e){
  mainCharater.moveCharater(e.code);

  // mainCharater.updatePosition();
  console.log(e);

})

//////////////////////////////////////////

// frame loop
function tic() {
	controls.update()
	renderer.render(scene, camera)
	requestAnimationFrame(tic)
}
requestAnimationFrame(tic)

// adaptive windows 
window.addEventListener('resize', handleResize)
function handleResize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()

	renderer.setSize(sizes.width, sizes.height)

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setPixelRatio(pixelRatio)
}