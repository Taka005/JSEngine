import { Circle } from "./Circle";

interface Track{
  object: Circle;
}

class Track{
  constructor(object: Circle){
    this.object = object;
  }
}

export { Track };