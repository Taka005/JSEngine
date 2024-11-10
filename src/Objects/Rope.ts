import { Entity, EntityOption } from "./Entity";
import { EntityManager } from "./EntityManager";
import { parseImage, resize, ObjectType } from "../utils";

/**
 * @typedef {Object} RopeOption
 * @property {strint} name 物体名
 * @property {number} startX 始点X座標
 * @property {number} startY 始点Y座標
 * @property {number} endX 終点X座標
 * @property {number} endY 終点Y座標
 * @property {number} size 幅
 * @property {number} mass 質量
 * @property {number} stiff 剛性
 * @property {number} speedX X方向の速度
 * @property {number} speedY Y方向の速度
 * @property {string} color 色
 * @property {string | null} image 画像リンク
 * @property {EntityOption[]} entities 構成されているエンティティー
 * @property {string | null} script カスタムスクリプト
 */
type RopeOption = {
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  mass: number;
  stiff: number;
  speedX?: number;
  speedY?: number;
  color?: string;
  image?: string | null;
  entities: EntityOption[];
  script?: string;
}

/**
 * ロープクラス
 * ロープを制御します
 *
 * @extends EntityManager
 */
class Rope extends EntityManager{

  /**
   * 種類
   */
  public readonly type: string = ObjectType.Rope;

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
   * 厚さ
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
   * カスタムスクリプト
   */
  public script: string;

  /**
   * @param {RopeOption} ロープオプション
   */
  constructor({name, startX, startY, endX, endY, size, mass, stiff, speedX = 0, speedY = 0, color = "red", image = null, entities = [], script = "" }: RopeOption){
    super();

    this.name = name;
    this.color = color;
    this.image = parseImage(image);
    this.size = size;
    this.mass = mass;
    this.stiff = stiff;
    this.script = script;

    if(entities[0]){
      entities.forEach(entity=>this.create(entity));
    }else{
      const width: number = endX - startX;
      const height: number = endY - startY;

      const count: number = Math.floor(Math.sqrt(width*width + height*height)/(this.size*2));

      let entity: Entity | null = null;
      for(let i: number = 0;i <= count;i++){
        let posX: number = startX + i*(width/count);
        let posY: number = startY + i*(height/count);

        const target = this.create({
          posX: posX,
          posY: posY,
          size: this.size,
          mass: this.mass,
          stiff: this.stiff,
          speedX: speedX,
          speedY: speedY,
          parent: this.name
        });

        if(entity){
          entity.addTarget({
            name: target.name,
            distance: this.size*2,
            stiff: this.stiff
          });

          target.addTarget({
            name: entity.name,
            distance: this.size*2,
            stiff: this.stiff
          });
        }

        entity = target;
      }
    }
  }

  /**
   * オブジェクトを描画します
   * @param {CanvasRenderingContext2D} ctx コンテキスト
   */
  public draw(ctx: CanvasRenderingContext2D): void{
    let target: Entity | null = null;

    this.entities.forEach((entity,i,array)=>{
      if(this.image){
        const { width, height } = resize(this.image,entity.size*2);

        ctx.drawImage(
          this.image,
          entity.posX - width/2,
          entity.posY - height/2,
          width,
          height
        );
      }else{
        if(target){
          ctx.beginPath();
          ctx.moveTo(target.posX,target.posY);
          ctx.lineTo(entity.posX,entity.posY);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.size*2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(target.posX,target.posY,this.size,0,2*Math.PI);
          ctx.fillStyle = this.color;
          ctx.fill();
        }

        if(i === array.length-1){
          ctx.beginPath();
          ctx.arc(entity.posX,entity.posY,this.size,0,2*Math.PI);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }

      target = entity;
    });
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
   * @returns {Rope} 複製された物体
   */
  public clone(): Rope{
    return new Rope(this.toJSON());
  }

  /**
   * クラスのデータをJSONに変換します
   * @returns {RopeOption} ロープオプション
   */
  public toJSON(): RopeOption{
    const start = this.entities[0];
    const end = this.entities[this.entities.length - 1];
    const { speedX, speedY } = this.getSpeed();

    return {
      name: this.name,
      startX: start.posX,
      startY: start.posY,
      endX: end.posX,
      endY: end.posX,
      size: this.size,
      mass: this.mass,
      stiff: this.stiff,
      speedX: speedX,
      speedY: speedY,
      color: this.color,
      image: this.image?.src || null,
      entities: this.entities.map(entity=>entity.toJSON()),
      script: this.script
    }
  }
}

export { Rope, RopeOption };