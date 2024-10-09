import { Process } from "./Process";
import { Entity } from "./Objects/Entity";
import { Ground, GroundOption } from "./Objects/Ground";
import { Curve, CurveOption } from "./Objects/Curve";
import { Circle, CircleOption } from "./Objects/Circle";
import { Square, SquareOption } from "./Objects/Square";
import { Rope, RopeOption } from "./Objects/Rope";
import { createId, resize, ObjectType, Event } from "./utils";
import { Key } from "./Key";

/**
 * エンジンの初期化オブジェクト
 * @typedef {Object} EngineOption
 * @property {number} pps 1秒あたりの処理回数
 * @property {number} gravity 重力加速度
 * @property {number} friction 摩擦係数
 * @property {number} posX 描画X座標
 * @property {number} posY 描画Y座標
 * @property {number} scale 描画倍率
 * @property {number} mapSize 物体の存在範囲
 * @property {string} backgroundColor 背景色
 * @property {string | null} backgroundImage 背景画像URL
 * @property {number} trackInterval 履歴の保存間隔(ミリ秒)
 */
type EngineOption = {
  pps?: number;
  gravity?: number;
  friction?: number;
  posX?: number;
  posY?: number;
  scale?: number;
  mapSize?: number;
  backgroundColor?: string;
  backgroundImage?: string | null;
  trackInterval?: number;
}

/**
 * 削除オプション
 * @typedef {Object} ClearOption
 * @property {boolean} force 全て削除するかどうか
 */
type ClearOption = {
  force?: boolean
}

/**
 * エンジンのエクスポートデータ
 * @typedef {Object} ExportData
 * @property {number} gravity 重力加速度
 * @property {number} friction 摩擦係数
 * @property {string} backgroundColor 背景色
 * @property {string | null} backgroundImage 背景画像
 * @property {number} scale 描画倍率
 * @property {number} trackInterval 履歴の保存間隔
 * @property {number} mapSize 物体の存在範囲
 * @property {number} posX 描画X座標
 * @property {number} posY 描画Y座標
 * @property {CircleOption[]} circle 全ての円の配列
 * @property {SquareOption[]} square 全ての四角の配列
 * @property {RopeOption[]} rope 全てのロープの配列
 * @property {GroundOption[]} ground 全ての地面の配列
 * @property {CurveOption[]} curve 全ての曲線の配列
 */
type ExportData = {
  gravity: number;
  friction: number;
  backgroundColor: string;
  backgroundImage: string | null;
  scale: number;
  trackInterval: number;
  mapSize: number;
  posX: number;
  posY: number;
  entity?: CircleOption[];
  circle: CircleOption[];
  square: SquareOption[];
  rope: RopeOption[];
  ground: GroundOption[];
  curve: CurveOption[];
}

/**
 * エンジンクラス
 * 物理エンジンの中心システムです
 *
 * @extends Process
 */
class Engine extends Process{

  /**
   * キャンバス要素
   */
  private readonly canvas: HTMLCanvasElement;

  /**
   * コンテキスト
   */
  private readonly ctx: CanvasRenderingContext2D;

  /**
   * 背景色
   */
  public backgroundColor: string;

  /**
   * 背景画像
   */
  public backgroundImage: HTMLImageElement | null = null;

  /**
   * 描画倍率
   */
  public scale: number;

  /**
   * 履歴の保存間隔
   */
  public trackInterval: number;

  /**
   * 物体の存在範囲
   */
  public mapSize: number;

  /**
   * 描画位置座標
   */
  public posX: number;
  public posY: number;

  /**
   * 地面の配列
   */
  private grounds: { [key: string]: Ground | Curve } = {};

  /**
   * 物体の配列
   */
  private objects: { [key: string]: Circle | Square | Rope } = {};

  /**
   * 履歴の配列
   */
  private tracks: (Circle | Square | Rope)[] = [];

  /**
   * 演算状態
   */
  public isStart: boolean = false;

  /**
   * デバッグモード
   */
  public isDebug: boolean = false;

  /**
   * 開発者モード
   */
  public isDev: boolean = false;

  /**
   * トラッキングモード
   */
  public isTrack: boolean = false;

  /**
   * 処理インターバル
   */
  private loop: number | null = null;

  /**
   * 履歴のカウント
   */
  private trackCount: number = 0;

  /**
   * 更新カウント
   */
  private updateCount: number = 0;

