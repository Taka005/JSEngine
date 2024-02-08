/**
 * @file 物理エンジン
 * @copyright Taka 2024
 * @license GPL3.0
 */

/**
 * 物理エンジンクラス
 * @extends EventTarget
 */
class Engine extends EventTarget {
  /**
   * @param {Element} canvas 適用するCanvasエレメント
   * @param {Object} option オプション
   * @param {Number} option.fps 1秒あたりの描画数
   * @param {Number} option.pps 1秒あたりの処理数
   * @param {Number} option.gravity 重力加速度
   * @param {Number} option.friction 摩擦係数
   */
  constructor(canvas,{ fps = 60, pps = 180, gravity = 500, friction = 0.001 } = {}){
    super();

    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

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

  /**
   * ランダムな文字列を生成
   * @param {Number} length 生成する文字数
   * @returns {String} 生成された文字列
   */
  createId(length){
    const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for(let i = 0;i < length;i++){
      id += str.charAt(Math.floor(Math.random()*str.length));
    }

    return id;
  }

  /**
   * 処理を開始
   */
  start(){
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

  /**
   * 処理を停止
   */
  stop(){
    if(!this.isStart) return;
    this.isStart = false;

    clearInterval(this.loop);
    clearInterval(this.trackLoop);
  }

  /**
   * 物体を更新
   */
  update(){
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
    });

    Object.values(this.entities).forEach(entity=>{
      this.updateSpeed(entity);
      this.solveSpeed(entity);

      if(entity.posY > this.canvas.height+100){
        this.deSpawn("entity",entity.name)
      }

      this.dispatchEvent(new CustomEvent("update",{
        entity: entity
      }));
    });
  }

