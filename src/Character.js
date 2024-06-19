import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Character {
  constructor(url, resolution) {
    this.url = url;
    this.character = null;
    this.modelLoaded = false;
    this.loadModel();

    // set up world resolution
    this.resolution = resolution;

    // direction parameters
    this.UP = new THREE.Vector3(0,0,-1);
    this.DOWN = new THREE.Vector3(0,0,1);
    this.RIGHT = new THREE.Vector3(-1,0,0);
    this.LEFT = new THREE.Vector3(1,0,0);
  }

  loadModel() {
    const modelLoader = new GLTFLoader();
    modelLoader.load(this.url, (gltf) => {
      this.character = gltf.scene;
      this.character.scale.set(0.1, 0.1, 0.1); 
      this.character.position.set(0, 0, 0); 
      this.modelLoaded = true;
      console.log('Model loaded:', this.character);
    }, undefined, (error) => {
      console.error(error);
    });
  }

  moveCharater(keyCode){
    let new_direction;
    switch (keyCode) {
      case 'ArrowUp':
      case 'KeyW':
        new_direction = this.UP
        this.updatePosition(new_direction)
        break
      case 'ArrowDown':
      case 'KeyS':
        new_direction  = this.DOWN
        this.updatePosition(new_direction)
        break
      case 'ArrowLeft':
      case 'KeyA':
        new_direction = this.LEFT
        this.updatePosition(new_direction)
        break
      case 'ArrowRight':
      case 'KeyD':
        new_direction = this.RIGHT
        this.updatePosition(new_direction)
        break
      default:
        return
    }
    console.log('new direction: ', new_direction)
  }

  updatePosition(direction){
    this.character.position.add(direction);

    if (this.character.position.z < 0){
      this.character.position.z = this.resolution.y - 1;
    }
    else if (this.character.position.z > this.resolution.y - 1 ){
      this.character.position.z = 0;
    }
    if (this.character.position.x < 0){
      this.character.position.x = this.resolution.x - 1;
    }
    else if (this.character.position.x > this.resolution.x - 1 ){
      this.character.position.x = 0;
    }
  }

}
