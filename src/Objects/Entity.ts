/**
 * エンティティーの初期化オブジェクトです
 * @typedef {Object} EntityOption
 * @property {string} name エンティティー名
 * @property {number} posX X座標
 * @property {number} posY Y座標
 * @property {number} size 半径
 * @property {number} mass 質量
 * @property {number} stiff 剛性(これは0以上1以下です)
 * @property {number} speedX X方向の速度
 * @property {number} speedY Y方向の速度
 * @property {number} rotate 回転角度
 * @property {number} rotateSpeed 回転速度
 * @property {Target[]} targets 接続された物体
 * @property {string} parent 親のID
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
  parent: string;
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
   * 名前
   */
  public readonly name: string;

  /**
   * 位置座標
   */
  public posX: number;
  public posY: number;

  /**
   * 前の位置座標
   */
  public prePosX: number;
  public prePosY: number;

  /**
   * 速度ベクトル
   */
  public speedX: number;
  public speedY: number;

  /**
   * 回転位置
   */
  public rotate: number;

  /**
   * 回転速度
   */
  public rotateSpeed: number;

  /**
   * 半径
   */
  public size: number;

  /**
   * 質量
   */
  public mass: number;

  /**
   * 剛性
   */
  public stiff: number;

  /**
   * ターゲット配列
   */
  public targets: Target[];

  /**
   * 親の名前
   */
  public parent: string;

  /**
   * @param {EntityOption} option エンティティーオプション
   */
  constructor({ name, posX, posY, size, mass, stiff, parent, speedX = 0, speedY = 0, rotate = 0, rotateSpeed = 0, targets = [] }: EntityOption){
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
    this.parent = parent;
  }

  /**
   * 質量の逆数
   * @returns {number} 逆数の質量
   */
  public get invMass(): number{
    if(this.mass === 0) return 0;

    return 1/this.mass;
  }

  /**
   * 位置を保存します
   */
  public savePosition(): void{
    this.prePosX = this.posX;
    this.prePosY = this.posY;
  }

  /**
   * 接続状態を取得します
   * @param {string} targetId ターゲット名
   * @returns {Target | undefined} 取得したターゲット
   */
  public getTarget(targetId: string): Target | undefined{
    return this.targets.find(target=>target.name === targetId);
  }

  /**
   * 接続対象を追加します
   * @param {Target} target 接続するエンティティー
   */
  public addTarget(target: Target): void{
    if(this.getTarget(target.name)) return;

    this.targets.push(target);
  }

  /**
   * 接続対象を削除します
   * @param {number} targetId 削除するエンティティー名
   */
  public removeTarget(targetId: string): void{
    this.targets = this.targets.filter(target=>target.name !== targetId);
  }

  /**
   * JSONに変換します
   * @return {EntityOption} エンティティーオプション
   */
  public toJSON(): EntityOption{
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