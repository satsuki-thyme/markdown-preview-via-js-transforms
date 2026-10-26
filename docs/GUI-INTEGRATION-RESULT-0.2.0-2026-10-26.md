# 正式GUI統合テスト結果 0.2.0

記録日: 2026-10-26（Asia/Tokyo）。**判定: 合格。**

正式な `npm.cmd run test:integration` が `test/run-integration.cjs` → `test/integration.cjs` を実行し、全既存assert通過後のPASS行と終了コード0を確認した。ユーザーの端末出力と、Dropboxに保存された原ログを独立に取得して照合した結果に基づく。診断版の成功を正式版の成功へ読み替えていない。AIがWindows実機を直接操作した試験ではない。

## 環境と根拠

| 項目 | 確認結果・出典 |
|---|---|
| 対象 | Markdown Preview via JS Transforms 0.2.0の開発ソース |
| OS | Windows 11（ユーザー報告。今回のOS版・ビルド番号の追加情報なし） |
| VS Code | 1.105.1（ランナーの版確認とPASS行） |
| 起動側Node.js | 24.21.0（ユーザーが提示した `node --version` の出力。保存ログにはこの行を含まない） |
| 拡張ホスト内Node.js | 22.19.0（PASS行） |
| 実行時刻 | 2026-10-26 07:07頃 JST。VS CodeログのUTC時刻22:07:18.150〜22:07:25.116はJSTで07:07:18.150〜07:07:25.116 |
| 正式テスト | `test/integration.cjs`、3,320 bytes |
| テストSHA-256 | `9c51bc2d48f767a424e06fad2a88da9cde6d4837bc8346fa5c7998c52bffd848` |
| 原ログ | 開発ルートの `test-results/gui-integration-formal-0.2.0-20261026-070712.log` |
| 原ログサイズ | 1,812 bytes。UTF-8の実バイト列をそのまま取得・保全 |
| 原ログSHA-256 | `f1fc0c2ebceaedcf48c3de3c2e451b5c9700988fd174deb53199684111045aa1` |
| 原ログDropbox Content Hash | `ef6805f0f671979e22eca68f8bfc1147b435c6a5be6988f01b5808f7fa6e5352` |
| 完了判定 | PASS行、拡張ホスト終了コード0、ランナー終了コード0、PowerShellで取得した終了コード0 |

原ログには正式テストのSHA-256も記録され、Dropboxの現行 `test/integration.cjs` と一致した。原ログは変更せず、既存のGit除外対象 `test-results/` に保持する。GitHubにはこの結果要約とハッシュを反映し、端末の絶対パスを含む生ログは追加しない。

確認した主要出力:

```text
> node test/run-integration.cjs
MPJST_INTEGRATION_PASS vscode=1.105.1 node=22.19.0
Exit code:   0
MPJST_FORMAL_EXIT_CODE=0
```

## 修正内容

正式テストは初回のrunPairで、環境変数 `MPJST_TEST_ROOT` のルートをそのまま渡していた。Windowsのドライブ表記が環境変数では `C:`、VS Code側の `Uri.fsPath` では `c:` となり、製品側のワークスペース一致確認で失敗した。通常の選択コマンドは既にVS Codeが返す所属ルートを使う。

そのため `test/integration.cjs` だけを次のように修正した。

```javascript
// Use the same workspace root as normal commands, including Windows drive casing.
const workspaceRoot = v.workspace.getWorkspaceFolder(v.Uri.file(input))?.uri.fsPath;
assert.ok(workspaceRoot, 'Input must belong to the test workspace');
const first = await api.controller.runPair({ root: workspaceRoot, input, script });
```

差分は4行追加・1行削除。診断出力を追加せず、既存の検証項目・PASS行を維持した。正式ランナー、製品コード、設定、版番号は変更していない。VSIX・ソースZIPも再作成していない。ソースZIPに収録されたテストは修正前の履歴であり、再実行には開発ルートの正式テストを使う。

元テストそのものは同じディレクトリの `test/integration.backup-2026-10-26-01.cjs` へ改名して保全済み。旧GitHubのtest/integration.cjsのGit blob `9b43caebdc903b33a465c0c43f2355105d9c16c4` はこのバックアップと一致する。準備時の保存根拠は [GUI-PREP照合記録（公開用）](SAVE-VERIFICATION-0.2.0-GUI-PREP-PUBLIC-2026-10-26.json)。

## 今回の正式スクリプトで確認した範囲

