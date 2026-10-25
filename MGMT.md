# 開発・進捗記録

更新: 2026-10-25（Asia/Tokyo）。対象: Markdown Preview via JS Transforms 0.2.0。

## 現在地

**0.2.0のユーザー実機受入を正式記録へ反映し、工程5・6の受入・納品整理を完了した。受入文書9件と保存照合記録1件はGitHubのmainへ同期し、10件の独立読戻しを確認した。** GUI統合テストは未実施のまま。GitHub同期は受入試験と別に記録する。

- 移行確認M1〜M6: 5件合格、M2は「対象なし」。6件合格とは数えない。
- 継続確認16項目: 16件合格。無限ループと未完了Promiseは追試の結果で確定した。
- 受入正本: [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)。検証方法別の記録: [docs/TESTING.md](docs/TESTING.md)。結果が食い違う場合は原報告へ戻って確認する。
- 原報告: [USER_TESTING_0.2.0.md](docs/USER_TESTING_0.2.0.md)、[USER_TESTING_0.2.0-2.md](docs/USER_TESTING_0.2.0-2.md)。原本は変更していない。
- 本報告の環境: Windows 11 Pro 26H2（26300.9711）、VS Code 1.143.1、内蔵Node.js 24.21.0。追試ファイルには環境の再記載がない。

初回の無限ループ・未完了Promiseのログはどちらも「成功」であり、停止確認の証拠としては不足していた。追試1で約10秒後のタイムアウト・VS Code操作継続・前回プレビュー保持、追試2で手動中断・中断後の別変換成功を確認したというユーザー報告を受け入れた。未完了Promiseの実機での自然タイムアウトや、中断時の保持を個別に再確認したとの記載はない。報告以上の観測へ拡張しない。

## 受入整理での実施内容と判断

IDAD、最新のsources.md、現存するプロジェクト指示書・原案、開発ルートの管理・設計・受入・納品文書と2件の原報告を確認した。新しい製品不具合は確認されず、コード・設定・版番号を変更せず、VSIXとソースZIPも再作成しない。自動テストとCLI導入は既存実績を引き継ぎ、今回は再実行していない。

Node.js 24.22.1とVS Code 1.105.1内蔵Node.js 22.19.0で各24件成功という0.2.0作成時の実績は維持する。内蔵Nodeでの実行を拡張機能ホスト／GUI統合テストと読み替えない。GUI統合テストは、以前の表示接続・ソケットの制約により未合格であり、今回も未実施。

今回、既存のVSIX（36,636 bytes）とソースZIP（72,338 bytes）をDropboxから取得し、サイズ・Dropbox Content Hash、ZIP CRC、双方の実行用8モジュールの一致、0.2.0のpackage情報、identityサンプルの収録を確認した。詳しくは [docs/DELIVERY.json](docs/DELIVERY.json)。同梱文書は受入前の作成時点のスナップショットであり、最新の受入記録は開発ルートの本書・docsを参照する。

## 保存・保全

保存先は `Dropbox\www\studio\markdown-preview-via-js-transforms`。受入整理での更新は `MGMT.md`、`README.md`、`CHANGELOG.md`、`docs/TESTING.md`、`docs/ACCEPTANCE.md`、`docs/PROCESS_CHART.md`、`docs/DELIVERY.json`、`docs/DESIGN.md`、`docs/MIGRATION_0.2.0.md` の9文書。

更新版をUTF-8実ファイルとして完成・検証し、Dropboxの正規アップロード仕様が受け付ける絶対ローカルパスを使う。元ファイルそのものを同じディレクトリの未使用の `.backup-2026-10-25-NN` 名へ改名し、存在・ID・サイズを確認してから元パスへ新版を新規作成する。保存後は別の読戻しで内容・サイズ・SHA-256・Dropbox Content Hashを照合する。

今回の対象別バックアップ名と照合実績は [SAVE-VERIFICATION-0.2.0-ACCEPTANCE-2026-10-25.json](docs/SAVE-VERIFICATION-0.2.0-ACCEPTANCE-2026-10-25.json)。この記録が存在しない、または全件成功でなければ工程6の保存は未完了と扱う。過去の `docs/SAVE-VERIFICATION-0.2.0.json` は当時の配布・改名作業の履歴として保持する。

原報告、旧版受入履歴、既存配布物、ユーザー入力・変換処理、LICENSE、Git設定には変更を加えない。復旧が必要なときは現行新版を別の未使用名へ改名して保全し、元パスが空いていることを確認してから対応するバックアップを元名へ戻す。直接上書き・削除はしない。

## GitHubと外部指示書の状態

索引で確認した対応先は `satsuki-thyme/markdown-preview-via-js-transforms`。同期前のmainは `863aefaa0426724c3cec4cd5ef15c0158d25b524`。2件の原報告とユーザーの別変更を含む最新ツリーを土台に、受入文書9件と保存照合記録1件だけを [コミット 9d14d54](https://github.com/satsuki-thyme/markdown-preview-via-js-transforms/commit/9d14d548e247c9e2ac54f60b83652ad1041bc7ee) で反映した。GitHubから10件を独立に読み戻し、Dropbox原本とのサイズ・バイト列・SHA-256一致を確認。対象外の102ファイルはGit blob・モードとも不変。GitHubの既存9文書はDropboxの改名済みバックアップ9件とバイト一致も確認した。

同期後の状態を記す7文書は、同じディレクトリの `.backup-2026-10-25-03` へ元そのものを改名してから更新する。旧受入保存記録は当時の履歴として内容不変で保持し、今回の同期と追加保存は [SAVE-VERIFICATION-0.2.0-GITHUB-SYNC-2026-10-25.json](docs/SAVE-VERIFICATION-0.2.0-GITHUB-SYNC-2026-10-25.json) に別記する。この記録に保存・照合の成功がない場合、追加保存は未完了と扱う。バックアップ自体はGitHubの変更対象に含めない。PR・Release・Marketplace公開は行っていない。ユーザーPC側のgit statusや未pushコミットの全体は確認していない。

指示書フォルダの現存ファイルは `Dropbox\ai\ChatGPT\project\markdown-preview-via-js-transforms\instructions-mpvjt.md` と `seed-prompt-mpvjt.md`。開発文書の参照先はこの実名へ修正した。指示書本文には旧自己参照の `instructions.md` / `seed-prompt.md` が残っている。外部指示書とChatGPTプロジェクト設定欄は今回変更しておらず、その整合は別の残課題とする。

## 次の工程

0.2.0は確認済みの環境・対応範囲で通常利用・保守へ移行できる。合格済みの実機試験を一律にやり直す必要はない。受入文書のGitHub同期は完了。後続作業は、表示可能な環境でのGUI統合テストと、外部指示書の参照先・プロジェクト設定の整合。詳細と実行用指示は [docs/PROCESS_CHART.md](docs/PROCESS_CHART.md)。GUI統合未実施やM2対象なしを合格へ変更しない。
