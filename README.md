# UnLockPen-Yay

Yay!（旧・ペントーク）のカンファレンス機能を補助し、複数のBOTアカウントを一括で制御できるモデレーション支援ツールです。フロントエンド（EJS + Webpack）とバックエンド（Express + MongoDB）で構成されています。

## 主な特徴
- **カンファレンス管理**: Agora RTM/RTC を用いた通話制御、参加者の状態監視、BOTの自動参加・離脱。
- **BOTオーケストレーション**: MongoDB に保存した BOT 情報を基にトークン更新やログインを自動化。
- **音声アセット配信**: `source/views/assets/audio` 以下の豊富な効果音を Web UI から即時再生。
- **API ファースト**: `/yay-api`, `/api/bot-api`, `/api/agora-api` など、外部システムからも利用できる REST API を提供。

## 技術スタック
- ランタイム: Node.js 18+
- サーバ: Express 4, EJS, cors, cookie-parser
- データ: MongoDB (mongoose 8)
- RTC: Agora RTM/RTC SDK
- ビルド: TypeScript 5, Webpack 5, ts-loader

## 必要要件
- Node.js 18 以上（16 でも動作しますが LTS 利用を推奨）
- npm 9 以上
- MongoDB クラスター（Atlas など）
- Agora App ID・Yay API キーなどの外部認証情報

## セットアップ
```bash
git clone https://github.com/<your-account>/UnLockPen-Yay.git
cd UnLockPen-Yay
npm install
```

### 環境変数
プロジェクトルートに `.env` を作成し、以下を設定してください。

| 変数名 | 説明 |
|:-------|:-----|
| `PORT` | HTTP サーバーポート (例: 3000) |
| `MONGODB_URI` | MongoDB 接続文字列（例: `mongodb+srv://` 形式） |
| `DB_USER` | MongoDB の DB 接頭辞（コレクション名に使用） |
| `YAY_HOST` | Yay API のベース URL（例: `https://api.yay.space`） |
| `HOST` | 自ホストのフル URL。未設定なら `http://localhost:${PORT}` |
| `USER_AGENT` | Yay API に送信する UA 文字列 |
| `API_KEY` | Yay ログイン API 用キー |
| `AGORA_APP_ID` | Agora RTM/RTC の App ID |

```bash
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.example.mongodb.net/app
DB_USER=rinapen
YAY_HOST=https://api.yay.space
HOST=http://localhost:3000
USER_AGENT=UnLockPen/1.0 (+https://github.com/...)
API_KEY=xxxxxxxxxxxxxxxx
AGORA_APP_ID=yyyyyyyyyyyyyyyy
```

### ビルド & 実行
| コマンド | 説明 |
|:---------|:-----|
| `npm run build` | TypeScript を `dist` にビルドし、フロント資産を Webpack で束ねる |
| `npm start` | `dist/server.js` を実行（API + Web UI を提供） |

開発中にサーバーのみ再起動したい場合は、`ts-node` や nodemon を任意で導入してください（標準スクリプトには同梱されていません）。

## ディレクトリ構成（抜粋）
```
source/
  server.ts            # Express エントリーポイント
  routes/              # Web/API ルーター
  models/              # Mongoose モデル（Bot, AgoraCache）
  utils/               # Agora/Yay 連携やトークン管理ロジック
  views/               # EJS テンプレートと静的アセット
dist/                  # ビルド成果物（自動生成）
```

## API エンドポイント例
- `GET /` : BOT 検索画面
- `GET /conference/:id` : Yay カンファレンス情報を取得し表示
- `GET /joined/:id` : 参加済みカンファレンスのビュー
- `GET /yay-api/v2/calls/conferences/:id` : Yay API へのプロキシ
- `GET /api/bot-api/random_bot_id` : MongoDB から BOT ID を抽選

詳細は `source/routes` 以下を参照してください。

## 開発ワークフロー
1. `npm run build` で TypeScript とアセットをコンパイル。
2. `npm start` でサーバーを起動し、`http://localhost:PORT` をブラウザで開く。
3. UI や音声アセットを編集した場合は再度 `npm run build`。

## 貢献について
1. Issue を立てて背景・再現手順・期待結果を共有してください。
2. Fork → feature ブランチを作成 → 変更内容をテスト → Pull Request。
3. コードスタイルは TypeScript/ESLint 標準に準じます。可能であればユニットテストやスクリーンショットを添付してください。

## 注意事項
- Yay/Agora API の利用規約にしたがい、個人情報やアクセスキーは公開しないでください。
- `source/views/assets/audio` 以下の音源は著作権にご注意ください。再配布には各素材のライセンスに従ってください。
- 実運用では HTTPS での公開と、`.env` を安全に管理することを推奨します。

## ライセンス
このプロジェクトは [CC0 1.0 Universal](LICENSE) の下で提供されています。必要に応じてクレジットを記載していただけると嬉しいですが、義務ではありません。