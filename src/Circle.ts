import { Application, Container, Sprite, Graphics } from "pixi.js";
import { EntityManager } from "./EntityManager";

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
}

class Circle extends EntityManager{
  constructor({ name, posX, posY, size, mass, stiff, speedX = 0, speedY = 0, color = "red", image = null }: CircleOption){
    super();

    this.type = "circle";

    this.name = name;
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.mass = mass;
    this.stiff = stiff;
    this.speedX = speedX;
    this.speedY = speedY;

    this.color = color;
    this.image = image;

    this.generate({
      name: this.name,
      posX: this.posX,
      posY: this.posY,
      size: this.size,
      mass: this.mass,
      stiff: this.stiff,
      speedX: this.speedX,
      speedY: this.speedY
    });
  }

  load(render: Application): void{
    this.container = new Container();

    if(this.image){
      const image = Sprite.from(this.image);

      image.anchor.set(0.5);
      image.position.set(this.posX,this.posY);

      this.container.addChild(image);
    }else{
      const circle = new Graphics()
        .circle(this.posX,this.posY,this.size)
        .fill(this.color);

      const mark = new Graphics()
        .moveTo(this.posX,this.posY)
        .lineTo(this.posX,this.posY - this.size)
        .stroke({ width: 1, color: "black" });

      const vector = new Graphics()
        .moveTo(this.posX,this.posY)
        .lineTo(this.posX + this.speedX,this.posY + this.speedY)
        .stroke({ width: 1, color: "black" });

      this.container.addChild(circle);
      this.container.addChild(mark);
    }

    //container.pivot.set(container.width/2,container.height/2);
    //container.rotation = this.rotate*(Math.PI);

    render.stage.addChild(this.container);
  }

  update(): void{
    const { posX, posY } = this.getPosition();

    this.container.position.set(posX,posY);
  }

  destroy(){
    this.container.destroy();
  }
}

export { Circle, CircleOption };