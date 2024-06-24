import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Character from './Character';
import TWEEN from '@tweenjs/tween.js';

export default class SemiNPC extends Character {

  static instances = [];

  constructor(url, resolution, setIndex, scale){
    super(url, resolution, setIndex, scale);
    this.name = 'duck';
    this.movable = true;
    this.caputured = false;

    this.possibleKeys = [
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD'
    ];

    SemiNPC.instances.push(this);
  }

  rotateOnSpot() {
    if (this.animationRunning) {
      console.log('stopped here')
      return;
    }

    const initialRotation = { y: this.model.rotation.y };
    const targetRotation = { y: this.model.rotation.y + Math.PI * 2 };

    const rotateTween = new TWEEN.Tween(initialRotation)
      .to(targetRotation, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        this.model.rotation.y = initialRotation.y;
      })
      .onComplete(() => {
        this.animationRunning = false;
      })
      .repeat(Infinity);

    rotateTween.start();
    this.animationRunning = true;
  }

  moveAround(obstacles, movables, removables) {
    const randomIndex = Math.floor(Math.random() * this.possibleKeys.length);
    let randomKey = this.possibleKeys[randomIndex]
    // console.log('random key ', randomKey)
    super.moveCharacter(randomKey, obstacles, movables, removables);

  }

  static executeMoveOnAllInstances(obstacles, movables, removables) {
    SemiNPC.instances.forEach(instance => instance.moveAround(obstacles, movables, removables));
  }

  updateList(instance) {
    const index = SemiNPC.instances.indexOf(instance);
    if (index > -1) {
      // console.log('before', SemiNPC.instances)
      SemiNPC.instances.splice(index, 1);
      // console.log('after', SemiNPC.instances)

    }
  }
}
