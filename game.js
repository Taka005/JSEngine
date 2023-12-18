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
  startX: 850,
  startY: 0,
  endX: 850,
  endY: 600,
  size: 15
});

engine.setGround({
  startX: 500,
  startY: 400,
  endX: 850,
  endY: 300,
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

const restraintInput = document.getElementById("restraintInput");
const restraintValue = document.getElementById("restraintValue");

const debug = document.getElementById("debug");
const track = document.getElementById("track");
const trackReset = document.getElementById("trackReset");
const reset = document.getElementById("reset");

gravityValue.textContent = gravityInput.value;
frictionValue.textContent = frictionInput.value;
restraintValue.textContent = restraintInput.value;

gravityInput.addEventListener("input",(event)=>{
  gravityValue.textContent = event.target.value;
  engine.gravity = event.target.value;
});

frictionInput.addEventListener("input",(event)=>{
  frictionValue.textContent = event.target.value;
  engine.friction = event.target.value;
});

restraintInput.addEventListener("input",(event)=>{
  restraintValue.textContent = event.target.value;
  engine.restraint = event.target.value;
});

debug.addEventListener("click",()=>{
  if(engine.isDebug){
    engine.isDebug = false;
  }else{
    engine.isDebug = true;
  }
});

track.addEventListener("click",()=>{
  if(engine.isTrack){
    engine.isTrack = false;
  }else{
    engine.isTrack = true;
  }
});

trackReset.addEventListener("click",()=>{
  engine.tracks = [];
});

reset.addEventListener("click",()=>{
  engine.entities = {};
  engine.tracks = [];
});

engine.addEventListener("update",()=>{
  document.getElementById("download").href = URL.createObjectURL(new Blob([JSON.stringify(engine.export())],{"type":"application/json"}));
});