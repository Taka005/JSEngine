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

/**
 * 画像をリサイズします
 * @param {HTMLImageElement} image 対象の画像
 * @param {number} maxSize 最大のサイズ
 * @returns {Object} 計算された縦幅と横幅
 */
function resize(image: HTMLImageElement,maxSize: number): { width: number, height: number }{
  let width: number = 0;
  let height: number = 0;
  const rate: number = image.height/image.width;

  if(image.width > image.height){
    width = maxSize;
    height = maxSize*rate;
  }else{
    width = maxSize*rate;
    height = maxSize;
  }

  return {
    width: width,
    height: height
  }
}

/**
 * 文字列を画像に変換します
 * @param {string} value 画像URL
 * @returns {HTMLImageElement | null} 画像エレメント
 */
function parseImage(value?: string): HTMLImageElement | null{
  if(value){
    const image: HTMLImageElement = new Image();
    image.src = value;

    return image;
  }else{
    return null;
  }
}

/**
 * 角度を正規化します
 * @param {number} angle 角度(ラジアン)
 * @returns {number} 正規化した角度
 */
function normalizeAngle(angle: number): number{
  return (angle + 2*Math.PI)%(2*Math.PI);
}

export { createId, resize, parseImage, normalizeAngle };