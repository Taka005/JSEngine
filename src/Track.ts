import { Sprite, Container, Graphics, Application } from "pixi.js";
import { Entity } from "./Entity";

interface Track{
  posX: number;
  posY: number;
  size: number;
  img: Sprite | null;
}

class Track{
  constructor(entity: Entity){
    this.posX = entity.posX;
    this.posY = entity.posY;
    this.size = entity.size;
    this.img = entity.img;
  }

  draw(render: Application): void{
    const container = new Container();

    if(this.img){
      container.addChild(this.img);
    }else{
      const circle = new Graphics()
        .circle(this.posX,this.posY,this.size)
        .fill("red");

      container.addChild(circle);
    }

    render.stage.addChild(container);
  }
}

export { Track };