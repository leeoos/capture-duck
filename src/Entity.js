import * as THREE from 'three'
import {EventDispatcher} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import TWEEN from '@tweenjs/tween.js';

export default class Entity extends  EventDispatcher {

  constructor(url, resolution, setIndex, scale) {
    super()

    this.name = 'entity';

    // refenrnce cell in world
    this.index = null;

    // load model
    this.model = null;
    this.modelLoaded = false;
    this.loadModel(url, setIndex, scale)

    // set up world resolution
    this.resolution = resolution;

    this.animationRunning = false
  }

  get position() {
    return this.model.position
  }

  get cellindex() {
    return this.index
  }

  updateCellIndex() {
    this.index = this.position.x * this.resolution.x + this.position.z 
  }

  updateMovable(movables, old_index) {
    // console.log('old movable ', movables)
    delete movables[old_index]
    movables[this.index] = this;
    // console.log('current movable ', movables)
  
  }

  getPosByIndex(index) {
    const curr_position = { x: 0, z: 0 };
    curr_position.x = index % this.resolution.x
    curr_position.z = Math.floor(index / this.resolution.y)
    return curr_position
  }
  
  loadModel(url, setIndex, scale) {
    const modelLoader = new GLTFLoader();
    modelLoader.load(url, (gltf) => {
      // load model
      this.model = gltf.scene;
      this.model.scale.set(scale, scale, scale); 

      
      let xAndz = this.getPosByIndex(setIndex)
      // console.log(xAndz.x)
      // console.log(xAndz.z)

      this.model.position.set(xAndz.x, 0, xAndz.z); 
      this.modelLoaded = true;
      
      // update model cell value
      // console.log('Model loaded:', this.model);
      this.updateCellIndex()
      // console.log('Cell index: ', this.index);
      super.dispatchEvent({type: 'loaded'});

    }, undefined, (error) => {
      console.error(error);
    });
  }
  
  checkEntitiesCollision(obstacles, movables, removables = null, code) {
    // console.log('collision condiction ', (this.index in indices))
    // console.log('entity name ', this.name)

    if (this.index in obstacles) {
      console.log('tree collision')
      return true
    }

    else if (this.index in movables){

      // collision between doll and movable duck
      if (
        (this.name == 'doll')  &&
        (movables[this.index].name == 'duck') &&
        (movables[this.index].movable)
      ){
        console.log('doll collision with duck')
        removables.push(movables[this.index])  
        delete movables[this.index]   
      }

      // collision between static duck and wolf
      if (
        (this.name == 'wolf') &&
        (movables[this.index].name == 'duck') && 
        (!movables[this.index].movable)
      ){
        console.log('wolf duck collision')
        movables[this.index].movable = true // capture
        let tryMove = movables[this.index].moveCharacter(code, obstacles, movables);
        console.log('try move ', tryMove);
        if (tryMove) {
          console.log('duck moved away');
          return false
        }
      }
      return true
    }

    else {
      return false
    }
  }

  animate() {
    if (this.name === 'wolf') this.animateArms()
  }

  stopAnimation() {
    TWEEN.removeAll();
    this.animationRunning = false; // Reset flag
  }

}
