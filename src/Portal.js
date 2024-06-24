import Entity from "./Entity";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Portal extends Entity {

  constructor(url, resolution, setIndex, scale){
    super(url, resolution, setIndex, scale)
    this.name = 'portal'
  }


}