# 0.2.0への移行

更新: 2026-10-26（Asia/Tokyo）。「MDprev via JSproc」を **Markdown Preview via JS Transforms** へ改名し、内部識別子も一式変更した。旧IDの互換エイリアスは登録しない。旧版0.1.1からの通常の上書き更新ではなく、別IDの拡張機能として導入する。

## 受入状況

2026-10-25、0.2.0ユーザー報告と追試を正式記録へ反映した。M1・M3〜M6は合格、M2はカスタム設定・キー割当の対象なし。継続確認16項目も追試を含め合格。以下は別環境への導入にも使う移行手順として保持し、今回合格済みの試験を再度要求しない。根拠と未検証範囲は [ACCEPTANCE.md](ACCEPTANCE.md)。自動GUI統合テストは2026-10-26にWindows 11／VS Code 1.105.1／内蔵Node.js 22.19.0で正式合格した。[正式結果](GUI-INTEGRATION-RESULT-0.2.0-2026-10-26.md)の範囲で確認済みとし、M2対象なしは維持する。

## 名称と識別子の対応

| 対象 | 旧 | 新 |
|---|---|---|
| 正式名称・コマンド分類・設定見出し・出力チャンネル | MDprev via JSproc | Markdown Preview via JS Transforms |
| package名 | `mdprev-via-jsproc` | `markdown-preview-via-js-transforms` |
| 拡張機能ID | `satsuki-thyme.mdprev-via-jsproc` | `satsuki-thyme.markdown-preview-via-js-transforms` |
| 選択して実行 | `mdprevViaJsproc.selectAndRun` | `markdownPreviewViaJsTransforms.selectAndRun` |
| 再実行 | `mdprevViaJsproc.rerun` | `markdownPreviewViaJsTransforms.rerun` |
| 再表示 | `mdprevViaJsproc.reopenPreview` | `markdownPreviewViaJsTransforms.reopenPreview` |
| 中断 | `mdprevViaJsproc.cancel` | `markdownPreviewViaJsTransforms.cancel` |
| 診断ログ | `mdprevViaJsproc.showLog` | `markdownPreviewViaJsTransforms.showLog` |
| 処理フォルダ設定 | `mdprevViaJsproc.transformsFolder` | `markdownPreviewViaJsTransforms.transformsFolder` |
| 時間制限設定 | `mdprevViaJsproc.timeoutMs` | `markdownPreviewViaJsTransforms.timeoutMs` |
| URIスキーム | `mdpjsp` | `markdown-preview-via-js-transforms` |
| 仮想パス接尾辞 | `.mdpjsp-preview.md` | `.js-transforms-preview.md` |
| workspaceStateキー | `lastSuccess.v1` | `markdownPreviewViaJsTransforms.lastSuccess.v1` |
| テスト用環境変数 | `MDPJSP_VSCODE_VERSION`, `MDPJSP_VSCODE_EXECUTABLE`, `MDPJSP_TEST_ROOT`, `MDPJSP_HEADLESS` | 同じ末尾を持つ `MPJST_…` |
| 統合テスト完了マーカー | `MDPJSP_INTEGRATION_PASS` | `MPJST_INTEGRATION_PASS` |

Publisher `satsuki-thyme`、MITライセンス、VS Code標準エディターIDは維持する。名称のJS Transformsは変換処理を意味し、JSXやTypeScriptのコンパイル機能を追加するものではない。

## 既存利用者の手順

