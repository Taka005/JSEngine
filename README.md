# JSEngine
- Web上で動作する物理エンジンです
- TypeScript、JavaScriptで記述されています
- ※エンジンの最適化がされていないため、オブジェクトを生成しすぎると重くなります
- この物理エンジンはPDB法による衝突判定を行い演算しています
- [デモサイト](https://taka005.github.io/JSEngine/)から誰でも自由に利用可能です
## 使用方法
- デモサイトでの使い方を1番上から説明しています
- 操作の一部はタッチパネルにも対応しています
- 物体(円、四角、ロープ)はエンティティーで構成され、全ての物体の最小単位になります
- 地面のみエンティティーで構成されていません
### 重力
- 重力加速度を設定します
- エンティティーで構成される物体(質量がある場合のみ)がこの影響を受けます
### 摩擦
- 摩擦係数を設定します
- エンティティーの移動、回転に影響します(エンティティーの衝突には影響しません)
- 負の値を設定すると徐々にエンティティーが加速します
### デバッグモード
- デバッグモードの有効/無効を切り替えます
- 有効にすると座標表示、エンティティーの速度ベクトルが表示されます
### トラッキングモード
- 物体の通過後を表示します
- 100ミリ秒ごとに履歴が残ります
- トラッキングが多すぎると動作が重くなる可能性があります
### トラッキングリセット
- トラッキングされたデータを全て削除します
### リセット
- 地面以外の全ての物体を削除します
### 全て削除
- 地面を含む全ての物体を削除します
- トラッキングデータは削除されません
### 開始・停止
- 演算の開始と停止を切り替えます
- 停止した場合、物体処理は止まりますが、描画処理は継続されます
### 保存
- 現在の物理演算状態をローカルストレージ上に保存します
- データをJSON形式で保存・共有する場合は後述のエクスポートを使用する必要があります
### ロード
- 保存されたデータを読み込みます
- 保存後の状態は削除されます
- 保存データが存在しない場合空のデータとして読み込まれます
### エクスポート
- 保存されているデータをエクスポートします
- 保存を先に実行されていないとエクスポートされません
- JSON形式で保存されます
### ファイルの読み込み
- エクスポートされたデータを読み込みます
- 保存されたデータが破損している場合、正常に読み込み、演算ができない可能性があります
### ツール
- ツールを選択します
- 選択している間ツールの操作が有効になります
- 種類は以下の通りです
- 円: 標準的な円 一つのエンティティーで構成されます
- 四角: 擬似的な四角(完全な四角ではありません) 4つのエンティティーで構成されています
- ロープ: 擬似的なロープ(完全なロープではありません) 設置には2点間をクリックする必要があります 長さに応じて必要なエンティティーが設定され構成されています
- 地面: 標準的な地面 重力の影響は受けません 設置には2点間をクリックする必要があります 完全に固定された平な面です
- 移動: エンティティーを右クリックを押している間、任意の位置に移動できます
- 接続: エンティティー同士を接続します 二つのエンティティーをクリックする必要があります
- 接続解除: 接続の逆の操作をします 接続された二つのエンティティーをクリックする必要があります
- 操作: クリックして選択したエンティティーをWASDで操作します
- 画面移動: WASDで描画している場所を移動します デバッグモードを使用すると位置が確認できます
### サイズ
- エンティティーのサイズの半径
- 地面の場合は地面の幅に影響します
### 質量
- 物体の質量を設定します
- 地面は質量の影響を受けません
- 質量を0に設定することで物体を常に停止させることができます
### 剛性
- エンティティーの衝突の跳ね返りやすさを設定します
- 特に理由がない場合は0.5から1の間に設定してください
- 0に設定すると物理演算がされません
### 速度(x座標、Y座標)
- エンティティー生成時の初速度を設定します
### 色
- 物体の色を設定します
- 画像が設定されている場合、この設定は無視されます
### 画像URL/画像ファイル
- 物体に設定する画像URLやファイルを設定します
- URLとファイルは後から設定した値が優先されます
- 画像は自動的にリサイズされます
### 画像をリセット
- 設定されたURLやファイルの値をリセットします
### 自動保存
- 15秒おきに保存データを作成します
### 背景色
- 背景の色を設定します
- 背景画像が設定されている場合この設定は無視されます
### 背景画像URL/背景画像ファイル
- 背景に設定する画像URLやファイルを設定します
- URLとファイルは後から設定した値が優先されます
- 画像は自動的にリサイズされます
## ビルド方法
- ※ Node.js、NPMがインストールされている必要があります
- `git clone https://github.com/Taka005/JSEngine.git`を実行してレポジトリをクローンします
- `npm i`を実行して依存関係をインストール
- `npm run bundle`を実行してコンパイル
- 正常にビルドされるとpublicフォルダの中にEngine.jsが生成されます
- public/index.htmlを開いてデモサイトを起動できます