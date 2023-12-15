class Engine extends EventTarget {
  /**
   * @param {Element} canvas 適用するCanvasエレメント
   * @param {Object} option オプション
   * @param {Number} option.fps 描画FPS
   * @param {Number} option.gravity 重力加速度
   * @param {Number} option.friction 摩擦係数
   */
  constructor(canvas,{fps = 60, gravity = 500, friction = 0.003} = {}){
    super();

    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.fps = fps;
    this.gravity = gravity;
    this.friction = friction;

    this.entities = {};
    this.grounds = {};
  }

  createId(length){
    const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for(let i = 0;i < length;i++){
      id += str.charAt(Math.floor(Math.random()*str.length));
    }

    return id;
  }

  start(){
    this.loop = setInterval(()=>{
      this.update();
      this.draw();
    },1000/this.fps);
  }

  stop(){
    clearInterval(this.loop);
  }

  update(){
    Object.values(this.entities).forEach(entity=>{
      this.updatePosition(entity);
    });

    for(let i = 0;i < 3;i++){
      Object.values(this.entities).forEach(entity=>{
        Object.values(this.grounds).forEach(ground=>{
          this.solveGroundPosition(entity,ground);
        });
      });

      Object.values(this.entities).forEach(entity=>{
        Object.values(this.entities).forEach(target=>{
          if(entity.name === target.name) return;

          this.solvePosition(entity,target);
        });
      });
    }

    Object.values(this.entities).forEach(entity=>{
      this.updateSpeed(entity);
      this.solveSpeed(entity);

      if(entity.posY > this.canvas.height+100){
        delete this.entities[entity.name];
      }

      this.dispatchEvent(new CustomEvent("update",{
        entity: entity
      }));
    });
  }

  draw(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);


    Object.values(this.grounds).forEach(ground=>{
      ground.draw(this.ctx);
    });

    Object.values(this.entities).forEach(entity=>{
      entity.draw(this.ctx);
    });
  }

  /**
   * @param {String} name エンティティー名
   * @param {Object} data エンティティーデータ(Entityクラスを参照してください)
   * @returns {Entity} 生成されたエンティティークラス
   */
  spawn(data){
    data.name = data.name || this.createId(8);

    this.entities[data.name] = new Entity(data);

    return this.entities[data.name];
  }

  reSpawn({ name, posX, posY, size, mass, stiff, speedX, speedY, image }){
    const entity = this.entities[name];
    if(entity) throw new Error("存在しないエンティティー名です");

    this.entities[name] = new Entity({
      posX: posX||entity.posX,
      posX: posY||entity.posY,
      size: size||entity.size,
      mass: mass||entity.mass,
      stiff: stiff||entity.stiff,
      speedX: speedX||entity.speedX,
      speedX: speedY||entity.speedY,
      image: image||entity.image
    });

    return this.entities[name];
  }

  /**
   * @param {String} name 削除するエンティティー名
   */
  deSpawn(name){
    delete this.entities[name];
  }

  setGround(data){
    data.name = data.name || this.createId(8);

    this.grounds[data.name] = new Ground(data);

    return this.grounds[data.name];
  }

  /**
   * @param {Entity} source 計算する対象
   * @param {Entity} target 計算する対象
   */
  solvePosition(source,target){
    const totalMass = source.mass + target.mass;
    if(totalMass === 0) return;

    let vecX = target.posX - source.posX;
    let vecY = target.posY - source.posY;

    const distance = Math.sqrt(vecX**2 + vecY**2);
    if(distance > source.size + target.size) return;

    this.dispatchEvent(new CustomEvent("hit",{
      source: source,
      target: target
    }));

    const move = (distance - (source.size + target.size))/(distance*totalMass)*source.stiff;
    vecX *= move;
    vecY *= move;

    source.posX += vecX*source.mass;
    source.posY += vecY*source.mass;

    target.posX -= vecX*target.mass;
    target.posY -= vecY*target.mass;
  }

  /**
   * @param {Entity} entity 計算する対象
   * @param {Ground} ground 計算する対象
   */
  solveGroundPosition(entity,ground){
    if(entity.mass === 0) return;

    let { distance, posX, posY } = ground.solveDistance(entity.posX,entity.posY);
    let vecX = posX - entity.posX;
    let vecY = posY - entity.posY;
    if(distance > entity.size + ground.size/2) return;

    move = (distance - (entity.size + ground.size/2))/(distance*entity.mass)*entity.stiff;
    vecX *= move;
    vecY *= move;

    entity.posX += vecX*entity.mass;
    entity.posY += vecY*entity.mass;
  }

  /**
   * @param {Entity} entity 変更するエンティティークラス
   */
  solveSpeed(entity){
    const rate = this.friction*entity.size*entity.mass;

    entity.speedX += -entity.speedX*rate*(1/this.fps);
    entity.speedY += -entity.speedY*rate*(1/this.fps);
  }
  /**
   * @param {Entity} entity 変更するエンティティークラス
   */
  updateSpeed(entity){
    entity.speedX = (entity.posX - entity.prePosX)/(1/this.fps);
    entity.speedY = (entity.posY - entity.prePosY)/(1/this.fps);

    if(entity.mass === 0) return;
    entity.speedY += this.gravity*(1/this.fps);
  }

  /**
   * @param {Entity} entity 変更するエンティティークラス
   */
  updatePosition(entity){
    entity.savePosition();

    entity.posX += entity.speedX*(1/this.fps);
    entity.posY += entity.speedY*(1/this.fps);
  }
}

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
   * @param {String} data.image 表示画像
   */
  constructor({name, posX, posY, size, mass, stiff, speedX = 0, speedY = 0, image = null}){
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

    this.size = size;
    this.mass = mass;
    this.stiff = stiff;
  }

  savePosition(){
    this.prePosX = this.posX;
    this.prePosY = this.posY;
  }

  /**
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
      ctx.strokeStyle = "red";
      ctx.fillStyle = "red";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fill();
    }
  }
}

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
  constructor({name, startX, startY, endX, endY, size}){
    if(size < 0) throw new Error("サイズは0以上にしてください");

    this.name = name;

    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;

    this.size = size;
  }

  /**
   *
   * @param {Number} posX 対象のX座標
   * @param {Number} posY 対象のY座標
   * @returns {Number} 距離
   */
  solveDistance(posX,posY){
    const m = (this.endX - this.startX !== 0) ? (this.endY - this.startY)/(this.endX - this.startX) : (this.endY - this.startY);
    const b = this.startY - m*this.startX;

    //const distance = Math.abs(m*posX + -posY + b)/Math.sqrt(m**2 + 1);
    const t = Math.max(0,Math.min(1,((posX - this.startX)*(this.endX - this.startX) + (posY - this.startY)*(this.endY - this.startY))/Math.sqrt((this.startX - this.endX)**2 + (this.startY - this.endY)**2)**2));
    const projectionX = this.startX + t*(this.endX - this.startX);
    const projectionY = this.startY + t*(this.endY - this.startY);

    if(t > 0 && t < 1){
      return {
        distance: Math.sqrt((posX - projectionX)**2 + (posY - projectionY)**2),
        posX: projectionX,
        posY: projectionY
      }
    }else{
      const startDistance = Math.sqrt((posX - this.startX)**2 + (posY - this.startY)**2);
      const endDistance = Math.sqrt((posX - this.endX)**2 + (posY - this.endY)**2);
      const distance = Math.min(startDistance,endDistance);
      if(distance === startDistance){
        return {
          distance: distance,
          posX: this.startX,
          posY: this.startY
        }
      }else{
        return {
          distance: distance,
          posX: this.endX,
          posY: this.endY
        }
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx Canvas
   */
  draw(ctx){
    ctx.beginPath();
    ctx.moveTo(this.startX,this.startY);
    ctx.lineTo(this.endX,this.endY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = this.size;
    ctx.stroke();
  }
}