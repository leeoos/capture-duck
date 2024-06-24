import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import fontSrc from 'three/examples/fonts/helvetiker_bold.typeface.json?url'
import TWEEN from '@tweenjs/tween.js';
import Character from './src/Character.js';
import SemiNPC from './src/SemiNPC.js';
import Obstacle from './src/Obstacle.js';
import Enemy from './src/Enemy.js'
import Portal from './src/Portal.js'


// game variables
const map_size = 31;
const resolution = new THREE.Vector2(map_size, map_size);
const numObstacle = 70;
const numNPC = 7;
const numEnemies = 15;
const charCell = Math.floor(resolution.x / 2);
const portalCell = (Math.floor(resolution.x/2)) + resolution.x*resolution.x 
const displace = 2 // initial space to leave for the main char
const isMobile = window.innerWidth <= 768
const charScale = 0.1;
const npcScale = 0.1;
const obsScale = 0.1;
const enemyScale = 0.5;
const portalScale = 0.5;
let character = null;
let characterSet = false
let obstacles = {};
let movables = {};
let removables = [];
let setFollow = true;
let lives = 1; // dummy initialization
let gameInterval;
let game_status = 'paused';
let goal = (resolution.x - 1) * (resolution.x) + Math.floor(resolution.x /2) 
let occasions = numNPC;
// console.log('goal ', goal)

// load fonts
const fontLoader = new FontLoader()
let font
fontLoader.load(fontSrc, function (loadedFont) {
	font = loadedFont
})

// set up color palette
const palettes = {
	main: {
		groundColor:  [
			0x2F4F2F, // dark greenish-brown color
			0x253B25, // even darker greenish-brown color
			0x006400, // dark green color
			0x004d00, // even darker green color
		],    
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

// add terrain style
const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 color;
  uniform vec3 fadeColor;
  varying vec2 vUv;

  void main() {
    float dist = distance(vUv, vec2(0.5, 0.5));
    float fade = smoothstep(0.4, 0.5, dist);
    vec3 finalColor = mix(color, fadeColor, fade);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const uniforms = {
  color: { value: new THREE.Color(0x2F4F2F) }, // Plane color
  fadeColor: { value: new THREE.Color('black') } // Fade to black
};

const planeMaterial = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide
});

// Create the plane with the shader material
const planeGeometry = new THREE.PlaneGeometry(resolution.x, resolution.y, resolution.x, resolution.y);
planeGeometry.rotateX(-Math.PI * 0.5);
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.x = resolution.x / 2 - 0.5;
plane.position.z = resolution.y / 2 - 0.5;
plane.receiveShadow = true;
scene.add(plane);


// add small white and dark green spots
const spotColors = [0xffffff, 0x006400]; // white and dark green colors
const spotSize = 0.02;
const spotGeometry = new THREE.CircleGeometry(spotSize);

for (let i = 0; i < 300; i++) {
    const spotMaterial = new THREE.MeshBasicMaterial({
        color: spotColors[Math.floor(Math.random() * spotColors.length)],
        side: THREE.DoubleSide // make sure the spot is visible from both sides
    });
    const spot = new THREE.Mesh(spotGeometry, spotMaterial);
    spot.rotation.x = -Math.PI / 2; // rotate to lay flat on the ground
    spot.position.set(
        Math.floor(Math.random() * resolution.x),
        0.001, // slightly above the plane to avoid z-fighting
        Math.floor(Math.random() * resolution.y)
    );
    scene.add(spot);
}

// add goal cell
// const squareSize = 1; // Size of the square
// const squareGeometry = new THREE.PlaneGeometry(squareSize, squareSize);
// const squareMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide});
// const square = new THREE.Mesh(squareGeometry, squareMaterial);
// square.rotation.x = -Math.PI / 2; // Rotate to lay flat
// square.position.set(
// 	Math.floor((resolution.x - 1) / 2), 
// 	0.01, 
// 	resolution.x -1
// ); 
// scene.add(square);


// DEBUG: set up grid helper for development
// const gridHelper = new THREE.GridHelper(
// 	resolution.x,
// 	resolution.y,
// 	0xffffff,
// 	0xffffff
// )
// gridHelper.position.set(resolution.x / 2 - 0.5, 0, resolution.y / 2 - 0.5)
// gridHelper.material.transparent = true
// gridHelper.material.opacity = isMobile ? 0.75 : 0.3
// scene.add(gridHelper)

// DUBUG: show the axes of coordinates system
// const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

// load the moon texture and bump map
const textureLoader = new THREE.TextureLoader();
const moonTexture = textureLoader.load('assets/moon.jpg');
const moonBumpMap = textureLoader.load('assets/bump.jpg'); 

// create the moon material with texture and bump map
const moonMaterial = new THREE.MeshStandardMaterial({
  map: moonTexture,
  bumpMap: moonBumpMap, 
  bumpScale: 0.05,  
});

// add moon 
const moonGeometry = new THREE.SphereGeometry(2, 32, 32);
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(0, 8, resolution.y);
scene.add(moon);

// set up lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9); // reduce intensity
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 4.5)
// directionalLight.position.set(3, 10, 7)
directionalLight.position.copy(moon.position)
scene.add(directionalLight)

