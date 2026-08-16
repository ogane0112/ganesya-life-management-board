# 0005. PixelAvatar / CategoryIconのプレースホルダー実装

- ステータス: 解消済み（`CategoryIcon`は[decisions/0008](./0008-svg-pixel-icons-and-layout-polish.md)、`PixelAvatar`は[decisions/0009](./0009-pixel-cat-avatar-and-space-background.md)でそれぞれSVGドット絵に置き換え済み）
- 日付: 2026-08-15

## コンテキスト

要件定義は `PixelAvatar`（レベル帯で見た目変化するドット絵アバター）と `CategoryIcon`
（各カテゴリのドット絵アイコンセット）をコンポーネントカタログに含めていたが、実際の
ドット絵アセット（スプライトシート等）は要件定義書にもセッション内にも存在しない。

## 決定

- `PixelAvatar` はレベル帯（1-9: novice / 10-29: adept / 30-59: veteran / 60-99: legend）
  ごとに単色の正方形ブロック＋枠線で見た目を変える暫定実装とした
  （`getAvatarTier()` で判定ロジックのみ先に確定）。
  **→ 2026-08-16追記**: [decisions/0009](./0009-pixel-cat-avatar-and-space-background.md)
  で16x16のインラインSVGドット絵猫に置き換え済み。`getAvatarTier()`の判定ロジック・
  閾値は変更なしで、見た目のみ差し替えた。
- `CategoryIcon` は各カテゴリごとに1文字のグリフ（♥/☆/$/⛨/⚖/♪）と専用カラーを
  割り当てる暫定実装とした。
  **→ 2026-08-16追記**: フォントによってグリフが表示されない問題が実機で発覚したため、
  [decisions/0008](./0008-svg-pixel-icons-and-layout-polish.md) で8x8のインラインSVG
  ドット絵に置き換え済み。以下の記述は`PixelAvatar`にのみ引き続き該当する。

## 検討した代替案

- **実装を保留してコンポーネント自体を作らない**: Storybookカタログとして要件定義の
  コンポーネント表を満たせなくなるため却下。骨格（Props・振る舞い・テスト）を先に固め、
  見た目の資産だけ後から差し替えられる設計を優先した。
- **AI生成のドット絵画像をその場で用意**: 著作権・品質の観点、および本セッションの
  スコープ（実装とテストの完了）から見送り、次のステップとして明示的に持ち越した。

## 結果・影響

- レベル帯の閾値（10/30/60）やカテゴリごとの配色は、実際のドット絵アセットが用意された
  際に見た目だけでなく閾値自体も再検討が必要になる可能性がある（`PixelAvatar.test.tsx` の
  `getAvatarTier` テストが仕様の現状を担保している）。
- 差し替えは `PixelAvatar.module.css` の背景色プロパティ、`CategoryIcon.tsx` の
  `CATEGORY_META` を画像/SVGスプライト参照に置き換えるだけで完結するよう、ロジックと
  見た目を分離した設計にしてある。
