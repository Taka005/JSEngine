interface Render{
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  posX: number;
  posY: number;
}

type RenderOption = {
  posX?: number;
  posY?: number;
}

class Render{
  constructor(canvas: HTMLCanvasElement,{ posX = 0, posY = 0 }: RenderOption){
    this.canvas = canvas;
    const ctx = this.canvas.getContext("2d");
    if(!ctx) throw new Error("無効な描画要素です");

    this.ctx = ctx;

    this.posX = posX;
    this.posY = posY;

    this.ctx.font = "10px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
  }

  line(startX: number,startY: number,endX: number,endY: number): void{
    this.ctx.beginPath();

    this.ctx.moveTo(startX,startY);
    this.ctx.lineTo(endX,endY);

    this.ctx.closePath();
  }

  text(posX: number,posY: number,value: string = ""): void{
    this.ctx.beginPath();

    this.ctx.fillText(value,posX,posY);

    this.ctx.closePath();
  }
}