// rendering sizes
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

// set up camera 
const fov = 70;
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 1000);
const midX = resolution.x / 2 - 0.5;
const midZ = resolution.y / 2 - 0.5;
camera.position.set(midX, 12, resolution.x + (resolution.x * 0.28));
camera.lookAt(new THREE.Vector3(midX, 0, midZ));

// set third person view
function transitionToThirdPerson(mainCharacter, setFollow) {
	if (mainCharacter && mainCharacter.model) {
		// get char position
		const charPosition = mainCharacter.model.position;
		const charDirection = new THREE.Vector3();
		mainCharacter.model.getWorldDirection(charDirection);
		
		// position the camera
		const cameraOffset = charDirection.clone().multiplyScalar(-3).add(new THREE.Vector3(0, 2, 0));
		const cameraPosition = charPosition.clone().add(cameraOffset);
		
		if (setFollow) {
			const currentCameraPosition = camera.position.clone();
			const currentCameraLookAt = new THREE.Vector3();
			camera.getWorldDirection(currentCameraLookAt);

			// create tweens for position and look-at
			new TWEEN.Tween(currentCameraPosition)
					.to(cameraPosition, 2000) // 2000ms = 2 seconds
					.easing(TWEEN.Easing.Quadratic.InOut)
					.onUpdate(() => {
							camera.position.copy(currentCameraPosition);
					})
					.start();

			new TWEEN.Tween(currentCameraLookAt)
					.to(charPosition, 2000)
					.easing(TWEEN.Easing.Quadratic.InOut)
					.onUpdate(() => {
							camera.lookAt(currentCameraLookAt);
					})
					.start();
		}
		else {
			camera.position.copy(cameraPosition);
			camera.lookAt(charPosition);
		}
	}
}

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

// set up OrbitControls to explore map
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(
	resolution.x / 2 - 2,
	0,
	resolution.y / 2 + (isMobile ? 0 : 2)
)
// controls.minDistance = 1; 
controls.maxDistance = 40; 

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
let freeCells = generateUniqueRandomNumbers(resolution.x * displace, ((resolution.x * resolution.y) - 2*resolution.y) - 1, numCell);
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

// add portal
const portalUrl = '3d_models/portal/scene.gltf';
loadObjects(Portal, portalUrl, resolution, portalCell, portalScale, obstacles)

// move around all charaters that can be moved
function moveALL() {
  if (game_status === 'active') {
    Enemy.executeMoveOnAllInstances(obstacles, movables, removables);
		SemiNPC.executeMoveOnAllInstances(obstacles, movables, removables);
  } else {
    clearInterval(gameInterval); 
  }
}

function gameOver() {
	console.log('lives ', lives)
	if (lives <= 0) {
		console.log('game over');
		game_status = 'game over';
		clearInterval(moveALL);
	}
}

const checkStop = setInterval(gameOver, 500)

// gui elements
const livesElement = document.getElementById('Lives');
const scoreElement = document.getElementById('Score');
const duckElement = document.getElementById('Ducks');

