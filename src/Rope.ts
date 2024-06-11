import { EntityOption } from "./Entity";
import { EntityManager } from "./EntityManager";
import { resize } from "./utils";

interface Rope extends EntityManager{
  type: string;
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
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
  entities: EntityOption;
}

class Rope extends EntityManager{
  constructor(name, startX, startY, endX, endY, size, mass, stiff, speedX = 0, speedY = 0, color = "red", image = null, entities = []): RopeOption{
    super();

    this.type = "rope";
    this.name = name;
    this.color = color;

    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;

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
      const width: number = this.startX - this.endX;
      const height: number = this.endX - this.endY;

      const count: number = Math.sqrt(width*width + height*height)/this.size;
      for(let i: number = 0;i < count;i++){
        let posX: number = startX + i*(width/count);
        let posY: number = startY + i*(height/count);

        this.create({
          posX: posX,
          posY: posY,
          size: this.size,
          mass: this.mass,
          stiff: this.stiff,
          speedX: speedX,
          speedY: speedY
        });
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
        ctx.arc(entity.posX,entity.posY,this.size/2,0,2*Math.PI);
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
   * @returns {Square} 複製された物体
   */
  public clone(): Square{
    return new Square(this.toJSON());
  }

  /**
   * クラスのデータをJSONに変換します
   * @returns {SquareOption} スクエアオプション
   */
  public toJSON(): RopeOption{
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

export { Rope, RopeOption };