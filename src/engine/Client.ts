import { Engine, EngineOption } from "./Engine";

interface Client {
  canvas: HTMLCanvasElement;
  engine: Engine;
  tool: string;
  isReady: boolean;
}

type ClientOption = {};

/**
 * クライアントクラス
 * エンジンを使いやすくします
 */
class Client{
  constructor({}: ClientOption = {}){
    this.tool = "circle";
    this.isReady = false;
  }

  setCanvas(canvas: HTMLCanvasElement): void{
    this.canvas = canvas;
  }

  setEngine(option: EngineOption = {}): void{
    if(!this.canvas) throw new Error("描画要素が設定されていません");

    this.engine = new Engine(this.canvas,option);

    this.isReady = true;
  }


  setTool(value: string): void{
    this.tool = value;
  }
}

export { Client };