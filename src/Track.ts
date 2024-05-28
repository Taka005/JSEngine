import { Sprite } from "pixi.js";
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

  draw(ctx: CanvasRenderingContext2D): void{
    const container = new Container();

    if(this.img){
      container.addChild(this.img);
    }else{
      const circle = new Graphics()
        .circle(this.posX,this.posY,this.size)
        .fill(this.color);

      const line = new Graphics()
        .moveTo(this.posX,this.posY)
        .lineTo(this.posX,this.posY - this.size);

      line.strokeStyle = "black";

      container.addChild(circle);
      container.addChild(line);
    }

    container.rotation = this.rotate*(Math.PI);

    render.stage.addChild(container);
  }
}

export { Track }