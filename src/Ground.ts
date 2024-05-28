import { Application, Graphics, Container } from "pixi.js";

interface Ground{
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
}

type GroundOption = {
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number
}

class Ground{
  constructor({ name, startX, startY, endX, endY, size }: GroundOption){
    if(size < 0) throw new Error("サイズは0以上にしてください");

    this.name = name;

    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;

    this.size = size;
  }

  solvePosition(posX: number,posY: number): { posX: number, posY: number }{
    const t: number = Math.max(0,Math.min(1,((posX - this.startX)*(this.endX - this.startX) + (posY - this.startY)*(this.endY - this.startY))/Math.sqrt((this.startX - this.endX)**2 + (this.startY - this.endY)**2)**2));
    const crossX: number = this.startX + t*(this.endX - this.startX);
    const crossY: number = this.startY + t*(this.endY - this.startY);

    if(t > 0 && t < 1){
      return {
        posX: crossX,
        posY: crossY
      }
    }else{
      const startDistance: number = Math.sqrt((posX - this.startX)**2 + (posY - this.startY)**2);
      const endDistance: number = Math.sqrt((posX - this.endX)**2 + (posY - this.endY)**2);
      if(startDistance < endDistance){
        return {
          posX: this.startX,
          posY: this.startY
        }
      }else{
        return {
          posX: this.endX,
          posY: this.endY
        }
      }
    }
  }

  draw(render: Application): void{
    const container = new Container();

    const line = new Graphics()
      .moveTo(this.startX,this.startY)
      .lineTo(this.endX,this.endY);

    const startCircle = new Graphics()
      .circle(this.startX,this.startY,this.size/2-1)
      .fill("red");

    const endCircle = new Graphics()
      .circle(this.endX,this.endY,this.size/2-1)
      .fill("red");

    line.strokeStyle = "red";
    line.width = this.size;

    container.addChild(line);
    container.addChild(startCircle);
    container.addChild(endCircle);

    render.stage.addChild(container);
  }
}

export { Ground, GroundOption };