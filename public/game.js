const game = document.getElementById("game");
const engine = new Engine(game);
const key = new Key();

let tool = "circle";
let size = 15;
let mass = 10;
let stiff = 0.5;
let speedX = 0;
let speedY = 0;
let color = "#ff0000";
let subColor = "#000000";
let image = null;
let position = {};
let targetEntity = null;
let saveData = engine.export();
let autoSave = false;

const gravityInput = document.getElementById("gravityInput");
const gravityValue = document.getElementById("gravityValue");

const frictionInput = document.getElementById("frictionInput");
const frictionValue = document.getElementById("frictionValue");

const toolInput = document.getElementById("toolInput");

const sizeInput = document.getElementById("sizeInput");
const sizeValue = document.getElementById("sizeValue");

const massInput = document.getElementById("massInput");
const massValue = document.getElementById("massValue");

const stiffInput = document.getElementById("stiffInput");
const stiffValue = document.getElementById("stiffValue");

const speedXInput = document.getElementById("speedXInput");
const speedXValue = document.getElementById("speedXValue");

const speedYInput = document.getElementById("speedYInput");
const speedYValue = document.getElementById("speedYValue");

const colorInput = document.getElementById("colorInput");
const colorValue = document.getElementById("colorValue");

const subColorInput = document.getElementById("subColorInput");
const subColorValue = document.getElementById("subColorValue");

const imageReset = document.getElementById("imageReset");
const imageInput = document.getElementById("imageInput");
const imageFileInput = document.getElementById("imageFileInput");

const autoSaveInput = document.getElementById("autoSaveInput");

const backgroundColorInput = document.getElementById("backgroundColorInput");
const backgroundColorValue = document.getElementById("backgroundColorValue");
const backgroundImageReset = document.getElementById("backgroundImageReset");
const backgroundImageInput = document.getElementById("backgroundImageInput");
const backgroundFileInput = document.getElementById("backgroundFileInput");

const debug = document.getElementById("debug");
const track = document.getElementById("track");
const trackReset = document.getElementById("trackReset");
const reset = document.getElementById("reset");
const allReset = document.getElementById("allReset");

const start = document.getElementById("start");
const stop = document.getElementById("stop");
const save = document.getElementById("save");
const load = document.getElementById("load");
const link = document.getElementById("link");
const cache = document.getElementById("cache");

const dataFile = document.getElementById("dataFile");

gravityValue.textContent = gravityInput.value;
frictionValue.textContent = frictionInput.value;
sizeValue.textContent = sizeInput.value;
massValue.textContent = massInput.value;
stiffValue.textContent = stiffInput.value;
speedXValue.textContent = speedXInput.value;
speedYValue.textContent = speedYInput.value;
colorValue.textContent = colorInput.value;
subColorValue.textContent = subColorInput.value;
backgroundColorValue.textContent = backgroundColorInput.value;

engine.start();

if(localStorage.map){
  saveData = localStorage.map;

  const data = JSON.parse(localStorage.map);

  engine.import(data);

  gravityValue.textContent = data.gravity;
  gravityInput.value = data.gravity;

  frictionValue.textContent = data.friction;
  frictionInput.value = data.friction;
}else{
  engine.spawn("ground",[
    {
      startX: 30,
      startY: 600,
      endX: 600,
      endY: 600,
      size: 15
    },
    {
      startX: 600,
      startY: 600,
      endX: 600,
      endY: 500,
      size: 15
    },
    {
      startX: 30,
      startY: 0,
      endX: 30,
      endY: 600,
      size: 15
    },
    {
      startX: 850,
      startY: 0,
      endX: 850,
      endY: 600,
      size: 15
    },
    {
      startX: 500,
      startY: 400,
      endX: 850,
      endY: 300,
      size: 15
    }
  ]);

  saveData =  engine.export();
}

engine.addEventListener("drawUpdate",()=>{
  if(tool === "control"&&!targetEntity) return;

  if(key.get("KeyW")){
    if(tool === "screen"){
      engine.posY += 300*(1/engine.pps);
    }else if(tool === "control"){
      targetEntity.speedY -= 100*(1/engine.pps);
    }
  }

  if(key.get("KeyA")){
    if(tool === "screen"){
      engine.posX += 300*(1/engine.pps);
    }else if(tool === "control"){
      targetEntity.speedX -= 100*(1/engine.pps);
    }
  }

  if(key.get("KeyS")){
    if(tool === "screen"){
      engine.posY -= 300*(1/engine.pps);
    }else if(tool === "control"){
      targetEntity.speedY += 100*(1/engine.pps);
    }
  }

  if(key.get("KeyD")){
    if(tool === "screen"){
      engine.posX -= 300*(1/engine.pps);
    }else if(tool === "control"){
      targetEntity.speedX += 100*(1/engine.pps);
    }
  }
});

