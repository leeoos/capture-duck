import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Character from './Character';

export default class SemiNPC extends Character {

  constructor(
    url, 
    resolution, 
    setPosition = {x:0, y:0, z:0}, 
    randomPos = false,
    obstacles = null,
    movables = null
  ){
    super(url, resolution, setPosition, randomPos, obstacles, movables);
    this.movable = false;
  }


}
