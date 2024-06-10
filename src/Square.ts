import { EntityManager } from "./EntityManager";
import { EntityOption } from "./Entity";

/**
 * @typedef {Object} Square
 * @property {string} type 物体の種類
 * @property {strint} name 物体名
 * @property {number} size 半径
 * @property {number} mass 質量
 * @property {number} stiff 剛性(これは0以上1以下です)
 * @property {string} color 色
 * @property {HTMLImageElement | null} image 画像
 */
interface Square extends EntityManager{
  type: string;
  name: string;
  size: number;
  mass: number;
  stiff: number;
  color: string;
  image: HTMLImageElement | null;
}

/**
 * @typedef {Object} SquareOption
 * @property {strint} name 物体名
 * @property {number} posX X座標
 * @property {number} posY Y座標
 * @property {number} size 半径
 * @property {number} mass 質量
 * @property {number} stiff 剛性(これは0以上1以下です)
 * @property {number} speedX X方向の速度
 * @property {number} speedY Y方向の速度
 * @property {string} color 色
 * @property {string | null} image 画像
 * @property {EntityOption[]} 構成されているエンティティーの初期化オプション
 */
type SquareOption = {
  name: string;
  posX: number;
  posY: number;
  size: number;
  mass: number;
  stiff: number;
  speedX?: number;
  speedY?: number;
  color?: string;
  image?: string | null;
  entities: EntityOption[];
}

/**
 * スクエアクラス
 * 四角を制御します
 */
class Square extends EntityManager{
  /**
   * @param {SquareOption} スクエアオプション
   */
  constructor({ name, posX, posY, size, mass, stiff, speedX = 0, speedY = 0, color = "red", image = null, entities = [] }: SquareOption){
    super();

    this.type = "square";
    this.name = name;
    this.size = size;
    this.mass = mass;
    this.stiff = stiff;
    this.color = color;

    if(image){
      this.image = new Image();
      this.image.src = image;
    }

    if(entities[0]){
      entities.map(entity=>this.create(entity));
    }else{
      for(let i = -1;i<=1;i+=2){
        for(let k = -1;k<=1;k+=2){
          this.create({
            posX: posX + i*(size/2),
            posY: posY + k*(size/2),
            size: size/2,
            mass: mass/4,
            stiff: stiff,
            speedX: speedX,
            speedY: speedY
          });
        }
      }

      this.connect();
    }
  }

  /**
   * オブジェクトを描画します
   * @param {CanvasRenderingContext2D} ctx コンテキスト
   */
  public draw(ctx: CanvasRenderingContext2D): void{
    const { posX, posY } = this.getPosition();

    if(this.image){
      let width: number = 0;
      let height: number = 0;
      const rate: number = this.image.height/this.image.width;

      if(this.image.width > this.image.height){
        width = this.size*2;
        height = this.size*2*rate;
      }else{
        width = this.size*2*rate;
        height = this.size*2;
      }

      ctx.drawImage(
        this.image,
        posX - width/2,
        posY - height/2,
        width,
        height
      );
    }else{
      this.entities.forEach(entity=>{
        ctx.beginPath();
        ctx.arc(entity.posX,entity.posY,this.size/2,0,2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
      });
    }
  }

  /**
   * 速度ベクトルを描画します
   * @param {CanvasRenderingContext2D} ctx コンテキスト
   */
  public drawVector(ctx: CanvasRenderingContext2D): void{
    const { posX, posY } = this.getPosition();
    const { speedX, speedY } = this.getSpeed();

    ctx.beginPath();
    ctx.moveTo(posX,posY);
    ctx.lineTo(posX + speedX,posY + speedY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /**
   * 物体を複製します
   * @returns {Square} 複製された物体
   */
  public clone(): Square{
    return new Square(this.toJSON());
  }

  /**
   * クラスのデータをJSONに変換します
   * @returns {SquareOption} スクエアオプション
   */
  public toJSON(): SquareOption{
    const { posX, posY } = this.getPosition();
    const { speedX, speedY } = this.getSpeed();

    return {
      name: this.name,
      posX: posX,
      posY: posY,
      size: this.size,
      mass: this.mass,
      stiff: this.stiff,
      speedX: speedX,
      speedY: speedY,
      color: this.color,
      image: this.image?.src || null,
      entities: this.entities.map(entity=>entity.toJSON())
    }
  }
}

export { Square, SquareOption };