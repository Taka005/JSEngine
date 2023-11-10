class Engine{
  /**
   * @param {Element} canvas 適用するCanvasエレメント
   * @param {Object} option オプション
   * @param {Number} option.fps 描画FPS
   * @param {Number} option.gravity 重力加速度
   * @param {Number} option.friction 摩擦係数
   */
  constructor(canvas,{fps = 60, gravity = 500, friction = 0.003} = {}){
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.fps = fps;
    this.gravity = gravity;
    this.friction = friction;

    this.entities = {};
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

    for(let i = 0;i < 10;i++){
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
    });
  }

  draw(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

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
    this.entities[data.name] = new Entity(data);

    return this.entities[data.name];
  }

  /**
   * @param {String} name 削除するエンティティー名
   */
  deSpawn(name){
    delete this.entities[name];
  }

  setGround({startX, startY, endX, endY}){
    const width = endX - startX;
    const height = endY - startY;

    const count = Math.sqrt(width*width + height*height)/10;
    for(let i = 0;i < count;i++){
      let x = startX + i*(width/count);
      let y = startY + i*(height/count);

      this.spawn({
        name: this.createId(8),
        posX: x,
        posY: y,
        size: 10,
        mass: 0,
        stiff: 1
      });
    }
  }

  /**
   * @param {Entity} entity 対象のエンティティークラス
   * @param {Entity} target 対象のエンティティークラス
   */
  solvePosition(entity,target){
    const totalMass = entity.mass + target.mass;
    if(totalMass === 0) return;

    let vecX = target.posX - entity.posX;
    let vecY = target.posY - entity.posY;

    const distance = Math.sqrt(vecX*vecX + vecY*vecY);
    if(distance > entity.size + target.size) return;

    const move = (distance - (entity.size + target.size))/(distance*totalMass)*entity.stiff;
    vecX *= move;
    vecY *= move;

    entity.posX += vecX*entity.mass;
    entity.posY += vecY*entity.mass;

    target.posX -= vecX*target.mass;
    target.posY -= vecY*target.mass;
  }

  /**
   * @param {Entity} entity 変更するエンティティークラス
   */
  solveSpeed(entity){
    if(entity.speedX > 0){
      const rate = this.friction*entity.size*entity.mass;
      entity.speedX += -entity.speedX*rate*(1/this.fps);
    }

    if(entity.speedY > 0){
      const rate = this.friction*entity.size*entity.mass;
      entity.speedY += -entity.speedY*rate*(1/this.fps);
    }
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
      ctx.lineWidth = 1;
      ctx.fill();
      //ctx.stroke();
    }
  }
}