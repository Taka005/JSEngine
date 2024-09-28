import { parseImage, resize, normalizeAngle } from "../utils";

/**
 * @typedef {Object} CurveOption
 * @property {strint} name 物体名
 * @property {number} startX 始点X座標
 * @property {number} startY 始点Y座標
 * @property {number} middleX 中点X座標
 * @property {number} middleY 中点Y座標
 * @property {number} endX 終点X座標
 * @property {number} endY 終点Y座標
 * @property {number} size 幅
 * @property {string} color 色
 * @property {string | null} 画像リンク
 */
type CurveOption = {
  name: string;
  startX: number;
  startY: number;
  middleX: number;
  middleY: number;
  endX: number;
  endY: number;
  size: number;
  color?: string;
  image?: string | null;
}

/**
 * カーブクラス
 * 曲線を制御します
 */
class Curve{

  /**
   * 種類
   */
  public readonly type: string = "curve";

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
  public image: HTMLImageElement | null;

  /**
   * 始点座標
   */
  public startX: number;
  public startY: number;

  /**
   * 中点座標
   */
  public middleX: number;
  public middleY: number;

  /**
   * 終点座標
   */
  public endX: number;
  public endY: number;

  /**
   * 厚さ
   */
  public size: number;

  /**
   * 中心座標
   */
  public centerX: number;
  public centerY: number;

  /**
   * 半径
   */
  public radius: number;

  /**
   * @param {Object} CurveOption カーブオプション
   */
  constructor({ name, startX, startY, middleX, middleY, endX, endY, size, color = "red", image = null }: CurveOption){
    this.name = name;
    this.color = color;
    this.image = parseImage(image);
    this.startX = startX;
    this.startY = startY;
    this.middleX = middleX;
    this.middleY = middleY;
    this.endX = endX;
    this.endY = endY;
    this.size = size;

    const slope1: number = (middleX - startX)/(startY - middleY);
    const slope2: number = (endX - middleX)/(middleY - endY);
    const equat1: number = (startY + middleY)/2 - slope1*((startX + middleX)/2);
    const equat2: number = (middleY + endY)/2 - slope2*((middleX + endX)/2);

    this.centerX = (equat2 - equat1)/(slope1 - slope2);
    this.centerY = slope1*this.centerX + equat1;

    this.radius = Math.sqrt((this.centerX - startX)**2 + (this.centerY - startY)**2);
  }

  /**
   * ある座標から地面への直交座標を計算します
   * @param {number} posX X座標
   * @param {number} posY Y座標
   * @returns {Object} 直行座標の位置
   */
  public solvePosition(posX: number,posY: number): { posX: number, posY: number }{

    const vecX: number = posX - this.centerX;
    const vecY: number = posY - this.centerY;

    const distance: number = Math.sqrt(vecX**2 + vecY**2);
    if(distance === 0) return {
      posX: this.startX,
      posY: this.startY
    }

    const scale: number = this.radius/distance;

    const crossX: number = this.centerX + vecX*scale;
    const crossY: number = this.centerY + vecY*scale;

    const startAngle: number = normalizeAngle(Math.atan2(this.startY - this.centerY,this.startX - this.centerX));
    const midAngle: number = normalizeAngle(Math.atan2(this.middleY - this.centerY,this.middleX - this.centerX));
    const endAngle: number = normalizeAngle(Math.atan2(this.endY - this.centerY,this.endX - this.centerX));
    const crossAngle: number = normalizeAngle(Math.atan2(crossY - this.centerY,crossX - this.centerX));

    const clockwise: boolean = (startAngle > endAngle) ? (midAngle > startAngle || midAngle < endAngle) : (midAngle > startAngle && midAngle < endAngle);

    const isWithinArc = (startAngle < endAngle)
      ? (crossAngle >= startAngle && crossAngle <= endAngle)
      : (crossAngle >= startAngle || crossAngle <= endAngle);

    //if(crossAngle < Math.min(startAngle,endAngle)||crossAngle > Math.max(startAngle,endAngle)){
    if(!isWithinArc){
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

    return {
      posX: crossX,
      posY: crossY
    }
  }

  /**
   * オブジェクトを描画
   * @param {CanvasRenderingContext2D} ctx コンテキスト
   */
  public draw(ctx: CanvasRenderingContext2D): void{
    if(this.image){
      const distance: number = Math.sqrt((this.startX - this.endX)**2 + (this.startY - this.endY)**2);
      const rotate: number = Math.atan2(this.endY - this.startY,this.endX - this.startX);

      const posX: number = (this.startX + this.middleX + this.endX)/3;
      const posY: number = (this.startY + this.middleX + this.endY)/3;

      const { width, height } = resize(this.image,distance);

      ctx.save();
      ctx.translate(posX,posY);
      ctx.rotate(rotate);

      ctx.drawImage(
        this.image,
        -width/2,
        -height/2,
        width,
        height
      );

      ctx.restore();
    }else{
      const startAngle: number = normalizeAngle(Math.atan2(this.startY - this.centerY,this.startX - this.centerX));
      const endAngle: number = normalizeAngle(Math.atan2(this.endY - this.centerY,this.endX - this.centerX));
      const midAngle: number = normalizeAngle(Math.atan2(this.middleY - this.centerY,this.middleX - this.centerX));
      const clockwise: boolean = (startAngle > endAngle) ? (midAngle > startAngle || midAngle < endAngle) : (midAngle > startAngle && midAngle < endAngle);
  
      ctx.beginPath();
      ctx.arc(this.centerX,this.centerY,this.radius,startAngle,endAngle,!clockwise);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(this.startX,this.startY,this.size/2,0,2*Math.PI);
      ctx.fillStyle = this.color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.endX,this.endY,this.size/2,0,2*Math.PI);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  /**
   * 物体を複製します
   * @returns {Curve} 複製された物体
   */
  public clone(): Curve{
    return new Curve(this.toJSON());
  }

  /**
   * クラスのデータをJSONに変換します
   * @returns {CurveOption} グラウンドオプション
   */
  public toJSON(): CurveOption{
    return {
      name: this.name,
      startX: this.startX,
      startY: this.startY,
      middleX: this.middleX,
      middleY: this.middleY,
      endX: this.endX,
      endY: this.endY,
      size: this.size,
      color: this.color,
      image: this.image?.src || null
    }
  }
}

export { Curve, CurveOption };