  /**
   * 描画カウント
   */
  private drawCount: number = 0;

  /**
   * 最終更新時間
   */
  private lastUpdate: DOMHighResTimeStamp = performance.now();

  /**
   * 最終描画時間
   */
  private lastDraw: DOMHighResTimeStamp = performance.now();

  /**
   * 現在のPPS
   */
  public correntPps: number = 0;

  /**
   * 現在のFPS
   */
  public correntFps: number = 0;

  /**
   * @param {HTMLCanvasElement} canvas 描画するキャンバス要素
   * @param {EngineOption} option エンジンオプション
   */
  constructor(canvas: HTMLCanvasElement,{ pps = 90, gravity = 500, friction = 0.001, posX = 0, posY = 0, backgroundColor = "#eeeeee", backgroundImage = null, scale = 1, trackInterval = 100, mapSize = 10000 }: EngineOption = {}){
    super({
      pps: pps,
      gravity: gravity,
      friction: friction
    });

    this.canvas = canvas;

    const ctx = this.canvas.getContext("2d");
    if(!ctx) throw new Error("無効な描画要素です");

    this.ctx = ctx;

    this.backgroundColor = backgroundColor;
    this.setBackgroundImage(backgroundImage);

    this.scale = scale;
    this.trackInterval = trackInterval;
    this.mapSize = mapSize;

    this.posX = posX;
    this.posY = posY;

    this.draw();
  }

  /**
   * 全てのエンティティーの配列を返します
   * @returns {Entity[]} エンティティーの配列
   */
  private get entities(): Entity[]{
    return Object.values(this.objects).map(object=>object.entities).flat();
  }

  /**
   * 物体を削除します
   * @param {ClearOption} option クリアオプション
   */
  public clear({ force = false }: ClearOption = {}): void{
    this.objects = {};

    if(force){
      this.grounds = {};
      this.tracks = [];
    }
  }

  /**
   * エンジンをスタートします
   */
  public start(): void{
    if(this.isStart) return;

    this.isStart = true;

    this.loop = setInterval(()=>{
      this.setPPS();
      this.step();
    },1000/this.pps);
  }

  /**
   * エンジンを停止します
   */
  public stop(): void{
    if(!this.isStart) return;

    this.isStart = false;
    this.trackCount = 0;

    if(this.loop){
      clearInterval(this.loop);
    }
  }

  /**
   * 処理を1フレーム進めます
   */
  public step(): void{
    this.trackCount++;

    if(this.trackCount >= this.trackInterval/(1000/this.pps)){
      Object.values(this.objects).forEach(object=>{
        this.tracks.push(object.clone());
      });

      this.trackCount = 0;
    }

    this.update();
  }

