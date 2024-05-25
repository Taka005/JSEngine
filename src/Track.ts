import { Entity } from "./Entity";

interface Track{
  posX: number;
  posY: number;
  size: number;
  img: HTMLImageElement | null;
}

class Track{
  constructor(entity: Entity){
    this.posX = entity.posX;
    this.posY = entity.posY;
    this.size = entity.size;
    this.img = entity.img;
  }

  draw(ctx: CanvasRenderingContext2D): void{
    if(this.img){
      ctx.drawImage(
        this.img,
        this.posX - this.img.width/2,
        this.posY - this.img.height/2
      );
    }else{
      ctx.beginPath();
      ctx.arc(this.posX,this.posY,this.size,0,2*Math.PI);
      ctx.strokeStyle = "rgba(255,0,0,0.3)";
      ctx.fillStyle = "rgba(255,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
    }
  }
}

export { Track }