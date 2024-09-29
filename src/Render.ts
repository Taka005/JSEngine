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

    this.reset();

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
  }

  reset(): Render{
    this.ctx.font = "10px Arial";
    this.ctx.fillStyle = "black";
    this.ctx.strokeStyle = "black";

    return this;
  }

  line(startX: number,startY: number,endX: number,endY: number): Render{
    this.ctx.beginPath();

    this.ctx.moveTo(startX,startY);
    this.ctx.lineTo(endX,endY);

    this.ctx.closePath();

    return this;
  }

  text(posX: number,posY: number,value: string = ""): Render{
    this.ctx.beginPath();

    this.ctx.fillText(value,posX,posY);

    this.ctx.closePath();

    return this;
  }

  setFont(value: string): Render{
    this.ctx.font = value;

    return this;
  }

  setColor(value: string): Render{
    this.ctx.fillStyle = value;
    this.ctx.strokeStyle = value;

    return this;
  }
}