# 開発・進捗記録

**最新の記録（2026-10-27、外部指示書整理）:** 外部指示書の現存名・参照先を整理した。`instructions-mpvjt.md` の自己参照と原案参照、旧名案内 `instructions-mdpjsp.md` の原案参照・保全済み名を修正。`seed-prompt-mpvjt.md` は要件・本文・ファイル名を変更しない。ChatGPTプロジェクト設定欄は未反映。設定画面へのブラウザーアクセスは利用上限によって自動承認審査を完了できず拒否され、画面の読取・変更とも未実施。今回の変更をGitHubへは反映していない。 保存・独立読戻しの実績は [今回の保存照合記録](docs/SAVE-VERIFICATION-0.2.0-EXTERNAL-INSTRUCTIONS-2026-10-27.json) を参照する。

**先行記録（2026-10-27、13:18追加実行の反映）:** 2026-10-26 13:18 JSTの追加正式実行もPASS・終了コード0。07:07の先行合格とは別の原ログで確認した。移行5件合格・M2対象なし、継続16件合格と既存の未検証範囲は維持する。 [追加実行結果](docs/GUI-INTEGRATION-RECHECK-0.2.0-2026-10-26-131806.md)を参照。今回の更新は文書のみで、コード・テストコード・VSIX・ソースZIPの変更や再試験、GitHub反映、Release・Marketplace公開は行っていない。従来の同期済み記録は過去の履歴であり、今回分はGitHub未反映。今回の保存・独立読戻しの成否は [保存照合記録](docs/SAVE-VERIFICATION-0.2.0-GUI-RECHECK-2026-10-27.json)に分けて記録する。

更新: 2026-10-27（Asia/Tokyo）。対象: Markdown Preview via JS Transforms 0.2.0。

## 現在地

**0.2.0のユーザー実機受入を正式記録へ反映し、工程5・6の受入・納品整理を完了した。受入文書9件と保存照合記録1件はGitHubのmainへ同期し、10件の独立読戻しを確認した。** 2026-10-26に正式GUI統合テストの合格を確認した（Windows 11／VS Code 1.105.1／内蔵Node.js 22.19.0）。[正式結果](docs/GUI-INTEGRATION-RESULT-0.2.0-2026-10-26.md)と[先行する07:07実行分の保存・GitHub同期記録](docs/SAVE-VERIFICATION-0.2.0-GUI-FINAL-2026-10-26.json)を参照する。GitHub同期は受入試験と別に記録する。

- 移行確認M1〜M6: 5件合格、M2は「対象なし」。6件合格とは数えない。
- 継続確認16項目: 16件合格。無限ループと未完了Promiseは追試の結果で確定した。
- 受入正本: [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)。検証方法別の記録: [docs/TESTING.md](docs/TESTING.md)。結果が食い違う場合は原報告へ戻って確認する。
- 原報告: [USER_TESTING_0.2.0.md](docs/USER_TESTING_0.2.0.md)、[USER_TESTING_0.2.0-2.md](docs/USER_TESTING_0.2.0-2.md)。原本は変更していない。
- 本報告の環境: Windows 11 Pro 26H2（26300.9711）、VS Code 1.143.1、内蔵Node.js 24.21.0。追試ファイルには環境の再記載がない。

初回の無限ループ・未完了Promiseのログはどちらも「成功」であり、停止確認の証拠としては不足していた。追試1で約10秒後のタイムアウト・VS Code操作継続・前回プレビュー保持、追試2で手動中断・中断後の別変換成功を確認したというユーザー報告を受け入れた。未完了Promiseの実機での自然タイムアウトや、中断時の保持を個別に再確認したとの記載はない。報告以上の観測へ拡張しない。

## 2026-10-25の受入整理での実施内容と判断（履歴）

