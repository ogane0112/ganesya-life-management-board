# テスト観点一覧

自動テストの実行状況（テストコマンド）と、各パッケージで何を・どんな観点でテストしているかの
一覧。CIでは `.github/workflows/ci.yml` が push / PR ごとに全パッケージのtypecheck・test・
buildを実行する。

```
npm run typecheck --workspaces --if-present
npm run test --workspaces --if-present
```

## 1. `@ganesya/stats-engine`（45テスト）

計算ロジックはこのアプリの心臓部であり、境界値・単調性・決定性を重点的に確認している。

| 観点 | 具体例 | テストファイル |
|---|---|---|
| 境界値 | `saturatingScore` の count=0 / halfPoint丁度 / 極大値 / 負数 | `math.test.ts` |
| 単調性 | count増加でスコアが単調増加すること（逆転しない） | `math.test.ts` |
| 異常系 | `halfPoint <= 0` で例外を投げる | `math.test.ts` |
| 日付境界 | ウィンドウの端（inclusive）、未来日付の除外、日をまたぐタイムゾーン処理 | `math.test.ts` (`countWithinWindow`, `daysBetween`) |
| 連続日数(streak) | 0件、猶予日、連続、途切れ、同日複数件の重複排除 | `math.test.ts` (`computeStreakDays`) |
| XPカーブ | xp=0でLv1、上限Lv99でクランプ、負のxpでもLv1未満にならない | `math.test.ts` (`xpToLevel`) |
| 各ステータス計算 | 空データで0点、レコードが増えるとスコアが上がる、有効期限の内外判定 | `calculate.test.ts` |
| 決定性 | 同一入力で `computeStatus` が同一出力を返す（副作用なし） | `calculate.test.ts` |

## 2. `@ganesya/worker`（31テスト）

GitHub APIへの実アクセスなしに、`fetchFn`/`GitHubDataSource` の注入でHTTP層とパース層を
分離して検証している。

| 観点 | 具体例 | テストファイル |
|---|---|---|
| GitHub APIレスポンスのマッピング | ファイル名からの日付抽出、日付なしファイルのフォールバック | `github.test.ts` |
| GitHub APIエラー | 404→空扱い、403(レート制限)→例外、非2xx→`GitHubApiError` | `github.test.ts` |
| Base64/UTF-8デコード | 日本語（マルチバイト文字）を含むファイル内容の正しいデコード | `github.test.ts` |
| Markdownテーブルパース | 正常系、テーブルなし、ヘッダのみ、区切り行欠落、日付不正 | `markdown-table.test.ts`, `parsers.test.ts` |
| スナップショット構築 | 7カテゴリすべてを呼び出すこと、エラーの伝播（握りつぶさない） | `snapshot.test.ts` |
| HTTPルーティング | OPTIONS→204、GET以外→405、未知パス→404 | `index.test.ts` |
| 設定不備 | `GITHUB_TOKEN`未設定→500 | `index.test.ts` |
| CORS | `ALLOWED_ORIGIN`がレスポンスヘッダに反映される | `index.test.ts` |
| エラー抽象化 | GitHub APIエラー→502、想定外エラー→500かつ内部情報を含まない | `index.test.ts` |

## 3. `@ganesya/frontend`（52テスト）

コンポーネントのアクセシビリティ（`role`/`aria-*`）とインタラクション、外部I/O
（Web Audio, localStorage, requestAnimationFrame）をモックしたロジック検証の両方を行う。

| 観点 | 具体例 | テストファイル |
|---|---|---|
| アクセシブルな構造 | `role="progressbar"` と `aria-valuenow/min/max` の整合性 | `ParameterBar.test.tsx` |
| 境界値 | max超過値のクランプ、負値のクランプ、max=0の0除算回避 | `ParameterBar.test.tsx` |
| レベル帯の分岐 | novice/adept/veteran/legendの閾値そのもの | `PixelAvatar.test.tsx` |
| モーダルの相互作用 | 閉じるボタン、背景クリック、Escapeキー、パネル内クリックでは閉じない | `LevelUpModal.test.tsx` |
| 音声再生の分離 | `playSound=false`で再生しない、`playBeep`注入で呼び出し回数を検証、AudioContext非対応でも例外を投げない | `LevelUpModal.test.tsx`, `beep.test.ts` |
| カウントアップアニメーション | 初期値は即座に反映、値変化で目標値まで補間、増加/減少どちらも対応 | `useCountUp.test.ts` |
| レベルアップ検知 | 初回訪問では発火しない、増加時のみ発火、同値/減少では発火しない、dismiss後は消える、他デバイス由来のlocalStorage値の尊重 | `useLevelUpDetection.test.ts` |
| API通信 | 成功時のJSONパース、非2xxで`ApiError`、ステータスコードの伝播 | `client.test.ts` |
| 画面状態遷移 | loading→ready、loading→error、Worker URL未設定時の設定エラー表示 | `App.test.tsx` |
| 統合的なレベルアップ表示 | 実際のfetch結果を経由してLevelUpModalが表示される/されない | `App.test.tsx` |
| Storybookビルド | 全コンポーネントの `.stories.tsx` が `build-storybook` を通過する | CI |

## 未実施・要手動確認（実インフラ依存のため）

このセッションのGitHubアクセス範囲は `ogane0112/ganesya-life-management-board` のみで、
Cloudflareアカウントや実際の `life-management` リポジトリへのアクセス権もないため、
以下は自動テストの対象外。デプロイ後に手動で確認する（[deployment.md](../deployment.md)
の手順内にチェックリストとして再掲）。

1. **実GitHub API疎通**: 実際のPATで `life-management` のprivateリポジトリを読めるか
   （scope/fine-grained権限の過不足）。
2. **実データでの計算結果の妥当性**: ファイル命名規則の前提が実際のリポジトリと一致するか、
   スコアの伸び方が体感的に妥当か（[design/status-calculation.md](../design/status-calculation.md)
   の「未決定・要すり合わせ事項」）。
3. **Cloudflare Access**: 許可アカウント以外がブロックされるか、ログイン画面が正しく出るか。
4. **CORS/オリジン設定**: 実際のGitHub Pagesドメインからのfetchが通るか。
5. **GitHub Pagesへのデプロイ**: `base` パス設定を含めたビルド成果物が正しく配信されるか。
6. **レベルアップ演出の実機確認**: 実ブラウザでの音声再生（autoplay制限を含む）、
   アニメーションの見た目。
7. **GitHub APIレート制限**: 1リクエストあたり9回のAPI呼び出し（7ディレクトリ+2ファイル）を
   行うため、頻繁なリロード時のレート制限到達有無。
