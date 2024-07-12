import { Entity, EntityOption, Target } from "./Entity";
import { createId } from "../utils";

/**
 * @typedef {Object} EntityManager
 * @property {Entity[]} 構成するエンティティーの配列
 */
interface EntityManager{
  entities: Entity[]
}

/**
 * エンティティー生成オプション
 * @typedef {Object} CreateOption
 * @property {string} name エンティティー名
 * @property {number} posX X座標
 * @property {number} posY Y座標
 * @property {number} size 半径
 * @property {number} mass 質量
 * @property {number} stiff 剛性(これは0以上一以下です)
 * @property {number} speedX X方向の速度
 * @property {number} speedY Y方向の速度
 * @property {number} rotate 回転角度
 * @property {number} rotateSpeed 回転速度
 * @property {Target[]} targets 接続された物体
 * @property {string} parent 親のID
 */
type CreateOption = {
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
  parent: string;
}

/**
 * エンティティーマネージャー
 * 構成するエンティティーを管理します
 */
class EntityManager{
  constructor(){
    this.entities = [];
  }

  /**
   * 平均されたエンティティーの位置を計算します
   * @returns {Object} 位置データ
   */
  public getPosition(): { posX: number, posY: number }{
    return {
      posX: this.entities.reduce((total,entity)=>total + entity.posX,0)/this.entities.length,
      posY: this.entities.reduce((total,entity)=>total + entity.posY,0)/this.entities.length
    }
  }

  /**
   * 平均されたエンティティーの速度を計算します
   * @returns {Object} 速度データ
   */
  public getSpeed(): { speedX: number, speedY: number }{
    return {
      speedX: this.entities.reduce((total,entity)=>total + entity.speedX,0)/this.entities.length,
      speedY: this.entities.reduce((total,entity)=>total + entity.speedY,0)/this.entities.length
    }
  }

  /**
   * 平均されたエンティティーの回転位置を計算します
   * @returns {number} 回転位置
   */
  public getRotate(): number{
    return this.entities.reduce((total,entity)=>total + entity.rotate,0)/this.entities.length
  }

  /**
   * エンティティーを作成します
   * @param {CreateOption} object クリエイトオプション
   * @returns {Entity} 作成されたエンティティー
   */
  protected create(object: CreateOption): Entity{
    if(!object.name){
      object.name = createId(8);
    }

    const entity = new Entity(object as EntityOption);

    this.entities.push(entity);

    return entity;
  }

  /**
   * 全ての物体を接続します
   */
  protected connect(): void{
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