document.addEventListener("keydown",(event)=>{
  key.keyDown(event);

  if(event.code === "KeyT"){
    if(!engine.isStart){
      engine.step();
    }
  }
});

document.addEventListener("keyup",(event)=>{
  key.keyUp(event);
});

game.addEventListener("mousemove",(event)=>{
  event.preventDefault();

  if(event.buttons === 1){
    if(!targetEntity) return;

    const rect = event.target.getBoundingClientRect();

    const posX = event.clientX - rect.left - engine.posX;
    const posY = event.clientY - rect.top - engine.posY;

    targetEntity.posX = posX;
    targetEntity.posY = posY;
    targetEntity.speedX = 0;
    targetEntity.speedY = 0;
  }
});

game.addEventListener("mousedown",(event)=>{
  event.preventDefault();

  if(tool === "screen") return;

  const rect = event.target.getBoundingClientRect();

  if(tool === "delete"){
    engine.checkObjectPosition(event.clientX - rect.left - engine.posX,event.clientY - rect.top - engine.posY)
      .forEach(object=>{
        engine.deSpawn(object.type,object.name);
      });
  }else if(tool === "move"){
    const entity = engine.checkEntityPosition(event.clientX - rect.left - engine.posX,event.clientY - rect.top - engine.posY)[0];
    if(!entity) return;

    targetEntity = entity;
  }else if(tool === "control"){
    const entity = engine.checkEntityPosition(event.clientX - rect.left - engine.posX,event.clientY - rect.top - engine.posY)[0];
    if(!entity) return;

    targetEntity = entity;
  }else if(tool === "connect"){
    if(Object.keys(position).length === 0){
      position = {
        posX: event.clientX - rect.left - engine.posX,
        posY: event.clientY - rect.top - engine.posY
      }
    }else{
      const source = engine.checkEntityPosition(position.posX,position.posY)[0];
      const target = engine.checkEntityPosition(event.clientX - rect.left - engine.posX,event.clientY - rect.top - engine.posY)[0];
      if(!source||!target) return position = {};

      if(source.name === target.name) return position = {};

      source.addTarget({
        name: target.name,
        distance: source.size + target.size,
        stiff: source.stiff
      });

      target.addTarget({
        name: source.name,
        distance: source.size + target.size,
        stiff: target.stiff
      });

      position = {};
    }
  }else if(tool === "disConnect"){
    if(Object.keys(position).length === 0){
      position = {
        posX: event.clientX - rect.left - engine.posX,
        posY: event.clientY - rect.top - engine.posY
      }
    }else{
      const source = engine.checkEntityPosition(position.posX,position.posY)[0];
      const target = engine.checkEntityPosition(event.clientX - rect.left - engine.posX,event.clientY - rect.top - engine.posY)[0];
      if(!source||!target) return position = {};

      if(source.name === target.name) return position = {};

      source.removeTarget(target.name);
      target.removeTarget(source.name);

      position = {};
    }
  }else if(tool === "ground"){
    if(Object.keys(position).length === 0){
      position = {
        posX: event.clientX - rect.left - engine.posX,
        posY: event.clientY - rect.top - engine.posY
      }
    }else{
      engine.spawn("ground",[{
        startX: position.posX,
        startY: position.posY,
        endX: event.clientX - rect.left - engine.posX,
        endY: event.clientY - rect.top - engine.posY,
        size: size,
        color: color,
        image: image
      }]);

      position = {};
    }
  }else if(tool === "curve"){
    if(Object.keys(position).length === 0){
      position = {
        startX: event.clientX - rect.left - engine.posX,
        startY: event.clientY - rect.top - engine.posY
      }
    }else if(Object.keys(position).length === 2){
        position.middleX = event.clientX - rect.left - engine.posX;
        position.middleY = event.clientY - rect.top - engine.posY;
    }else{
      engine.spawn("curve",[{
        startX: position.startX,
        startY: position.startY,
        middleX: position.middleX,
        middleY: position.middleY,
        endX: event.clientX - rect.left - engine.posX,
        endY: event.clientY - rect.top - engine.posY,
        size: size,
        color: color,
        image: image
      }]);

      position = {};
    }
  }else if(tool === "rope"){
    if(Object.keys(position).length === 0){
      position = {
        posX: event.clientX - rect.left - engine.posX,
        posY: event.clientY - rect.top - engine.posY
      }
    }else{
      engine.spawn("rope",[{
        startX: position.posX,
        startY: position.posY,
        endX: event.clientX - rect.left - engine.posX,
        endY: event.clientY - rect.top - engine.posY,
        mass: mass,
        stiff: stiff,
        speedX: speedX,
        speedY: speedY,
        size: size,
        color: color,
        image: image
      }]);

      position = {};
    }
  }else{
    engine.spawn(tool,[{
      posX: event.clientX - rect.left - engine.posX,
      posY: event.clientY - rect.top - engine.posY,
      size: size,
      mass: mass,
      stiff: stiff,
      speedX: speedX,
      speedY: speedY,
      color: color,
      subColor: subColor,
      image: image
    }]);
  }
});

