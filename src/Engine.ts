import { Entity } from "./Entity";
import { Ground, GroundOption } from "./Ground";
import { Circle, CircleOption } from "./Circle";
import { Square, SquareOption } from "./Square";
import { createId } from "./utils";

interface Engine extends EventTarget{
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D
  pps: number;
  gravity: number;
  friction: number;
  grounds: { [key: string]: Ground };
  objects: { [key: string]: Circle | Square };
  tracks: (Circle | Square)[];
  isStart: boolean;
  isDebug: boolean;
  isTrack: boolean;
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
  square: SquareOption[];
  ground: GroundOption[];
}

class Engine extends EventTarget {
  constructor(canvas: HTMLCanvasElement,{ pps = 90, gravity = 500, friction = 0.001 }: EngineOption = {}){
    super();

    this.canvas = canvas;
    const ctx = this.canvas.getContext("2d");
    if(!ctx) throw new Error("無効な描画要素です");

    this.ctx = ctx;

    this.pps = pps;
    this.gravity = gravity;
    this.friction = friction;

    this.grounds = {};
    this.objects = {};
    this.tracks = [];

    this.isStart = false;
    this.isDebug = false;
    this.isTrack = false;

    this.draw();
  }

  get entities(): Entity[]{
    return Object.values(this.objects).map(object=>object.entities).flat();
  }

  clear({ force = false }: { force?: boolean } = {}): void{
    this.objects = {};

    if(force){
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
      Object.values(this.objects).forEach(object=>{
        this.tracks.push(object.clone());
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

      if(posY > this.canvas.height+100){
        this.deSpawn(object.type,object.name);
      }
    });
  }

  draw(): void{
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    if(this.isDebug){
      Object.values(this.objects).forEach(object=>{
        object.drawVector(this.ctx);
      });

      this.drawGrid();
    }

    Object.values(this.grounds).forEach(ground=>{
      ground.draw(this.ctx);
    });

    Object.values(this.objects).forEach(object=>{
      object.draw(this.ctx);
    });

    if(this.isTrack){
      this.ctx.globalAlpha = 0.5;

      Object.values(this.tracks).forEach(track=>{
        track.draw(this.ctx);
      });

      this.ctx.globalAlpha = 1;
    }

    requestAnimationFrame(()=>this.draw());
  }

  spawn(type: string,objects: (CircleOption | GroundOption | SquareOption)[]): void{
    objects.forEach(object=>{
      object.name = object.name || createId(8);

      if(type === "circle"){
        const circle = new Circle(object as CircleOption);

        this.objects[object.name] = circle;
      }else if(type === "square"){
        const square = new Square(object as SquareOption);

        this.objects[object.name] = square;
      }else if(type === "ground"){
        const ground = new Ground(object as GroundOption);

        this.grounds[object.name] = ground;
      }
    });
  }

  deSpawn(type: string,name: string): void{
    if(type === "circle"){
      const circle = this.get<Circle>(type,name);
      if(!circle) return;

      delete this.objects[name];
    }else if(type === "square"){
        const square = this.get<Square>(type,name);
        if(!square) return;
  
        delete this.objects[name];
    }else if(type === "ground"){
      const ground = this.get<Ground>(type,name);
      if(!ground) return;

      delete this.grounds[name];
    }
  }

  get<T>(type: string,name: string): T | undefined{
    if(type === "entity"){
      return this.entities.find(entity=>entity.name === name) as T;
    }else if(type === "ground"){
      return this.grounds[name] as T;
    }else{
      return this.objects[name] as T;
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

    if(
      Math.abs(vecX) >= entity.size + Math.abs(ground.startX - ground.endX) + ground.size&&
      Math.abs(vecY) >= entity.size + Math.abs(ground.startY - ground.endY) + ground.size
    ) return;

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

  checkPosition(posX: number,posY: number): (Circle | Square | Ground)[]{
    const targets: (Circle | Square | Ground)[] = [];

    Object.values(this.objects).forEach(object=>{
      const entities: Entity[] = object.entities.filter(entity=>{
        const vecX: number = entity.posX - posX;
        const vecY: number = entity.posY - posY;
    
        const distance: number = Math.sqrt(vecX**2 + vecY**2);

        return distance <= entity.size;
      });

      if(!entities.length) return;

      targets.push(object);
    });

    Object.values(this.grounds).forEach(ground=>{
      const data: { posX: number, posY: number } = ground.solvePosition(posX,posY);

      const vecX: number = data.posX - posX;
      const vecY: number = data.posY - posY;
  
      const distance = Math.sqrt(vecX**2 + vecY**2);

      if(distance > ground.size/2) return;

      targets.push(ground);
    });

    return targets;
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
    const circle = Object.values(this.objects)
      .filter(object=>object.type === "circle")
      .map(object=>object.toJSON());

    const square = Object.values(this.objects)
      .filter(object=>object.type === "square")
      .map(object=>object.toJSON());

    const grounds = Object.values(this.grounds).map(object=>object.toJSON());

    return JSON.stringify({
      gravity: this.gravity,
      friction: this.friction,
      circle: circle,
      square: square,
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

    if(data.square){
      this.spawn("square",data.square);
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