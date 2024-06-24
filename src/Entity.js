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

    // possile orientations
    this.orientations = [
      0,
      Math.PI / 2,
      Math.PI,
      -Math.PI / 2
    ]

    // set up world resolution
    this.resolution = resolution;

    this.animationRunning = false
  }

  get position() {
    return this.model.position
  }

  get rotation() {
    return this.model.rotation
  }

  get cellindex() {
    return this.index
  }

  updateCellIndex() {
    // the order is super important
    this.index = this.position.z * this.resolution.x + this.position.x
  }

  updateMovable(movables, old_index) {
    // console.log('old movable ', movables)
    // update only for wolf or doll (?)
    if (!this.capured) {
      delete movables[old_index]
      movables[this.index] = this;
    }
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

      if (this.name === 'doll' || this.name === 'duck') {
        const randomIndex = Math.floor(Math.random() * this.orientations.length);
        this.model.rotation.set(
          0, 
          this.orientations[randomIndex], 
          0
        )
      }
      
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
  
  checkEntitiesCollision(obstacles, movables, removables = null) {
    // console.log('collision condiction ', (this.index in indices))
    // console.log('entity name ', this.name)

    if (this.index in obstacles) {
      console.log('tree collision')
      return true
    }

    else if (this.index in movables){

      // collision between doll and movable duck
      if (
        (this.name === 'doll')  &&
        (movables[this.index].name == 'wolf') &&
        (movables[this.index].movable)
      ){
        console.log('doll collision with wolf');
        if (movables[this.index].prey) {
          movables[this.index].preyCounter -= 1;
        }
      }

      // collision between  duck and wolf
      if (
        (this.name === 'wolf') &&
        (movables[this.index].name == 'duck') && 
        (!movables[this.index].capured)
      ){
        console.log('wolf collision duck')
        movables[this.index].movable = true 
        movables[this.index].capured = true // captured
        this.preyCounter += 1

        if (this.isFirst){
          console.log('capture a new duck')
          movables[this.index].updateList(movables[this.index])
          this.prey = movables[this.index]
          movables[this.index].model.position.x = this.position.x
          movables[this.index].model.position.y = 1.2
          movables[this.index].model.position.z = this.position.z
          movables[this.index].model.scale.set(0.06, 0.06, 0.06)
          movables[this.index].rotateOnSpot()
          this.isFirst = false;
          return false;
        }

        else if (!this.isFirst) {
          removables.push(movables[this.index])  
          delete movables[this.index];
        }
        return false
      }
      // in this case do not consider collision
      else if (
        (this.name === 'wolf') &&
        (movables[this.index].name === 'duck') && 
        (movables[this.index].capured)
      ){
        return false
      }
      return true
    }
    return false
  }

  animate() {
    if (this.name === 'wolf') this.animateArms()
  }

  stopAnimation() {
    TWEEN.removeAll();
    this.animationRunning = false; // Reset flag
  }

}
