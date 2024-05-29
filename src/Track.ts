import { Sprite, Container, Graphics, Application } from "pixi.js";
import { Entity } from "./Entity";

interface Track{
  posX: number;
  posY: number;
  size: number;
}

class Track{
  constructor(entity: Entity){
    this.posX = entity.posX;
    this.posY = entity.posY;
    this.size = entity.size;
  }
}

export { Track };