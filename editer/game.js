const canvas = document.getElementById("game");
const editer = new Editer(canvas);

editer.start();

let saveData = editer.export();

const gravityInput = document.getElementById("gravityInput");
const gravityValue = document.getElementById("gravityValue");

const frictionInput = document.getElementById("frictionInput");
const frictionValue = document.getElementById("frictionValue");

const toolInput = document.getElementById("toolInput");
const toolValue = document.getElementById("toolValue");

const rangeInput = document.getElementById("rangeInput");
const rangeValue = document.getElementById("rangeValue");

const massInput = document.getElementById("massInput");
const massValue = document.getElementById("massValue");

const reset = document.getElementById("reset");

const save = document.getElementById("save");
const load = document.getElementById("load");
const link = document.getElementById("link");

gravityValue.textContent = gravityInput.value;
frictionValue.textContent = frictionInput.value;
toolValue.textContent = toolInput.value;
rangeValue.textContent = rangeInput.value;
massValue.textContent = massInput.value;

gravityInput.addEventListener("input",(event)=>{
  gravityValue.textContent = event.target.value;
  editer.gravity = event.target.value;
});

frictionInput.addEventListener("input",(event)=>{
  frictionValue.textContent = event.target.value;
  editer.friction = event.target.value;
});

toolInput.addEventListener("change",(event)=>{
  toolValue.textContent = event.target.value;
  editer.tool = event.target.value;
});

rangeInput.addEventListener("input",(event)=>{
  rangeValue.textContent = event.target.value;
  editer.range = event.target.value;
});

massInput.addEventListener("input",(event)=>{
  massValue.textContent = event.target.value;
  editer.mass = event.target.value;
});

reset.addEventListener("click",()=>{
  editer.entities = {};
  editer.grounds = {};
});

save.addEventListener("click",()=>{
  saveData = editer.export();
  link.href = URL.createObjectURL(new Blob([saveData],{"type":"application/json"}));
});

load.addEventListener("click",()=>{
  const data = JSON.parse(saveData);

  editer.import(data);

  gravityValue.textContent = data.gravity;
  gravityInput.value = data.gravity;

  frictionValue.textContent = data.friction;
  frictionInput.value = data.friction;
});

canvas.addEventListener("mousedown",(event)=>{
  event.preventDefault();

  const rect = event.target.getBoundingClientRect();

  if(editer.tool === "entity"){
    editer.groundPos = {};

    editer.spawn({
      posX: event.clientX - rect.left,
      posY: event.clientY - rect.top,
      stiff: 0.5
    });
  }else if(editer.tool === "ground"){
    if(Object.keys(editer.groundPos).length === 0){
      editer.groundPos = {
        posX: event.clientX - rect.left,
        posY: event.clientY - rect.top
      };
    }else{
      editer.spawn({
        startX: editer.groundPos.posX,
        startY: editer.groundPos.posY,
        endX: event.clientX - rect.left,
        endY: event.clientY - rect.top,
        stiff: 0.5
      });

      editer.groundPos = {};
    }
  }
});