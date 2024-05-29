import { Sprite, Container, Graphics, Application } from "pixi.js";
import { Circle } from "./Circle";

interface Track{
  container: Container;
}

class Track{
  constructor(object: Circle){
    this.container = object.container;
  }

  load(): void{
    this.container.alpha = 0.1;
  }

  destroy(): void{
    this.container.destroy();
  }
}

export { Track };