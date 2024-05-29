import { Application, Graphics, Container } from "pixi.js";

interface Ground{
  type: string;
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  container: Container;
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

    this.type = "ground";
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

  load(render: Application): void{
    this.container = new Container();

    const line = new Graphics()
      .moveTo(this.startX,this.startY)
      .lineTo(this.endX,this.endY)
      .stroke({ width: this.size, color: "red" });

    const startCircle = new Graphics()
      .circle(this.startX,this.startY,this.size/2)
      .fill("red");

    const endCircle = new Graphics()
      .circle(this.endX,this.endY,this.size/2)
      .fill("red");

    this.container.addChild(line,startCircle,endCircle);

    render.stage.addChild(this.container);
  }

  destroy(): void{
    this.container.destroy();
  }

  toJSON(): GroundOption{
    return {
      name: this.name,
      startX: this.startX,
      startY: this.startY,
      endX: this.endX,
      endY: this.endY,
      size: this.size
    }
  }
}

export { Ground, GroundOption };