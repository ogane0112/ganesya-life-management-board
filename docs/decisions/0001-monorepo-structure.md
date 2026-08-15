# 0001. npm workspacesによるモノレポ構成

- ステータス: 採用
- 日付: 2026-08-15

## コンテキスト

要件定義書のアーキテクチャは GitHub Pages（フロント）／Cloudflare Worker（プロキシ）／
GitHub API（データソース）の3層。加えてステータス算出ロジックという明確に独立した
ドメインロジックが存在する。これらをどう分割・管理するか決める必要があった。

## 決定

`packages/stats-engine`（計算ロジック）、`packages/worker`（Cloudflare Worker）、
`packages/frontend`（React/Storybook）の3パッケージを npm workspaces で1リポジトリに
まとめる構成を採用した。

## 検討した代替案

- **単一パッケージにベタ書き**: ロジックとWorkerとフロントが密結合し、計算ロジックだけを
  ユニットテストで独立検証しづらい。却下。
- **3つの別リポジトリに分割**: 個人開発規模でリポジトリ間の同期コストが見合わない。却下。
- **pnpm workspaces**: 機能的には優れるが、実行環境に既にnpmが入っており追加インストールの
  手間・不確実性を避けるため見送り。将来的にpnpmへの移行は妨げない構成にしてある。

## 結果・影響

- `stats-engine` は `worker` からも将来的な `frontend` プレビュー用途からも参照できる
  純粋関数パッケージとして独立させられた。
- ルートの `npm run test --workspaces` で全パッケージのテストを一括実行できる（CIで採用）。
- デメリット: npm workspacesはpnpmほど厳密な依存関係の分離をしないため、パッケージ間の
  暗黙の依存（phantom dependency）が紛れ込む余地がある。パッケージ数が少ない現状は許容。
