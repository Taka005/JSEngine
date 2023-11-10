const canvas = document.getElementById("game");
const engine = new Engine(canvas);

engine.start();

engine.setGround({
  startX: 0,
  startY: 500,
  endX: 900,
  endY: 600
});

document.addEventListener("keydown",(event)=>{
  event.preventDefault();

  engine.spawn({
    name: event.code,
    posX: 451,
    posY: 200,
    size: 30,
    mass: 10,
    stiff: 0.5
  });
});