IDAD、最新のsources.md、現存するプロジェクト指示書・原案、開発ルートの管理・設計・受入・納品文書と2件の原報告を確認した。新しい製品不具合は確認されず、コード・設定・版番号を変更せず、VSIXとソースZIPも再作成しない。自動テストとCLI導入は既存実績を引き継ぎ、今回は再実行していない。

Node.js 24.22.1とVS Code 1.105.1内蔵Node.js 22.19.0で各24件成功という0.2.0作成時の実績は維持する。内蔵Nodeでの実行を拡張機能ホスト／GUI統合テストと読み替えない。GUI統合テストは、以前の表示接続・ソケットの制約により未合格であり、今回も未実施。

今回、既存のVSIX（36,636 bytes）とソースZIP（72,338 bytes）をDropboxから取得し、サイズ・Dropbox Content Hash、ZIP CRC、双方の実行用8モジュールの一致、0.2.0のpackage情報、identityサンプルの収録を確認した。詳しくは [docs/DELIVERY.json](docs/DELIVERY.json)。同梱文書は受入前の作成時点のスナップショットであり、最新の受入記録は開発ルートの本書・docsを参照する。

## 2026-10-25の保存・保全（履歴）

保存先は `Dropbox\www\studio\markdown-preview-via-js-transforms`。受入整理での更新は `MGMT.md`、`README.md`、`CHANGELOG.md`、`docs/TESTING.md`、`docs/ACCEPTANCE.md`、`docs/PROCESS_CHART.md`、`docs/DELIVERY.json`、`docs/DESIGN.md`、`docs/MIGRATION_0.2.0.md` の9文書。

更新版をUTF-8実ファイルとして完成・検証し、Dropboxの正規アップロード仕様が受け付ける絶対ローカルパスを使う。元ファイルそのものを同じディレクトリの未使用の `.backup-2026-10-25-NN` 名へ改名し、存在・ID・サイズを確認してから元パスへ新版を新規作成する。保存後は別の読戻しで内容・サイズ・SHA-256・Dropbox Content Hashを照合する。

今回の対象別バックアップ名と照合実績は [SAVE-VERIFICATION-0.2.0-ACCEPTANCE-2026-10-25.json](docs/SAVE-VERIFICATION-0.2.0-ACCEPTANCE-2026-10-25.json)。この記録が存在しない、または全件成功でなければ工程6の保存は未完了と扱う。過去の `docs/SAVE-VERIFICATION-0.2.0.json` は当時の配布・改名作業の履歴として保持する。

原報告、旧版受入履歴、既存配布物、ユーザー入力・変換処理、LICENSE、Git設定には変更を加えない。復旧が必要なときは現行新版を別の未使用名へ改名して保全し、元パスが空いていることを確認してから対応するバックアップを元名へ戻す。直接上書き・削除はしない。

## 2026-10-25のGitHub同期と外部指示書の状態（履歴）