  /**
   * 物体を描画
   */
  draw(){
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

  /**
   * 物体の生成
   * @param {String} type 生成物体の種類
   * @param {Array} data 生成データの配列(Entityクラスを参照してください)
   */
  spawn(type,data){
    data.forEach(d=>{
      d.name = d.name || this.createId(8);

      if(type === "entity"){
        this.entities[d.name] = new Entity(d);
      }else if(type === "ground"){
        this.grounds[d.name] = new Ground(d);
      }
    });
  }

  /**
   * 指定された物体の再生成
   * @param {String} name 再生成する物体名
   * @param {Object} data 生成データ
   * @param {Number} data.posX X位置
   * @param {Number} data.posY Y座標
   * @param {Number} data.size 大きさ
   * @param {Number} data.mass 質量
   * @param {Number} data.stiff 剛性
   * @param {Number} data.speedX X速度
   * @param {Number} data.speedY Y速度
   * @param {Number} data.rotate 回転角度
   * @param {Number} data.rotateSpeed 回転速度
   * @returns {Entity} 再生成されたエンティティークラス
   */
  reSpawn(name,{ posX, posY, size, mass, stiff, speedX, speedY, rotate, rotateSpeed, image }){
    const entity = this.entities[name];
    if(!entity) throw new Error("存在しないエンティティー名です");

    this.entities[name] = new Entity({
      posX: posX||entity.posX,
      posX: posY||entity.posY,
      size: size||entity.size,
      mass: mass||entity.mass,
      stiff: stiff||entity.stiff,
      speedX: speedX||entity.speedX,
      speedX: speedY||entity.speedY,
      rotate: rotate||entity.rotate,
      rotateSpeed: rotateSpeed||entity.rotateSpeed,
      image: image||entity.image
    });

    return this.entities[name];
  }

  /**
   * 物体の削除
   * @param {String} name 削除する物体名
   */
  deSpawn(type,name){
    if(type === "entity"){
      delete this.entities[name];
    }else if(type === "ground"){
      delete this.grounds[name];
    }
  }

  /**
   * 位置の計算
   * @param {Entity} source 計算する対象
   * @param {Entity} target 計算する対象
   */
  solvePosition(source,target){
    const totalMass = source.mass + target.mass;
    if(totalMass === 0) return;

    let vecX = target.posX - source.posX;
    let vecY = target.posY - source.posY;

    const distance = Math.sqrt(vecX**2 + vecY**2);
    if(distance <= source.size + target.size){
      this.dispatchEvent(new CustomEvent("hit",{
        source: source,
        target: target
      }));

      const move = (distance - (source.size + target.size))/(distance*totalMass + 0.000001)*source.stiff;
      vecX *= move;
      vecY *= move;

      source.posX += vecX*source.mass;
      source.posY += vecY*source.mass;

      target.posX -= vecX*target.mass;
      target.posY -= vecY*target.mass;

      this.solveRotate(source,target);
    }
  }

  /**
   * 地面との位置計算
   * @param {Entity} entity 計算する対象
   * @param {Ground} ground 計算する地面
   */
  solveGroundPosition(entity,ground){
    if(entity.mass === 0) return;

    const { posX, posY } = ground.solvePosition(entity.posX,entity.posY);
    let vecX = posX - entity.posX;
    let vecY = posY - entity.posY;

    const distance = Math.sqrt(vecX**2 + vecY**2);
    if(distance <= entity.size + ground.size/2){
      this.dispatchEvent(new CustomEvent("hit",{
        source: entity,
        target: ground
      }));

      const move = (distance - (entity.size + ground.size/2))/(distance*entity.mass + 0.000001)*entity.stiff;
      vecX *= move;
      vecY *= move;

      entity.posX += vecX*entity.mass;
      entity.posY += vecY*entity.mass;

      this.solveGroundRotate(entity,posX,posY);
    }
  }

  /**
   * 速度の計算
   * @param {Entity} entity 変更するエンティティークラス
   */
  solveSpeed(entity){
    const rate = this.friction*entity.size*entity.mass;

    entity.speedX += -entity.speedX*rate*(1/this.pps);
    entity.speedY += -entity.speedY*rate*(1/this.pps);

    entity.rotateSpeed += -entity.rotateSpeed*rate*(1/this.pps);
  }

  /**
   * 回転の計算
   * @param {Entity} source 変更するエンティティークラス
   * @param {Entity} target 変更するエンティティークラス
   */
  solveRotate(source,target){
    const vecX = target.posX - source.posX;
    const vecY = target.posY - source.posY;

    const vecSize = Math.sqrt(vecX**2 + vecY**2);
    const sourceSpeed = Math.sqrt(source.speedX**2 + source.speedY**2);
    const targetSpeed = Math.sqrt(target.speedX**2 + target.speedY**2);

    const angle = vecX*(-source.speedY) + vecY*source.speedX;

    const rotate = Math.acos((vecX*source.speedX + vecY*source.speedY)/(vecSize*sourceSpeed))*(180/Math.PI);

    if(angle > 0){
      source.rotateSpeed -= (1/rotate*targetSpeed);
      target.rotateSpeed += (1/rotate*sourceSpeed);
    }else if(angle < 0){
      source.rotateSpeed += (1/rotate*targetSpeed);
      target.rotateSpeed -= (1/rotate*sourceSpeed);
    }
  }

  /**
   * 地面との回転の計算
   * @param {Entity} entity 変更するエンティティークラス
   * @param {Number} posX 計算対象のX座標
   * @param {Number} posY 計算対象のY座標
   */
  solveGroundRotate(entity,posX,posY){
    const vecX = posX - entity.posX;
    const vecY = posY - entity.posY;

    const vecSize = Math.sqrt(vecX**2 + vecY**2);
    const entitySpeed = Math.sqrt(entity.speedX**2 + entity.speedY**2);

    const angle = vecX*(-entity.speedY) + vecY*entity.speedX;

    const rotate = Math.acos((vecX*entity.speedX + vecY*entity.speedY)/(vecSize*entitySpeed))*(180/Math.PI);

    if(angle > 0){
      entity.rotateSpeed += rotate*entitySpeed;
    }else if(angle < 0){
      entity.rotateSpeed -= rotate*entitySpeed;
    }
  }

  /**
   * 速度の更新
   * @param {Entity} entity 変更するエンティティークラス
   */
  updateSpeed(entity){
    entity.speedX = (entity.posX - entity.prePosX)/(1/this.pps);
    entity.speedY = (entity.posY - entity.prePosY)/(1/this.pps);

    if(entity.mass !== 0){
      entity.speedY += this.gravity*(1/this.pps);
    }
  }

  /**
   * 位置の更新
   * @param {Entity} entity 変更するエンティティークラス
   */
  updatePosition(entity){
    entity.savePosition();

    entity.posX += entity.speedX*(1/this.pps);
    entity.posY += entity.speedY*(1/this.pps);
  }

  /**
   * 回転の更新
   * @param {Entity} entity 変更するエンティティークラス
   */
  updateRotate(entity){
    entity.rotate += entity.rotateSpeed*(1/this.pps);
  }

  /**
   * グリッドの描画
   */
  drawGrid(){
    this.ctx.beginPath();

    for(let x = 0;x < this.canvas.width;x += 25){
      this.ctx.moveTo(x,0);
      this.ctx.lineTo(x,this.canvas.height);
    }

    for(let y = 0;y < this.canvas.height;y += 25){
      this.ctx.moveTo(0,y);
      this.ctx.lineTo(this.canvas.width,y);
    }

    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 0.1;
    this.ctx.stroke();
  }

  /**
   * データの出力
   * @returns {String} エクスポートデータ
   */
  export(){
    return JSON.stringify({
      gravity: this.gravity,
      friction: this.friction,
      entity: Object.values(this.entities),
      ground: Object.values(this.grounds)
    });
  }

  /**
   * データの入力
   * @param {Object} data エクスポートデータ
   */
  import(data){
    this.gravity = data.gravity;
    this.friction = data.friction;

    this.entities = {};
    this.grounds = {};
    this.tracks = [];

    this.spawn("entity",data.entity);
    this.spawn("ground",data.ground);
  }
}

/**
 * エンティティークラス
 */
class Entity{
  /**
   * @param {Object} data エンティティーデータ
   * @param {String} data.name エンティティー名
   * @param {Number} data.posX X位置
   * @param {Number} data.posY Y位置
   * @param {Number} data.size 大きさ
   * @param {Number} data.mass 質量
   * @param {Number} data.stiff 剛性(0以上1以下)
   * @param {Number} data.speedX X速度
   * @param {Number} data.speedY Y速度
   * @param {Number} data.rotate 回転角度
   * @param {Number} data.rotateSpeed 回転速度
   * @param {String} data.image 表示画像
   */
  constructor({ name, posX, posY, size, mass, stiff, speedX = 0, speedY = 0, rotate = 0, rotateSpeed = 0, image = null }){
    if(size < 0) throw new Error("サイズは0以上にしてください");
    if(mass < 0) throw new Error("質量は0以上にしてください");
    if(stiff < 0 || stiff > 1) throw new Error("剛性は0以上1以下にしてください");

    if(image){
      this.img = new Image();
      this.img.src = image;
    }

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
  }

