import Entity from "./Entity";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Obstacle extends Entity {

  constructor(url, resolution, illigalindex){
    super(resolution)

    this.url = url;
    this.obstacle = null;
    this.illigalindex = illigalindex;
    this.loadObstacle();

  }

  get position() {
    return this.obstacle.position
  }

  loadObstacle() {
    const modelLoader = new GLTFLoader();
    modelLoader.load(this.url, (gltf) => {
      // load and set model
      this.obstacle = gltf.scene;
      this.obstacle.scale.set(0.1, 0.1, 0.1); 

      // random position of the 
      let newIndex = Math.floor(Math.random() * this.resolution.x * this.resolution.y);
      let xAndz = super.getPosByIndex(newIndex)
      this.obstacle.position.set(xAndz.x, 0, xAndz.y); 
      this.modelLoaded = true;

      // update model cell value
      console.log('Obstacle loaded:', this.obstacle);
      super.updateCellIndex()
      console.log('Cell index: ', this.index)
    }, undefined, (error) => {
      console.error(error);
    });
  }
}