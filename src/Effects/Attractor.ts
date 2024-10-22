import { Entity } from "../Objects/Entity";
import { EffectType, parseImage, resize } from "../utils";

/**
 * @typedef {Object} AttractorOption
 * @property {strint} name 物体名
 * @property {number} startX X座標
 * @property {number} startY Y座標
 * @property {number} speed 設定する速度
 * @property {number} size 影響半径
 * @property {string} color 色
 * @property {string | null} 画像リンク
 */
type AttractorOption = {
  name: string;
  posX: number;
  posY: number;
  speed: number;
  size: number;
  color?: string;
  image?: string | null;
}

/**
 * アトラクタークラス
 * 重力を制御
 */
class Attractor{

  /**
   * 種類
   */
  public readonly type = EffectType.Attractor;

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
   * 設置座標
   */
  public posX: number;
  public posY: number;

  /**
   * 設定する速度
   */
  public speed: number;

  /**
   * 影響半径
   */
  public size: number;

  /**
   * @param {Object} AttractorOption グラウンドオプション
   */
  constructor({ name, posX, posY, speed, size, color = "red", image = null }: AttractorOption){
    this.name = name;
    this.color = color;
    this.image = parseImage(image);
    this.posX = posX;
    this.posY = posY;
    this.speed = speed;
    this.size = size;
  }

  /**
   * 物体に効果を与えます
   * @param entity 対象のエンティティー
   */
  public setEffect(entity: Entity): void{
    const vecX: number = entity.posX - this.posX;
    const vecY: number = entity.posY - this.posY;

    //if(
      //Math.abs(vecX) >= entity.size + this.size||
      //Math.abs(vecY) >= entity.size + this.size
    //) return;

    const distance: number = Math.sqrt(vecX**2 + vecY**2);
    if(distance === 0) return;

    const speed = this.speed/(distance**2);

    if(distance <= this.size + entity.size){
      entity.speedX += (vecX/distance)*speed;
      entity.speedY += (vecY/distance)*speed;
    }
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
   * @returns {AttractorOption} サークルオプション
   */
  public toJSON(): AttractorOption{
    return {
      name: this.name,
      posX: this.posX,
      posY: this.posY,
      speed: this.speed,
      size: this.size,
      color: this.color,
      image: this.image?.src || null
    }
  }
}

export { Attractor, AttractorOption };