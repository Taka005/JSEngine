import { resize } from "./utils";

/**
 * @typedef {Object} Ground
 * @property {string} type 物体の種類
 * @property {strint} name 物体名
 * @property {number} startX 始点X座標
 * @property {number} startY 始点Y座標
 * @property {number} endX 終点X座標
 * @property {number} endY 終点Y座標
 * @property {number} size 幅
 * @property {string} color 色
 * @property {HTMLImageElement | null} image 画像
 */
interface Ground{
  type: string;
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  color: string;
  image: HTMLImageElement | null;
}

/**
 * @typedef {Object} GroundOption
 * @property {strint} name 物体名
 * @property {number} startX 始点X座標
 * @property {number} startY 始点Y座標
 * @property {number} endX 終点X座標
 * @property {number} endY 終点Y座標
 * @property {number} size 幅
 * @property {string} color 色
 * @property {string | null} 画像リンク
 */
type GroundOption = {
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  color?: string;
  image?: string | null;
}

/**
 * グラウンドクラス
 * 地面を制御します
 */
class Ground{
  /**
   * @param {Object} GroundOption グラウンドオプション
   */
  constructor({ name, startX, startY, endX, endY, size, color = "red", image = null }: GroundOption){
    this.type = "ground";
    this.name = name;
    this.color = color;

    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;

    this.size = size;

    if(image){
      this.image = new Image();
      this.image.src = image;
    }
  }

  /**
   * ある座標から地面への直交座標を計算します
   * @param {number} posX X座標
   * @param {number} posY Y座標
   * @returns {Object} 直行座標の位置
   */
  public solvePosition(posX: number,posY: number): { posX: number, posY: number }{
    const t: number = Math.max(0,Math.min(1,((posX - this.startX)*(this.endX - this.startX) + (posY - this.startY)*(this.endY - this.startY))/Math.sqrt((this.startX - this.endX)**2 + (this.startY - this.endY)**2)**2));
    const crossX: number = this.startX + t*(this.endX - this.startX);
    const crossY: number = this.startY + t*(this.endY - this.startY);

    if(t > 0 && t < 1){
      return {
        posX: crossX,
        posY: crossY
      }
    }else{
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
  }

  /**
   * オブジェクトを描画
   * @param {CanvasRenderingContext2D} ctx コンテキスト
   */
  public draw(ctx: CanvasRenderingContext2D): void{
    if(this.image){
      const posX = (this.startX + this.endX)/2;
      const posY = (this.startY + this.endY)/2;

      const { width, height } = resize(this.image,this.size*2);

      ctx.drawImage(
        this.image,
        posX - width/2,
        posY - height/2
      );
    }else{
      ctx.beginPath();
      ctx.moveTo(this.startX,this.startY);
      ctx.lineTo(this.endX,this.endY);
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
   * @returns {Ground} 複製された物体
   */
  public clone(): Ground{
    return new Ground(this.toJSON());
  }

  /**
   * クラスのデータをJSONに変換します
   * @returns {GroundOption} グラウンドオプション
   */
  public toJSON(): GroundOption{
    return {
      name: this.name,
      startX: this.startX,
      startY: this.startY,
      endX: this.endX,
      endY: this.endY,
      size: this.size,
      color: this.color
    }
  }
}

export { Ground, GroundOption };