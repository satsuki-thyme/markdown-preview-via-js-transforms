# GUI統合テスト正式再実行手順 0.2.0

作成: 2026-10-26（Asia/Tokyo）。状態: 正式テスト修正・再実行準備。正式GUI合格は未確定。

## 今回の変更と根拠

`test/integration.cjs` の最初の `runPair` に渡すルートだけを、環境変数のパスから `v.workspace.getWorkspaceFolder(v.Uri.file(input))?.uri.fsPath` へ変更した。取得できなければ明示的に失敗させる。既存の検証項目とPASSマーカーを維持する。診断ログの追加は取り込まない。

ユーザー報告: Windows 11、VS Code 1.105.1、内蔵Node.js 22.19.0で、ルート取得を変更した診断版が `MPJST_INTEGRATION_PASS`、終了コード0で成功した。`C:\` と `c:\` の差が原因という報告と、正式版・診断版・製品の通常コマンド経路のコードを照合した。報告受領日は本書作成日であり、実行日時を推定したものではない。

VS Code公式APIでは `Uri.fsPath` がWindowsのドライブ文字を小文字へ正規化し、`getWorkspaceFolder` が指定URIの所属ルートまたはundefinedを返すと説明されている（2026-10-26確認）。正式テストも通常コマンドと同じルート表現を使用する。

- https://code.visualstudio.com/api/references/vscode-api#Uri
- https://code.visualstudio.com/api/references/vscode-api#workspace.getWorkspaceFolder

製品本体、正式ランナー、package.json、VSIX、ユーザー入力・変換JavaScript、既存バックアップ、過去の配布物は今回の変更対象外。管理・受入文書の完了判定は正式実機結果を受領してから更新する。

## 事前検証

| 検証 | 実際の結果 | 範囲 |
|---|---|---|
| 修正版 `node --check` | 終了コード0 | 構文のみ |
| 初回runPairの引数確認 | WindowsのC:/c:差、POSIXの大小文字保持、所属ルートなしの拒否を確認 | 模擬API。変換・GUI検証開始前で停止する確認 |
| 既存自動テスト | Linux / Node.js 24.22.1で24件成功、失敗0、スキップ0、終了コード0 | `node --test --test-concurrency=1 --test-reporter=tap test/*.test.cjs`。既存製品・テストの取得コピーで実施 |
| 診断版との比較 | 診断ログ2行と追加したルート存在assert/commentを除き、root-check版と修正版の内容が一致 | バイト列からUTF-8で読んで比較。元ファイルは改変しない |
| 正式GUI統合テスト | 実機再実行待ち | 診断版成功や上記確認を正式GUI合格へ読み替えない |

修正版 `test/integration.cjs`: 3,320 bytes、SHA-256 `9c51bc2d48f767a424e06fad2a88da9cde6d4837bc8346fa5c7998c52bffd848`。

## 診断用4ファイルの扱い

以下は元の `test/` にそのまま保全し、削除・上書き・改名しない。

| ファイル | 用途 | 今後の扱い |
|---|---|---|
| `integration-diagnostic.cjs` | 初回実行結果のログ追加 | 調査履歴として保持 |
| `run-integration-diagnostic.cjs` | 上記診断版の起動 | 正式再実行には使わない |
| `integration-root-check.cjs` | ルート取得方法の修正と診断ログ | 成功報告に対応する調査資料として保持 |
| `run-integration-root-check.cjs` | 上記root-check版の起動 | 正式再実行には使わない |

`npm run test:integration` は正式な `test/run-integration.cjs` → `test/integration.cjs` を起動する。4件は `npm test` の `test/*.test.cjs` にも該当しない。今回のGitHub反映対象には含めず、後続の同期では対象ファイルを個別に指定する。`git add .` や全体同期は使わない。

## Windowsでの正式再実行

1. Dropbox同期を待つ。作業を保存してVS Codeを閉じ、WindowsのPowerShellを新しく開く。
2. 以下を実行する。前回の診断で用いた開発用依存関係が既にある前提。VSIXの再インストール・再作成は不要。テストは開発ソースを読み、OSの一時フォルダ内に専用の入力・変換JSを生成して試験する。ユーザーの入力・変換JSは使用しない。

```powershell
Set-Location -LiteralPath (Join-Path $env:USERPROFILE 'Dropbox\www\studio\markdown-preview-via-js-transforms')

$mpjstExpectedHash = '9c51bc2d48f767a424e06fad2a88da9cde6d4837bc8346fa5c7998c52bffd848'
$mpjstActualHash = (Get-FileHash -LiteralPath '.\test\integration.cjs' -Algorithm SHA256).Hash
if ($mpjstActualHash -ne $mpjstExpectedHash) {
    throw '正式テストのSHA-256が一致しません。同期状況を確認し、この時点では実行しないでください。'
}

$env:MPJST_VSCODE_VERSION = '1.105.1'
Remove-Item Env:MPJST_VSCODE_EXECUTABLE -ErrorAction SilentlyContinue
Remove-Item Env:MPJST_HEADLESS -ErrorAction SilentlyContinue
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue

$mpjstResults = Join-Path (Get-Location).Path 'test-results'
if (-not (Test-Path -LiteralPath $mpjstResults)) {
    New-Item -ItemType Directory -Path $mpjstResults | Out-Null
}
$mpjstLog = Join-Path $mpjstResults ('gui-integration-formal-0.2.0-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.log')
if (Test-Path -LiteralPath $mpjstLog) { throw '同名ログがあるため中止します。' }

node --version
npm.cmd run test:integration 2>&1 | Tee-Object -Variable mpjstOutput
$mpjstExitCode = $LASTEXITCODE
$mpjstReport = @('MPJST_FORMAL_SHA256=' + $mpjstActualHash) + @($mpjstOutput | ForEach-Object { "$_" }) + @('MPJST_FORMAL_EXIT_CODE=' + $mpjstExitCode)
$mpjstReport | Out-File -LiteralPath $mpjstLog -Encoding utf8 -NoClobber
Write-Output ('MPJST_FORMAL_EXIT_CODE=' + $mpjstExitCode)
Write-Output ('MPJST_FORMAL_LOG=' + $mpjstLog)
```

新しく開いたPowerShellだけにテスト用環境変数を設定する。終わったらこのPowerShellを閉じてよい。`test-results/` は既存のGit除外設定に含まれる。ログは既存名への上書きを拒否し、UTF-8で新規保存する。新規作成した一時ワークスペースは正式ランナーが最後に削除する既存仕様であり、診断4ファイル・バックアップの削除ではない。

3. 次の両方を確認する。

```text
MPJST_INTEGRATION_PASS vscode=1.105.1 node=22.19.0
MPJST_FORMAL_EXIT_CODE=0
```

PASS行は全assert通過後にだけ出る。終了コードも別途0であることを確認する。ウィンドウが開いたことだけ、または診断用コマンドの成功を正式合格として扱わない。バージョンが異なる、PASS行がない、終了コードが非0の場合はそのまま報告し、合格記録を更新しない。

## 結果受領後の工程

| 工程 | 前提・完了条件 | 推奨モード |
|---|---|---|
| 正式実機再実行 | 上記修正版と正式ランナー。PASS行、終了コード、対象環境、実行ログを確認 | ユーザー実機PowerShell |
| 管理・受入文書更新 | 正式結果を確認後、MGMT.md、TESTING.md、ACCEPTANCE.md、PROCESS_CHART.mdなど現在の記述を再読し必要箇所のみ整合。M2対象なしを維持 | Work・通常の実装／文書処理 |
| GitHub同期 | 最新mainとDropboxを再比較し、検証済み変更だけ反映。元ファイルの改名保全と独立読戻しを行い、コミットと対象外不変を確認 | Work・通常の実装／文書処理 |

準備時に確認したGitHub main: `e53d4fb186085b87ef8cb101f1306d87593ed715`。当時の正式integration.cjsはDropbox原本とGit blob `9b43caebdc903b33a465c0c43f2355105d9c16c4` が一致した。後続同期では最新状態を必ず再取得する。今回GitHubへの書込みは行わない。

次の報告例:

> 正式な `npm run test:integration` を実行しました。Windows 11、PASS行は `MPJST_INTEGRATION_PASS vscode=1.105.1 node=22.19.0`、終了コードは0です。ログは `<実際に表示されたMPJST_FORMAL_LOGのパス>` です。GUI統合テスト完了の文書反映と、検証済み差分だけのGitHub同期を続けてください。元ファイルの改名バックアップと保存後の独立読戻しを行い、診断4件・製品本体・VSIX・入力・変換JS・既存バックアップ・過去の配布物は変更しないでください。

未実施の結果をこの例文のまま報告しない。失敗した場合は実際の出力を渡す。正式結果を確認するまでは、GUI統合テストの完了記録と今回差分のGitHub同期を保留する。
