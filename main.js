import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import fontSrc from 'three/examples/fonts/helvetiker_bold.typeface.json?url'
import Character from './src/Character.js';
import SemiNPC from './src/SemiNPC.js';
import Obstacle from './src/Obstacle.js';

// game variables
const resolution = new THREE.Vector2(20, 20);
const numObstacle = 20;
const numNPC = 3;
let obstacles = {};
let movables = {};
const initialization = {
	mainCharPos: {
		x: Math.floor(resolution.x / 2),
		y: 0,
		z: 0
	} 
}
const illigalIndex = 0;
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
	}
}
let paletteName = localStorage.getItem('paletteName') || 'main'
let selectedPalette = palettes[paletteName]
const params = {
	...selectedPalette,
}

// set up scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(params.fogColor)
scene.fog = new THREE.Fog(params.fogColor, 5, 40)

// add plane
// const planeGeometry = new THREE.PlaneGeometry(
// 	resolution.x * 50,
// 	resolution.y * 50
// )
const planeGeometry = new THREE.PlaneGeometry(resolution.x, resolution.y,resolution.x, resolution.y);
planeGeometry.rotateX(-Math.PI * 0.5)
const planeMaterial = new THREE.MeshStandardMaterial({
	color: params.groundColor,
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.position.x = resolution.x / 2  - (1/2);
plane.position.z = resolution.y / 2 - (1/2);  
plane.receiveShadow = true
scene.add(plane)

// set up grid helper
const gridHelper = new THREE.GridHelper(
	resolution.x,
	resolution.y,
	0xffffff,
	0xffffff
)
gridHelper.position.set(resolution.x / 2 - 0.5, 0, resolution.y / 2 - 0.5)
gridHelper.material.transparent = true
gridHelper.material.opacity = isMobile ? 0.75 : 0.3
scene.add(gridHelper)


let mainCharacter; // Declare mainCharacter in a broader scope

// function to load a character model and return a promise
function loadCharacter(url, resolution, position, randomizePosition, obstacles, movables) {
  return new Promise((resolve) => {
    const character = new Character(url, resolution, position, randomizePosition, obstacles, movables);
    const checkModelLoaded = setInterval(() => {
      if (character.modelLoaded) {
        movables[character.index] = character;
        scene.add(character.model);
        clearInterval(checkModelLoaded);
        resolve(character);
      }
    }, 100);
  });
}

// function to load a semi-NPC model and return a promise
function loadSemiNPC(url, resolution, position, randomizePosition, obstacles, movables) {
  return new Promise((resolve) => {
    const npc = new SemiNPC(url, resolution, position, randomizePosition, obstacles, movables);
    const checkModelLoaded = setInterval(() => {
      if (npc.modelLoaded) {
        movables[npc.index] = npc;
        scene.add(npc.model);
        clearInterval(checkModelLoaded);
        resolve(npc);
      }
    }, 100);
  });
}

// function to load an obstacle model and return a promise
function loadObstacle(url, resolution, position, randomizePosition, obstacles, movables) {
  return new Promise((resolve) => {
    const obstacle = new Obstacle(url, resolution, position, randomizePosition, obstacles, movables);
    const checkModelLoaded = setInterval(() => {
      if (obstacle.modelLoaded) {
        obstacles[obstacle.index] = obstacle;
        scene.add(obstacle.model);
        clearInterval(checkModelLoaded);
        resolve(obstacle);
      }
    }, 100);
  });
}

// Load the main character first then...
const characterUrl = '3d_models/wolf/scene.gltf';
loadCharacter(characterUrl, resolution, initialization['mainCharPos'], false, obstacles, movables)
  .then((character) => {
		mainCharacter = character;

    // load NPCs after the main character is loaded
    const npcPromises = [];
		const npcUrl = '3d_models/goose/scene.gltf';
    for (let j = 0; j < numNPC; j++) {
      npcPromises.push(loadSemiNPC(npcUrl, resolution, undefined, true, obstacles, movables));
    }
    return Promise.all(npcPromises);
  })
  .then(() => {
    // load obstacles after all NPCs are loaded
    const obstaclePromises = [];
    for (let i = 0; i < numObstacle; i++) {
      const treeUrl = '3d_models/tree2/scene.gltf';
      obstaclePromises.push(loadObstacle(treeUrl, resolution, undefined, true, obstacles, movables));
    }
    return Promise.all(obstaclePromises);
  })
  .catch((error) => {
    console.error('Error loading models:', error);
  });

// rendering sizes
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

// set up camera TODO change to follow character
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
	5,
	resolution.y / 2 + 5
)
camera.position.copy(initialPosition)
camera.lookAt(new THREE.Vector3(0, 2.5, 0))

// set up lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
const directionalLight = new THREE.DirectionalLight(0xffffff, 4.5)
directionalLight.position.set(3, 10, 7)
scene.add(ambientLight, directionalLight)

// DUBUG: show the axes of coordinates system
// const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

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
controls.target.set(
	resolution.x / 2 - 2,
	0,
	resolution.y / 2 + (isMobile ? 0 : 2)
)

// move around
window.addEventListener('keyup', function(e){

	mainCharacter.moveCharacter(e.code, obstacles, movables);
	console.log(movables)
	for (let key in movables) {
		if (movables.hasOwnProperty(key)) {
			let value = movables[key];
			if (value.movable) {
				value.moveCharacter(e.code, obstacles, movables);
			}		
			// console.log(`Key: ${key}, Value:`, value.movable);
		}
	}
})


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