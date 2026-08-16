# デプロイ手順

このセッションではCloudflareアカウント・GitHub PAT・実際の `life-management` リポジトリへの
アクセス権がないため、実デプロイは未実施。以下はコード・設定ファイルを踏まえた手順書。

## 前提

- `ogane0112/life-management` に読み取りアクセスできるGitHub Personal Access Token
  （Fine-grained PAT、`Contents: Read-only` 権限を該当リポジトリに付与したもの）
- Cloudflareアカウント（Workers, Pages, Access が利用可能なプラン）

## 1. Cloudflare Worker のデプロイ

```bash
cd packages/worker
npx wrangler login
npx wrangler secret put GITHUB_TOKEN   # PATを入力
npx wrangler deploy
```

`wrangler.toml` の `vars`（`GITHUB_OWNER` / `GITHUB_REPO` / `ALLOWED_ORIGIN`）は
実際のGitHub Pagesドメインに合わせて事前に書き換える。

デプロイ後、動作確認:

```bash
curl -i https://<worker-subdomain>.workers.dev/api/status
```

`GITHUB_TOKEN` 未設定なら500、正しく疎通していれば `CharacterStatus` のJSONが200で返る。

## 2. フロントエンドのビルド・GitHub Pagesデプロイ（自動）

手動でビルドコマンドを叩く必要はない。`.github/workflows/deploy-pages.yml` が
**`main` ブランチにpushするたびに自動でビルド＆GitHub Pagesへ公開**する
（GitHub公式の `actions/deploy-pages` を使用）。

やることは最初の1回だけの設定のみ：

1. **Pagesの配信元をActionsにする**（リポジトリで1回だけ）
   GitHubの当該リポジトリ → `Settings` → `Pages` → `Build and deployment` →
   `Source` を `GitHub Actions` に変更する（`gh-pages` ブランチ等は不要）。
2. **Worker URLを登録する**（Workerをデプロイした後）
   `Settings` → `Secrets and variables` → `Actions` を開き、`Variables` タブ・
   `Secrets` タブのどちらでも構わないので以下を追加：
   - Name: `VITE_WORKER_URL`
   - Value: `https://<worker-subdomain>.workers.dev/api/status`
     （手順1でデプロイしたWorkerのURL）

   ワークフロー側は `${{ vars.VITE_WORKER_URL || secrets.VITE_WORKER_URL }}` と
   両対応にしてあるので、どちらのタブに登録しても反映される
   （機密情報ではないのでVariables推奨だが、Secretsでも動作する）。

この2つを設定した状態で `main` にpush（またはActionsタブから
`Deploy frontend to GitHub Pages` を手動実行）すると、以後は自動でビルド・公開される。
手元でビルド結果だけ確認したい場合は次のコマンドでも可能：

```bash
cd packages/frontend
VITE_WORKER_URL="https://<worker-subdomain>.workers.dev/api/status" npm run build
```

`vite.config.ts` の `base` はリポジトリ名に応じたプロジェクトサイトのパス
（デフォルト `/ganesya-life-management-board/`）になっているため、別リポジトリ名で
配信する場合は `VITE_BASE_PATH` 環境変数で上書きする。

## 3. Cloudflare Access（Zero Trust）の設定

1. Cloudflare Zero Trust ダッシュボードで対象ドメイン（Worker/Pagesのカスタムドメイン）に
   Access アプリケーションを作成。
2. ポリシーで許可するメールアドレス（Google/GitHubアカウント）を1件のみ登録。
3. Worker・Pages双方の手前にAccessを適用（要件定義どおり、コード側では認可チェックを
   行わない設計 — [decisions/0003](./decisions/0003-cloudflare-worker-proxy-design.md)）。

## デプロイ後チェックリスト

[testing/test-viewpoints.md](./testing/test-viewpoints.md) の「未実施・要手動確認」と対応。

- [ ] Workerが実際に `life-management` のprivateリポジトリを読めている（401/403が出ない）
- [ ] `logs/` 等の実ファイル名が `YYYY-MM-DD` プレフィックス前提と一致しているか確認し、
      一致しなければ `packages/worker/src/github.ts` の日付抽出ロジックを調整
- [ ] `profile/qualifications.md` / `career.md` が想定のMarkdownテーブル形式になっているか
      確認し、一致しなければ `packages/worker/src/parsers.ts` を調整
- [ ] 許可アカウント以外でアクセスした際にCloudflare Accessのログイン画面が出る
- [ ] 許可アカウントでログインし、GitHub Pages上でStatusPanelが表示される
- [ ] リポジトリに新しい記録を追加 → リロードでステータスが変化する（リアルタイム性）
- [ ] LVが上がるようなデータ変化を起こし、レベルアップ演出（フラッシュ・音・カウントアップ）
      が実機で正しく動く
- [ ] 実データでのスコアの伸び方を確認し、`STATUS_WEIGHTS`（`stats-engine/src/calculate.ts`）
      の重み・半減点を必要に応じて調整
- [ ] `Settings > Pages > Source` が `GitHub Actions` になっている、
      かつ `VITE_WORKER_URL` リポジトリ変数が設定されている（自動デプロイの前提）