| 検証 | 結果 |
|---|---|
| 拡張機能のactivateと初回変換 | 成功 |
| 生成仮想文書の言語IDと日本語環境での絵文字を含む初期本文 | `markdown` と `# First 🌿` に一致 |
| 標準Markdownプレビューのタブ | 対象URIと標準エディター種別のタブが1件 |
| 入力・JSの保存後、変換なしで再表示 | 元の本文を維持 |
| 手動再実行 | 保存済み入力と変更済みJSの結果へ更新 |
| 再実行の繰返し | 3回の追加再実行でも同じタブを再利用、タブ数1件 |
| 入力側へ移動して再表示 | 同じプレビュータブを再利用 |
| プレビューを閉じて再表示 | プレビュータブが1件 |
| 同期無限ループの中断 | 中断コマンドで `cancelled`、前回の生成本文を保持 |

GUIを起動した拡張ホスト内のAPI・文書・タブに対するassertである。画面のピクセルやWebview DOM、画像の実レンダリングを自動検査したものではない。このスクリプトはテスト専用ワークスペースで信頼確認を無効化して起動し、初回はテスト用runPairを使うため、候補選択UI、Restricted Mode、複数ルート、再起動後復元、自然タイムアウト、未完了Promiseなどを今回追加確認したとは扱わない。それらの既存自動テスト・手動実機受入の根拠は [TESTING.md](TESTING.md) と [ACCEPTANCE.md](ACCEPTANCE.md) に維持する。

## 併記する検証とログの留保

- 準備時にLinux／Node.js 24.22.1で既存自動テスト24件が合格（失敗0、スキップ0、終了コード0、約5.784秒）。今回の正式結果受領後に同じ単体試験を繰り返したとは扱わない。
- 修正版の構文検査が成功。WindowsとPOSIXのルート引数、所属ルートなしの拒否の3例も成功。模擬APIによる確認で、正式GUI結果とは別。
- 原ログには `DEP0190`、`DEP0040`、`Error: Error mutex already exists` と進捗記号の文字化けがある。後続の拡張ホスト・正式assert・終了コードが成功した事実を採用する。これらの警告・メッセージの原因が修正済み、常に無害、再発しないとは断定しない。今回の製品変更は行わない。
- 既存の移行確認5件合格・M2対象なし、継続確認16項目合格は変更しない。今回のGUI合格を全対応バージョン・全機能の実証へ広げない。

## 診断用4ファイルと準備記録

`test/integration-diagnostic.cjs`、`test/run-integration-diagnostic.cjs`、`test/integration-root-check.cjs`、`test/run-integration-root-check.cjs` は元の場所に保持する。削除・上書き・改名せず、今回のGitHub変更対象にも含めない。正式実行はこの4件を参照しない。

[GUI-INTEGRATION-RERUN-0.2.0-2026-10-26.md](GUI-INTEGRATION-RERUN-0.2.0-2026-10-26.md) と開発ルートの原GUI-PREP照合記録は再実行前の履歴として内容を維持する。GitHubには、原記録のSHA-256を明記し、ストレージ識別子・絶対パス・プロジェクト外の参照情報を除いた[公開用照合記録](SAVE-VERIFICATION-0.2.0-GUI-PREP-PUBLIC-2026-10-26.json)を別ファイルとして同期する。原記録は削除・改名・上書きしない。その「再実行待ち」は準備時点の状態であり、現在の完了判定は本書に従う。手順内の再実行コードは、将来必要になった場合に利用できる。

## 保存・同期と次の工程

管理・受入文書の更新は本正式結果の確認後に行う。文書の元ファイルを同じディレクトリで改名保全してから更新版を新規保存し、Dropboxの独立読戻しで内容・サイズ・SHA-256・Content Hashを照合する。GitHubは最新mainの既存変更を保持し、今回の正式テストと関連文書・記録だけを反映する。

実際の保存・コミット・読戻し結果と対象外ファイルの不変確認は [SAVE-VERIFICATION-0.2.0-GUI-FINAL-2026-10-26.json](SAVE-VERIFICATION-0.2.0-GUI-FINAL-2026-10-26.json) を参照する。記録に成功がない作業を完了扱いにしない。製品本体・VSIX・ユーザーの入力や変換JS・既存バックアップ・過去の配布物・原ログは今回の更新対象外。

次は通常利用・保守へ進める。別の残課題は、外部指示書の自己参照とChatGPTプロジェクト設定欄の整合である。今回の正式GUI試験を繰り返す必要はない。
