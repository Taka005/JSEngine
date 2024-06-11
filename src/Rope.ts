import { Entity, EntityOption } from "./Entity";
import { EntityManager } from "./EntityManager";
import { resize } from "./utils";

interface Rope extends EntityManager{
  type: string;
  name: string;
  size: number;
  mass: number;
  stiff: number;
  color: string;
  image: HTMLImageElement | null;
}

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
}

/**
 * ロープクラス
 * ロープを制御します
 *
 * @extends EntityManager
 */
class Rope extends EntityManager{
  /**
   * @param {RopeOption} ロープオプション
   */
  constructor({name, startX, startY, endX, endY, size, mass, stiff, speedX = 0, speedY = 0, color = "red", image = null, entities = []}: RopeOption){
    super();

    this.type = "rope";
    this.name = name;
    this.color = color;

    this.size = size;
    this.mass = mass;
    this.stiff = stiff;

    if(image){
      this.image = new Image();
      this.image.src = image;
    }

    if(entities[0]){
      entities.map(entity=>this.create(entity));
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
          speedY: speedY
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
    this.entities.forEach(entity=>{
      if(this.image){
        const { width, height } = resize(this.image,entity.size*2);

        ctx.drawImage(
          this.image,
          entity.posX - width/2,
          entity.posX - height/2,
          width,
          height
        );
      }else{
        ctx.beginPath();
        ctx.arc(entity.posX,entity.posY,this.size,0,2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
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
      entities: this.entities.map(entity=>entity.toJSON())
    }
  }
}

export { Rope, RopeOption };