import { Application, Container, Graphics } from "pixi.js";
import { Entity } from "./Entity";
import { Ground, GroundOption } from "./Ground";
import { Track } from "./Track";
import { Circle, CircleOption } from "./Circle";
import { createId } from "./utils";

interface Engine extends EventTarget{
  render: Application
  pps: number;
  gravity: number;
  friction: number;
  grounds: { [key: string]: Ground };
  objects: { [key: string]: Circle };
  tracks: Track[];
  isStart: boolean;
  isDebug: boolean;
  isTrack: boolean;
  grid: Container;
  loop: number;
  trackLoop: number;
}

type EngineOption = {
  pps?: number;
  gravity?: number;
  friction?: number;
}

type ExportData = {
  gravity: number;
  friction: number;
  entity?: CircleOption[];
  circle: CircleOption[];
  ground: GroundOption[];
}

class Engine extends EventTarget {
  constructor({ pps = 90, gravity = 500, friction = 0.001 }: EngineOption = {}){
    super();

    this.render = new Application();

    this.pps = pps;
    this.gravity = gravity;
    this.friction = friction;

    this.grounds = {};
    this.objects = {};
    this.tracks = [];

    this.isStart = false;
    this.isDebug = false;
    this.isTrack = false;
  }

  get entities(): Entity[]{
    return Object.values(this.objects).map(object=>object.entities).flat();
  }

  setDebug(): void{
    if(!this.isDebug){
      this.isDebug = true;

      this.grid.visible = true;
    }else{
      this.isDebug = false;

      this.grid.visible = false;

      Object.values(this.objects).forEach(object=>{
        object.vector.visible = false;
      });
    }
  }

  async init(): Promise<void>{
    await this.render.init({
      width: 900,
      height: 700,
      backgroundColor: "#eee",
      antialias: true
    });

    this.render.ticker.add(()=>{
      this.draw();
    });

    this.setGrid();
  }

  clear({ force = false }: { force?: boolean } = {}): void{
    Object.values(this.objects).forEach(object=>{
      object.destroy();
    });

    this.objects = {};

    if(force){
      Object.values(this.grounds).forEach(ground=>{
        ground.destroy();
      });

      this.grounds = {};
    }
  }

  start(): void{
    if(this.isStart) return;
    this.isStart = true;

    this.loop = setInterval(()=>{
      this.update();
    },1000/this.pps);

    this.trackLoop = setInterval(()=>{
      Object.values(this.entities).forEach(entity=>{
        //this.tracks.push(new Track(entity));
      });
    },100);
  }

  stop(): void{
    if(!this.isStart) return;
    this.isStart = false;

    clearInterval(this.loop);
    clearInterval(this.trackLoop);
  }

  update(): void{
    this.entities.forEach(entity=>{
      this.updatePosition(entity);
      this.updateRotate(entity);
    });

    this.entities.forEach(entity=>{
      Object.values(this.grounds).forEach(ground=>{
        this.solveGroundPosition(entity,ground);
      });

      this.entities.forEach(target=>{
        if(entity.name === target.name) return;

        this.solvePosition(entity,target);
      });

      entity.targets.forEach(data=>{
        const target = this.get<Entity>("entity",data.name);
        if(!target) return;

        this.solveConnect(entity,target,data.distance,data.stiff);
      });
    });

    this.entities.forEach(entity=>{
      this.updateSpeed(entity);
      this.solveSpeed(entity);

      this.dispatchEvent(new CustomEvent("update",{
        detail:{
          entity: entity
        }
      }));
    });

    Object.values(this.objects).forEach(object=>{
      const { posY } = object.getPosition();

      if(posY > this.render.screen.height+100){
        this.deSpawn(object.type,object.name);
      }
    });
  }

  draw(): void{
    if(this.isDebug){
      Object.values(this.objects).forEach(object=>{
        if(object.vector.visible) return;
        object.vector.visible = true;
      });
    }

    Object.values(this.objects).forEach(object=>{
      object.update();
    });

    //if(this.isTrack){
      //Object.values(this.tracks).forEach(track=>{
        //track.draw(this.render);
      //});
    //}
  }

