/**
 * 指定された長さのランダムな文字列を生成します
 * @param {number} length 生成する長さ 
 * @returns {string} 生成された文字列
 */
function createId(length: number): string{
  const str: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id: string = "";

  for(let i = 0;i < length;i++){
    id += str.charAt(Math.floor(Math.random()*str.length));
  }

  return id;
}

export { createId };