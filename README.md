# JSEngine
- このブランチはv1です動作が不安定のためv2のブランチを使ってください
- Web上で動作する物理エンジンです
- ※エンジンの最適化がされていないため、オブジェクトを生成しすぎると重くなります
## 使用方法
### ビルドする場合
- ※ Node.jsがインストールされている必要があります
- `git clone https://github.com/Taka005/JSEngine.git`を実行してレポジトリを作成
- `npm i`を実行して依存関係をインストール
- `npm run bundle`を実行してコンパイル
- 正常にビルドされるとpublicフォルダの中にEngine.jsが生成されます
- index.htmlを開いてデモサイトを起動できます
### CDN経由の場合
- `https://taka005.github.io/JSEngine/Engine.js`をscriptタグに埋め込んでください
