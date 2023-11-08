const canvas = document.getElementById("game");
const engine = new Engine(canvas);

engine.start();

document.addEventListener("keydown",(event)=>{
  event.preventDefault()
  engine.spawn({
    name: `${Math.floor(Math.random()*1000)}`,
    posX: 450,
    posY: 200,
    size: 50,
    mass: 10,
    stiff: 0.5
  });
});