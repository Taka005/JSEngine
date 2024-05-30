import { Application, Container, Sprite, Graphics } from "pixi.js";
import { EntityManager } from "./EntityManager";
import { EntityOption } from "./Entity";

interface Circle extends EntityManager{
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

type CircleOption = {
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

class Circle extends EntityManager{
  constructor({ name, posX, posY, size, mass, stiff, speedX = 0, speedY = 0, color = "red", image = null, entities = [] }: CircleOption){
    super();

    entities.map(entity=>this.generate(entity));

    this.type = "circle";
    this.name = name;
    this.size = size;
    this.mass = mass;
    this.stiff = stiff;
    this.color = color;
    this.image = image;

    this.generate({
      posX: posX,
      posY: posY,
      size: size,
      mass: mass,
      stiff: stiff,
      speedX: speedX,
      speedY: speedY
    });
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
      const circle = new Graphics()
        .circle(0,0,this.size)
        .fill(this.color);

      const mark = new Graphics()
        .moveTo(0,0)
        .lineTo(0,-this.size)
        .stroke({ width: 1, color: "black" });

      this.view.addChild(circle,mark);
    }

    render.stage.addChild(this.view,this.vector);
  }

  update(): void{
    const { posX, posY } = this.getPosition();
    const { speedX, speedY } = this.getSpeed();
    const rotate = this.getRotate();

    this.view.rotation = rotate*(Math.PI/180);
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

  toJSON(): CircleOption{
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

export { Circle, CircleOption };