1. 旧版で開いたプレビューを閉じる。入力・処理ファイルは残す。必要なら旧設定値とキー割当を確認する。
2. 拡張機能画面で `@id:satsuki-thyme.mdprev-via-jsproc` を検索し、旧版を**無効化**する。アンインストールや旧データの削除は不要。新版を使うプロファイル・ワークスペースで旧版が動かない状態にする。
3. `Extensions: Install from VSIX...` から `dist/markdown-preview-via-js-transforms-0.2.0.vsix` を導入し、「Developer: Reload Window」。拡張機能画面で新版0.2.0のIDを確認する。
4. カスタム設定があれば、下の手順で新設定へ同じ値を移す。初期値のままなら `transforms` と10000msなので変更不要。
5. キー割当があれば上表の新コマンドへ付け替える。旧割当を同じキーで残すと競合するため、新版を使うプロファイルの有効な割当は新版に揃える。
6. 利用ワークスペースの入力を開き、`Markdown Preview via JS Transforms: 変換処理を選択して実行` で処理を選ぶ。初回は旧版の「前回の組」を引き継がない。開発フォルダを改名していた場合も、現在のパスで選び直す。
7. [ACCEPTANCE.md](ACCEPTANCE.md) のM1〜M6、その後に継続確認16項目を確認する。

設定・ショートカットを編集する前に、対象の実ファイル（ユーザー／プロファイルの `settings.json`・`keybindings.json`、フォルダの `.vscode/settings.json`、複数ルートの `.code-workspace` など）の所在とスコープを確認する。元そのものを同じフォルダの未使用の `settings.backup-YYYY-MM-DD-NN.json` 等へ改名し、元パスへ更新版を作成してから再読み込みする。設定UIを使う場合も、背後の既存設定ファイルを変更する前にこの保全を行う。コピーだけや直接上書きで代用しない。

設定値は旧キーを残したまま新キーにも同じ値を追加できる。フォルダ別・ワークスペース別・ユーザー別の適用範囲を変えない。キー割当では、`key`・`when`・`args` を保ち、`command` の旧IDを対応する新IDへ変える。旧版を再び使う際は保存した設定に基づいて戻す。これらの編集を拡張機能が自動で行うことはない。

## 状態と互換性

新版は別の拡張機能ID・保存キーを使う。旧版の結果と前回の組は自動移行せず、新版の初回には成功結果がない旨を案内する。最初の手動成功後は新版自身の結果を保持・復元する。旧版の保存領域やVS Code内部DBの書換え、キャッシュを作るための自動実行は行わない。旧版のデータは残すが、ワークスペースのパス変更やVS Code側の状態管理により、旧版から再利用できることまでは保証しない。

旧URIを新URIへ転送しない。旧プレビューを開いたまま旧版を無効化すると、旧スキームを扱う拡張機能がなくなり表示できないため、導入前に閉じる。同時に有効化すると表示名やコマンドが並ぶので、旧版の無効化を確認する。

問題時は新プレビューを閉じ、新版を無効化し、旧版0.1.1を有効化して再読み込みする。必要な設定・キー割当を保全済みファイルから復元する際も、その時点のファイルを改名保全してから行う。両版の配布物・元データを削除しない。

## 参照先と履歴

- リポジトリ: `satsuki-thyme/markdown-preview-via-js-transforms`
- 開発ルート: `Dropbox\www\studio\markdown-preview-via-js-transforms`
- 指示書: `Dropbox\ai\ChatGPT\project\markdown-preview-via-js-transforms\instructions-mpvjt.md`
- 原案: 同フォルダの `seed-prompt-mpvjt.md`（現存ファイル名。今回内容変更なし）
- 索引: `Dropbox\ai\etc\sources.md`

旧ユーザー報告、日付付き評価書、過去の保存照合記録、旧配布物、改名バックアップ内の旧名称は歴史的事実として残す。現行の実行コードは旧IDを登録しない。現存する `instructions-mpvjt.md` の本文には、自己参照として `instructions.md` / `seed-prompt.md` が残っている。外部指示書とChatGPTプロジェクト設定欄の整合は後続課題とし、今回更新済みとは扱わない。旧指示書名 `instructions-mdpjsp.md` も保全する。

方針の根拠: [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest) に従いpublisherとnameを組み合わせたIDが変わる。[ExtensionContext](https://code.visualstudio.com/api/references/vscode-api#ExtensionContext) と [Data Storage](https://code.visualstudio.com/api/extension-capabilities/common-capabilities) の公開APIに基づき、他の拡張機能の私有状態に依存しない。別ID間の状態を自動移行しないことは本製品の設計判断である。
