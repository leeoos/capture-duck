import * as THREE from 'three'
import {EventDispatcher} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Entity extends  EventDispatcher {

  constructor(resolution) {
    super()

    // refenrnce cell in world
    this.index = null;

    // set up world resolution
    this.resolution = resolution;
  }

  get cellindex() {
    return this.index
  }

  updateCellIndex() {
    this.index = this.position.x * this.resolution.x + this.position.z 
  }

  getPosByIndex(index) {
    const curr_position = { x: 0, z: 0 };
    curr_position.x = index % this.resolution.x
    curr_position.z = Math.floor(index / this.resolution.y)
    return curr_position
  }

  checkEntitiesCollision(entity) {
    console.log('current pos', this.index)
    console.log('entity pos', entity.index)
    console.log('equals? ', (this.index === entity.index))
		return ((this.index) === entity.index)
	}

}
