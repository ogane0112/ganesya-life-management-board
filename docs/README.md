# docs 目次

`life-management` RPGビジュアライザーの設計ドキュメント・意思決定記録・テスト観点をここにまとめる。

- [design/architecture.md](./design/architecture.md) — 全体アーキテクチャ、データフロー
- [design/status-calculation.md](./design/status-calculation.md) — ステータス算出ロジックの仕様（計算式・重み・データ契約）
- [design/component-design.md](./design/component-design.md) — Storybookコンポーネントカタログ
- [decisions/](./decisions/) — ADR（意思決定の証跡）
- [testing/test-viewpoints.md](./testing/test-viewpoints.md) — テスト観点一覧
- [deployment.md](./deployment.md) — デプロイ手順（Cloudflare Worker / GitHub Pages / Access）

## 元要件

このリポジトリの実装は、ユーザーがセッション内で共有した
`life-management RPGビジュアライザー 要件定義`（2026-08-16作成、life-managementリポジトリ非保存）
に基づく。要件定義書自体はどのリポジトリにも永続化されていないため、本ドキュメント群が
実装済み範囲についての一次情報となる。
