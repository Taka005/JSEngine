/**
 * Game Class
 */
class Game{
  /**
   * 初期化   
   */
  constructor(){
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");
  }

  /**
   * ゲームのスタート
   */
  start(){
    this.player = new Character("./img/avatar.png",150,400,60);

    this.lastTime = performance.now();

    this.loop = setInterval(()=>{
      this.update();
      this.draw();

    },16);
  }

  /**
   * ゲームの終了
   */
  stop(){
    clearInterval(this.loop);
  }

  /**
   * 更新
   */
  update(){

  }

  /**
   * 描画
   */
  draw(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    this.player.draw(this.ctx);
  }

  /**
   * キー入力の制御
   * @param {KeyboardEvent} event キー入力イベント 
   */
  key(event){
    if(event.code === "Space"){
      this.player.jump();
    }else if(event.code === "KeyF"){
      if(this.canvas.requestFullscreen){
        this.canvas.requestFullscreen(); 
      }else if(this.canvas.webkitRequestFullscreen){
        this.canvas.webkitRequestFullscreen();
      }else if(this.canvas.mozRequestFullScreen){
        this.canvas.mozRequestFullScreen();
      }else if(this.canvas.msRequestFullscreen){
        this.canvas.msRequestFullscreen(); 
      }
    }
  }

  /**
   * 配列からランダムに抽出
   * @param {Array} arr 元の配列  
   * @returns {any} 抽出された要素
   */
  random(arr){
    return arr[Math.floor(Math.random()*arr.length)];
  }
}

/**
 * Character Class
 */
class Character{
  /**
   * 初期化
   * @param {String} img 画像
   * @param {Number} posX 描画するX座標
   * @param {Number} posY 描画するY座標
   * @param {Number} size 当たり判定
   */
  constructor(img,posX,posY,size){
    this.image = new Image();
    this.image.src = img;

    this.posX = posX;
    this.posY = posY;

    this.speedX = 0;
    this.speedY = 0;

    this.accX = 0;
    this.accY = 0;

    this.size = size;
  }

  /**
   * 描画
   * @param {CanvasRenderingContext2D} ctx Canvas
   */
  draw(ctx){
    ctx.drawImage(
      this.image,
      this.posX - this.image.width/2,
      this.posY - this.image.height/2
    );
  }

  /**
   * ジャンプ
   */
  jump(){
    if(this.posY !== 400) return;
      
    this.speedY = -30;
    this.accY = 1.5;
  }

}

/**
 * Block Class
 */
class Block{
  /**
   * 初期化
   * @param {String} img 画像
   * @param {Number} posX 描画するX座標
   * @param {Number} posY 描画するY座標
   */
  constructor(img,posX,posY){
    this.image = new Image();
    this.image.src = img;

    this.posX = posX;
    this.posY = posY;
  }

  /**
   * 描画
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx){
    ctx.drawImage(
      this.image,
      this.posX,
      this.posY
    );
  }
}

const game = new Game();

document.addEventListener("keydown",(event)=>{
  event.preventDefault()
  game.key(event);
});