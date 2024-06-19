import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Character from './Character';

export default class SemiNPC extends Character {

  constructor(url, resolution, defX, defY, defZ, control) {
    super(url, resolution, defX, defY, defZ);
    this.controlledMove = control;
  }

  setControll() {
    this.controlledMove = true;
  }

}
