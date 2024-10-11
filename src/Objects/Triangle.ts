import { EntityManager } from "./EntityManager";
import { Entity, EntityOption } from "./Entity";
import { parseImage, resize, ObjectType } from "../utils";

/**
 * @typedef {Object} TriangleOption
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
type TriangleOption = {
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
 * トライアングルクラス
 * 三角を制御します
 *
 * @extends EntityManager
 */
class Triangle extends EntityManager{

  /**
   * 種類
   */
  public readonly type: string = ObjectType.Triangle;

  /**
   * 名前
   */
  public readonly name: string;

  /**
   * 幅
   */
  public size: number;

  /**
   * 質量
   */
  public mass: number;

  /**
   * 剛性
   */
  public stiff: number;

  /**
   * 色
   */
  public color: string;

  /**
   * 画像
   */
  public image: HTMLImageElement | null;

  /**
   * @param {TriangleOption} トライアングルオプション
   */
  constructor({ name, posX, posY, size, mass, stiff, speedX = 0, speedY = 0, color = "red", image = null, entities = [] }: TriangleOption){
    super();

    this.name = name;
    this.size = size;
    this.mass = mass;
    this.stiff = stiff;
    this.color = color;
    this.image = parseImage(image);

    if(entities[0]){
      entities.forEach(entity=>this.create(entity));
    }else{
      this.create({
        posX: posX,
        posY: posY - (2/Math.sqrt(3))*(this.size/2),
        size: this.size/2,
        mass: this.mass/3,
        stiff: this.stiff,
        speedX: speedX,
        speedY: speedY,
        parent: this.name
      });

      for(let i = -1;i<=1;i+=2){
        this.create({
          posX: posX + i*(this.size/2),
          posY: posY + (1/Math.sqrt(3))*(this.size/2),
          size: this.size/2,
          mass: this.mass/3,
          stiff: this.stiff,
          speedX: speedX,
          speedY: speedY,
          parent: this.name
        });
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
      const start: Entity = this.entities[1];
      const end: Entity = this.entities[2];

      const rotate: number = Math.atan2(start.posY - end.posY,end.posX - start.posX);

      const { width, height } = resize(this.image,this.size*2);

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
      this.entities.forEach(source=>{
        ctx.beginPath();
        ctx.arc(source.posX,source.posY,this.size/2,0,2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();

        this.entities.forEach(target=>{
          if(source.name === target.name) return;

          ctx.beginPath();
          ctx.moveTo(source.posX,source.posY);
          ctx.lineTo(target.posX,target.posY);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.size;
          ctx.stroke();
        });
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
  public clone(): Triangle{
    return new Triangle(this.toJSON());
  }

  /**
   * クラスのデータをJSONに変換します
   * @returns {TriangleOption} トライアングルオプション
   */
  public toJSON(): TriangleOption{
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

export { Triangle, TriangleOption };