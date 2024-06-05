import { Application, Container, Sprite, Graphics } from "pixi.js";
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
 * @property {string | null} image 画像
 * @property {Graphics} vector ベクトルの描画グラフィッククラス
 * @property {Container} view 描画コンテナクラス
 */
interface Square extends EntityManager{
  type: string;
  name: string;
  size: number;
  mass: number;
  stiff: number;
  color?: string;
  image?: string | null;
  vector: Graphics;
  view: Container;
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
    this.image = image;

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
   * 描画を初期化します
   * @param {Application} render アプリケーションクラス
   */
  load(render: Application): void{
    const { posX, posY } = this.getPosition();
    const { speedX, speedY } = this.getSpeed();

    this.view = new Container();
  
    this.vector = new Graphics()
      .moveTo(0,0)
      .lineTo(speedX,speedY)
      .stroke({ width: 1, color: "black" });

    this.vector.visible = false;

    this.vector.position.set(posX,posY);

    if(this.image){
      const image = Sprite.from(this.image);

      image.anchor.set(0.5);
      image.position.set(0,0);

      this.view.addChild(image);
    }else{
      this.entities.forEach(entity=>{
        const circle = new Graphics()
          .circle(entity.posX,entity.posY,entity.size)
          .fill(this.color);

        this.view.addChild(circle);
      });
    }

    render.stage.addChild(this.view,this.vector);
  }

  /**
   * 描画を更新します
   */
  update(): void{
    const { posX, posY } = this.getPosition();
    const { speedX, speedY } = this.getSpeed();

    this.view.removeChildren(0);

    if(this.image){
      const image = Sprite.from(this.image);

      image.anchor.set(0.5);
      image.position.set(0,0);

      this.view.addChild(image);
    }else{
      this.entities.forEach(entity=>{
        const circle = new Graphics()
          .circle(entity.posX,entity.posY,entity.size)
          .fill(this.color);

        this.view.addChild(circle);
      });
    }

    this.vector.position.set(posX,posY);

    this.vector
      .clear()
      .moveTo(0,0)
      .lineTo(speedX,speedY)
      .stroke({ width: 1, color: "black" });
  }

  /**
   * 描画を破棄します
   */
  destroy(): void{
    this.view.destroy();
    this.vector.destroy();
  }


  /**
   * クラスのデータをJSONに変換します
   * @returns {SquareOption} スクエアオプション
   */
  toJSON(): SquareOption{
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
      image: this.image,
      entities: this.entities.map(entity=>entity.toJSON())
    }
  }
}

export { Square, SquareOption };