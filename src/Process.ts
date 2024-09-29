import { Entity } from "./Objects/Entity";
import { Ground } from "./Objects/Ground";
import { ObjectType, Event } from "./utils";

/**
 * @typedef {Object} ProcessOption
 * @property {number} pps 1秒あたりの処理回数
 * @property {number} gravity 重力加速度
 * @property {number} friction 摩擦係数
 */
type ProcessOption = {
  pps: number;
  gravity: number;
  friction: number;
}

/**
 * プロセスクラス
 * 物理演算のコアを処理します
 */
class Process extends EventTarget{

  /**
   * 1秒あたりの処理回数
   */
  public pps: number;

  /**
   * 重力加速度
   */
  public gravity: number;

  /**
   * 摩擦係数
   */
  public friction: number;

  /**
   * @param {ProcessOption} プロセスオプション
   */
  constructor({ pps, gravity, friction }: ProcessOption){
    super();

    this.pps = pps;
    this.gravity = gravity;
    this.friction = friction;
  }

  /**
   * 物体と物体の衝突を計算します
   * @param {Entity} source 対象のエンティティー
   * @param {Entity} target 対象のエンティティー
   */
  protected solvePosition(source: Entity,target: Entity): void{
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
      this.dispatchEvent(new CustomEvent(Event.HitEntity,{
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

  /**
   * 物体と地面の衝突を計算します
   * @param {Entity} entity 対象のエンティティー
   * @param {Ground} ground 対象の地面
   */
  protected solveGroundPosition(entity: Entity,ground: Ground): void{
    if(entity.invMass === 0) return;

    const { posX, posY }: { posX: number, posY: number } = ground.solvePosition(entity.posX,entity.posY);

    let vecX: number = posX - entity.posX;
    let vecY: number = posY - entity.posY;

    if(ground.type === ObjectType.Ground){
      if(
        Math.abs(vecX) >= entity.size + Math.abs(ground.startX - ground.endX) + ground.size&&
        Math.abs(vecY) >= entity.size + Math.abs(ground.startY - ground.endY) + ground.size
      ) return;
    }else if(ground.type === ObjectType.Curve){
      if(
        Math.abs(vecX) >= entity.size + 2*ground.radius + ground.size&&
        Math.abs(vecY) >= entity.size + 2*ground.radius + ground.size
      ) return;
    }

    const distance = Math.sqrt(vecX**2 + vecY**2);
    if(distance <= entity.size + ground.size/2){
      this.dispatchEvent(new CustomEvent(Event.HitGround,{
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

  /**
   * 物体の速度を計算
   * @param {Entity} entity 対象のエンティティー
   */
  protected solveSpeed(entity: Entity): void{
    const rate: number = this.friction*entity.size*entity.mass;

    entity.speedX -= entity.speedX*rate*(1/this.pps);
    entity.speedY -= entity.speedY*rate*(1/this.pps);

    entity.rotateSpeed -= entity.rotateSpeed*rate*(1/this.pps);

    if(Math.abs(entity.rotateSpeed) > 500){
      entity.rotateSpeed = Math.sign(entity.rotateSpeed)*500;
    }
  }

  /**
   * 物体と物体の衝突時の回転を計算します
   * @param {Entity} source 対象のエンティティー
   * @param {Entity} target 対象のエンティティー
   */
  protected solveRotate(source: Entity,target: Entity): void{
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

  /**
   * 指定の座標と物体の回転を計算します
   * @param {Entity} entity 対象のエンティティー
   * @param {number} posX 対象のX座標
   * @param {number} posY 対象のY座標
   */
  protected solveGroundRotate(entity: Entity,posX: number,posY: number): void{
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

  /**
   * 物体と物体の結合を計算します
   * @param {Entity} source 対象のエンティティー
   * @param {Entity} target 対象のエンティティー
   * @param {number} connectDistance 結合距離
   * @param {number} connectStiff 結合の剛性
   */
  protected solveConnect(source: Entity,target: Entity,connectDistance: number,connectStiff: number): void{
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

  /**
   * 物体の速度を更新
   * @param {Entity} entity 対象のエンティティー
   */
  protected updateSpeed(entity: Entity): void{
    entity.speedX = (entity.posX - entity.prePosX)/(1/this.pps);
    entity.speedY = (entity.posY - entity.prePosY)/(1/this.pps);

    if(entity.mass !== 0){
      entity.speedY += this.gravity*(1/this.pps);
    }
  }

  /**
   * 物体の位置を更新
   * @param {Entity} entity 対象のエンティティー
   */
  protected updatePosition(entity: Entity): void{
    entity.savePosition();

    entity.posX += entity.speedX*(1/this.pps);
    entity.posY += entity.speedY*(1/this.pps);
  }

  /**
   * 物体の回転を更新
   * @param {Entity} entity 対象のエンティティー
   */
  protected updateRotate(entity: Entity): void{
    entity.rotate += entity.rotateSpeed*(1/this.pps);
  }
}

export { Process };