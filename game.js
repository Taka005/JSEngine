const canvas = document.getElementById("game");
const engine = new Engine(canvas);

engine.start();

engine.setGround({
  startX: 30,
  startY: 600,
  endX: 600,
  endY: 600
});

engine.setGround({
  startX: 600,
  startY: 600,
  endX: 600,
  endY: 700
});

engine.setGround({
  startX: 30,
  startY: 0,
  endX: 30,
  endY: 600
});

engine.setGround({
  startX: 800,
  startY: 0,
  endX: 800,
  endY: 600
});

document.addEventListener("keydown",(event)=>{
  event.preventDefault();

  engine.spawn({
    name: createId(8),
    posX: 450,
    posY: 200,
    size: 10,
    mass: 10,
    stiff: 0.5
  });
});

function createId(length){
  const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for(let i = 0;i < length;i++){
    id += str.charAt(Math.floor(Math.random()*str.length));
  }
  return id;
}