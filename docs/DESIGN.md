# 設計記録 0.1.0

日付: 2026-10-24（Asia/Tokyo）。添付 `seed-prompt.md`、プロジェクト指示、IDAD原文を参照。現在の実装と判断は本書へ記録する。

## 方式選定

| 候補 | 手動更新 | ファイルの残存 | リンク・画像 | 判断 |
|---|---|---|---|---|
| TextDocumentContentProviderのみ | キャッシュと変更通知で可能 | なし | バイナリ資源の提供が別途必要 | テキスト専用なら単純だが画像連携に不足 |
| 読み取り専用FileSystemProvider | 結果キャッシュと変更通知で可能 | なし | 元ファイルを読み取り専用で代理読込可能 | 採用。標準プレビューの制約は残る |
| 利用ワークスペース内に実ファイル | 成功時書込で可能 | あり | 通常の相対リンク | 原案の非汚染を優先し不採用 |
| ワークスペース外の一時ファイル | 成功時書込で可能 | 一時領域 | 基準パスが変わる | 相対リンク補正・後始末が増えるため不採用 |
| 独自レンダラー | 可能 | 任意 | 独自管理 | 初期要件の対象外 |

公開VS Code APIの `registerFileSystemProvider` と、内蔵Markdown拡張の `markdown.showLockedPreviewToSide` を用いる。独自Webview・Markdownレンダラー・自動変換イベントはない。標準拡張側のコマンド実装がURIを受け付け、ロック状態で開くことを公式ソースで確認した。VS Code 1.105.1配布物にも当該コマンドが存在する。

**工程1の実画面検証は未完了。** 小規模プローブを作成してVS Code 1.105.1を起動したが、実行環境が画面接続・必要なソケットを提供できず停止した。headlessでもGTKの表示接続が必要だった。API資料・標準拡張のソース確認と、模擬APIでの提供・更新試験を根拠に実装を進めた。標準プレビューの表示、ファイル変更イベントによる実エディター更新、リンク表示の受入は実機で行う。

## モジュール

| ファイル | 役割 |
|---|---|
| `src/extension.cjs` | コマンド、FS Provider、診断出力の登録と破棄 |
| `src/controller.cjs` | 対象決定、信頼確認、入力の取得、排他、前回の組、状態保存 |
| `src/paths.cjs` | 拡張子、候補列挙、実パスとルートの確認 |
| `src/runner.cjs` | Worker起動、制限時間・取消、終了待機、ログ上限 |
| `src/worker.cjs` | 保存済みモジュールのimport、呼出し、出力検証 |
| `src/preview.cjs` | 結果キャッシュ、変更通知、読み取り専用の資源読込 |

本番APIはコマンドだけ。テスト用のcontroller参照はExtensionModeがProductionでないときだけ返す。

## 実行契約と時点

1. コマンド入口から対象選択・表示完了まで1件に排他する。追加要求は待ち行列に入れず案内して終了する。
2. 選択前のアクティブ入力URIを固定し、入力の所属ルートに設定されたフォルダの直下を列挙する。
3. 選択後、入力・処理の存在、拡張子、実パスがルート内か、Workspace Trustを確認する。
4. `openTextDocument(inputUri).getText()` でその時点の未保存編集を含めて取得する。入力自体は保存しない。
5. 新しいWorkerに `script`, `text`, `filePath` を渡す。`import(fileURL)` で保存済み処理を読み込み、defaultの関数をawaitする。
6. CommonJSはdynamic importのdefaultが `module.exports` に当たる。ESMは `export default`。Workerを毎回破棄するため、CJS/ESMの依存モジュールのキャッシュも次回へ持ち越さない。
7. 戻り値が文字列か、UTF-8換算16 MiB以下かを検証する。空文字列は成功である。
8. 成否にかかわらず `await worker.terminate()` でWorkerの実終了を確認する。処理が返った後の残留タイマーも終了する。
9. 取消を確認し、コミット区間へ入る。この区間では実行処理は終了済みなので新しい中断は受け付けない。
10. `workspaceState.update('lastSuccess.v1', {pair, markdown, time})` 成功後にメモリー結果と前回の組を差し替える。状態保存失敗では前回結果を維持する。
11. `onDidChangeFile` を通知し、標準プレビューを開く。プレビュー表示だけが失敗した場合は「変換成功・表示失敗」を明示し、結果再表示へ案内する。

