import { Engine } from "../Engine";
import { Entity } from "../Objects/Entity";
import { EffectType, parseImage, resize } from "../utils";

/**
 * @typedef {Object} BoosterOption
 * @property {strint} name 物体名
 * @property {number} startX 始点X座標
 * @property {number} startY 始点Y座標
 * @property {number} endX 終点X座標
 * @property {number} endY 終点Y座標
 * @property {number} speedX 設定するX速度
 * @property {number} speedY 設定するX速度
 * @property {string} color 色
 * @property {string | null} image 画像リンク
 * @property {string} script カスタムスクリプト
 */
type BoosterOption = {
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speedX: number;
  speedY: number;
  color?: string;
  image?: string | null;
  script?: string;
}

/**
 * ブースタークラス
 * ブースターを制御
 */
class Booster{

  /**
   * 種類
   */
  public readonly type = EffectType.Booster;

  /**
   * 名前
   */
  public readonly name: string;

  /**
   * 色
   */
  public color: string;

  /**
   * 画像
   */
  public image: HTMLImageElement | null

  /**
   * 始点
   */
  public startX: number;
  public startY: number;

  /**
   * 終点
   */
  public endX: number;
  public endY: number;

  /**
   * 設定する速度
   */
  public speedX: number;
  public speedY: number;

  /**
   * カスタムスクリプト
   */
  public script: string;

  /**
   * @param {Object} BoosterOption グラウンドオプション
   */
  constructor({ name, startX, startY, endX, endY, speedX, speedY, color = "red", image = null, script = "" }: BoosterOption){
    this.name = name;
    this.color = color;
    this.image = parseImage(image);
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.speedX = speedX;
    this.speedY = speedY;
    this.script = script;
  }

  /**
   * 物体に効果を与えます
   * @param entity 対象のエンティティー
   */
  public setEffect(entity: Entity): void{
    if(entity.mass === 0) return;

    let vecX: number = entity.posX - (this.startX + this.endX)/2;
    let vecY: number = entity.posY - (this.startY + this.endY)/2;

    if(
      Math.abs(vecX) >= Math.abs(this.startX - this.endX)/2 + entity.size||
      Math.abs(vecY) >= Math.abs(this.startY - this.endY)/2 + entity.size
    ) return;

    entity.speedX += this.speedX;
    entity.speedY += this.speedY;
  }

  public setUpdate(engine: Engine): void{}

  /**
   * オブジェクトを描画
   * @param {CanvasRenderingContext2D} ctx コンテキスト
   */
  public draw(ctx: CanvasRenderingContext2D): void{
    if(this.image){
      const posX: number = (this.startX + this.endX)/2;
      const posY: number = (this.startY + this.endY)/2;

      const { width, height } = resize(this.image,Math.abs(this.startX - this.endX));

      ctx.save();
      ctx.translate(posX,posY);

      ctx.drawImage(
        this.image,
        -width/2,
        -height/2,
        width,
        height
      );

      ctx.restore();
    }else{
      const sizeX: number = this.endX - this.startX;
      const sizeY: number = this.endY - this.startY;

      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(this.startX,this.startY,sizeX,sizeY);    
    }
  }

  /**
   * クラスのデータをJSONに変換します
   * @returns {BoosterOption} サークルオプション
   */
  public toJSON(): BoosterOption{
    return {
      name: this.name,
      startX: this.startX,
      startY: this.startY,
      endX: this.endX,
      endY: this.endY,
      speedX: this.speedX,
      speedY: this.speedY,
      color: this.color,
      image: this.image?.src || null,
      script: this.script
    }
  }
}

export { Booster, BoosterOption };