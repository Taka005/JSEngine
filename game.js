const canvas = document.getElementById("game");
const engine = new Engine(canvas,{
  fps: 60
});

engine.start();

engine.setGround({
  startX: 30,
  startY: 600,
  endX: 600,
  endY: 600,
  size: 15
});

engine.setGround({
  startX: 600,
  startY: 600,
  endX: 600,
  endY: 500,
  size: 15
});

engine.setGround({
  startX: 30,
  startY: 0,
  endX: 30,
  endY: 600,
  size: 15
});

engine.setGround({
  startX: 800,
  startY: 0,
  endX: 800,
  endY: 600,
  size: 15
});

engine.setGround({
  startX: 800,
  startY: 0,
  endX: 800,
  endY: 600,
  size: 15
});

engine.setGround({
  startX: 800,
  startY: 0,
  endX: 800,
  endY: 600,
  size: 15
});

document.addEventListener("keydown",(event)=>{
  event.preventDefault();

  engine.spawn({
    posX: 450,
    posY: 200,
    size: 20,
    mass: 50,
    stiff: 0.5
  });
});

canvas.addEventListener("mousedown",(event)=>{
  event.preventDefault();

  const rect = event.target.getBoundingClientRect();

  engine.spawn({
    posX: event.clientX - rect.left,
    posY: event.clientY - rect.top,
    size: 15,
    mass: 10,
    stiff: 0.5
  });
});

const gravityInput = document.getElementById("gravityInput");
const gravityValue = document.getElementById("gravityValue");

const frictionInput = document.getElementById("frictionInput");
const frictionValue = document.getElementById("frictionValue");

const debug = document.getElementById("debug");

gravityValue.textContent = gravityInput.value;
gravityInput.addEventListener("input",(event)=>{
  gravityValue.textContent = event.target.value;
  engine.gravity = event.target.value;
});

frictionValue.textContent = frictionInput.value;
frictionInput.addEventListener("input",(event)=>{
  frictionValue.textContent = event.target.value;
  engine.friction = event.target.value;
});

debug.addEventListener("click",()=>{
  if(engine.isDebug){
    engine.isDebug = false;
  }else{
    engine.isDebug = true;
  }
});