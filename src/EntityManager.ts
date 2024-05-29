import { Entity, EntityOption } from "./Entity";
import { createId } from "./utils";

interface EntityManager{
  entities: Entity[]
}

class EntityManager{
  constructor(entities: Entity[] = []){
    this.entities = entities;
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

  generate(object: EntityOption): Entity{
    const entity = new Entity(createId(8),object);

    this.entities.push(entity);

    return entity;
  }
}

export { EntityManager };