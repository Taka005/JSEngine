import { Container, Graphics, Application } from "pixi.js";
import { Circle } from "./Circle";

interface Track{
  view: Container;
}

class Track{
  constructor(object: Circle){
    this.view = object.view;
  }

  load(): void{
    this.view.alpha = 0.1;
  }

  destroy(): void{
    this.view.destroy();
  }
}

export { Track };