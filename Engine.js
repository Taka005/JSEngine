class Engine{
  /**
   * @param {Element} canvas 適用するエレメント
   * @param {Object} option オプション
   * @param {Number} option.fps 描画FPS
   */
  constructor(canvas,{fps = 60} = {}){
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.fps = fps;

    this.entities = {};
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
  spawn(name,data){
    if(!name) throw new Error("エンティティー名を指定してください");

    this.entities[name] = new Entity(data);

    return this.entities[name];
  }

  /**
   * @param {String} name 削除するエンティティー名
   */
  deSpawn(name){
    delete this.entities[name];
  }
}

class Entity{
  /**
   * @param {Object} data エンティティーデータ
   * @param {Number} data.posX X位置
   * @param {Number} data.posY Y位置
   * @param {Number} data.size 大きさ
   * @param {Number} data.mass 質量
   * @param {Number} data.stiff 剛性(0以上1以下)
   * @param {Number} data.speedX X速度
   * @param {Number} data.speedY Y速度
   * @param {String} data.image 表示画像
   */
  constructor({posX, posY, size, mass, stiff, speedX = 0, speedY = 0, image = null}){
    if(
      !posX||
      !posY||
      !size||
      !mass||
      !stiff
    ) throw new Error("エンティティーデータが不足しています");

    if(size < 0) throw new Error("サイズは0以上にしてください");
    if(mass < 1) throw new Error("質量は1以上にしてください");
    if(stiff < 0 || stiff > 1) throw new Error("剛性は0以上1以下にしてください");

    if(image){
      this.img = new Image();
      this.img.src = image;
    }

    this.posX = posX;
    this.posY = posY;

    this.speedX = speedX;
    this.speedY = speedY;

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
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}