索引で確認した対応先は `satsuki-thyme/markdown-preview-via-js-transforms`。同期前のmainは `863aefaa0426724c3cec4cd5ef15c0158d25b524`。2件の原報告とユーザーの別変更を含む最新ツリーを土台に、受入文書9件と保存照合記録1件だけを [コミット 9d14d54](https://github.com/satsuki-thyme/markdown-preview-via-js-transforms/commit/9d14d548e247c9e2ac54f60b83652ad1041bc7ee) で反映した。GitHubから10件を独立に読み戻し、Dropbox原本とのサイズ・バイト列・SHA-256一致を確認。対象外の102ファイルはGit blob・モードとも不変。GitHubの既存9文書はDropboxの改名済みバックアップ9件とバイト一致も確認した。

同期後の状態を記す7文書は、同じディレクトリの `.backup-2026-10-25-03` へ元そのものを改名してから更新する。旧受入保存記録は当時の履歴として内容不変で保持し、今回の同期と追加保存は [SAVE-VERIFICATION-0.2.0-GITHUB-SYNC-2026-10-25.json](docs/SAVE-VERIFICATION-0.2.0-GITHUB-SYNC-2026-10-25.json) に別記する。この記録に保存・照合の成功がない場合、追加保存は未完了と扱う。バックアップ自体はGitHubの変更対象に含めない。PR・Release・Marketplace公開は行っていない。ユーザーPC側のgit statusや未pushコミットの全体は確認していない。

指示書フォルダの現存ファイルは `Dropbox\ai\ChatGPT\project\markdown-preview-via-js-transforms\instructions-mpvjt.md` と `seed-prompt-mpvjt.md`。開発文書の参照先はこの実名へ修正した。指示書本文には旧自己参照の `instructions.md` / `seed-prompt.md` が残っている。外部指示書とChatGPTプロジェクト設定欄は今回変更しておらず、その整合は別の残課題とする。

## GUI統合テストの正式完了（2026-10-26 07:07実行の履歴）

正式な `npm.cmd run test:integration` → `test/run-integration.cjs` → `test/integration.cjs` をユーザーのWindows実機で実行した。Dropboxの原ログ `test-results/gui-integration-formal-0.2.0-20261026-070712.log` を独立取得し、テストのSHA-256、`MPJST_INTEGRATION_PASS vscode=1.105.1 node=22.19.0`、拡張ホストとランナーの終了コード0、`MPJST_FORMAL_EXIT_CODE=0` を照合した。起動側Node.js 24.21.0はユーザーの端末出力、内蔵22.19.0はPASS行に基づく。

修正は正式テストのルート取得と未取得時のassertだけ。環境変数の `C:` 表記をそのまま渡す代わりに、通常コマンドと同じ `getWorkspaceFolder(Uri.file(input))?.uri.fsPath` を渡す。製品本体・正式ランナー・版番号・VSIX・ソースZIPは変更しない。準備時のLinux／Node.js 24.22.1で既存24件合格、構文検査と引数確認3例も合格。診断版成功と正式版成功を分け、後者を今回の完了根拠にする。

診断用4ファイルは元のtest/に保持し、削除・上書き・改名・今回のGitHub同期の対象にしない。正式テストの元ファイルは `test/integration.backup-2026-10-26-01.cjs` に改名済み。文書9件も同じディレクトリの未使用の `.backup-2026-10-26-01` へ元そのものを改名してから新規保存する。詳細な合格範囲・未検証範囲・ログ中の警告は [正式結果](docs/GUI-INTEGRATION-RESULT-0.2.0-2026-10-26.md)、保存照合と限定同期の結果は [SAVE-VERIFICATION-0.2.0-GUI-FINAL-2026-10-26.json](docs/SAVE-VERIFICATION-0.2.0-GUI-FINAL-2026-10-26.json) を参照する。記録に実際の成功があることを完了条件とする。

## 13:18追加実行の反映と工程再評価（2026-10-27）

指定原ログ `test-results/gui-integration-formal-0.2.0-20261026-131806.log` を読み戻し、1,815 bytes、SHA-256 `3255ab434228bebd2f559c9eff766c19279b349edb2850301bc7bfaff66bfb4d`、Dropbox Content Hashを照合した。記録された正式テストSHA-256は現行 `test/integration.cjs` と一致し、PASS行、拡張ホスト終了コード0、ランナー終了コード0、`MPJST_FORMAL_EXIT_CODE=0` を確認した。今回ログで確認できる実行環境はWindowsパス、VS Code 1.105.1、拡張ホストNode.js 22.19.0。起動側Node.jsの版とOS詳細は今回ログにないため先行実行から転記しない。

mutexエラー、DEP0190、DEP0040、進捗記号の文字化けは残っている。正式assertと終了コードの合格とは分離し、原因特定・解消・常時無害のいずれも未確認として記録する。今回新たな失敗はログで確認されず、製品変更を行う根拠にはしない。

工程5は確認済み環境・範囲で完了を維持。工程6は既存成果物の存在・既記録ハッシュとの整合、今回の文書保存・改名保全・独立読戻し全件成功を条件に完了を維持する。今回の詳細は [追加実行結果](docs/GUI-INTEGRATION-RECHECK-0.2.0-2026-10-26-131806.md)、保存の実績は [保存照合記録](docs/SAVE-VERIFICATION-0.2.0-GUI-RECHECK-2026-10-27.json)を参照する。

## 次の工程

0.2.0は確認済みの環境・対応範囲で通常利用・保守へ移行できる。合格済みの実機試験を一律にやり直す必要はない。従来の受入文書同期に加え、正式GUI統合テストも確認済みの環境・スクリプト範囲で完了した。先行する07:07実行分の同期・読戻しは [過去の保存・同期記録](docs/SAVE-VERIFICATION-0.2.0-GUI-FINAL-2026-10-26.json) を参照する。外部指示書の参照先整理は今回実施した。後続課題はChatGPTプロジェクト設定欄への反映・保存後確認。詳細と実行用指示は [docs/PROCESS_CHART.md](docs/PROCESS_CHART.md)。M2対象なし、未検証の環境・機能を維持する。

今回分のGitHub反映はユーザー指定により未実施。必要になった時に今回の文書差分だけを別途同期する。先行する13:18実行結果の文書反映時は外部指示書・プロジェクト設定欄を変更していない。今回の外部指示書整理と設定欄の未反映は、冒頭と次節の記録に従う。

## 外部指示書の整合（2026-10-27）

IDAD、sources.md、MGMT.md、docs/PROCESS_CHART.md、README.md、docs/DESIGN.md、docs/TESTING.md、正式GUI結果、および指示書フォルダの現存3文書を確認した。正式名称・開発ルート・GitHub対応は既に整合しており、IDADとsources.mdの変更は不要と判断した。

更新対象は外部指示書 `instructions-mpvjt.md`、旧名の案内 `instructions-mdpjsp.md`、本書、`docs/PROCESS_CHART.md` の4件。原案 `seed-prompt-mpvjt.md` は自己参照の誤りがなく、要件を保持して更新対象から除外した。日付付きの過去記録・既存バックアップは変更しない。

正式GUI合格はWindows 11／VS Code 1.105.1／拡張ホストNode.js 22.19.0での正式スクリプトのassert範囲に限定する。13:18追加ログにOS詳細・起動側Node.js版の記載がないこと、描画・画像・候補選択UI等の追加検証ではないことを維持する。移行5件合格・M2対象なし、継続16件合格、mutex・DEP0190・DEP0040の原因解消未確認も変更しない。今回テストは再実行していない。

元ファイルそのものを同じディレクトリの未使用バックアップ名へ改名し、存在・元ID・サイズを確認してから、正規アップロード仕様で元名へUTF-8更新版を新規保存する。保存と独立照合の実際の結果・各バックアップ名は [保存照合記録](docs/SAVE-VERIFICATION-0.2.0-EXTERNAL-INSTRUCTIONS-2026-10-27.json) に分離する。製品コード・テストコード・入力・変換JS・既存配布物は変更しない。工程5・6の既存完了判定を、設定欄の未反映と混同しない。

ChatGPT設定欄は外部ファイル更新では自動的に書き換わらない。反映するには、対象プロジェクトの指示を編集する欄を開き、現行欄に別の変更がないか確認してから、`instructions-mpvjt.md` の全文に差し替えて保存する。再度欄を開き、自己参照 `instructions-mpvjt.md` と原案参照 `seed-prompt-mpvjt.md`、開発ルート、本文末尾まで一致していることを確認する。原案・旧名案内は指示欄へ貼らない。今回、設定画面には到達できていないため、正確なメニュー表示名・保存結果は未確認。

復旧時は更新版を別の未使用名に改名して保全し、元パスが空いていることを確認してから今回の対応バックアップを元名に戻す。上書き・削除は行わない。
