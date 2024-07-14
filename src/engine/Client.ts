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

  }

}

export { Client };