import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Entity from './Entity';
import TWEEN from '@tweenjs/tween.js';

export default class Character extends Entity {

  constructor(url, resolution, setIndex, scale) {
    super(url, resolution, setIndex, scale)

    // dummy attribute
    this.name = 'wolf';
    this.movable = true;
    this.captured = false;
    this.occasions = 0;

    // monitor first capture
    this.isFirst = true;
    this.prey = null;
    this.preyCounter = 0

    // direction parameters
    this.UP = new THREE.Vector3(0,0,1);
    this.DOWN = new THREE.Vector3(0,0,-1);
    this.RIGHT = new THREE.Vector3(-1,0,0);
    this.LEFT = new THREE.Vector3(1,0,0);

    // animation setup
    this.currentLeftTween = null
    this.swingLeftForward = null
    this.swingLeftBackward = null

    this.currentRightTween = null
    this.swingRightForward = null
    this.swingRightBackward = null

    this.animationRunning = false;
    this.firstStep = true;
  }

  moveCharacter(keyCode, obstacles, movables, removables){

    // set new direction
    let new_direction;
    let rotation_angle;
    switch (keyCode) {
      case 'ArrowUp':
      case 'KeyW':
        new_direction = this.UP;
        rotation_angle = 0;
        break;
      case 'ArrowDown':
      case 'KeyS':
        new_direction = this.DOWN;
        rotation_angle = Math.PI;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        new_direction = this.LEFT;
        rotation_angle = Math.PI / 2;
        break;
      case 'ArrowRight':
      case 'KeyD':
        new_direction = this.RIGHT;
        rotation_angle = -Math.PI / 2;
        break;
      default:
        return;
    }

    let success = this.updatePosition(new_direction, obstacles, movables, removables, keyCode);

    if (success) {
      // Update the model's rotation
      if (this.name === 'doll' || this.name === 'duck') {
        this.model.rotation.y = rotation_angle;
      }
      // this.model.rotation.y = rotation_angle;

      if (!this.animationRunning && this.name === 'wolf') {
        this.swingArms();
      }
    }
    return success;
  }

  updatePosition(direction, obstacles, movables, removables = null, code = null){

    const old = JSON.parse(JSON.stringify(this.position));
    const old_index = JSON.parse(JSON.stringify(this.index));
    
    this.position.add(direction);
    
    super.updateCellIndex();
    let updatedPos = true;

    // check collision
    if (super.checkEntitiesCollision(obstacles, movables, removables, code)) {
      // console.log('eh eh eh collistion detected!!!')
      this.position.x = old.x;
      this.position.y = old.y;
      this.position.z = old.z;
      super.updateCellIndex()
      updatedPos = false;
    }

    // condictions for map edges
    if (this.position.z < 0 || this.position.z > this.resolution.y - 1 || this.position.x < 0 || this.position.x > this.resolution.x - 1){
      this.position.x = old.x;
      this.position.y = old.y;
      this.position.z = old.z;
      super.updateCellIndex()
      updatedPos = false;
    }

    if (updatedPos) {
      super.updateMovable(movables, old_index);
      if (this.name === 'wolf' && this.preyCounter > 0) {
        this.prey.model.position.x = this.position.x;
        this.prey.model.position.z = this.position.z;
      }
    } 
    return updatedPos;
  }

  animationSetUp() {
    // left shoulder
    let leftShoulder = this.model.getObjectByName('L_shoulder_s_00');

    this.swingLeftForward = new TWEEN.Tween({ rotation: Math.PI })
    .to({ rotation: Math.PI / 4 }, 1000)
    .onUpdate(({ rotation }) => {
        if (leftShoulder) leftShoulder.rotation.x = rotation;
    });

    this.swingLeftBackward = new TWEEN.Tween({ rotation: Math.PI / 4 })
    .to({ rotation: Math.PI }, 1000)
    .onUpdate(({ rotation }) => {
        if (leftShoulder) leftShoulder.rotation.x = rotation;
    });

    this.currentLeftTween = 'backward';

    // right shoulder
    let rightShoulder = this.model.getObjectByName('R_shoulder_s_037');

    this.swingRightForward = new TWEEN.Tween({ rotation:  -Math.PI / 4 })
    .to({ rotation: 0 }, 1000)
    .onUpdate(({ rotation }) => {
        if (rightShoulder) rightShoulder.rotation.x = rotation;
    });

    this.swingRightBackward = new TWEEN.Tween({ rotation: 0 })
    .to({ rotation: -Math.PI / 4 }, 1000)
    .onUpdate(({ rotation }) => {
        if (rightShoulder) rightShoulder.rotation.x = rotation;
    });

    this.currentRightTween = 'forward';
  }

  swingArms() {

    if (this.currentLeftTween === 'forward') {
      this.swingLeftBackward.start();
      this.currentLeftTween = 'backward';
    } else {
      console.log('forward')
      this.swingLeftForward.start();
      this.currentLeftTween = 'forward';
    }

    if (this.currentRightTween === 'forward') {
      this.swingRightBackward.start();
      this.currentRightTween = 'backward';
    } else {
        this.swingRightForward.start();
        this.currentRightTween = 'forward';
    }
  }

  resetPos() {
    let leftShoulder = this.model.getObjectByName('L_shoulder_s_00');
    leftShoulder.rotation.x = Math.PI;
    let rightShoulder = this.model.getObjectByName('R_shoulder_s_037');
    rightShoulder.rotation.x = 0;
  }

}
