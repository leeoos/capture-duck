import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Entity from './Entity';
import TWEEN from '@tweenjs/tween.js';

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

    // objaect componets
    this.head = "head_s_08";
    this.rArm = "R_forearm_twist_s_039";
    this.lArm = "L_forearm_twist_s_025";
  }

  moveCharacter(keyCode, obstacles, movables, removables = null){
    let new_direction;
    switch (keyCode) {
      case 'ArrowUp':
      case 'KeyW':
        new_direction = this.UP
        return this.updatePosition(new_direction, obstacles, movables, removables, keyCode)
        break
      case 'ArrowDown':
      case 'KeyS':
        new_direction  = this.DOWN
        return this.updatePosition(new_direction, obstacles, movables, removables, keyCode)
        break
      case 'ArrowLeft':
      case 'KeyA':
        new_direction = this.LEFT
        return this.updatePosition(new_direction, obstacles, movables, removables, keyCode)
        break
      case 'ArrowRight':
      case 'KeyD':
        new_direction = this.RIGHT
        return this.updatePosition(new_direction, obstacles, movables, removables, keyCode)
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
      this.animate();
    } 
    return updatedPos;
  }

  animateArms() {

    let leftArm = this.model.getObjectByName(this.lArm)
    let rightArm = this.model.getObjectByName(this.rArm)

	if (!leftArm || !rightArm) {
			console.error('Arm bones not found!');
			return;
	}

	const initialRotationLeft = { x: leftArm.rotation.x, y: leftArm.rotation.y, z: leftArm.rotation.z };
	const targetRotationLeft = { x: Math.PI / 4, y: leftArm.rotation.y, z: leftArm.rotation.z };

	const initialRotationRight = { x: rightArm.rotation.x, y: rightArm.rotation.y, z: rightArm.rotation.z };
	const targetRotationRight = { x: -Math.PI / 4, y: rightArm.rotation.y, z: rightArm.rotation.z };

	const leftArmTween = new TWEEN.Tween(initialRotationLeft)
			.to(targetRotationLeft, 1000)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(() => {
					leftArm.rotation.x = initialRotationLeft.x;
					leftArm.rotation.y = initialRotationLeft.y;
					leftArm.rotation.z = initialRotationLeft.z;
			})
			.yoyo(true)
			.repeat(Infinity);

	const rightArmTween = new TWEEN.Tween(initialRotationRight)
			.to(targetRotationRight, 1000)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(() => {
					rightArm.rotation.x = initialRotationRight.x;
					rightArm.rotation.y = initialRotationRight.y;
					rightArm.rotation.z = initialRotationRight.z;
			})
			.yoyo(true)
			.repeat(Infinity);

    leftArmTween.start();
    rightArmTween.start();
  }

  animate() {
    this.animateArms()
  }

}
