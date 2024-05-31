import { Application, Container, Sprite, Graphics } from "pixi.js";
import { EntityManager } from "./EntityManager";
import { EntityOption } from "./Entity";

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

class Square extends EntityManager{
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

  load(render: Application): void{
    const { posX, posY } = this.getPosition();
    const { speedX, speedY } = this.getSpeed();

    this.view = new Container();
  
    this.vector = new Graphics()
      .moveTo(0,0)
      .lineTo(speedX,speedY)
      .stroke({ width: 1, color: "black" });

    this.vector.visible = false;

    this.view.position.set(posX,posY);
    this.vector.position.set(posX,posY);

    if(this.image){
      const image = Sprite.from(this.image);

      image.anchor.set(0.5);
      image.position.set(0,0);

      this.view.addChild(image);
    }else{
      for(let i = -1;i<=1;i+=2){
        for(let k = -1;k<=1;k+=2){
          const circle = new Graphics()
            .circle(i*(this.size/2),k*(this.size/2),this.size)
            .fill(this.color);

          this.view.addChild(circle);
        }
      }
    }

    render.stage.addChild(this.view,this.vector);
  }

  update(): void{
    const { posX, posY } = this.getPosition();
    const { speedX, speedY } = this.getSpeed();

    this.view.position.set(posX,posY);
    this.vector.position.set(posX,posY);

    this.vector
      .clear()
      .moveTo(0,0)
      .lineTo(speedX,speedY)
      .stroke({ width: 1, color: "black" });
  }

  destroy(): void{
    this.view.destroy();
    this.vector.destroy();
  }

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