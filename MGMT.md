# 開発・進捗記録

更新: 2026-10-25（Asia/Tokyo）

## 現在地

Markdown Preview via JS Transforms 0.2.0。旧名MDprev via JSprocから表示名・拡張機能ID・コマンドID・設定ID・URIスキーム・保存キー・開発用識別子を変更した。既存の手動変換、標準プレビューのタブ再利用、失敗時の保持、Worker停止の契約は維持する。自動テストはNode.js 24.22.1とVS Code 1.105.1内蔵Node.js 22.19.0で各24件成功。配布物とCLI導入の詳細は `docs/DELIVERY.json`。

0.1.0初回1〜6と0.1.1再確認A〜Dはユーザー報告ですべてok。タブ増加への修正は旧版で受入済み。報告環境はWindows 11 Pro 26H2（26300.9711）／VS Code 1.143.1／内蔵Node.js 24.21.0。**0.2.0の実機移行M1〜M6と従来の継続確認16項目は未実施。** 合否は `docs/TESTING.md` を正本とする。

## 再開時に確認したもの

- IDAD、`Dropbox\ai\etc\sources.md`、旧プロジェクト指示書、原案、開発ルートの実ファイルと受入報告。
- 改名済み開発ルート `Dropbox\www\studio\markdown-preview-via-js-transforms` とGitHub `satsuki-thyme/markdown-preview-via-js-transforms`。mainの `ce8991ae0834ae6c6fa3f99223a254ce22cfe678` と取得した36ファイルが一致した。
- 指示書フォルダは取得時点で旧名だったため、新しい指定先へフォルダごと改名する。正本は `Dropbox\ai\ChatGPT\project\markdown-preview-via-js-transforms\instructions.md`。旧指示書名は正本への案内、原案は内容不変の `seed-prompt.md` とする。
- 旧版ユーザー報告 `docs/USER_TESTING.md` の残16行は未のまま。ユーザーの原本と日付付き評価書は変更しない。

## 判断と保全

内部識別子も一式変更するという明示依頼に従う。別IDとして導入し、旧版を無効化する。互換エイリアスや他拡張機能の内部DB操作は行わず、設定・キー割当は利用者が対応表に基づき移す。初回は現在のパスで手動選択し、新版の状態を作る。詳細は `docs/MIGRATION_0.2.0.md` と `docs/DESIGN.md`。

既存ファイルは完成・検証済みの新版を用意してから、元そのものを同じディレクトリの未使用の `.backup-2026-10-25-NN` へ改名して保全する。バックアップを検証してから元パスへ新規作成する。旧配布物、ユーザー入力、LICENSE、Git設定は変更しない。配布物にはルートの利用者用 `input.md`・`transforms/`、バックアップ、ユーザー報告・過去の照合記録を含めない。公開サンプルは `examples/` のidentityのみ。

GitHubへのpush、PR、Release、Marketplace公開は今回行わない。改名済みDropbox作業フォルダへ保存し、独立読戻しのサイズ・SHA-256・Dropboxハッシュを照合する。今回の実績は `docs/SAVE-VERIFICATION-0.2.0.json`。以前の同種記録は履歴として保持する。指示書ファイルの更新とChatGPTプロジェクト設定欄への反映は区別する。

## 次の作業

`docs/MIGRATION_0.2.0.md` に従って旧版を無効化し新版を導入。`docs/ACCEPTANCE.md` のM1〜M6と残り16項目をユーザー実機で確認し、新しい `docs/USER_TESTING_0.2.0.md` に結果を記録する。工程5は継続中。GUI統合テストは表示可能な環境でのみ実施し、未実施を合格にしない。
