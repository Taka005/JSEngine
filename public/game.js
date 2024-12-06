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
let script = "";
let image = null;
let position = {};
let targetEntity = null;
let saveData = engine.export();
let autoSave = false;

const gravityInput = document.getElementById("gravityInput");
const gravityValue = document.getElementById("gravityValue");

const frictionInput = document.getElementById("frictionInput");
const frictionValue = document.getElementById("frictionValue");

const scaleInput = document.getElementById("scaleInput");
const scaleValue = document.getElementById("scaleValue");

const speedInput = document.getElementById("speedInput");
const speedValue = document.getElementById("speedValue");

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

const customScript = document.getElementById("customScript");

const imageReset = document.getElementById("imageReset");
const imageInput = document.getElementById("imageInput");
const imageFileInput = document.getElementById("imageFileInput");

const autoSaveInput = document.getElementById("autoSaveInput");

const safeModeInput = document.getElementById("safeModeInput");

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

const command = document.getElementById("command");
const code = document.getElementById("code");

gravityValue.textContent = gravityInput.value;
frictionValue.textContent = frictionInput.value;
scaleValue.textContent = scaleInput.value;
speedValue.textContent = speedInput.value;
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

  gravityValue.textContent = data.gravity||500;
  gravityInput.value = data.gravity||500;

  frictionValue.textContent = data.friction||0.001;
  frictionInput.value = data.friction||0.001;

  scaleValue.textContent = data.scale||1;
  scaleInput.value = data.scale||1;
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

    targetEntity.posX = getPosX(event);
    targetEntity.posY = getPosY(event);
    targetEntity.speedX = 0;
    targetEntity.speedY = 0;
  }
});

game.addEventListener("mousedown",(event)=>{
  event.preventDefault();

  if(tool === "screen") return;

  if(tool === "delete"){
    engine.checkObject(getPosX(event),getPosY(event))
      .forEach(object=>{
        engine.deSpawn(object.type,object.name);
      });
  }else if(tool === "move"){
    const entity = engine.checkEntity(getPosX(event),getPosY(event))[0];
    if(!entity) return;

    targetEntity = entity;
  }else if(tool === "control"){
    const entity = engine.checkEntity(getPosX(event),getPosY(event))[0];
    if(!entity) return;

    targetEntity = entity;
  }else if(tool === "connect"){
    if(Object.keys(position).length === 0){
      position = {
        posX: getPosX(event),
        posY: getPosY(event)
      }
    }else{
      const source = engine.checkEntity(position.posX,position.posY)[0];
      const target = engine.checkEntity(getPosX(event),getPosY(event))[0];
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
        posX: getPosX(event),
        posY: getPosY(event)
      }
    }else{
      const source = engine.checkEntity(position.posX,position.posY)[0];
      const target = engine.checkEntity(getPosX(event),getPosY(event))[0];
      if(!source||!target) return position = {};

      if(source.name === target.name) return position = {};

      source.removeTarget(target.name);
      target.removeTarget(source.name);

      position = {};
    }
  }else if(tool === "ground"){
    if(Object.keys(position).length === 0){
      position = {
        posX: getPosX(event),
        posY: getPosY(event)
      }
    }else{
      engine.spawn("ground",[{
        startX: position.posX,
        startY: position.posY,
        endX: getPosX(event),
        endY: getPosY(event),
        size: size,
        color: color,
        image: image,
        script: script
      }]);

      position = {};
    }
  }else if(tool === "booster"){
    if(Object.keys(position).length === 0){
      position = {
        posX: getPosX(event),
        posY: getPosY(event)
      }
    }else{
      engine.spawn("booster",[{
        startX: position.posX,
        startY: position.posY,
        endX: getPosX(event),
        endY: getPosY(event),
        speedX: speedX,
        speedY: speedY,
        color: color,
        image: image,
        script: script
      }]);

      position = {};
    }
  }else if(tool === "attractor"){
    engine.spawn("attractor",[{
      posX: getPosX(event),
      posY: getPosY(event),
      size: size,
      speed: speedX,
      color: color,
      image: image,
      script: script
    }]);
  }else if(tool === "curve"){
    if(Object.keys(position).length === 0){
      position = {
        startX: getPosX(event),
        startY: getPosY(event)
      }
    }else if(Object.keys(position).length === 2){
        position.middleX = getPosX(event);
        position.middleY = getPosY(event);
    }else{
      engine.spawn("curve",[{
        startX: position.startX,
        startY: position.startY,
        middleX: position.middleX,
        middleY: position.middleY,
        endX: getPosX(event),
        endY: getPosY(event),
        size: size,
        color: color,
        image: image,
        script: script
      }]);

      position = {};
    }
  }else if(tool === "rope"){
    if(Object.keys(position).length === 0){
      position = {
        posX: getPosX(event),
        posY: getPosY(event)
      }
    }else{
      engine.spawn("rope",[{
        startX: position.posX,
        startY: position.posY,
        endX: getPosX(event),
        endY: getPosY(event),
        mass: mass,
        stiff: stiff,
        speedX: speedX,
        speedY: speedY,
        size: size,
        color: color,
        image: image,
        script: script
      }]);

      position = {};
    }
  }else{
    engine.spawn(tool,[{
      posX: getPosX(event),
      posY: getPosY(event),
      size: size,
      mass: mass,
      stiff: stiff,
      speedX: speedX,
      speedY: speedY,
      color: color,
      subColor: subColor,
      image: image,
      script: script
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

scaleInput.addEventListener("input",(event)=>{
  scaleValue.textContent = event.target.value;
  engine.scale = event.target.value;
});

speedInput.addEventListener("input",(event)=>{
  speedValue.textContent = event.target.value;
  engine.setSpeed(Number(event.target.value));
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

customScript.addEventListener("input",(event)=>{
  script = event.target.value;
});

imageInput.addEventListener("change",(event)=>{
  image = event.target.value || null;
});

autoSaveInput.addEventListener("change",()=>{
  autoSave = autoSaveInput.checked;
});

safeModeInput.addEventListener("change",()=>{
  engine.isSafeMode = safeModeInput.checked;
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

    scaleValue.textContent = data.scale||1;
    scaleInput.value = data.scale||1;
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

  scaleValue.textContent = data.scale||1;
  scaleInput.value = data.scale||1;
});

cache.addEventListener("click",()=>{
  delete localStorage.map;
});

command.addEventListener("click",()=>{
  const value = prompt("コマンドを入力");

  alert(engine.command(value));
});

code.addEventListener("click",()=>{
  eval(prompt("スクリプトを実行"));
});

setInterval(()=>{
  if(autoSave){
    saveData = engine.export();
  }
},15000);

function getPosX(event){
  const rect = event.target.getBoundingClientRect();

  return (event.clientX - rect.left - engine.posX)*(1/engine.scale);
}

function getPosY(event){
  const rect = event.target.getBoundingClientRect();

  return (event.clientY - rect.top - engine.posY)*(1/engine.scale);
}