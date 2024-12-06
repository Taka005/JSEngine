import { Engine } from "../Engine";
import { EffectType, parseImage, resize } from "../utils";

/**
 * @typedef {Object} SpawnerOption
 * @property {strint} name 物体名
 * @property {number} posX X座標
 * @property {number} posY Y座標
 * @property {number} speedX 設定するX速度
 * @property {number} speedY 設定するY速度
 * @property {number} size 設定する半径
 * @property {string} color 設定する色
 * @property {string | null} image 画像リンク
 * @property {string} script カスタムスクリプト
 */
type SpawnerOption = {
  name: string;
  posX: number;
  posY: number;
  speedX?: number;
  speedY?: number;
  size: number;
  color?: string;
  image?: string | null;
  script?: string;
}

/**
 * スポナークラス
 * 円を生成します
 */
class Spawner{

  /**
   * 種類
   */
  public readonly type = EffectType.Spawner;

  /**
   * 名前
   */
  public readonly name: string;

  /**
   * 設定する色
   */
  public color: string;

  /**
   * 画像
   */
  public image: HTMLImageElement | null

  /**
   * 設置座標
   */
  public posX: number;
  public posY: number;

  /**
   * 設定する速度
   */
  public speedX: number;
  public speedY: number;

  /**
   * 設定する半径
   */
  public size: number;

  /**
   * カスタムスクリプト
   */
  public script: string;

  /**
   * @param {Object} SpawnerOption グラウンドオプション
   */
  constructor({ name, posX, posY, speedX = 0, speedY = 0, size, color = "red", image = null, script = "" }: SpawnerOption){
    this.name = name;
    this.color = color;
    this.image = parseImage(image);
    this.posX = posX;
    this.posY = posY;
    this.speedX = speedX;
    this.speedY = speedY;
    this.size = size;
    this.script = script;
  }

  /**
   * 物体に効果を与えます
   */
  public setEffect(): void{}

  public setUpdate(engine: Engine): void{

  }

  /**
   * オブジェクトを描画
   * @param {CanvasRenderingContext2D} ctx コンテキスト
   */
  public draw(ctx: CanvasRenderingContext2D): void{
    if(this.image){
      const { width, height } = resize(this.image,this.size*2);

      ctx.save();
      ctx.translate(this.posX,this.posY);

      ctx.drawImage(
        this.image,
        -width/2,
        -height/2,
        width,
        height
      );

      ctx.restore();
    }else{
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.arc(this.posX,this.posY,this.size,0,2*Math.PI);
      ctx.stroke();
    }
  }

  /**
   * クラスのデータをJSONに変換します
   * @returns {SpawnerOption} サークルオプション
   */
  public toJSON(): SpawnerOption{
    return {
      name: this.name,
      posX: this.posX,
      posY: this.posY,
      speedX: this.speedX,
      speedY: this.speedY,
      size: this.size,
      color: this.color,
      image: this.image?.src || null,
      script: this.script
    }
  }
}

export { Spawner, SpawnerOption };