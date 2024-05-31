import { Entity, EntityOption, Target } from "./Entity";
import { createId } from "./utils";

interface EntityManager{
  entities: Entity[]
}

type GenerateOption = {
  name?: string;
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

class EntityManager{
  constructor(){
    this.entities = [];
  }

  getPosition(): { posX: number, posY: number }{
    return {
      posX: this.entities.reduce((total,entity)=>total + entity.posX,0)/this.entities.length,
      posY:  this.entities.reduce((total,entity)=>total + entity.posY,0)/this.entities.length
    }
  }

  getSpeed(): { speedX: number, speedY: number }{
    return {
      speedX: this.entities.reduce((total,entity)=>total + entity.speedX,0)/this.entities.length,
      speedY:  this.entities.reduce((total,entity)=>total + entity.speedY,0)/this.entities.length
    }
  }

  getRotate(){
    return this.entities.reduce((total,entity)=>total + entity.rotate,0)/this.entities.length
  }

  create(object: GenerateOption): Entity{
    if(!object.name){
      object.name = createId(8);
    }

    const entity = new Entity(object as EntityOption);

    this.entities.push(entity);

    return entity;
  }

  connect(): void{
    this.entities.forEach(source=>{
      this.entities.forEach(target=>{
        if(source.name === target.name) return;

        const vecX = source.posX - target.posX;
        const vecY = source.posY - target.posY;

        const distance = Math.sqrt(vecX**2 + vecY**2);

        source.addTarget({
          name: target.name,
          distance: distance,
          stiff: source.stiff
        });

        target.addTarget({
          name: source.name,
          distance: distance,
          stiff: source.stiff
        });
      });
    });
  }
}

export { EntityManager };