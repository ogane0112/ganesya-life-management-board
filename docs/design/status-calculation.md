# ステータス算出ロジック仕様

要件定義書には「具体的な計算式・重み付けは実装フェーズで詰める」と明記されていたため、
本ドキュメントが計算式の一次仕様となる。実装は `packages/stats-engine` に純粋関数として
存在し、全項目がユニットテスト（`packages/stats-engine/test/`）でカバーされている。

## データ契約（RepoSnapshot）

`worker` が GitHub API から取得した情報を、以下の正規化された形に変換してから
`stats-engine` に渡す（`packages/stats-engine/src/types.ts`）。

```ts
interface RepoSnapshot {
  now: string;                       // 計算基準時刻（ISO8601, 決定的テストのため必ず注入）
  logs: RepoFileEntry[];             // logs/ 配下のファイル
  finance: RepoFileEntry[];          // finance/ 配下のファイル
  qualifications: QualificationRecord[]; // profile/qualifications.md をパース
  careerEvents: CareerEventRecord[];     // profile/career.md をパース
  home: RepoFileEntry[];             // home/ 配下のファイル
  decisions: RepoFileEntry[];        // decisions/ 配下のファイル
  chatSummaries: RepoFileEntry[];    // chat-summaries/ 配下のファイル
}
```

### 前提とするファイル命名規則（要確認）

実際の `life-management` リポジトリの中身を参照できない状態で実装したため、以下を
**仮の前提**としてドキュメント化している。実データと食い違う場合は
`packages/worker/src/github.ts` の `extractDateFromFilename` と
`packages/worker/src/parsers.ts` の調整が必要（[decisions/0002](../decisions/0002-status-calculation-approach.md) 参照）。

- `logs/`, `finance/`, `home/`, `decisions/`, `chat-summaries/` 配下のファイル名は
  先頭が `YYYY-MM-DD` で始まる（例: `2026-08-14.md`）。日付が取れないファイルは
  「日付不明」として継続日数・鮮度の計算からは除外されるが、件数ベースの計算には含まれる。
- `profile/qualifications.md` は次のMarkdownテーブル形式：

  ```markdown
  | name | acquiredDate | expiryDate |
  |------|--------------|------------|
  | 基本情報技術者 | 2020-04-01 |            |
  | TOEIC        | 2024-06-01 | 2026-06-01 |
  ```
  `expiryDate` が空欄なら「失効しない資格」として扱う。

- `profile/career.md` は次のMarkdownテーブル形式：

  ```markdown
  | title | date |
  |-------|------|
  | 入社   | 2019-04-01 |
  | 昇進   | 2023-04-01 |
  ```

## 共通の考え方: 飽和スコア（saturating score）

件数ベースのステータス（財力・装備・判断力・絆など）は、単純な線形加算にすると
「記録すればするだけ無限に伸びる」ため、リミットのある成長曲線にした。

```
saturatingScore(count, halfPoint) = 100 * count / (count + halfPoint)
```

- `count === halfPoint` のとき必ずスコア50になる、直感的でテストしやすい形
- `count → ∞` でも100に漸近するのみで到達しない（0除算・オーバーフロー耐性）
- 単調増加なので「記録すれば必ずステータスは上がる（下がらない）」というゲーム的な納得感を維持

実装: `packages/stats-engine/src/math.ts#saturatingScore`

## 各ステータスの計算式

| ステータス | 対象パス | 入力 | 計算式 | 半減点(halfPoint)等のデフォルト |
|---|---|---|---|---|
| **HP / 継続力** | `logs/` | 連続記録日数(streak)、直近30日の記録件数 | `0.6 * saturatingScore(streak, 7) + 0.4 * saturatingScore(recent30, 15)` | streak半点7日、直近件数半点15件 |
| **INT / 知力** | `profile/qualifications.md` | 資格数、有効期限内割合 | `0.5 * saturatingScore(count, 5) + 0.5 * (validRatio * 100)` | 半点5件 |
| **財力・節約力** | `finance/` | ファイル数、直近90日以内に更新された割合 | `0.5 * saturatingScore(count, 10) + 0.5 * (freshRatio * 100)` | 半点10件、鮮度窓90日 |
| **装備 / 生活基盤** | `home/` | ファイル数 | `saturatingScore(count, 8)` | 半点8件 |
| **判断力** | `decisions/` | ファイル数 | `saturatingScore(count, 10)` | 半点10件 |
| **絆 / 対話履歴** | `chat-summaries/` | ファイル数 | `saturatingScore(count, 20)` | 半点20件 |
| **LV（レベル）** | `profile/career.md` | キャリアイベント数、経験年数 | `xp = events*50 + years*100` → `level = floor(sqrt(xp/50)) + 1`（1〜99にクランプ） | — |

全て `packages/stats-engine/src/calculate.ts` の `STATUS_WEIGHTS` に集約されており、
チューニングはこの1箇所を変更するだけで完結する。

### HP（継続力）の連続日数（streak）の定義

`computeStreakDays`（`math.ts`）:
- 「今日」ログがまだ無くても「昨日」までのログがあれば1日の猶予（grace）を与える
  （1日の終わりにまだ記録していないだけで継続が途切れたと判定しないため）
- 日付が1日でも欠けた時点でそこで打ち切り

### LV（レベル）のXPカーブ

`level = floor(sqrt(xp / 50)) + 1` という平方根カーブにより、古典的なRPGのように
「低レベルはすぐ上がるが、高レベルほど時間がかかる」を再現している。レベル1〜99の範囲に
クランプ。

## 未決定・要すり合わせ事項

要件定義書の「未決定・次のステップ候補」に対応する、本実装後もなお残る論点：

1. 上記の重み・半減点は実データなしで決めた仮値。実際の `life-management` の記録量に
   対して体感的に「ちょうどいい成長速度」になっているかは、実データ投入後に要調整
   （[decisions/0002](../decisions/0002-status-calculation-approach.md)）。
2. ファイル命名規則の前提（`YYYY-MM-DD` プレフィックス、Markdownテーブル形式）が
   実際のリポジトリの記法と一致するかは未確認。
3. 「財力・節約力」の「サブスク整理度」は、要件定義の文言だけでは具体的な判定方法が
   読み取れなかったため、本実装ではファイル数＋更新頻度の代理指標にとどめている。
