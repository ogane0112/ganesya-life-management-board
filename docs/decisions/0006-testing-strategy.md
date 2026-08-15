# 0006. テスト戦略（実インフラなしでの自動テスト方針）

- ステータス: 採用
- 日付: 2026-08-15

## コンテキスト

このセッションからは実際の `life-management`（private）リポジトリの中身、Cloudflareの
実アカウント、GitHub PATのいずれにもアクセスできない。「実装からテストまで完了させる」
という要求に対し、実インフラに依存しない形でどこまで自動テストを積めるかを設計する必要が
あった。

## 決定

外部I/O（GitHub API通信、Web Audio、`window.localStorage`、`requestAnimationFrame`）は
すべて依存性注入またはブラウザ標準APIのモック/ポリフィルで切り離し、ロジックを
決定的にテストできる形にした。

- `stats-engine`: 完全に純粋関数。`now` を含め外部状態を一切参照せず、Node環境でVitestの
  みで45テスト実行。
- `worker`: `GitHubClient` はコンストラクタで `fetchFn` を注入可能にし、`handleRequest` は
  `GitHubDataSource` を返す `ClientFactory` を注入可能にした。実ネットワークアクセスなしに
  正常系・404・レート制限(403)・認証エラー・サーバエラーの各パターンを31テストで検証。
- `frontend`: `LevelUpModal` はビープ再生関数を注入可能にし（`playBeep` prop）、jsdomに
  存在しない `AudioContext` に依存せずテストできる。`App` は `workerUrl` をpropとして
  注入可能にし、`import.meta.env` のモックに頼らずテストできる。`requestAnimationFrame` は
  `src/test/setup.ts` でタイマーベースのポリフィルを提供し、`useCountUp` のアニメーションを
  `waitFor` で検証できるようにした。52テスト。

## 検討した代替案

- **Miniflare/wrangler devによるWorkerの統合テスト**: 実行環境によってはより本物に近い
  検証ができるが、セットアップコストと実行時間が増える。今回はGitHub API呼び出し自体を
  モックで切り離せば十分検証できると判断し、プレーンなVitestでの単体テストに留めた。
- **PlaywrightによるフロントエンドのE2Eテスト**: ブラウザでの実際の描画・操作を検証できるが、
  Worker/GitHub Pagesの実デプロイが前提になる。今回のスコープ外とし、
  [testing/test-viewpoints.md](../testing/test-viewpoints.md) に「デプロイ後に必要な
  手動/E2E確認事項」として明記した。

## 結果・影響

- 3パッケージ合計 **128個の自動テスト**（stats-engine 45 / worker 31 / frontend 52）が
  CI（`.github/workflows/ci.yml`）で毎回実行される。
- 一方で「実際のGitHub APIレスポンス形状が想定通りか」「Cloudflare Accessが正しく
  ブロックするか」といった、モックの外側にある前提の正しさまでは自動テストで保証できない。
  この境界は [testing/test-viewpoints.md](../testing/test-viewpoints.md) の
  「未実施・要手動確認」セクションに明示した。
