import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Character from './Character';

export default class SemiNPC extends Character {

  constructor(url, resolution, setIndex, scale){
    super(url, resolution, setIndex, scale);
    this.name = 'duck';
    this.movable = false;
  }

}
