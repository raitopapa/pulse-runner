# PULSE RUNNER — パルスランナー

独立リポジトリ用のソース一式です。お菓子作りゲームのソース・素材・セーブデータは含みません。

専用リポジトリ：[raitopapa/pulse-runner](https://github.com/raitopapa/pulse-runner)

公開するには Settings → Pages → Deploy from a branch → main → /docs → Save を選びます。公開設定の完了後のURLは `https://raitopapa.github.io/pulse-runner/` です。

スマホ・タブレット向けの横スクロールロボットアクション。走る・跳ぶ・撃つを中心に、チャージ射撃、壁蹴り、地上／空中ダッシュ、ボスからの武器獲得を組み合わせます。キャラクター、背景、敵、音楽はこのゲーム用に制作しました。

## 収録内容

| ステージ | ボス | 獲得武器・特徴 |
|---|---|---|
| ネオン・スカイライン | ヴォルト・ファルコン | アーク：3方向の電撃 |
| フレア・ファウンドリー | フレア・ゴーレム | フレイム：敵を貫く炎 |
| フロスト・アーカイブ | フロスト・マンティス | フロスト：敵を遅くする氷弾 |
| ネクサス・コア | ネクサス・プライム | 3つの都市をクリアすると解放 |

各ステージにチェックポイント2か所とデータコア3個。ボスは攻撃前の予告があり、体力半分で第2形態に移行します。火は氷に、氷は電撃に、電撃は火に有効です。クリアした都市は再挑戦できます。

## 操作

横向き推奨。左下が移動、右下がジャンプ・ショット・ダッシュ。ショットを長押しして離すとチャージ弾。武器名をタップして切り替えます。移動・ジャンプ・射撃の同時タッチに対応しています。

| 動作 | キーボード | ゲームパッド（標準配列） |
|---|---|---|
| 移動 | ← → / A D | 左スティック / 十字 |
| ジャンプ | Z / Space / W | A |
| 射撃 | X / J | X / RT |
| ダッシュ | C / Shift / K | B / RB |
| 武器切替 | Q / E | LB |
| 一時停止 | P / Esc | Start |

アシストは体力増加・被ダメージ軽減・二段ジャンプ・敵の減速。設定の自動ショットも併用できます。難易度変更は次の出発／リトライから反映。バックグラウンド移行時は一時停止します。

## 保存とオフライン

チェックポイント、クリア、獲得武器、コア記録、ハイスコア、設定を `localStorage` の `pulseRunner.v1` に保存。途中再開は最後のチェックポイントからです。端末／ブラウザ間の同期はありません。サイトデータ削除で記録は消えます。

HTTPSのプレイURLを開き、画面下の「オフライン準備完了」を確認してください。iPadはSafariの共有から「ホーム画面に追加」後、追加したアイコンでもオンラインで一度起動します。以後、機内モードで再起動できるか端末で確認してください。音楽・効果音は最初の操作後に端末内で生成します。

## 開発・配信

Node.js 20以降。依存パッケージのインストールやビルドは不要です。

```sh
npm start
# http://localhost:8080/
npm run check
npm test
```

`docs/` を静的配信。`levels.js` はステージと保存形式、`engine.js` は固定60Hzの物理と戦闘、`render.js` はCanvas描画、`input.js` はタッチ／キー／ゲームパッド、`audio.js` はWeb Audio、`app.js` は画面と保存の連携です。描画幅を最大1440に制限し、フレーム遅延時の物理処理を6ステップで打ち切ります。

独立したService Worker・キャッシュ名・manifest scopeを使用。別リポジトリのGitHub Pagesへ公開するため、お菓子ゲームのパスやWorkerとは分離されます。更新時は子の `sw.js` のキャッシュバージョンを変更します。新Workerはプレイ中に強制適用せず、既存画面が閉じた後に切り替わります。GitHub Pagesの Settings → Pages で Deploy from a branch → main → /docs を選択して保存します。ビルドは不要です。

`review.html` は開発用の画面サイズ確認ページ。実機のタッチ性能・Safari・ゲームパッドの動作確認を代替するものではありません。

## 活用したリソース

- [Bramble’s Dash](https://github.com/raitopapa/bramble-dash)：既存のCanvas中心の構成、ポインター捕捉、ジャンプ入力猶予、Web Audioの音量エンベロープと先読み再生を参考に再実装。
- [Bramble Boom](https://github.com/raitopapa/bramble-boom)：軽量なタッチ入力・合成音の構成を参照。
- [お菓子ゲーム](https://github.com/raitopapa/-okashi-world)：相対URL、PWAの完全プリキャッシュ、他アプリのキャッシュを消さない設計を継承。
- [Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/)：固定刻みの物理更新と蓄積時間の上限。
- [MDN: Multi-touch interaction](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Multi-touch_interaction)：Pointer Eventsによる複数入力。
- [Kenney: Pixel Platformer Industrial Expansion](https://kenney.nl/assets/pixel-platformer-industrial-expansion)：CC0素材の候補として確認。今回の配布データには採用せず、Canvas上で新規描画。

ロックマン系アクションの操作感を参考にしています。既存ゲームのキャラクター画像・音楽・ステージデータは同梱していません。添付のお菓子の絵本は元の家づくりゲームの資料として扱っています。

## 検証範囲

自動テストは入力猶予、ジャンプ高度、ダッシュ、壁蹴り、セーブ検証、落下からの復帰、4ステージの穴越え、武器挙動、4ボスの進行、PWAキャッシュを対象にしています。移行前の公開URLのChromeで起動、ステージ選択、射撃・ジャンプのボタン、一時停止／再開、設定変更、オフライン準備完了表示を確認しました。390×844、844×390、1024×768のiframeで縦横の画面配置を確認しています。独立版の自動テストは24件です。iPad／Android実機での長時間プレイ・複数同時タッチ・音の聴感・ゲームパッドは実機未確認です。
