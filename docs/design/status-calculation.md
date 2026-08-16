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

### ファイル形式（2026-08-16、実リポジトリで確認済み）

初版実装時は `life-management` の中身を参照できず仮の前提を置いていたが、
2026-08-16 にユーザーの許可のもとリポジトリを実際に確認し、以下のとおり
パーサーを実データの形式に修正した（詳細な経緯は
[decisions/0007](../decisions/0007-real-data-format-corrections.md)）。

- **`logs/`**: ファイル名が `YYYY-MM-DD` で始まる（例: `2026-08-14.md`,
  `2026-06-29-tasks.md`）。当初の仮定と一致。日付が取れないファイルは
  「日付不明」として継続日数・直近件数の計算からは除外されるが、件数ベースの
  計算には含まれる。
- **`finance/`, `home/`, `decisions/`**: ファイル名に日付は含まれない。
  代わりに各ファイルの先頭にYAML frontmatterがあり、
  `last_updated: "YYYY-MM-DD"`（無ければ `created`）を記録している。
  日付が実際に必要な `finance/` のみ、ファイル名で取れない場合にこの
  frontmatterを読みにいく（`home/`・`decisions/` は件数のみ使うため対象外）。
- **`chat-summaries/`**: frontmatterなし。件数のみ使うため実害なし。
- **`profile/qualifications.md`**: 1ファイルに「学歴」「取得済み資格・免許」
  「勉強中・取得予定」の3テーブルが同居する。ステータス計算に使うのは
  「取得済み資格・免許」テーブルのみ：

  ```markdown
  ## 取得済み資格・免許

  | 資格名 | 取得年月 | 有効期限 | 備考 |
  |---|---|---|---|
  | 基本情報技術者 | 2020-04 | 無期限 | - |
  | TOEIC        | 2024-06-01 | 2026-06-01 | - |
  ```
  `有効期限` が `無期限`/`-`/空欄なら「失効しない資格」として扱う。
  `取得年月` は `YYYY-MM-DD` か `YYYY-MM`（月初として正規化）を受け付け、
  `-` 等は「未記入」として無視する。

- **`profile/career.md`**: 「現職」は項目名/内容の縦持ち（key-value）テーブル、
  「職歴」は期間付きの通常テーブル：

  ```markdown
  ## 現職

  | 項目 | 内容 |
  |---|---|
  | 職種 | バックエンドエンジニア |
  | 入社日 | 2024-04-01 |

  ## 職歴

  | 期間 | 会社名 | 職種 | 備考 |
  |---|---|---|---|
  | 2020-04 - 2023-03 | 前職株式会社 | フロントエンドエンジニア | - |
  ```
  「現職」の入社日と「職歴」の期間開始日の両方をキャリアイベントとして扱う。
  現時点の実データではどちらも未記入（`-`）のため、LVは実データ入力待ちで
  当面 `Lv. 1` のまま。

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

1. 上記の重み・半減点は実データなしで決めた仮値。2026-08-16に実データで
   試算した結果（HP 18 / INT 69 / 財力 58 / 装備 20 / 判断力 47 / 絆 38、
   [decisions/0007](../decisions/0007-real-data-format-corrections.md)）は
   極端な値ではなかったが、体感的に「ちょうどいい成長速度」かは実運用しながら
   要調整。
2. ファイル命名規則・Markdown形式は2026-08-16に実リポジトリで確認済み
   （[decisions/0007](../decisions/0007-real-data-format-corrections.md)）。
   パーサーは実データに合わせて修正済み。
3. 「財力・節約力」の「サブスク整理度」は、要件定義の文言だけでは具体的な判定方法が
   読み取れなかったため、本実装ではファイル数＋更新頻度の代理指標にとどめている。
4. `profile/career.md` の「現職」「職歴」に実データ（入社日など）が未記入のため、
   LVは現状 `Lv. 1` のまま。ユーザーが実際に日付を記入すれば自動的に反映される。
