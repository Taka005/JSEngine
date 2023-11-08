const canvas = document.getElementById("game");
const engine = new Engine(canvas);

engine.start();

document.addEventListener("keydown",(event)=>{
  event.preventDefault();
  
  engine.spawn({
    name: event.code,
    posX: 450,
    posY: 200,
    size: 30,
    mass: 10,
    stiff: 0.5
  });
});