// Function to update the GUI
function updateGUI() {
  livesElement.innerText = lives;
	duckElement.innerText = character.occasions;
  if (character && character.prey) {
    scoreElement.innerText = `${character.preyCounter}/${numNPC}`;
  } else {
    scoreElement.innerText = `${0}/${numNPC}`;;
  }
}


window.addEventListener('keyup', function(e){

	// reset function
	if (e.code === "KeyR") {
		location.reload();
	}

	// stop condiction
	if (lives <= 0 || game_status === 'game ended') {
		clearInterval(moveALL);
		return;
	}

	// charater status
	if (!characterSet) {
		character = movables[charCell]
		console.log('character ', character)
		characterSet = true;
		if (character.occasions === 0) character.occasions = numNPC
	}

	// complete and exit
	if (e.code === "KeyG" ){
		console.log('char index ', character.index)
		console.log('goal ', goal)
		console.log(character.index === goal)
		character.resetPos()
		if (character.index === goal && character.prey){
			console.log('game ended! ')
			console.log('score ', character.preyCounter)
			game_status = 'game ended';
			controls.enabled = true
			character.stopAnimation()
			clearInterval(moveALL);

			// redirect to vinning page
			localStorage.setItem('score', character.preyCounter);
			const message = document.createElement('div');
			message.innerText = "Press Enter to view the victory screen";
			message.style.position = 'absolute';
			message.style.top = '10px';
			message.style.left = '50%';
			message.style.transform = 'translateX(-50%)';
			message.style.color = 'white';
			message.style.fontSize = '1.5em';
			message.style.fontFamily = 'Arial, sans-serif';
			document.body.appendChild(message);

			// Add event listener for Enter key
			window.addEventListener('keydown', function handleEnter(e) {
				if (e.code === 'Enter') {
					window.removeEventListener('keydown', handleEnter); // Remove listener to prevent multiple redirects
					window.location.href = 'victory.html';
				}
			});
			return;
		}
		else {

			const message = document.createElement('div');
			message.innerText = "You cannot pass through the portal without a duck!!!";
			message.style.position = 'absolute';
			message.style.top = '10px';
			message.style.left = '50%';
			message.style.transform = 'translateX(-50%)';
			message.style.color = 'white';
			message.style.fontSize = '1.5em';
			message.style.fontFamily = 'Arial, sans-serif';
			document.body.appendChild(message);

			// remove message after 3 seconds
			setTimeout(() => {
				document.body.removeChild(message);
			}, 3000); 

		}
	}

	if (e.code === "KeyP") {
		if (game_status === 'active') {
			game_status = 'paused'
			console.log('game paused')
			controls.enabled = true
			clearInterval(moveALL);
			character.stopAnimation()
			if (character.prey) character.prey.stopAnimation()
		}
		else {
			if (lives > 0) {
				game_status = 'active';
				if (character.prey) character.prey.rotateOnSpot()
			}
			console.log('game active');
			controls.enabled = false;
			setFollow = true;
			const gameInterval = setInterval(moveALL, 500);
		}
	}

	// console.log(movables[charCell])
	if (game_status == 'active' && lives > 0) {
		transitionToThirdPerson(character, setFollow);
		setFollow = false; // avoid camera transition
		character.moveCharacter(e.code, obstacles, movables, removables);
		console.log('prey counter ', character.preyCounter)
		if (character.prey) {
			lives = character.preyCounter
			if(character.preyCounter === 0) {
				console.log('removing little duck');
				scene.remove(character.prey.model);
				character.isFirst = true;
				character.prey = null;
				// occasions -= 1; 
				console.log('occasions ', occasions)
				if (character.occasions > 0) lives = 1;
			}
		}

		// console.log('Elements to remove ', removables)
		removables.forEach((element) => {
			// console.log('removing ', element)
			scene.remove(element.model);
			delete removables[element]; 
			// occasions -= 1; // only the one rotating will remain
		});
	}
	updateGUI()
});

// frame loop
function tic() {
	TWEEN.update();
	if(controls.enabled) controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(tic);
}
requestAnimationFrame(tic);

// adaptive windows 
window.addEventListener('resize', handleResize);
function handleResize() {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix();

	renderer.setSize(sizes.width, sizes.height)

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setPixelRatio(pixelRatio)
}