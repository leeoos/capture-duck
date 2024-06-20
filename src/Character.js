import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Entity from './Entity';

export default class Character extends Entity {

  constructor(url, resolution, defX = 0, defY = 0, defZ = 0) {
    super(resolution)

    // load model
    this.url = url;
    this.character = null;
    this.modelLoaded = false;
    this.loadModel(defX, defY, defZ);

    // direction parameters
    this.UP = new THREE.Vector3(0,0,1);
    this.DOWN = new THREE.Vector3(0,0,-1);
    this.RIGHT = new THREE.Vector3(-1,0,0);
    this.LEFT = new THREE.Vector3(1,0,0);
  }

  get position() {
    return this.character.position
  }

  loadModel(defX, defY, defZ) {
    const modelLoader = new GLTFLoader();
    modelLoader.load(this.url, (gltf) => {
      // load and set model
      this.character = gltf.scene;
      this.character.scale.set(0.1, 0.1, 0.1); 
      this.character.position.set(defX, defY, defZ); 
      this.modelLoaded = true;

      // update model cell value
      console.log('Model loaded:', this.character);
      super.updateCellIndex()
      console.log('Cell index: ', this.index)
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
    // console.log('new direction: ', new_direction)
  }

  updatePosition(direction){
    this.position.add(direction);

    if (this.position.z < 0){
      this.position.z = this.resolution.y - 1;
    }
    else if (this.position.z > this.resolution.y - 1 ){
      this.position.z = 0;
    }
    if (this.position.x < 0){
      this.position.x = this.resolution.x - 1;
    }
    else if (this.position.x > this.resolution.x - 1 ){
      this.position.x = 0;
    }

    super.updateCellIndex()
  }

}