game.addEventListener("mouseup",()=>{
  if(targetEntity&&tool === "move"){
    targetEntity = null;
  }
});

gravityInput.addEventListener("input",(event)=>{
  gravityValue.textContent = event.target.value;
  engine.gravity = event.target.value;
});

frictionInput.addEventListener("input",(event)=>{
  frictionValue.textContent = event.target.value;
  engine.friction = event.target.value;
});

toolInput.addEventListener("input",(event)=>{
  tool = event.target.value;

  position = {};
  targetEntity = null;
});

sizeInput.addEventListener("input",(event)=>{
  sizeValue.textContent = event.target.value;
  size = Number(event.target.value);
});

massInput.addEventListener("input",(event)=>{
  massValue.textContent = event.target.value;
  mass = Number(event.target.value);
});

stiffInput.addEventListener("input",(event)=>{
  stiffValue.textContent = event.target.value;
  stiff = Number(event.target.value);
});

speedXInput.addEventListener("input",(event)=>{
  speedXValue.textContent = event.target.value;
  speedX = Number(event.target.value);
});

speedYInput.addEventListener("input",(event)=>{
  speedYValue.textContent = event.target.value;
  speedY = Number(event.target.value);
});

colorInput.addEventListener("input",(event)=>{
  colorValue.textContent = event.target.value;
  color = event.target.value;
});

subColorInput.addEventListener("input",(event)=>{
  subColorValue.textContent = event.target.value;
  subColor = event.target.value;
});

imageInput.addEventListener("change",(event)=>{
  image = event.target.value || null;
});

autoSaveInput.addEventListener("change",()=>{
  autoSave = autoSaveInput.checked;
});

backgroundColorInput.addEventListener("input",(event)=>{
  backgroundColorValue.textContent = event.target.value;
  engine.backgroundColor = event.target.value;
});

backgroundImageInput.addEventListener("change",(event)=>{
  engine.setBackgroundImage(event.target.value || null);
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
  engine.clear();
});

allReset.addEventListener("click",()=>{
  if(!confirm("全て削除しますか？")) return;

  engine.clear({ force: true });
});

dataFile.addEventListener("change",(event)=>{
  const reader = new FileReader();
  reader.readAsText(event.target.files[0]);
  reader.addEventListener("load",()=>{
    data = JSON.parse(reader.result);

    saveData = reader.result;
    engine.import(data);
    localStorage.map = reader.result;

    gravityValue.textContent = data.gravity;
    gravityInput.value = data.gravity;

    frictionValue.textContent = data.friction;
    frictionInput.value = data.friction;
  });
});

imageFileInput.addEventListener("change",(event)=>{
  const reader = new FileReader();
  reader.readAsDataURL(event.target.files[0]);
  reader.addEventListener("load",()=>{
    image = reader.result;
  });
});

imageReset.addEventListener("click",()=>{
  imageInput.value = "";
  imageFileInput.value = "";
  image = null;
});

backgroundFileInput.addEventListener("change",(event)=>{
  const reader = new FileReader();
  reader.readAsDataURL(event.target.files[0]);
  reader.addEventListener("load",()=>{
    engine.setBackgroundImage(reader.result);
  });
});

backgroundImageReset.addEventListener("click",()=>{
  backgroundColorInput.value = "#eeeeee";
  backgroundImageInput.value = "";
  backgroundFileInput.value = "";
  backgroundColorValue.textContent = "#eeeeee";

  engine.setBackgroundImage(null);
});

start.addEventListener("click",()=>{
  engine.start();
});

stop.addEventListener("click",()=>{
  engine.stop();
});

save.addEventListener("click",()=>{
  saveData = engine.export();
  link.href = URL.createObjectURL(new Blob([saveData],{"type":"application/json"}));
  localStorage.map = saveData;
});

load.addEventListener("click",()=>{
  const data = JSON.parse(saveData);

  engine.import(data);
  localStorage.map = saveData;

  gravityValue.textContent = data.gravity;
  gravityInput.value = data.gravity;

  frictionValue.textContent = data.friction;
  frictionInput.value = data.friction;
});

cache.addEventListener("click",()=>{
  delete localStorage.map;
});

setInterval(()=>{
  if(autoSave){
    saveData = engine.export();
  }
},15000);