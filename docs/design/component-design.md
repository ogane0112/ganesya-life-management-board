# コンポーネント設計（Storybookカタログ）

`packages/frontend/src/components/` に実装、各コンポーネントは `.stories.tsx` を持ち
`npm run build-storybook --workspace=@ganesya/frontend` でカタログをビルド確認済み。

| コンポーネント | 役割 | 主なProps | 対応するテスト |
|---|---|---|---|
| `PixelWindow` | ドラクエ風の枠線テキストウィンドウ。他の全パネルの土台 | `title?`, `children` | `PixelWindow.test.tsx` |
| `ParameterBar` | HP/MPゲージ風バー。値変化時にパラパラカウントアップ | `label`, `value`, `max`, `colorVar?` | `ParameterBar.test.tsx` |
| `StatusPanel` | LV＋全ステータスバーをまとめたキャラクターカード | `status: CharacterStatus`, `characterName?` | `StatusPanel.test.tsx` |
| `PixelAvatar` | レベル帯（novice/adept/veteran/legend）で色が変わる16x16ドット絵の猫アバター | `level` | `PixelAvatar.test.tsx` |
| `LevelUpModal` | 「レベルが あがった！」演出モーダル（フラッシュ＋ビープ音＋カウントアップ） | `previousLevel`, `newLevel`, `onClose`, `playSound?`, `playBeep?` | `LevelUpModal.test.tsx` |
| `CategoryIcon` | 各カテゴリ（HP/INT/財力/装備/判断力/絆）の8x8ドット絵アイコン | `category` | `CategoryIcon.test.tsx` |
| `SpaceBackground` | 星空・流れ星・地球が動く装飾的な背景（`aria-hidden`） | — | Playwrightでの実描画確認（[decisions/0009](../decisions/0009-pixel-cat-avatar-and-space-background.md)） |
| `InfoTooltip` | ホバー/クリック/フォーカスで開く説明ポップオーバー | `label`, `children` | `InfoTooltip.test.tsx` |
| `PixelFont`（トークン） | `--pixel-font` CSS変数。"Press Start 2P" + 和文フォールバック | — | `global.css` |
| `RetroPalette`（トークン） | NES風の限定色パレット。`RetroPalette` オブジェクト＋`--rp-*` CSS変数 | — | `tokens/palette.ts` |

## 依存関係

```mermaid
flowchart TD
    RetroPalette --> PixelWindow
    RetroPalette --> ParameterBar
    RetroPalette --> PixelAvatar
    RetroPalette --> CategoryIcon
    PixelFont --> PixelWindow
    PixelWindow --> StatusPanel
    PixelWindow --> LevelUpModal
    ParameterBar --> StatusPanel
    PixelAvatar --> StatusPanel
    CategoryIcon --> StatusPanel
    InfoTooltip --> StatusPanel
    StatusPanel --> App
    LevelUpModal --> App
    SpaceBackground --> App
```

## ステータス説明ツールチップ

各ステータス行とLVには情報アイコンが付いており、ホバー/クリック/キーボード
フォーカスのいずれでも「データ元」「算出方法」「いまの内訳」を表示する。
説明文は`stats-engine`の`STATUS_WEIGHTS`から重み・半減点を読み取って
生成しているため、計算式をチューニングしても説明が古いまま残ることがない。
設計判断の詳細は [decisions/0010](../decisions/0010-stat-explanation-tooltips.md)。

## 演出（レベルアップ）の実装

要件定義の3要素すべてを実装している：

1. **画面フラッシュ＋テキストボックス** — `LevelUpModal` の `.headline` に
   `@keyframes flash` によるopacity点滅アニメーションを適用（`LevelUpModal.module.css`）。
2. **ピコピコ音** — `packages/frontend/src/audio/beep.ts` の `playBeepSequence` が
   Web Audio API（`OscillatorNode` の square波）で上昇アルペジオを合成。
   AudioContext非対応環境やユーザー操作前のautoplay制限で失敗しても、演出自体は
   落ちないよう例外を握りつぶす設計にしている。
3. **数値のパラパラカウントアップ** — `useCountUp` フック（`hooks/useCountUp.ts`）が
   `requestAnimationFrame` で表示値を前回値→新値へ補間する。`ParameterBar` と
   `LevelUpModal` の両方で共用。

レベルアップの検知自体は `useLevelUpDetection` フック（`hooks/useLevelUpDetection.ts`）が
担当し、`localStorage` に前回表示したLVを保存することで「リポジトリ更新後にリロードしたら
レベルアップ演出が出る」という要件のリアルタイム性を、ページ単体の状態だけで実現している
（サーバー側にセッション状態を持たない）。

## デザイントークンの選定理由

`RetroPalette` は NES 風に色数を絞った十数色のみを定義し、コンポーネント側は必ず
`var(--rp-*)` 経由で色を参照する（コンポーネントファイル内にハードコードされた16進色を
置かない）。理由と代替案の比較は
[decisions/0004-retro-design-tokens.md](../decisions/0004-retro-design-tokens.md) を参照。

## ドット絵アセットについて

`PixelAvatar`（猫、`catGrid.ts`）と `CategoryIcon`（各カテゴリのアイコン、
`pixelGrids.ts`）はいずれも、フォントや画像アセットに依存しないインラインSVGの
0/1グリッドとして実装している。デザインはローカルの静的HTML＋Playwright
スクリーンショットで見た目を確認しながら反復した（[decisions/0008](../decisions/0008-svg-pixel-icons-and-layout-polish.md)、
[decisions/0009](../decisions/0009-pixel-cat-avatar-and-space-background.md)）。
本格的なスプライトシート（アニメーションするドット絵など）ではない抽象度の高い
シルエットだが、環境によらず同じ見た目で確実に描画される。
