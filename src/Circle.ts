import { Application, Container, Sprite, Graphics } from "pixi.js";
import { EntityManager } from "./EntityManager";
import { Entity } from "./Entity";

interface Circle extends EntityManager{
  type: string;
  name: string;
  posX: number;
  posY: number;
  size: number;
  mass: number;
  stiff: number;
  speedX: number;
  speedY: number;
  color?: string;
  image?: string | null;
  isVector: boolean;
  container: Container;
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
  entities: Entity[];
}

class Circle extends EntityManager{
  constructor({ name, posX, posY, size, mass, stiff, speedX = 0, speedY = 0, color = "red", image = null, entities = [] }: CircleOption){
    super(entities);

    this.type = "circle";
    this.name = name;
    this.size = size;
    this.mass = mass;
    this.stiff = stiff;
    this.color = color;
    this.image = image;
    this.isVector = false;

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

    this.container = new Container();

    this.container.position.set(posX,posY);

    if(this.image){
      const image = Sprite.from(this.image);

      image.anchor.set(0.5);
      image.position.set(0,0);

      this.container.addChild(image);
    }else{
      const circle = new Graphics()
        .circle(0,0,this.size)
        .fill(this.color);

      const mark = new Graphics()
        .moveTo(0,0)
        .lineTo(0,-this.size)
        .stroke({ width: 1, color: "black" });

      this.container.addChild(circle,mark);
    }

    render.stage.addChild(this.container);
  }

  setVector(){
    const vector = new Graphics()
      .moveTo(0,0)
      .lineTo(this.speedX,this.speedY)
      .stroke({ width: 1, color: "black" });
  }

  update(): void{
    const { posX, posY } = this.getPosition();
    const rotate = this.getRotate();

    this.container.rotation = rotate*(Math.PI);
    this.container.position.set(posX,posY);
  }

  destroy(){
    this.container.destroy();
  }

  toJSON(){
    const { posX, posY } = this.getPosition();
    const { speedX, speedY } = this.getSpeed();

    return {
      type: this.type,
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