取消と時間切れはWorkerの実停止を待つ。結果を返すPromiseだけ放置して終了扱いにしない。ネイティブ呼出し・外部子プロセスまでの強制終了保証は提供しない。

## 前回の記録と結果

- `lastSuccess.v1` は入力絶対パス、JavaScript絶対パス、所属ルート、Markdown、時刻を1件保存する。入力本文は結果と同じ場合を除き別には保存しない。
- 一覧キャンセル、失敗、停止、候補なしは前回の組を変えない。
- 再実行時は現在のアクティブエディターを参照しない。ルート構成変更や対象消失は明示的に失敗する。
- 再起動は最後の成功結果を復元するだけ。importも変換も走らない。
- 同じ入力の仮想URIは `<入力の絶対URIパス>.mdpjsp-preview.md`、schemeは `mdpjsp`。
- 入力が違う場合の旧スナップショットはメモリーに保持する。永続復元は最後の1件に限定する。

## 資源と安全性

FS Providerは書込み、改名、削除、フォルダ作成をすべて拒否する。キャッシュにないURIは同じパスのローカルファイルへ変換し、現在のワークスペース内か、symlink解決後も内部かを検査して読む。フォルダ外への画像アクセスは標準Markdownプレビューの `localResourceRoots` にも制約される。

この代理読込は相対リンク資源用であり、変換の契機ではない。`watch()` は空のDisposableで、入力やJavaScriptの変更監視・再実行は一切登録しない。出力への変更通知は成功コミット時だけである。

`capabilities.untrustedWorkspaces.supported = limited` と実行直前の `workspace.isTrusted` の両方を使う。キャッシュ再表示は信頼を要求しない。`extensionKind: ui`、`file:` 入力のみを許可し、RemoteとWebは対象外。Workerは同じプロセス内の別スレッドであって、悪意ある任意コードに対する境界ではない。

## 探索・npm・エラー

- `transformsFolder`: resource設定、初期値 `transforms`。相対パスだけ。設定変更は次回選択に適用。記録済み組の再実行はその組を保持する。
- 直下の `.js`, `.cjs`, `.mjs` を名前順で列挙。所定のバックアップを除外する。サブフォルダは補助コード置場。
- npmはユーザー側の `node_modules` からNode標準規則で解決。拡張機能には実行依存パッケージなし。CWDは変更しない。
- `timeoutMs`: 初期値10000、100〜300000。V8旧世代ヒープ256 MiB、ログ転送64 KiB、結果16 MiB。すべてセキュリティ保証ではなく運用上の限界。
- エラー通知に対象パス、出力チャンネルに例外スタックと実行環境を残す。入力本文を診断ログへ自動転記しない。変換自身のconsole出力は利用者の責任で扱う。

## 公式資料（2026-10-24確認）

- [VS Code FileSystemProvider API](https://code.visualstudio.com/api/references/vscode-api#FileSystemProvider)
- [Virtual Documents](https://code.visualstudio.com/api/extension-guides/virtual-documents)
- [Workspace Trust](https://code.visualstudio.com/api/extension-guides/workspace-trust)
- [標準Markdownプレビューのコマンド実装](https://github.com/microsoft/vscode/blob/main/extensions/markdown-language-features/src/commands/showPreview.ts)
- [標準Markdown資源のアクセス範囲](https://github.com/microsoft/vscode/blob/main/extensions/markdown-language-features/src/util/resources.ts)
- [Node Worker threads / terminate](https://nodejs.org/api/worker_threads.html#workerterminate)
- [VSIXのパッケージ化](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

上記に独自の仕様保証を付け足さず、画面で未検証の箇所を TESTING.md に分離する。
