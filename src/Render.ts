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
  }
}