  /**
   * 物体の状態を更新します
   */
  private update(): void{
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
        const target = this.get<Entity>(ObjectType.Entity,data.name);
        if(!target) return entity.removeTarget(data.name);

        this.solveConnect(entity,target,data.distance,data.stiff);
      });
    });

    this.entities.forEach(entity=>{
      this.updateSpeed(entity);
      this.solveSpeed(entity);
    });

    Object.values(this.objects).forEach(object=>{
      const { posX, posY } = object.getPosition();

      if(Math.abs(posX) > this.mapSize||Math.abs(posY) > this.mapSize){
        this.deSpawn(object.type,object.name);
      }
    });

    this.dispatchEvent(new CustomEvent(Event.Update));
  }

  /**
   * 物体を描画します
   */
  private draw(): void{
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    this.drawBackground();

    this.ctx.save();
    this.ctx.translate(this.posX,this.posY);

    if(this.isDebug) this.drawGrid();

    this.ctx.scale(this.scale,this.scale);

    if(this.isDebug){
      Object.values(this.objects).forEach(object=>{
        object.drawVector(this.ctx);
      });
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

      if(this.isDebug){
        Object.values(this.tracks).forEach(track=>{
          track.drawVector(this.ctx);
        });
      }

      this.ctx.globalAlpha = 1;
    }

    this.ctx.restore();

    this.setFPS();

    if(this.isDev){
      this.ctx.font = "20px Arial";
      this.ctx.fillStyle = "black";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";

      this.ctx.fillText(`${this.correntPps}PPS ${this.correntFps}FPS ${Object.values(this.objects).length + Object.values(this.grounds).length}Objects ${this.entities.length}Entities ${this.tracks.length}Tracks`,this.canvas.width/2,15)
    }

    this.dispatchEvent(new CustomEvent(Event.DrawUpdate));

    requestAnimationFrame(()=>this.draw());
  }

  /**
   * PPSを計算します
   */
  private setPPS(): void{
    this.updateCount++;

    const nextTime: DOMHighResTimeStamp = performance.now();
    const deltaTime: number = nextTime - this.lastUpdate;
  
    if(deltaTime >= 500){
      this.correntPps = Math.round(1000*this.updateCount/deltaTime);
      this.lastUpdate = nextTime;
      this.updateCount = 0;
    }
  }  

  /**
   * FPSを計算します
   */
  private setFPS(): void{
    this.drawCount++;

    const nextTime: DOMHighResTimeStamp = performance.now();
    const deltaTime: number = nextTime - this.lastDraw;

    if(deltaTime >= 500){
      this.correntFps = Math.round(1000*this.drawCount/deltaTime);
      this.lastDraw = nextTime;
      this.drawCount = 0;
    }
  }

  /**
   * 物体を生成します
   * @param {string} type 生成する種類
   * @param {(CircleOption | GroundOption | SquareOption | RopeOption | CurveOption)[]} objects 生成するオブジェクトの配列
   */
  public spawn(type: string,objects: (CircleOption | GroundOption | SquareOption | RopeOption | CurveOption)[]): void{
    objects.forEach(object=>{
      object.name = object.name || createId(8);

      if(type === ObjectType.Circle){
        const circle = new Circle(object as CircleOption);

        this.objects[object.name] = circle;
      }else if(type === ObjectType.Square){
        const square = new Square(object as SquareOption);

        this.objects[object.name] = square;
      }else if(type === ObjectType.Rope){
        const rope = new Rope(object as RopeOption);

        this.objects[object.name] = rope;
      }else if(type === ObjectType.Ground){
        const ground = new Ground(object as GroundOption);

        this.grounds[object.name] = ground;
      }else if(type === ObjectType.Curve){
        const curve = new Curve(object as CurveOption);

        this.grounds[object.name] = curve;
      }
    });
  }

  /**
   * 物体を削除します
   * @param {string} type 削除するタイプ
   * @param {string} name 削除する物体名
   */
  public deSpawn(type: string,name: string): void{
    if(type === ObjectType.Circle){
      const circle = this.get<Circle>(type,name);
      if(!circle) return;

      delete this.objects[name];
    }else if(type === ObjectType.Square){
      const square = this.get<Square>(type,name);
      if(!square) return;

      delete this.objects[name];
    }else if(type === ObjectType.Rope){
      const rope = this.get<Rope>(type,name);
      if(!rope) return;

      delete this.objects[name];
    }else if(type === ObjectType.Ground||type === ObjectType.Curve){
      const ground = this.get<Ground | Curve>(type,name);
      if(!ground) return;

      delete this.grounds[name];
    }
  }

  /**
   * 指定した物体を取得します
   * @param {string} type 取得する種類
   * @param {string} name 取得する物体名
   * @returns {T | undefined} 取得した物体
   */
  public get<T>(type: string,name: string): T | undefined{
    if(type === ObjectType.Entity){
      return this.entities.find(entity=>entity.name === name) as T;
    }else if(type === ObjectType.Ground||type === ObjectType.Curve){
      return this.grounds[name] as T;
    }else{
      return this.objects[name] as T;
    }
  }

  /**
   * 指定した座標にある物体を取得します
   * @param {number} posX 対象のX座標
   * @param {number} posY 対象のY座標
   * @returns {(Circle | Square | Rope | Ground | Curve)[]} 存在した物体の配列
   */
  public checkObject(posX: number,posY: number): (Circle | Square | Rope | Ground | Curve)[]{
    const targets: (Circle | Square | Rope | Ground | Curve)[] = [];

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

  /**
   * 指定した座標にあるエンティティーを計算します
   * @param {number} posX 対象のX座標
   * @param {number} posY 対象のY座標
   * @returns {Entity[]} 存在したエンティティー
   */
  public checkEntity(posX: number,posY: number): Entity[]{
    const targets: Entity[] = [];

    this.entities.forEach(entity=>{
      const vecX: number = entity.posX - posX;
      const vecY: number = entity.posY - posY;

      const distance: number = Math.sqrt(vecX**2 + vecY**2);

      if(distance > entity.size) return;

      targets.push(entity);
    });

    return targets;
  }

  /**
   * 背景画像を設定します
   * @param {string | null} value 画像URL
   */
  public setBackgroundImage(value: string | null): void{
    if(value){
      this.backgroundImage = new Image();
      this.backgroundImage.src = value;
    }else{
      this.backgroundImage = null;
    }
  }

  /**
   * 背景を描画
   */
  private drawBackground(): void{
    if(this.backgroundImage){
      const { width, height } = resize(this.backgroundImage,this.canvas.width > this.canvas.height ? this.canvas.width : this.canvas.height);

      this.ctx.drawImage(
        this.backgroundImage,
        0,
        0,
        width,
        height
      );
    }else{
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    }
  }

  /**
   * マス目を描画
   */
  private drawGrid(): void{
    this.ctx.beginPath();

    const startX: number = this.posX - this.posX%25;
    const startY: number = this.posY - this.posY%25;

    this.ctx.font = "10px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    for(let posX: number = -startX;posX < this.canvas.width - this.posX;posX += 25){
      this.ctx.moveTo(posX,-this.posY);
      this.ctx.lineTo(posX,this.canvas.height - this.posY);

      this.ctx.fillStyle = Math.abs(posX/this.scale) >= this.mapSize ? "red" : "black";    
      this.ctx.fillText(`${Math.round(posX/this.scale)}`,posX,-this.posY + 10);
    }

    for(let posY: number = -startY;posY < this.canvas.height - this.posY;posY += 25){
      this.ctx.moveTo(-this.posX,posY);
      this.ctx.lineTo(this.canvas.width - this.posX,posY);

      this.ctx.fillStyle = Math.abs(posY/this.scale) >= this.mapSize ? "red" : "black";
      this.ctx.fillText(`${Math.round(posY/this.scale)}`,-this.posX + 15,posY);
    }

    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 0.1;
    this.ctx.stroke();
  }

  /**
   * エンジンのデータを出力します
   * @returns {string} エクスポートデータの文字列
   */
  public export(): string{
    const circle = Object.values(this.objects)
      .filter(object=>object.type === ObjectType.Circle)
      .map(object=>object.toJSON());

    const square = Object.values(this.objects)
      .filter(object=>object.type === ObjectType.Square)
      .map(object=>object.toJSON());

    const rope = Object.values(this.objects)
      .filter(object=>object.type === ObjectType.Rope)
      .map(object=>object.toJSON());

    const grounds = Object.values(this.grounds)
      .filter(object=>object.type === ObjectType.Ground)
      .map(object=>object.toJSON());

    const curves = Object.values(this.grounds)
      .filter(object=>object.type === ObjectType.Curve)
      .map(object=>object.toJSON());

    return JSON.stringify({
      gravity: this.gravity,
      friction: this.friction,
      backgroundColor: this.backgroundColor,
      backgroundImage: this.backgroundImage?.src||null,
      scale: this.scale,
      trackInterval: this.trackInterval,
      mapSize: this.mapSize,
      posX: this.posX,
      posY: this.posY,
      circle: circle,
      square: square,
      rope: rope,
      ground: grounds,
      curve: curves
    });
  }

  /**
   * エクスポートデータを読み込みます
   * @param {ExportData} data エクスポートデータ
   */
  public import(data: ExportData): void{
    this.gravity = data.gravity||5000;
    this.friction = data.friction||0.001;
    this.trackInterval = data.trackInterval||100;
    this.mapSize = data.mapSize||10000;
    this.posX = data.posX||0;
    this.posY = data.posY||0;
    this.backgroundColor = data.backgroundColor;
    this.scale = data.scale||1;

    this.clear({ force: true });

    if(data.backgroundImage){
      this.setBackgroundImage(data.backgroundImage);
    }

    if(data.ground){
      this.spawn(ObjectType.Ground,data.ground);
    }

    if(data.curve){
      this.spawn(ObjectType.Curve,data.curve);
    }

    if(data.circle){
      this.spawn(ObjectType.Circle,data.circle);
    }

    if(data.square){
      this.spawn(ObjectType.Square,data.square);
    }

    if(data.rope){
      this.spawn(ObjectType.Rope,data.rope);
    }

    if(data.entity){
      this.spawn(ObjectType.Circle,data.entity);
    }
  }
}

declare global {
  var Engine: any;
  var Key: any;
}

globalThis.Engine = Engine;
globalThis.Key = Key;