  spawn(type: string,objects: (CircleOption | GroundOption)[]): void{
    objects.forEach(object=>{
      object.name = object.name || createId(8);

      if(type === "circle"){
        const circle = new Circle(object as CircleOption);

        circle.load(this.render);

        this.objects[object.name] = circle;
      }else if(type === "ground"){
        const ground = new Ground(object as GroundOption);

        ground.load(this.render);

        this.grounds[object.name] = ground;
      }
    });
  }

  deSpawn(type: string,name: string): void{
    if(type === "circle"){
      const circle = this.get<Circle>(type,name);
      if(!circle) return;

      circle.destroy();

      delete this.objects[name];
    }else if(type === "ground"){
      const ground = this.get<Ground>(type,name);
      if(!ground) return;

      ground.destroy();

      delete this.grounds[name];
    }
  }

  get<T>(type: string,name: string): T | undefined{
    if(type === "entity"){
      return this.entities.find(entity=>entity.name === name) as T;
    }else if(type === "circle"){
      return this.objects[name] as T;
    }else if(type === "ground"){
      return this.grounds[name] as T;
    }
  }

  solvePosition(source: Entity,target: Entity): void{
    const totalMass: number = source.invMass + target.invMass;
    if(totalMass === 0) return;

    let vecX: number = target.posX - source.posX;
    let vecY: number = target.posY - source.posY;

    if(
      Math.abs(vecX) >= source.size + target.size&&
      Math.abs(vecY) >= source.size + target.size
    ) return;

    const distance: number = Math.sqrt(vecX**2 + vecY**2);
    if(distance <= source.size + target.size){
      this.dispatchEvent(new CustomEvent("hitEntity",{
        detail:{
          source: source,
          target: target
        }
      }));

      const move: number = (distance - (source.size + target.size))/(distance*totalMass + 0.000001)*source.stiff;
      vecX *= move;
      vecY *= move;

      source.posX += vecX*source.invMass;
      source.posY += vecY*source.invMass;

      target.posX -= vecX*target.invMass;
      target.posY -= vecY*target.invMass;

      this.solveRotate(source,target);
    }
  }

  solveGroundPosition(entity: Entity,ground: Ground): void{
    if(entity.invMass === 0) return;

    const { posX, posY }: { posX: number, posY: number } = ground.solvePosition(entity.posX,entity.posY);
    let vecX: number = posX - entity.posX;
    let vecY: number = posY - entity.posY;

    const distance = Math.sqrt(vecX**2 + vecY**2);
    if(distance <= entity.size + ground.size/2){
      this.dispatchEvent(new CustomEvent("hitGround",{
        detail:{
          source: entity,
          target: ground
        }
      }));

      const move: number = (distance - (entity.size + ground.size/2))/(distance*entity.invMass + 0.000001)*entity.stiff;
      vecX *= move;
      vecY *= move;

      entity.posX += vecX*entity.invMass;
      entity.posY += vecY*entity.invMass;

      this.solveGroundRotate(entity,posX,posY);
    }
  }

  solveSpeed(entity: Entity): void{
    const rate: number = this.friction*entity.size*entity.mass;

    entity.speedX -= entity.speedX*rate*(1/this.pps);
    entity.speedY -= entity.speedY*rate*(1/this.pps);

    entity.rotateSpeed -= entity.rotateSpeed*rate*(1/this.pps);

    if(Math.abs(entity.rotateSpeed) > 500){
      entity.rotateSpeed = Math.sign(entity.rotateSpeed)*500;
    }
  }

