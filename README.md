# ganesya-life-management-board

`ogane0112/life-management` リポジトリの記録・整理状況を、ドラクエ風レトロRPGの
ステータス画面として可視化するWebアプリ。

設計ドキュメント・意思決定の証跡・テスト観点は [docs/](./docs/README.md) を参照。

## 構成

```
packages/
  stats-engine/  ... リポジトリスナップショット → RPGステータス計算（純粋関数）
  worker/        ... Cloudflare Worker（GitHub APIプロキシ）
  frontend/       ... React + Storybook フロントエンド（GitHub Pages配信）
```

## セットアップ

```bash
npm install
```

## 開発コマンド

```bash
npm run typecheck --workspaces --if-present   # 型チェック（全パッケージ）
npm run test --workspaces --if-present        # テスト（全パッケージ）
npm run build --workspaces --if-present       # ビルド（全パッケージ）

npm run dev --workspace=@ganesya/frontend        # フロント開発サーバー
npm run storybook --workspace=@ganesya/frontend  # Storybook
npm run dev --workspace=@ganesya/worker          # Worker開発サーバー（wrangler dev）
```

デプロイ手順は [docs/deployment.md](./docs/deployment.md) を参照。
