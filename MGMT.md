# 開発・進捗記録

更新: 2026-10-24（Asia/Tokyo）

## 現在地

0.1.0のソースを実装。自動テストとパッケージ検証を実施し、実機受入前版を提供する。標準プレビューの実画面確認とWindowsでの導入・操作は未完了。合否・数値は `docs/TESTING.md` を正本とする。

## 開始時に確認したもの

- 添付の最新版 `seed-prompt.md`。
- `Dropbox/ai/development-and-operations-model/idad-v1.md` と `Dropbox/ai/etc/sources.md`。
- 開発ルート直下には `LICENSE` と `.git` のみ。README、MGMT、既存実装・テストは存在しなかった。
- `.git/config` から `https://github.com/satsuki-thyme/MDprev-via-JSproc` / `main` を確認。GitHub側は初期コミット `fb1988c`、LICENSEのみ。
- LICENSEはMIT、Copyright (c) 2026 SATSUKI Thyme。内容・ライセンスは変更しない。
- 受渡し手順 `/references/chatgpt-file-handoff-to-dropbox.md` を取得。現在のupload仕様は絶対ローカルパスを正式に受け付ける。

## 実装上の判断

読み取り専用の仮想FSと標準ロックプレビュー。毎回新しいWorker。入力はエディターの最新内容、JavaScriptは保存済み内容。前回の組は成功コミット時のみ更新。競合は追加実行を断る。最後の成功結果をVS Codeワークスペース状態へ保存。具体的なAPI・限界は `docs/DESIGN.md`。

入力変換の用途固有コードは作成せず、公開サンプルはそのまま返す `identity.cjs` のみ。異常系はテストの一時ファイルとして生成。

## 保全と公開範囲

作業対象はこの開発ルート。既存LICENSEやGit設定は変更しない。新規実装の修正時も旧実ファイルを同じディレクトリの `.backup-2026-10-24-NN` へ改名して保全した。バックアップはGit追跡・VSIXの対象外。Dropboxへの初回配置は同名ファイル不存在を確認して新規保存する。

GitHubとの対応は確認済みだが、リモートへのpush、PR、Release、Marketplace公開は行わない。Dropbox上の作業フォルダへ配置する。保存・独立読戻しの実績は `docs/DELIVERY.json` を参照。

## 次の作業

`docs/PROCESS_CHART.md` と `docs/ACCEPTANCE.md` に従って、実機確認を行う。確認結果を受け取ったら未完了の工程1・5から継続する。工程1からの作り直しや方式の再選定を先に行わない。
