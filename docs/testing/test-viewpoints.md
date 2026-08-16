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

## 2. `@ganesya/worker`（50テスト）

GitHub APIへの実アクセスなしに、`fetchFn`/`GitHubDataSource` の注入でHTTP層とパース層を
分離して検証している。パーサーのテストフィクスチャは、2026-08-16に実際の
`ogane0112/life-management` リポジトリで確認した構造（frontmatter・見出し単位の
複数テーブル・key-valueテーブル）を模した内容にしてある
（[decisions/0007](../decisions/0007-real-data-format-corrections.md)）。

| 観点 | 具体例 | テストファイル |
|---|---|---|
| GitHub APIレスポンスのマッピング | ファイル名からの日付抽出、日付なしファイルのフォールバック | `github.test.ts` |
| GitHub APIエラー | 404→空扱い、403(レート制限)→例外、非2xx→`GitHubApiError` | `github.test.ts` |
| Base64/UTF-8デコード | 日本語（マルチバイト文字）を含むファイル内容の正しいデコード | `github.test.ts` |
| frontmatter日付フォールバック | ファイル名に日付がない場合のみ内容を取得してfrontmatterを読む、frontmatterなしでのフォールバック | `github.test.ts`, `frontmatter.test.ts` |
| Markdownテーブルパース | 正常系、テーブルなし、ヘッダのみ、区切り行欠落、日付不正 | `markdown-table.test.ts` |
| セクション抽出 | 見出し単位での本文切り出し、同レベル見出しでの打ち切り、見出し不在時の空文字 | `markdown-table.test.ts` (`extractSection`) |
| key-valueテーブル反転 | 項目/内容形式のテーブルをオブジェクトルックアップに変換、キー欠落行の無視 | `markdown-table.test.ts` (`tableToKeyValue`) |
| 資格・職歴パース | 複数テーブル中から対象テーブルのみ抽出、無期限/未記入の扱い、期間レンジからの日付抽出（日付内`-`との衝突回避） | `parsers.test.ts` |
| スナップショット構築 | 7カテゴリすべてを呼び出すこと、エラーの伝播（握りつぶさない） | `snapshot.test.ts` |
| HTTPルーティング | OPTIONS→204、GET以外→405、未知パス→404 | `index.test.ts` |
| 設定不備 | `GITHUB_TOKEN`未設定→500 | `index.test.ts` |
| CORS | `ALLOWED_ORIGIN`がレスポンスヘッダに反映される | `index.test.ts` |
| エラー抽象化 | GitHub APIエラー→502、想定外エラー→500かつ内部情報を含まない | `index.test.ts` |

## 3. `@ganesya/frontend`（80テスト）

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
| 説明ツールチップの開閉経路 | ホバー/クリック固定/フォーカス/Escape/外側クリック、`aria-expanded`の遷移 | `InfoTooltip.test.tsx` |
| 説明文の生成 | 全6カテゴリでサマリー・説明が埋まる、engineの重み(60%/40%等)が文面に反映される、`details`欠損時の0フォールバック | `statExplanations.test.ts` |
| ラベルの分かりやすさ | 全ステータスが日本語名で表示される、一行ヒントの表示/未指定時の非表示、ポップオーバー先頭のサマリー | `ParameterBar.test.tsx`, `StatusPanel.test.tsx` |
| ステータス説明の統合 | 全ステータス＋LVに情報トリガーがある、クリックでデータ元と内訳が出る | `StatusPanel.test.tsx` |
| Storybookビルド | 全コンポーネントの `.stories.tsx` が `build-storybook` を通過する | CI |

## 未実施・要手動確認（実インフラ依存のため）

このセッションはCloudflareアカウントへのアクセス権を持たないため、Worker自体の
デプロイ・Secret設定・実際のHTTP疎通確認はユーザー側での手動実施となる
（[deployment.md](../deployment.md) の手順・チェックリスト参照）。

1. ~~**実Workerでの全カテゴリ0点**~~ → **解決済み（2026-08-16）**。
   [decisions/0007](../decisions/0007-real-data-format-corrections.md) の
   パーサー修正を反映したWorkerを再デプロイした結果、実画面で
   HP 18 / INT 69 / 財力 58 / 装備 20 / 判断力 47 / 絆 38 が表示され、
   ローカルの実データ検証値と完全に一致した。GitHub API疎通・PAT権限・
   パース処理すべて正常に動作している。
   なお LV が 1 のままなのは `profile/career.md` の入社日欄が未記入のためで、
   仕様どおりの挙動（実データ入力待ち）。
2. **実データでの計算式の妥当性**: ファイル形式は実データで確認・修正済みだが、
   重み・半減点が実際の記録量に対して体感的に「ちょうどいい成長速度」かは
   実運用しながら要調整（[design/status-calculation.md](../design/status-calculation.md)
   の「未決定・要すり合わせ事項」）。
3. **Cloudflare Access**: 許可アカウント以外がブロックされるか、ログイン画面が正しく出るか。
4. **CORS/オリジン設定**: 実際のGitHub Pagesドメインからのfetchが通るか（動作確認済み）。
5. **レベルアップ演出の実機確認**: 実ブラウザでの音声再生（autoplay制限を含む）、
   アニメーションの見た目。
6. **GitHub APIレート制限**: 1リクエストあたり最大9〜11回程度のAPI呼び出し
   （7ディレクトリ+2ファイル+finance/の日付解決用フォールバック）を行うため、
   頻繁なリロード時のレート制限到達有無。
