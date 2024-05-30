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
}

type Target = {
  name: string;
  distance: number;
  stiff: number;
}

class Entity{
  constructor({ name, posX, posY, size, mass, stiff, speedX = 0, speedY = 0, rotate = 0, rotateSpeed = 0, targets = [] }: EntityOption){
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

  addTarget(target: Target){
    this.targets.push(target);
  }

  removeTarget(targetId: string){
    this.targets = this.targets.filter(target=>target.name !== targetId);
  }

  toJSON(): EntityOption{
    return {
      name: this.name,
      posX: this.posX,
      posY: this.posY,
      size: this.size,
      mass: this.mass,
      stiff: this.stiff,
      speedX: this.speedX,
      speedY: this.speedY,
      rotate: this.rotate,
      rotateSpeed: this.rotateSpeed,
      targets: this.targets
    }
  }
}

export { Entity, EntityOption, Target };