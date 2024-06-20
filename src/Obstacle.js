import Entity from "./Entity";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Obstacle extends Entity {

  constructor(
    url, 
    resolution, 
    setPosition = {x:0, y:0, z:0}, 
    randomPos = false, 
    obstacles = null,
    movables = null
  ){
    super(resolution)

    // load model
    this.url = url;
    super.loadModel(setPosition, randomPos, obstacles, movables)

  }

}