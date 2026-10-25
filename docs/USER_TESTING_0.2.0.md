# ユーザーテスト 0.2.0

## 実施環境

### OS

エディション	Windows 11 Pro
バージョン	26H2
インストール日	‎2024-‎11-‎22
OS ビルド	26300.9711
エクスペリエンス	Windows 機能エクスペリエンス パック 1000.26100.372.0

### VS Code

Version: 1.143.1 (user setup)
Commit: e646868227c3e3a9e3f24277c8c7220be42c0be7
Date: 2026-10-22T17:23:22Z
Electron: 43.7.7
ElectronBuildId: 15743441
Chromium: 150.0.7871.250
Node.js: 24.21.0
V8: 15.0.245.31-electron.0
@github/copilot: 1.0.100-1
@github/copilot-sdk: 1.0.23-preview.5
OS: Windows_NT x64 10.0.26300

## 0.2.0への移行確認

| # | 結果 |
|---|---|
| M1 | ok |
| M2 | 対象なし |
| M3 | ok |
| M4 | ok |
| M5 | ok |
| M6 | ok |

## 続けて確認する項目

| 項目 | 結果 | 備考 |
|---|---|---|
| 4拡張子 | ok |  |
| 未保存入力 | ok |  |
| 未保存JS | ok |  |
| 複数処理 | ok |  |
| 候補なし | ok |  |
| キャンセル | ok |  |
| 初回失敗 | ok |  |
| エラー保持 | ok |  |
| 対象消失 | ok |  |
| 無限ループ | ok | 10秒で何かが起こったと認識できなかった => log 1 |
| 未完了Promise | ? | 実行して異変を感じない => log 2 |
| 連打 | ok | log 3 |
| 未信頼 | ok |  |
| 複数ルート | ok |
| 画像・リンク | ok |  |
| 状態保持 | ok |  |

### log 1

``` log
[2026-10-24T23:37:50.762Z] 実行 {"root":"c:\\Users\\camellia\\Dropbox\\www\\studio\\markdown-preview-via-js-transforms","input":"c:\\Users\\camellia\\Dropbox\\www\\studio\\markdown-preview-via-js-transforms\\input.md","script":"c:\\Users\\camellia\\Dropbox\\www\\studio\\markdown-preview-via-js-transforms\\transforms\\identity copy.cjs"} / VS Code 1.143.1 / Node 24.21.0 / 10000ms
成功: 308 bytes
```

### log 2

``` log
[2026-10-24T23:45:19.885Z] 実行 {"root":"c:\\Users\\camellia\\Dropbox\\www\\studio\\markdown-preview-via-js-transforms","input":"c:\\Users\\camellia\\Dropbox\\www\\studio\\markdown-preview-via-js-transforms\\input.md","script":"c:\\Users\\camellia\\Dropbox\\www\\studio\\markdown-preview-via-js-transforms\\transforms\\identity copy 2.cjs"} / VS Code 1.143.1 / Node 24.21.0 / 10000ms
成功: 305 bytes
```

### log 3

``` log
[2026-10-24T23:49:19.870Z] {"root":"c:\\Users\\camellia\\Dropbox\\www\\studio\\markdown-preview-via-js-transforms","input":"c:\\Users\\camellia\\Dropbox\\www\\studio\\markdown-preview-via-js-transforms\\input.md","script":"c:\\Users\\camellia\\Dropbox\\www\\studio\\markdown-preview-via-js-transforms\\transforms\\identity copy 3.cjs"}
Error: 変換が制限時間 10000 ms を超えたため停止しました。
	at fault (c:\Users\camellia\.vscode\extensions\satsuki-thyme.markdown-preview-via-js-transforms-0.2.0\src\runner.cjs:5:48)
	at Timeout.<anonymous> (c:\Users\camellia\.vscode\extensions\satsuki-thyme.markdown-preview-via-js-transforms-0.2.0\src\runner.cjs:39:50)
	at listOnTimeout (node:internal/timers:685:17)
	at process.processTimers (node:internal/timers:618:7)
```
