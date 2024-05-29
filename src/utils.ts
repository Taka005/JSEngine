function createId(length: number): string{
  const str: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id: string = "";

  for(let i = 0;i < length;i++){
    id += str.charAt(Math.floor(Math.random()*str.length));
  }

  return id;
}

export { createId };