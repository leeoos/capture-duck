import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import fontSrc from 'three/examples/fonts/helvetiker_bold.typeface.json?url'
import Character from './src/Character.js';
import SemiNPC from './src/SemiNPC.js';
import Obstacle from './src/Obstacle.js';
import Enemy from './src/Enemy.js'

// game variables
const map_size = 10
const resolution = new THREE.Vector2(map_size, map_size);
const numObstacle = 1;
const numNPC = 1;
const numEnemies = 1;
const charCell = Math.floor(resolution.x / 2)
const displace = 2 // initial space to leave for the main char
const isMobile = window.innerWidth <= 768
const charScale = 0.1;
const npcScale = 0.1;
const obsScale = 0.1;
const enemyScale = 0.5;
let obstacles = {};
let movables = {};
let removables = [];

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

// make a set of siutable coordinates to assigne to each model
function generateUniqueRandomNumbers(x, y, count) {
  if (count > (y - x + 1)) {
    throw new Error("Count cannot be greater than the range of numbers.");
  }
  let numbers = Array.from({ length: y - x + 1 }, (_, i) => x + i);

  // Fisher-Yates shuffle algorithm
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers.slice(0, count);
}
const numCell = numNPC + numEnemies + numObstacle 
let freeCells = generateUniqueRandomNumbers(resolution.x * displace, resolution.x * resolution.y, numCell);
console.log('Free cells: ', freeCells);

// load objects into the scene
function loadObjects(
	objType, 
	url, 
	resolution,
	refCell,
	scale,
	dictionary
) {

	const newObject = new objType(
		url, 
		resolution, 
		refCell,
		scale
	);
	const checkModelLoaded = setInterval(() => {
		if (newObject.modelLoaded) {
			dictionary[newObject.index] = newObject;
			scene.add(newObject.model);
			clearInterval(checkModelLoaded);
		}
	}, 100);
}

// load character
const characterUrl = '3d_models/wolf/scene.gltf';
loadObjects(Character, characterUrl, resolution, charCell, charScale, movables)

// load npc
const npcUrl = '3d_models/duck/scene.gltf';
for (let i = 0; i < numNPC; i++) {
	loadObjects(SemiNPC, npcUrl, resolution, freeCells[i], npcScale, movables)
}

// load enemy
const enemyUrl = '3d_models/doll/scene.gltf';
for (let j = numNPC; j < numNPC + numEnemies; j++) {
	loadObjects(Enemy, enemyUrl, resolution, freeCells[j], enemyScale, movables)
}

// load obstacles
const obstacleUrl = '3d_models/tree/scene.gltf';
for (let k = numNPC + numEnemies ; k < numNPC + numEnemies + numObstacle; k++) {
	loadObjects(Obstacle, obstacleUrl, resolution, freeCells[k], obsScale, obstacles)
}

let gameInterval;
let game_status = 'paused';

// move around all charaters that can be moved
function moveEnemy() {
  if (game_status === 'active') {
    Enemy.executeMethodOnAllInstances(obstacles, movables, removables);
  } else {
    clearInterval(gameInterval); 
  }
}

window.addEventListener('keyup', function(e){

	if (e.code === "KeyP") {
		if (game_status === 'active') {
			game_status = 'paused'
			console.log('game paused')
			clearInterval(moveEnemy);
		}
		else {
			game_status = 'active'
			console.log('game active')
			const gameInterval = setInterval(moveEnemy, 500);
		}
	}

	if (game_status == 'active') {
		// mainCharacter.moveCharacter(e.code, obstacles, movables);
		// console.log(movables)
		for (let index in movables) {
			if (movables.hasOwnProperty(index)) {
				let character = movables[index];
				if (character.movable) {
					character.moveCharacter(e.code, obstacles, movables);
				}		
			}
		}
		// console.log('Elements to remove ', removables)
		removables.forEach((element) => {
			// console.log('removing ', element)
			scene.remove(element.model)
			delete removables[element]; 
		});

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