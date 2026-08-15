# 0003. Cloudflare Workerプロキシの設計（認可・エラー処理）

- ステータス: 採用
- 日付: 2026-08-15

## コンテキスト

要件定義では Cloudflare Access（Zero Trust）がPages/Workerの手前でログイン画面を
自動生成し、許可アカウントのみ通す。Worker自体が独自に認証・認可ロジックを持つべきかが
論点だった。

## 決定

Worker自体では認可チェックを行わず、Cloudflare Accessに認可を全面委譲する設計にした。
Workerが持つのは以下のみ:

- GitHub PATをSecretとして保持し、フロントには一切返さない
- CORS: `ALLOWED_ORIGIN`（GitHub Pagesのオリジン）のみ許可
- GitHub API呼び出し失敗時は詳細（レート制限メッセージ等）をそのままフロントに返さず、
  `502 { error: "failed to fetch repository data" }` のような抽象化したエラーにする
  （`packages/worker/src/index.ts` の `handleRequest`）

## 検討した代替案

- **Workerに共有シークレット/JWT検証を実装**: Cloudflare Accessと二重に認可ロジックを
  持つことになり、要件の「パスワード管理不要」という利点を損なう。却下。
- **GitHub APIのエラーメッセージをそのまま透過**: デバッグはしやすいが、レート制限や
  内部パス構造などの情報が漏れる。抽象化したエラーメッセージに統一した。

## 結果・影響

- Worker単体のテスト（`packages/worker/test/index.test.ts`）では、Cloudflare Accessが
  正しく機能している前提を置き、Worker自身のHTTPレベルの振る舞い（CORS, 405/404/500/502の
  出し分け、GitHubトークン未設定時の500）のみを検証している。
- Cloudflare Accessの認可設定漏れがあった場合、Worker側では防御できない
  （多層防御にはなっていない）。運用チェックリストとして
  [deployment.md](../deployment.md) にAccess設定手順を明記した。
- テストでは実際の `GitHubClient` の代わりに `GitHubDataSource` インターフェースを
  注入する設計にし（`ClientFactory`）、GitHub APIへのネットワークアクセスなしに
  Workerのルーティング・エラーハンドリングを検証できるようにした。
