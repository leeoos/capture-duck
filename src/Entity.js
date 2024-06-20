import * as THREE from 'three'
import {EventDispatcher} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Entity extends  EventDispatcher {

  constructor(resolution) {
    super()

    // refenrnce cell in world
    this.index = null;
    this.model = null;
    this.modelLoaded = false;

    // set up world resolution
    this.resolution = resolution;
  }

  get position() {
    return this.model.position
  }

  get cellindex() {
    return this.index
  }

  updateCellIndex() {
    this.index = this.position.x * this.resolution.x + this.position.z 
    // if (movables) movables[this.index] = this;
  }

  getPosByIndex(index) {
    const curr_position = { x: 0, z: 0 };
    curr_position.x = index % this.resolution.x
    curr_position.z = Math.floor(index / this.resolution.y)
    return curr_position
  }
  
  loadModel(setPosition, randomPos = false, obstacles = null, movables = null) {
    const modelLoader = new GLTFLoader();
    modelLoader.load(this.url, (gltf) => {
      // load model
      this.model = gltf.scene;
      this.model.scale.set(0.1, 0.1, 0.1); 
      
      if (randomPos){
        let newIndex = Math.floor(Math.random() * this.resolution.x * this.resolution.y);
        // check that the cell is free
        while (newIndex in obstacles || newIndex in movables) {
          console.log('Cell ', newIndex, 'was not free... selcting new one')
          newIndex = Math.floor(Math.random() * this.resolution.x * this.resolution.y);
        }
        let xAndz = this.getPosByIndex(newIndex)
        setPosition.x = xAndz.x
        setPosition.z = xAndz.z
      }
      this.model.position.set(setPosition.x, setPosition.y, setPosition.z); 
      this.modelLoaded = true;
      
      // update model cell value
      // console.log('Model loaded:', this.model);
      this.updateCellIndex()
      // console.log('Cell index: ', this.index);
    }, undefined, (error) => {
      console.error(error);
    });
  }
  
  checkEntitiesCollision(obstacles, movables) {
    // console.log('collision condiction ', (this.index in indices))
    if (this.index in obstacles) {
      console.log('tree collision')
      return true
    }
    else if (this.index in movables){
      // if not capured yet
      if (!movables[this.index].movable) {
        // console.log('duck collision')
        // capture
        movables[this.index].movable = true
        return true
      }
      // else treat as obstacle
      else {
        // console.log('duck movable',  movables[this.index].movable)
        return false
      }
    }
    else {
      return false
    }
  }

}
