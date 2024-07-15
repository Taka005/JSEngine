import { Engine } from "./Engine";

interface Client {

}

type ClientOption = {
  canvas?: HTMLCanvasElement;
}

/**
 * クライアントクラス
 * エンジンを使いやすくします
 */
class Client{
  constructor({ canvas }: ClientOption = {}){
    if(canvas){
      this.setCanvas(canvas);
    }
  }

  setCanvas(canvas: HTMLCanvasElement): void{
    this.canvas = canvas;

    this.engine = new Engine(this.canvas);
  }
}

export { Client };