  solveRotate(source: Entity,target: Entity): void{
    const vecX: number = target.posX - source.posX;
    const vecY: number = target.posY - source.posY;

    const vecSize: number = Math.sqrt(vecX**2 + vecY**2);
    const sourceSpeed: number = Math.sqrt(source.speedX**2 + source.speedY**2);

    const angle: number = vecX*(-source.speedY) + vecY*source.speedX;

    const rotate: number = Math.acos((vecX*source.speedX + vecY*source.speedY)/(vecSize*sourceSpeed))*(180/Math.PI);

    if(angle > 0){
      source.rotateSpeed -= rotate/50;
      target.rotateSpeed += rotate/50;
    }else if(angle < 0){
      source.rotateSpeed += rotate/50;
      target.rotateSpeed -= rotate/50;
    }
  }

  solveGroundRotate(entity: Entity,posX: number,posY: number): void{
    const vecX: number = posX - entity.posX;
    const vecY: number = posY - entity.posY;

    const vecSize: number = Math.sqrt(vecX**2 + vecY**2);
    const entitySpeed: number = Math.sqrt(entity.speedX**2 + entity.speedY**2);

    const angle: number = vecX*(-entity.speedY) + vecY*entity.speedX;

    const rotate: number = Math.acos((vecX*entity.speedX + vecY*entity.speedY)/(vecSize*entitySpeed))*(180/Math.PI);

    if(angle > 0){
      entity.rotateSpeed += rotate/50;
    }else if(angle < 0){
      entity.rotateSpeed -= rotate/50;
    }
  }

  solveConnect(source: Entity,target: Entity,connectDistance: number,connectStiff: number): void{
    const totalMass: number = source.mass + target.mass;
    if(totalMass === 0) return;

    let vecX: number = target.posX - source.posX;
    let vecY: number = target.posY - source.posY;

    const distance: number = Math.sqrt(vecX**2 + vecY**2);

    const move: number = (distance - connectDistance)/(distance*totalMass + 0.000001)*connectStiff;
    vecX *= move;
    vecY *= move;

    source.posX += vecX*source.mass;
    source.posY += vecY*source.mass;

    target.posX -= vecX*target.mass;
    target.posY -= vecY*target.mass;
  }

  updateSpeed(entity: Entity): void{
    entity.speedX = (entity.posX - entity.prePosX)/(1/this.pps);
    entity.speedY = (entity.posY - entity.prePosY)/(1/this.pps);

    if(entity.mass !== 0){
      entity.speedY += this.gravity*(1/this.pps);
    }
  }

  updatePosition(entity: Entity): void{
    entity.savePosition();

    entity.posX += entity.speedX*(1/this.pps);
    entity.posY += entity.speedY*(1/this.pps);
  }

  updateRotate(entity: Entity): void{
    entity.rotate += entity.rotateSpeed*(1/this.pps);
  }

  setGrid(): void{
    this.grid = new Container();

    for(let posX: number = 0;posX < this.render.screen.width;posX += 25){
      const line = new Graphics()
        .moveTo(posX,0)
        .lineTo(posX,this.render.screen.height)
        .stroke({ width: 1, color: "black" });

      this.grid.addChild(line);
    }

    for(let posY: number = 0;posY < this.render.screen.height;posY += 25){
      const line = new Graphics()
        .moveTo(0,posY)
        .lineTo(this.render.screen.width,posY)
        .stroke({ width: 1, color: "black" });

      this.grid.addChild(line);
    }

    this.grid.visible = false;

    this.render.stage.addChild(this.grid);
  }

  export(): string{
    const circle = Object.values(this.objects)
      .filter(object=>object.type === "circle")
      .map(object=>object.toJSON());

    const grounds = Object.values(this.grounds).map(object=>object.toJSON());

    return JSON.stringify({
      gravity: this.gravity,
      friction: this.friction,
      circle: circle,
      ground: grounds
    });
  }

  import(data: ExportData): void{
    this.gravity = data.gravity;
    this.friction = data.friction;

    this.tracks = [];

    this.clear({ force: true });

    this.spawn("ground",data.ground);

    if(data.circle){
      this.spawn("circle",data.circle);
    }

    if(data.entity){
      this.spawn("circle",data.entity);
    }
  }
}

declare global {
  var Engine: any;
}

globalThis.Engine = Engine;