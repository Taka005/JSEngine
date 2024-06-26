const game = document.getElementById("game");
const engine = new Engine();

let tool = "circle";
let size = 15;
let mass = 10;
let stiff = 0.5;
let color = "#ff0000";
let position = {};

let saveData = engine.export();

(async()=>{
  await engine.init();

  game.appendChild(engine.render.canvas);

  engine.start();

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
})();

game.addEventListener("mousedown",(event)=>{
  event.preventDefault();

  const rect = event.target.getBoundingClientRect();

  if(tool === "delete"){
    engine.checkPosition(event.clientX - rect.left,event.clientY - rect.top)
      .forEach(object=>{
        engine.deSpawn(object.type,object.name);
      });
  }else if(tool === "ground"){
    if(Object.keys(position).length === 0){
      position = {
        posX: event.clientX - rect.left,
        posY: event.clientY - rect.top
      }
    }else{
      engine.spawn("ground",[{
        startX: position.posX,
        startY: position.posY,
        endX: event.clientX - rect.left,
        endY: event.clientY - rect.top,
        stiff: 0.5,
        size: size,
        color: color
      }]);

      position = {};
    }
  }else{
    position = {};

    engine.spawn(tool,[{
      posX: event.clientX - rect.left,
      posY: event.clientY - rect.top,
      size: size,
      mass: mass,
      stiff: stiff,
      color: color
    }]);
  }
});

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

const colorInput = document.getElementById("colorInput");
const colorValue = document.getElementById("colorValue");

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

const dataFile = document.getElementById("dataFile");

gravityValue.textContent = gravityInput.value;
frictionValue.textContent = frictionInput.value;
sizeValue.textContent = sizeInput.value;
massValue.textContent = massInput.value;
stiffValue.textContent = stiffInput.value;
colorValue.textContent = colorInput.value;

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

colorInput.addEventListener("input",(event)=>{
  colorValue.textContent = event.target.value;
  color = event.target.value;
});

debug.addEventListener("click",()=>{
  engine.setDebug();
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

    gravityValue.textContent = data.gravity;
    gravityInput.value = data.gravity;

    frictionValue.textContent = data.friction;
    frictionInput.value = data.friction;
  });
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
});

load.addEventListener("click",()=>{
  const data = JSON.parse(saveData);

  engine.import(data);

  gravityValue.textContent = data.gravity;
  gravityInput.value = data.gravity;

  frictionValue.textContent = data.friction;
  frictionInput.value = data.friction;
});