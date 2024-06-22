import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Character from './Character';

export default class Enemy extends Character {

  static instances = [];

  constructor(url, resolution, setIndex, scale){
    super(url, resolution, setIndex, scale);

    this.name = 'doll';
    this.movable = false;
    this.possibleKeys = [
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD'
    ];

    Enemy.instances.push(this); // add this object to the one of the same class
  }

  moveAround(obstacles, movables, removables) {
    const randomIndex = Math.floor(Math.random() * this.possibleKeys.length);
    let randomKey = this.possibleKeys[randomIndex]
    // console.log('random key ', randomKey)
    super.moveCharacter(randomKey, obstacles, movables, removables);

  }

  static executeMethodOnAllInstances(obstacles, movables, removables) {
    Enemy.instances.forEach(instance => instance.moveAround(obstacles, movables, removables));
  }

}