import { Application, Container, Graphics, Sprite } from "pixi.js";

interface Entity{
  name: string;
  posX: number;
  posY: number;
  prePosX: number;
  prePosY: number;
  size: number;
  mass: number;
  stiff: number;
  speedX: number;
  speedY: number;
  rotate: number;
  rotateSpeed: number;
  targets: Target[];
  color: string;
  img: Sprite | null;
}

type EntityOption = {
  name: string;
  posX: number;
  posY: number;
  size: number;
  mass: number;
  stiff: number;
  speedX?: number;
  speedY?: number;
  rotate?: number;
  rotateSpeed?: number;
  targets?: Target[];
  color?: string;
  image?: string | null;
}

type Target = {
  name: string;
  distance: number;
  stiff: number;
}

class Entity{
  constructor({ name, posX, posY, size, mass, stiff, speedX = 0, speedY = 0, rotate = 0, rotateSpeed = 0, targets = [], color = "red", image = null }: EntityOption){
    if(size < 0) throw new Error("サイズは0以上にしてください");
    if(mass < 0) throw new Error("質量は0以上にしてください");
    if(stiff < 0 || stiff > 1) throw new Error("剛性は0以上1以下にしてください");

    if(image){
      this.img = Sprite.from(image);
      this.img.anchor.set(0.5);
    }else{
      this.color = color;
    }

    this.name = name;

    this.posX = posX;
    this.posY = posY;
    this.prePosX = posX;
    this.prePosY = posY;

    this.speedX = speedX;
    this.speedY = speedY;

    this.rotate = rotate;
    this.rotateSpeed = rotateSpeed;

    this.size = size;
    this.mass = mass;
    this.stiff = stiff;

    this.targets = targets;
  }

  savePosition(): void{
    this.prePosX = this.posX;
    this.prePosY = this.posY;
  }

  draw(render: Application): void{
    const container = new Container();

    if(this.img){
      this.img.position.set(this.posX,this.posY);

      container.addChild(this.img);
    }else{
      const circle = new Graphics()
        .circle(this.posX,this.posY,this.size)
        .fill(this.color);

      const line = new Graphics()
        .moveTo(this.posX,this.posY)
        .lineTo(this.posX,this.posY - this.size);

      line.strokeStyle = "black";

      container.addChild(circle);
      container.addChild(line);
    }

    container.pivot.set(this.posX,this.posY);
    container.rotation = this.rotate*(Math.PI);

    render.stage.addChild(container);
  }

  drawVector(render: Application): void{
    const line = new Graphics()
      .moveTo(this.posX,this.posY)
      .lineTo(this.posX + this.speedX,this.posY + this.speedY);

    line.strokeStyle = "black";

    render.stage.addChild(line);
  }

  addTarget(target: Target){
    this.targets.push(target);
  }

  removeTarget(targetId: string){
    this.targets = this.targets.filter(target=>target.name !== targetId);
  }
}

export { Entity, EntityOption, Target };