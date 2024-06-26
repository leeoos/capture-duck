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
    this.last_rotation = 'up'
    this.leftRotation = 0
    this.rightRotation = 0

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

  // moveCharacter(keyCode, obstacles, movables, removables){

  //   // set new direction
  //   let new_direction;
  //   let rotation_angle;
  //   switch (keyCode) {
  //     case 'ArrowUp':
  //     case 'KeyW':
  //       new_direction = this.UP;
  //       rotation_angle = 0;
  //       break;
  //     case 'ArrowDown':
  //     case 'KeyS':
  //       new_direction = this.DOWN;
  //       rotation_angle = Math.PI;
  //       break;
  //     case 'ArrowLeft':
  //     case 'KeyA':
  //       new_direction = this.LEFT;
  //       rotation_angle = Math.PI / 2;
  //       break;
  //     case 'ArrowRight':
  //     case 'KeyD':
  //       new_direction = this.RIGHT;
  //       rotation_angle = -Math.PI / 2;
  //       break;
  //     default:
  //       return;
  //   }

  //   let success = this.updatePosition(new_direction, obstacles, movables, removables, keyCode);

  //   if (success) {
  //     // Update the model's rotation
  //     if (this.name === 'doll' || this.name === 'duck') {
  //       this.model.rotation.y = rotation_angle;
  //     }
  //     // this.model.rotation.y = rotation_angle;

  //     if (!this.animationRunning && this.name === 'wolf') {
  //       this.swingArms();
  //     }
  //   }
  //   return success;
  // }

  moveCharacter(keyCode, obstacles, movables, removables) {
    // Calculate the current forward direction based on the model's rotation
 
    
    let new_direction = new THREE.Vector3();
    let rotation_angle = 0
    let go_back = false;
    switch (keyCode) {
      case 'ArrowUp':
      case 'KeyW':
        new_direction = this.UP;
        rotation_angle = 0;
        break;
      case 'ArrowDown':
      case 'KeyS':
        new_direction = this.UP;
        rotation_angle = 0;
        go_back = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        rotation_angle = Math.PI / 2;
        this.last_rotation = 'left'
        this.rightRotation -= 1;
        this.leftRotation += 1
        // this.leftRotation = this.leftRotation % 4 // reset in module 4 
        break;
      case 'ArrowRight':
      case 'KeyD':
        rotation_angle = -Math.PI / 2;
        this.last_rotation = 'right'
        this.leftRotation -= 1;
        this.rightRotation += 1
        // this.rightRotation = this.rightRotation % 4 // reset in module 4 
        break;
      default:
        return;
    }
  
    this.model.rotation.y += rotation_angle;
    // console.log('last rotation: ', this.last_rotation)
    // console.log('left ', this.leftRotation)
    // console.log('right ', this.rightRotation)
    // console.log('current orientation: ', currOrientation)

    if (rotation_angle == 0) {

      // left orientation
      let foo = Math.abs(this.leftRotation)
      let currOrientation = foo % 4
      // currOrientation = currOrientation % 4
      
      // if (this.last_rotation === 'left') {
      if (this.leftRotation > 0) {
        // let currOrientation = this.leftRotation - this.rightRotation
        // if (currOrientation < 0) currOrientation = -currOrientation;
        // console.log('current orientation: ', currOrientation)
        switch(currOrientation) {
          case 0 : 
            new_direction = this.UP
            break;
          case 1 : 
            new_direction = this.LEFT
            break;
          case 2 : 
            new_direction = this.DOWN
            break;
          case 3 : 
            new_direction = this.RIGHT
            break;
        }
        // console.log('direction ', new_direction)
        // if (go_back) {
        //   // console.log('here ', new_direction)
        //   if (new_direction.x !=0) new_direction.x = -1*new_direction.x;
        //   if (new_direction.z !=0) new_direction.z = -1*new_direction.z;
        //   go_back = false
        // }
        // console.log(new_direction)
      }
      // right orientation
      // else if (this.last_rotation === 'right') {
      else if (this.leftRotation <= 0) {
        // let currOrientation = this.rightRotation - this.leftRotation 
        // if (currOrientation < 0) currOrientation = -currOrientation;
        // currOrientation = currOrientation % 4
        // let bar = Math.abs(this.rightRotation)
        // let currOrientation = bar % 4
        switch(currOrientation) {
          case 0 : 
            new_direction = this.UP
            break;
          case 1 : 
            new_direction = this.RIGHT
            break;
          case 2 : 
            new_direction = this.DOWN
            break;
          case 3 : 
            new_direction = this.LEFT
            break;
        }
        // console.log('direction ', new_direction)
        // if (go_back) {
        //   // console.log('here ', new_direction)
        //   if (new_direction.x !=0) new_direction.x = -1*new_direction.x;
        //   if (new_direction.z !=0) new_direction.z = -1*new_direction.z;
        //   go_back = false
        // }
        // console.log(new_direction)
      }
      if (go_back) {
        switch (new_direction) {
          case this.UP:
            new_direction = this.DOWN
            break;
          case this.DOWN:
            new_direction = this.UP
            break;
          case this.LEFT:
            new_direction = this.RIGHT
            break;
          case this.RIGHT:
            new_direction = this.LEFT
            break;
          default:
            break;
        }
      }

    }

    let success = this.updatePosition(new_direction, obstacles, movables, removables, keyCode);
  
    if (success && rotation_angle === 0) {

      if (!this.animationRunning && this.name === 'wolf') {
        this.swingArms();
      }
    }
    return success;
  }

  updatePosition(direction, obstacles, movables, removables = null, code = null){

    if (!direction) return false

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

    // swing left arm forward
    this.swingLeftForward = new TWEEN.Tween({ rotation: Math.PI })
    .to({ rotation: Math.PI / 4 }, 1000)
    .onUpdate(({ rotation }) => {
        if (leftShoulder) leftShoulder.rotation.x = rotation;
    });

    // go back to rest from forward
    this.swingLeftFReset = new TWEEN.Tween({ rotation: Math.PI / 4 })
    .to({ rotation: Math.PI }, 1000)
    .onUpdate(({ rotation }) => {
        if (leftShoulder) leftShoulder.rotation.x = rotation;
    });

    // swing left arm backward
    this.swingLeftBackward = new TWEEN.Tween({ rotation: Math.PI})
    .to({ rotation: 3*Math.PI / 2 }, 1000)
    .onUpdate(({ rotation }) => {
        if (leftShoulder) leftShoulder.rotation.x = rotation;
    });

    // go back to rest form backward
    this.swingLeftBReset = new TWEEN.Tween({ rotation: 3*Math.PI / 2 })
    .to({ rotation: Math.PI }, 1000)
    .onUpdate(({ rotation }) => {
        if (leftShoulder) leftShoulder.rotation.x = rotation;
    });

    this.currentLeftTween = 'f-reset';

    // right shoulder
    let rightShoulder = this.model.getObjectByName('R_shoulder_s_037');

    this.swingRightForward = new TWEEN.Tween({ rotation:  0 })
    .to({ rotation: Math.PI / 4 }, 1000)
    .onUpdate(({ rotation }) => {
        if (rightShoulder) rightShoulder.rotation.x = rotation;
    });

    this.swingRightFReset = new TWEEN.Tween({ rotation: Math.PI / 4 })
    .to({ rotation: 0 }, 1000)
    .onUpdate(({ rotation }) => {
        if (rightShoulder) rightShoulder.rotation.x = rotation;
    });

    this.swingRightBackward = new TWEEN.Tween({ rotation: 0 })
    .to({ rotation: -Math.PI / 4 }, 1000)
    .onUpdate(({ rotation }) => {
        if (rightShoulder) rightShoulder.rotation.x = rotation;
    });

    this.swingRightBReset = new TWEEN.Tween({ rotation: -Math.PI / 4 })
    .to({ rotation: 0 }, 1000)
    .onUpdate(({ rotation }) => {
        if (rightShoulder) rightShoulder.rotation.x = rotation;
    });

    this.currentRightTween = 'b-reset';
  }


  swingArms() {

    // left 
    if (this.currentLeftTween === 'forward') {
      this.swingLeftFReset.start();
      this.currentLeftTween = 'f-reset';  
    }
    else if (this.currentLeftTween === 'f-reset') {
      console.log('go backkkkkk')
      this.swingLeftBackward.start();
      this.currentLeftTween = 'backward'; 
    }
    else if (this.currentLeftTween === 'backward') {
      this.swingLeftBReset.start();
      this.currentLeftTween = 'b-reset'; 
    }
    else {
      this.swingLeftForward.start();
      this.currentLeftTween = 'forward'; 
    }

    // right
    if (this.currentRightTween === 'forward') {
      this.swingRightFReset.start();
      this.currentRightTween = 'f-reset';  
    }
    else if (this.currentRightTween === 'f-reset') {
      this.swingRightBackward.start();
      this.currentRightTween = 'backward'; 
    }
    else if (this.currentRightTween === 'backward') {
      this.swingRightBReset.start();
      this.currentRightTween = 'b-reset'; 
    }
    else {
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
