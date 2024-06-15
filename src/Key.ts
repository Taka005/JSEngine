interface Key{
  keys: { [key: string]: boolean };
}

/**
 * キークラス
 * キー入力をより使いやすくします
 */
class Key{
  constructor(){
    this.keys = {};
  }

  /**
   * キーの状態を取得します
   * @param {string} code キーコード
   * @returns {boolean} 推されているかどうか
   */
  get(code: string): boolean{
    if(this.keys.hasOwnProperty(code)) return false;

    return this.keys[code];
  }

  /**
   * キーダウンを登録します
   * @param {KeyboardEvent} event キーボードイベント
   */
  keyDown(event: KeyboardEvent): void{
    if(!event.code) throw new Error("キーコードが存在しません");

    this.keys[event.code] = true;
  }

  /**
   * キーアップを登録します
   * @param {KeyboardEvent} event キーボードイベント
   */
  keyUp(event: KeyboardEvent): void{
    if(!event.code) throw new Error("キーコードが存在しません");

    this.keys[event.code] = false;
  }
}

export { Key };