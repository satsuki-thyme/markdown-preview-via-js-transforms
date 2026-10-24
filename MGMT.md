# 開発・進捗記録

更新: 2026-10-24（Asia/Tokyo）

## 現在地

0.1.0の初回ユーザーテスト1〜6はすべてok。4番の「新しいタブが開いた」へ対応した0.1.1を作成。標準Markdown Previewを既存タブで再利用するよう表示経路を変更した。自動テスト22件を2ランタイムで確認。0.1.1の実機再確認A〜Dと、継続確認16項目は未実施。合否・数値は `docs/TESTING.md` を正本とする。

## 開始時に確認したもの

- 添付の最新版 `seed-prompt.md`。
- `Dropbox/ai/development-and-operations-model/idad-v1.md` と `Dropbox/ai/etc/sources.md`。
- 開発ルート直下には `LICENSE` と `.git` のみ。README、MGMT、既存実装・テストは存在しなかった。
- `.git/config` から `https://github.com/satsuki-thyme/MDprev-via-JSproc` / `main` を確認。GitHub側は初期コミット `fb1988c`、LICENSEのみ。
- LICENSEはMIT、Copyright (c) 2026 SATSUKI Thyme。内容・ライセンスは変更しない。
- 受渡し手順 `/references/chatgpt-file-handoff-to-dropbox.md` を取得。現在のupload仕様は絶対ローカルパスを正式に受け付ける。
- 今回は `docs/USER_TESTING.md` のユーザー記入版を取得し、対象ソース・文書が前回納品物と一致することを確認した。ユーザー報告原本は変更しない。

## 実装上の判断

読み取り専用の仮想FSとVS Code標準Markdown Preview。0.1.1では `vscode.openWith` と標準のカスタムエディターを使い、URIで既存タブを再利用する。毎回新しいWorker。入力はエディターの最新内容、JavaScriptは保存済み内容。前回の組は成功コミット時のみ更新。競合は追加実行を断る。最後の成功結果をVS Codeワークスペース状態へ保存。具体的なAPI・限界は `docs/DESIGN.md`。

入力変換の用途固有コードは作成せず、公開サンプルはそのまま返す `identity.cjs` のみ。異常系はテストの一時ファイルとして生成。

## 保全と公開範囲

作業対象はこの開発ルート。既存LICENSEやGit設定は変更しない。変更候補を別領域で作成・検証した後、旧実ファイルを同じディレクトリの未使用の `.backup-2026-10-24-NN` へ改名して保全し、新版を配置する。バックアップはGit追跡・VSIXの対象外。0.1.0のVSIX・ソースZIPとユーザー報告原本は保持する。

GitHubへのpush、PR、Release、Marketplace公開は行っていない。Dropbox上の作業フォルダへ配置する。成果物のハッシュは `docs/DELIVERY.json`、独立読戻しの実績とバックアップ対応は `docs/SAVE-VERIFICATION-0.1.1.json` を参照。`docs/SAVE-VERIFICATION.json` は0.1.0の保存実績として残す。

## 次の作業

`docs/ACCEPTANCE.md` の0.1.1再確認A〜Dをユーザー実機で行い、タブ増加の改善を確認する。その後、未実施16項目を確認する。0.1.0で確認済みの基礎経路を作り直さず、工程5の残項目から継続する。今回の報告評価は `docs/USER_TESTING_REVIEW-2026-10-24.md`。
