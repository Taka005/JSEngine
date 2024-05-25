import { Entity, EntityOption } from "./Entity";
import { Ground, GroundOption } from "./Ground";
import { Track } from "./Track";

interface Engine extends EventTarget{
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  fps: number;
  pps: number;
  gravity: number;
  friction: number;
  entities: { [key: string]: Entity };
  grounds: { [key: string]: Ground };
  tracks: Track[];
  isStart: boolean;
  isDebug: boolean;
  isTrack: boolean;
  loop: number;
  trackLoop: number;
}

type EngineOption = {
  fps?: number;
  pps?: number;
  gravity?: number;
  friction?: number;
}

type ExportData = {
  gravity: number;
  friction: number;
  entity: Entity[];
  ground: Ground[];
}

class Engine extends EventTarget {
  constructor(canvas: HTMLCanvasElement,{ fps = 60, pps = 180, gravity = 500, friction = 0.001 }: EngineOption = {}){
    super();

    this.canvas = canvas;

    const ctx: CanvasRenderingContext2D | null = this.canvas.getContext("2d");
    if(!ctx) throw new Error("コンテキストが取得できません");

    this.ctx = ctx;

    this.fps = fps;
    this.pps = pps;
    this.gravity = gravity;
    this.friction = friction;

    this.entities = {};
    this.grounds = {};
    this.tracks = [];

    this.isStart = false;

    this.isDebug = false;
    this.isTrack = false;

    setInterval(()=>{
      this.draw();
    },1000/this.fps);
  }

  createId(length: number): string{
    const str: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id: string = "";
    for(let i = 0;i < length;i++){
      id += str.charAt(Math.floor(Math.random()*str.length));
    }

    return id;
  }

  start(): void{
    if(this.isStart) return;
    this.isStart = true;

    this.loop = setInterval(()=>{
      this.update();
    },1000/this.pps);

    this.trackLoop = setInterval(()=>{
      Object.values(this.entities).forEach(entity=>{
        this.tracks.push(new Track(entity));
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
    Object.values(this.entities).forEach(entity=>{
      this.updatePosition(entity);
      this.updateRotate(entity);
    });

    Object.values(this.entities).forEach(entity=>{
      Object.values(this.grounds).forEach(ground=>{
        this.solveGroundPosition(entity,ground);
      });

      Object.values(this.entities).forEach(target=>{
        if(entity.name === target.name) return;

        this.solvePosition(entity,target);
      });

      entity.targets.forEach(data=>{
        const target = this.get("entity",data.name);
        if(!target) return;

        this.solveConnect(entity,target,data.distance,data.stiff);
      });
    });

    Object.values(this.entities).forEach(entity=>{
      this.updateSpeed(entity);
      this.solveSpeed(entity);

      if(entity.posY > this.canvas.height+100){
        this.deSpawn("entity",entity.name);
      }

      this.dispatchEvent(new CustomEvent("update",{
        detail:{
          entity: entity
        }
      }));
    });
  }

  draw(): void{
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    if(this.isDebug){
      this.drawGrid();

      Object.values(this.entities).forEach(entity=>{
        entity.drawVector(this.ctx);
      });
    }

    Object.values(this.grounds).forEach(ground=>{
      ground.draw(this.ctx);
    });

    Object.values(this.entities).forEach(entity=>{
      entity.draw(this.ctx);
    });

    if(this.isTrack){
      Object.values(this.tracks).forEach(track=>{
        track.draw(this.ctx);
      });
    }
  }

  spawn(type: string,objects: (EntityOption | GroundOption)[]){
    objects.forEach(object=>{
      object.name = object.name || this.createId(8);

      if(type === "entity"){
        this.entities[object.name] = new Entity(object as EntityOption);
      }else if(type === "ground"){
        this.grounds[object.name] = new Ground(object as GroundOption);
      }
    });
  }

  deSpawn(type: "entity" | "ground",name: string): void{
    if(type === "entity"){
      delete this.entities[name];
    }else if(type === "ground"){
      delete this.grounds[name];
    }
  }

  get(type: "entity", name: string): Entity | undefined;
  get(type: "ground", name: string): Ground | undefined;
  get(type: "entity" | "ground",name: string): Entity | Ground | undefined{
    if(type === "entity"){
      return this.entities[name];
    }else if(type === "ground"){
      return this.grounds[name];
    }
  }

  solvePosition(source: Entity,target: Entity): void{
    const totalMass: number = source.mass + target.mass;
    if(totalMass === 0) return;

    let vecX: number = target.posX - source.posX;
    let vecY: number = target.posY - source.posY;

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

      source.posX += vecX*source.mass;
      source.posY += vecY*source.mass;

      target.posX -= vecX*target.mass;
      target.posY -= vecY*target.mass;

      this.solveRotate(source,target);
    }
  }

  solveGroundPosition(entity: Entity,ground: Ground): void{
    if(entity.mass === 0) return;

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

      const move = (distance - (entity.size + ground.size/2))/(distance*entity.mass + 0.000001)*entity.stiff;
      vecX *= move;
      vecY *= move;

      entity.posX += vecX*entity.mass;
      entity.posY += vecY*entity.mass;

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

  solveGroundRotate(entity: Entity,posX: number,posY: number){
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

  drawGrid(): void{
    this.ctx.beginPath();

    for(let posX: number = 0;posX < this.canvas.width;posX += 25){
      this.ctx.moveTo(posX,0);
      this.ctx.lineTo(posX,this.canvas.height);
    }

    for(let posY: number = 0;posY < this.canvas.height;posY += 25){
      this.ctx.moveTo(0,posY);
      this.ctx.lineTo(this.canvas.width,posY);
    }

    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 0.1;
    this.ctx.stroke();
  }

  export(): string{
    return JSON.stringify({
      gravity: this.gravity,
      friction: this.friction,
      entity: Object.values(this.entities),
      ground: Object.values(this.grounds)
    });
  }

  import(data: ExportData){
    this.gravity = data.gravity;
    this.friction = data.friction;

    this.entities = {};
    this.grounds = {};
    this.tracks = [];

    this.spawn("entity",data.entity);
    this.spawn("ground",data.ground);
  }
}