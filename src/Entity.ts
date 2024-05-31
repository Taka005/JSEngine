/**
 * エンティティーを表します
 * @typedef {Object} Entity
 * @property {string} name エンティティー名
 * @property {number} posX X座標
 * @property {number} posY Y座標
 * @property {number} prePosX 保存されたX座標
 * @property {number} prePosY 保存されたY座標
 * @property {number} size 半径
 * @property {number} mass 質量
 * @property {number} stiff 剛性(これは0以上1以下です)
 * @property {number} speedX X方向の速度
 * @property {number} speedY Y方向の速度
 * @property {number} rotate 回転角度
 * @property {number} rotateSpeed 回転速度
 * @property {Target[]} targets 接続された物体
 */
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

/**
 * エンティティーの初期化オブジェクトです
 * @typedef {Object} EntityOption
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
 */
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

/**
 * 物体の接続を表します
 * @typedef {Object} Target
 * @property {string} name エンティティー名
 * @property {number} distance 接続距離
 * @property {number} stiff 拘束する強さ(これは0以上1以下の値です)
 */
type Target = {
  name: string;
  distance: number;
  stiff: number;
}

/**
 * エンティティークラス
 * これは物理エンジンにおける物体の最小単位です
 */
class Entity{
  /**
   * @param {EntityOption} option エンティティーオプション
   */
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

  /**
   * 質量の逆数を返します
   * @returns {number} 逆数の質量
   */
  get invMass(): number{
    if(this.mass === 0) return 0;

    return 1/(this.mass);
  }

  /**
   * 位置を保存します
   */
  savePosition(): void{
    this.prePosX = this.posX;
    this.prePosY = this.posY;
  }

  /**
   * 接続対象を追加します
   * @param {Target} target 接続するエンティティー
   */
  addTarget(target: Target){
    this.targets.push(target);
  }

  /**
   * 接続対象を削除します
   * @param {number} targetId 削除するエンティティー名
   */
  removeTarget(targetId: string){
    this.targets = this.targets.filter(target=>target.name !== targetId);
  }

  /**
   * JSONに変換します
   * @return {EntityOption} エンティティーオプション
   */
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