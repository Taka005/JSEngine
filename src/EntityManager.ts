import { Entity, EntityOption } from "./Entity"

interface EntityManager{
  entities: Entity[]
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

  generate(object: EntityOption): Entity{
    const entity = new Entity(object);

    this.entities.push(entity);

    return entity;
  }
}

export { EntityManager };