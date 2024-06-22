import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Entity from './Entity';

export default class Character extends Entity {

  constructor(url, resolution, setIndex, scale) {
    super(url, resolution, setIndex, scale)

    // load model
    // this.url = url;
    // super.loadModel(setIndex)

    // dummy attribute
    this.name = 'wolf';
    this.movable = true;

    // direction parameters
    this.UP = new THREE.Vector3(0,0,1);
    this.DOWN = new THREE.Vector3(0,0,-1);
    this.RIGHT = new THREE.Vector3(-1,0,0);
    this.LEFT = new THREE.Vector3(1,0,0);
  }

  moveCharacter(keyCode, obstacles, movables, removables = null){
    let new_direction;
    switch (keyCode) {
      case 'ArrowUp':
      case 'KeyW':
        new_direction = this.UP
        this.updatePosition(new_direction, obstacles, movables, removables, keyCode)
        break
      case 'ArrowDown':
      case 'KeyS':
        new_direction  = this.DOWN
        this.updatePosition(new_direction, obstacles, movables, removables, keyCode)
        break
      case 'ArrowLeft':
      case 'KeyA':
        new_direction = this.LEFT
        this.updatePosition(new_direction, obstacles, movables, removables, keyCode)
        break
      case 'ArrowRight':
      case 'KeyD':
        new_direction = this.RIGHT
        this.updatePosition(new_direction, obstacles, movables, removables, keyCode)
        break
      default:
        return
    }
    // console.log('new direction: ', new_direction)
  }

  updatePosition(direction, obstacles, movables, removables = null, code = null){

    const old = JSON.parse(JSON.stringify(this.position));
    const old_index = JSON.parse(JSON.stringify(this.index));
    
    this.position.add(direction);
    super.updateCellIndex();

    // check collision
    if (super.checkEntitiesCollision(obstacles, movables, removables, code)) {
      // console.log('eh eh eh collistion detected!!!')
      this.position.x = old.x;
      this.position.y = old.y;
      this.position.z = old.z;
      super.updateCellIndex()
    }

    // condictions for map edges
    if (this.position.z < 0 || this.position.z > this.resolution.y - 1 || this.position.x < 0 || this.position.x > this.resolution.x - 1){
      this.position.x = old.x;
      this.position.y = old.y;
      this.position.z = old.z;
      super.updateCellIndex()
    }

    super.updateMovable(movables, old_index)
  }
}
