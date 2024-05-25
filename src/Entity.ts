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
  targets: Target[]
  color: string;
  img: HTMLImageElement | null;
}

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
  color?: string;
  image?: string | null;
}

type Target = {
  name: string;
  distance: number;
  stiff: number;
}

class Entity{
  constructor({ name, posX, posY, size, mass, stiff, speedX = 0, speedY = 0, rotate = 0, rotateSpeed = 0, targets = [], color = "red", image = null }: EntityOption){
    if(size < 0) throw new Error("サイズは0以上にしてください");
    if(mass < 0) throw new Error("質量は0以上にしてください");
    if(stiff < 0 || stiff > 1) throw new Error("剛性は0以上1以下にしてください");

    if(image){
      this.img = new Image();
      this.img.src = image;
    }else{
      this.color = color;
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

    this.targets = targets;
  }

  savePosition(): void{
    this.prePosX = this.posX;
    this.prePosY = this.posY;
  }

  draw(ctx: CanvasRenderingContext2D): void{
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
      ctx.strokeStyle = this.color;
      ctx.fillStyle = this.color;
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

  drawVector(ctx: CanvasRenderingContext2D): void{
    ctx.beginPath();
    ctx.moveTo(this.posX,this.posY);
    ctx.lineTo(this.posX + this.speedX,this.posY + this.speedY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export { Entity, EntityOption, Target };