  /**
   * 位置の保存
   */
  savePosition(){
    this.prePosX = this.posX;
    this.prePosY = this.posY;
  }

  /**
   * 物体を描画
   * @param {CanvasRenderingContext2D} ctx Canvas
   */
  draw(ctx){
    ctx.save();
    ctx.translate(this.posX,this.posY);
    ctx.rotate(this.rotate*(Math.PI/180));

    if(this.img){
      ctx.drawImage(
        this.img,
        this.posX - this.img.width/2,
        this.posY - this.img.height/2
      );
    }else{
      ctx.beginPath();
      ctx.arc(0,0,this.size,0,2*Math.PI);
      ctx.strokeStyle = "red";
      ctx.fillStyle = "red";
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(0,-this.size);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 速度ベクトルを描画
   * @param {CanvasRenderingContext2D} ctx Canvas
   */
  drawVector(ctx){
    ctx.beginPath();
    ctx.moveTo(this.posX,this.posY);
    ctx.lineTo(this.posX + this.speedX,this.posY + this.speedY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/**
 * 地面クラス
 */
class Ground{
  /**
   * @param {Object} data エンティティーデータ
   * @param {String} data.name エンティティー名
   * @param {Number} data.startX X開始位置
   * @param {Number} data.startY Y開始位置
   * @param {Number} data.endX X終了位置
   * @param {Number} data.endY Y終了位置
   * @param {Number} data.size 大きさ
   */
  constructor({ name, startX, startY, endX, endY, size }){
    if(size < 0) throw new Error("サイズは0以上にしてください");

    this.name = name;

    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;

    this.size = size;
  }

  /**
   * 位置の計算
   * @param {Number} posX 対象のX座標
   * @param {Number} posY 対象のY座標
   * @returns {Object} 接触座標
   */
  solvePosition(posX,posY){
    const t = Math.max(0,Math.min(1,((posX - this.startX)*(this.endX - this.startX) + (posY - this.startY)*(this.endY - this.startY))/Math.sqrt((this.startX - this.endX)**2 + (this.startY - this.endY)**2)**2));
    const crossX = this.startX + t*(this.endX - this.startX);
    const crossY = this.startY + t*(this.endY - this.startY);

    if(t > 0 && t < 1){
      return {
        posX: crossX,
        posY: crossY
      }
    }else{
      const startDistance = Math.sqrt((posX - this.startX)**2 + (posY - this.startY)**2);
      const endDistance = Math.sqrt((posX - this.endX)**2 + (posY - this.endY)**2);
      if(startDistance < endDistance){
        return {
          posX: this.startX,
          posY: this.startY
        }
      }else{
        return {
          posX: this.endX,
          posY: this.endY
        }
      }
    }
  }

  /**
   * 物体の描画
   * @param {CanvasRenderingContext2D} ctx Canvas
   */
  draw(ctx){
    ctx.beginPath();
    ctx.moveTo(this.startX,this.startY);
    ctx.lineTo(this.endX,this.endY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = this.size;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.startX,this.startY,this.size/2-1,0,2*Math.PI);
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.endX,this.endY,this.size/2-1,0,2*Math.PI);
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
  }
}

/**
 * トラッカークラス
 */
class Track{
  /**
   * @param {Entity} entity Entityクラス
   */
  constructor(entity){
    this.posX = entity.posX;
    this.posY = entity.posY;
    this.size = entity.size;
    this.img = entity.img;
  }

  /**
   * トラッカーの描画
   * @param {CanvasRenderingContext2D} ctx Canvas
   */
  draw(ctx){
    if(this.img){
      ctx.drawImage(
        this.img,
        this.posX - this.img.width/2,
        this.posY - this.img.height/2
      );
    }else{
      ctx.beginPath();
      ctx.arc(this.posX,this.posY,this.size,0,2*Math.PI);
      ctx.strokeStyle = "rgba(255,0,0,0.3)";
      ctx.fillStyle = "rgba(255,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
    }
  }
}