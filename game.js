const canvas = document.getElementById("game");
const engine = new Engine(canvas);

engine.start();

engine.spawn({
  name: "G1",
  posX: 450,
  posY: 400,
  size: 50,
  mass: 0,
  stiff: 0.5
});

document.addEventListener("keydown",(event)=>{
  event.preventDefault();

  engine.spawn({
    name: event.code,
    posX: 450,
    posY: 200,
    size: 30,
    mass: 10,
    stiff: 0.5,
    speedX: 1
  });
});