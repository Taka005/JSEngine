class Editer{
  /**
   * @param {Element} canvas 適用するCanvasエレメント
   * @param {Object} option オプション
   * @param {Number} option.fps 描画FPS
   * @param {Number} option.gravity 重力加速度
   * @param {Number} option.friction 摩擦係数
   */
  constructor(canvas,{fps = 60, gravity = 500, friction = 0.001} = {}){
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.fps = fps;
    this.gravity = gravity;
    this.friction = friction;

    this.tool = "entity"
    this.range = 10;
    this.mass = 10;

    this.groundPos = {};

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
    setInterval(()=>{
      this.draw();
    },1000/this.fps);
  }

  draw(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    this.drawSquares();

    Object.values(this.grounds).forEach(ground=>{
      ground.draw(this.ctx);
    });

    Object.values(this.entities).forEach(entity=>{
      entity.draw(this.ctx);
    });
  }

  /**
   * @param {Object} data エンティティーデータ(Entityクラスを参照してください)
   * @returns {Entity} 生成されたエンティティークラス
   */
  spawn(data){
    data.name = data.name || this.createId(8);
    data.size = this.range;
    data.mass = this.mass;

    if(this.tool === "entity"){
      this.entities[data.name] = new Entity(data);

      return this.entities[data.name];
    }else if(this.tool === "ground"){
      this.grounds[data.name] = new Ground(data);

      return this.grounds[data.name];
    }
  }

  drawSquares(){
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
 * @param {Object} data エクスポートデータ
 */
  import(data){
    this.gravity = data.gravity;
    this.friction = data.friction;

    this.entities = {};
    this.grounds = {};

    data.entity.forEach(entity=>{
      this.entities[entity.name] = new Entity(entity);
    });

    data.ground.forEach(ground=>{
      this.grounds[ground.name] = new Ground(ground);
    });
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
   * @param {String} data.image 表示画像
   */
  constructor({name, posX, posY, size, mass, stiff, image = null}){
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

    this.size = size;
    this.mass = mass;
    this.stiff = stiff;
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
      ctx.fill();
      ctx.stroke();
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