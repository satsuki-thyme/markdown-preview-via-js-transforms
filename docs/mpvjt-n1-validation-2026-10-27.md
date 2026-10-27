# Markdown Preview via JS Transforms — N1小規模検証

記録日: 2026-10-27（Asia/Tokyo）  
基準: 現行0.2.0と`docs/mpvjt-next-development-design-2026-10-27.md`  
状態: **N1の非GUI検証と方式比較を実施。実拡張ホスト・GUIは未実施。採用確定およびN2以降には進んでいない。**

## 1. 結論

1. **同じエディター領域に標準プレビューを開く要求は構成できる。厳密な同一タブは達成していない。** 元入力と結果のURIを分け、入力タブを保持する案を隔離コピーで検証した。模擬APIでは表示先・正しい入力への復帰・表示操作で変換しないことを確認した。実画面のタブ数、未保存編集のライフサイクル、Undo、描画は未検証。
2. **別グループにある既存結果を、無損失で自動移動しつつ同じ領域に表示する点が未解決。** 現行コードの既存グループ再利用は安全側だが、入力と同じ領域にはならない。単純に現在列へ`openWith`を要求すると、標準のCustomTextEditorは複数表示を許すため重複し得る。位置指定だけで再利用・移動成功とはしない。
3. **入力タブ1枚を置き換える方式の採用判断は停止。** 元入力URIを標準プレビューで開く方式は生成結果を表示せず、入力の変更が表示へ反映される。入力を閉じて別URIを開く方式は、未保存入力に確認ダイアログが生じ、保存・破棄なしでの継続とUndo保持を保証できない。独自レンダラーへの置換も標準プレビュー要件を変える。機能を削る実装はしていない。
4. **独自auto/en/jaで代表案内を切り替える試験は成立。コマンド主表示は言語別入口で切替可能な構成だが、副作用がある。** 既存5IDを維持して別入口10IDから転送する案では既存キーの呼出しを保てる一方、固定en/jaのパレット行は別IDなので、既存キーの補助表示を自動継承しない。履歴と歯車のキー設定先も別IDになる。主表示・案内・補助表示をすべて同一挙動のまま独自切替できたとは判定しない。

**次はN1の実機確認と差異の判断。N2の採用仕様確定・製品実装へはまだ進まない。**

## 2. 根拠、対象、保全

IDAD原文、sources.md、PROSPECT.md、原案seed-prompt-mpvjt.md、最新MGMT.md、README.md、PROCESS_CHART.md、DESIGN.md、TESTING.md、ACCEPTANCE.md、MIGRATION_0.2.0.md、2026-10-27設計案、package.json、製品8モジュール、関連テスト6ファイルを確認した。Dropboxの対応先はsources.mdにある`/www/studio/markdown-preview-via-js-transforms`。GitHub最新ツリーとの同期比較は今回の対象にしていない。

実行に使うソース・テスト・manifestおよび参照文書はDropboxの生ファイルで取得し、26ファイルのサイズとDropbox Content Hashを照合した。テキスト抽出は末尾改行や文字の表現が変わるため、最初の抽出テキストを実行用コピーの正本にしなかった。プローブの製品8モジュールと試験用コピー8モジュールは取得元とバイト一致し、**製品モジュール自体には変更を加えていない**。

変更は隔離したローカルの試験用追加ファイルと新規報告・検証キットに限定した。本番の製品コード、利用者の入力・変換JS、既存VSIX・ソースZIP、原報告、既存管理文書、設計案、バックアップは変更していない。GitHub書込み、VSIX作成・配布更新、Marketplace登録・公開は実施していない。

プローブは別拡張機能ID`n1-local.mpvjt-n1-probe`、版`0.0.0`の開発専用コピー。製品の次期版番号ではない。既存5コマンドID・URIスキームを試験するため、専用user-data・extensions・試験ワークスペースで起動する。利用者の通常環境にインストールしない。プローブではProductionモードでの起動を拒否する。

本番ファイルの更新がないため、Dropbox上の既存ファイルの改名は不要。試験ハーネスの修正では、完成案の構文確認後、旧ファイルそのものを`official-functions.test.backup-2026-10-27-01.cjs`へ改名し、存在・内容を確認してから元名で新版を新規作成した。旧ハーネスと失敗ログをキットに保持した。

現行受入の「移行5件合格・M2対象なし・継続16件合格」と、Windows 11／VS Code 1.105.1／内蔵Node.js 22.19.0での正式GUI統合合格は過去の確認範囲として維持する。今回の新方式のGUI合格へ転用しない。mutex、DEP0190、DEP0040の原因解消を確認したものでもない。

## 3. 実際に行った試験

実行環境: Linux x86_64、Node.js **24.22.1**、Python **3.12.14**。これはユーザー端末やVS Code内蔵Nodeではない。`code --version`の応答は`code or code-insiders is not installed`、DISPLAYは空、xvfb-runもなし。利用可能なVS Code GUI／実拡張ホストを確保できず、本件のGUI起動・操作は実施していない。

| 区分 | 実施内容 | 結果 | 証明しないこと |
|---|---|---|---|
| 現行コードの確認 | 生ファイルによる既存24試験。実Workerと模擬VS Code API | 24件合格 | 実エディターの描画・Undo・タブ挙動 |
| N1-A1〜A8 | 同領域への引数、入力A/Bの対応、復帰先、入力移動後の再探索、別グループ停止、消失・未知結果、再起動相当の初期記録 | 8件合格 | 本物のタブ移動やUndo。模擬文書を同じオブジェクトで返すことはUndo実証ではない |
| N1-L1〜L4 | 本体en/ja×独自auto/en/jaの解決、その他言語の英語fallback、manifest条件の排他、10入口から5既存IDへの引数付き転送、原例外・パス保持 | 4件合格 | 実際のパレット描画、起動時の表示タイミング、全既存案内の翻訳 |
| N1-S1〜S4 | Microsoft公式1.105.1のmanifest翻訳関数とパレット項目生成関数を取り出し、周辺サービスを模擬して実行 | 4件合格 | VS Codeプロセス全体、メニュー更新・MRU表示のGUI実証 |
| 統合したNode試験 | 既存24＋N1追加16 | **40件合格、失敗0、終了コード0** | 拡張機能ホスト・GUI統合テストとは呼ばない |
| 構文・同一性 | 新規JS3ファイルの構文検査、JSON解析、製品8モジュール×2コピーの一致、公式関数2ファイルのGit blob SHA照合 | 合格 | PowerShellランチャーの実行。pwshがなく静的確認のみ |

最終ログはキット内`logs/node-tests-20261027T043853Z.log`、実行概要は`logs/summary-20261027T043853Z.json`。時刻名はUTCで、JSTでは13:38:53。テスト数は重複した再実行を加算せず、最終実行の40件で数える。

先行実行`node-tests-20261027T043726Z.log`は38合格・2失敗。原因は公式TypeScriptの`<string>`型アサーションをNodeのstripモードが扱えなかった試験ハーネス側の制約。transformモードに修正し、同じ公式関数を再試験して40合格となった。製品不具合として扱わない。Nodeの`stripTypeScriptTypes`に関するExperimentalWarningは最終実行でも残り、終了コード0と分離して記録する。

## 4. 表示方式の比較

「同じ領域」は、呼出し時の入力が属するエディターグループに結果を表示すること。「厳密な同一タブ」は、入力タブを結果表示へ置き換え、タブ数を1枚に保ったまま元入力へ戻れること。この2条件を混同しない。別グループへフォーカスしただけでも同じ領域達成とはしない。

### 4.1 API・公式実装で分かったこと

- 公開`vscode.openWith(resource, viewId, options)`は、指定URIを指定エディターで開く。`viewColumn`は表示先、`preview:false`は一時タブ置換を避ける設定。入力と結果を別URIにする現行方式で、元の入力タブを結果URIへ原子的に交換する引数はない。[V1][S1]
- 1.105.1の標準`markdown.showPreview`は`resourceColumn`を表示先とし、横表示の場合だけBesideを使う。この実装は「入力と同じ列」の根拠であり、入力タブが1枚のまま残ることの保証ではない。[S2]
- 公開Tab APIの`input`はreadonlyで、TabGroupsには列挙・変更イベント・closeがある。既存TabのURIを書き換えるAPIや、特定Tabを原子的に交換する公開APIは確認できない。dirtyなTabのcloseは取消可能な確認ダイアログを伴う。[V2]
- 内部`reopenEditorWith`は元エディターの`toUntyped()`を基にview typeを変更する。同一の入力リソースを再び開くもので、別の変換結果URIへ置換する公開契約ではない。内部の`replaceEditors`へ依存する製品実装はしていない。[S1]
- 標準プレビューは渡されたリソースのTextDocumentを読み、同リソースの変更イベントで更新する。元入力URIを渡すと、保持済み生成Markdownではなく元入力の表示となる。[S3]

### 4.2 候補と採用条件

| 候補 | 得られること | 制約・失うもの | N1判定 |
|---|---|---|---|
| A1: 入力保持＋同じ列に固定型標準プレビュー | 変換結果URI、手動更新、元文書を保つ構成。横分割を新規に要求しない | 元入力と結果の2タブ。実GUIでの確認が必要 | 第一候補として継続比較。採用未確定、厳密同一タブは未達 |
| A2: 現行どおり既存グループを再利用 | URI・view typeを照合して重複を避ける | 別グループに既存結果があると同じ領域にならない | 現行動作の維持案。新要件達成とはしない |
| A3: 別グループがあっても現在列へopenWith | 指定列へ開く要求が可能 | 標準CustomTextEditorは複数表示が可能で、移動ではなく複製になる可能性 | 生の要求を観測する専用コマンドのみ用意。実GUI未検証 |
| A4: moveActiveEditorで自動移動 | 標準の移動機構を使う可能性 | 1.105.1はactiveGroup.selectedEditorsを対象にするため、複数選択で無関係なタブまで動かす恐れ | 無損失条件が未確立。実装・採用停止 |
| A5: 新列で開いて旧結果タブを閉じる | 結果を1個へ整理する可能性 | 既存タブの再利用・移動ではない。スクロール等の表示状態が失われる可能性、途中失敗・閉鎖の問題 | 差異を受け入れる承認なしに採用しない |
| B1: 元入力URIを標準プレビューで再オープン | 同一リソースのエディター切替を使える | 変換済みMarkdownを表示しない。元文書の編集に追従し、成功結果固定の要件を失う | **採用判断停止** |
| B2: 元入力を閉じ、結果URIを開く | 見かけ上のタブ数を減らせる場合がある | dirty文書で保存・破棄・取消の問題。Undo・ビュー状態・復帰を無損失に保証できない | **採用判断停止。入力の自動closeは未実装** |
| C: 独自Custom Editor／Webviewで一体化 | 表示を独自制御する余地 | VS Code標準Markdownプレビューとの同一性と保守条件を変える | 今回の優先順位に反するため採用しない |

別グループの扱いについては、`CustomTextEditorProvider`が登録経路で複数表示可能とされ、resolverの`singlePerResource`はその能力を反転して決まることを公式ソースで確認した。[S4][S5][S6] 自動移動が保証されるとの前提は置けない。`moveActiveEditor`が単一タブ専用だとの前提も置けない。[S1]

安全側のプローブは、既存結果が別グループにある／複数存在する場合に`cross-group-unverified`として停止する。別領域の結果を表示して「同領域成功」とは返さない。GUIでの生`openWith`比較用入口を別に用意したが、製品への採用はしていない。

### 4.3 機能保持表

| 維持対象 | 非GUIで確認したこと | 実画面・実機で残ること |
|---|---|---|
| 元入力への復帰 | 結果URI→入力の対応を成功記録から管理。A表示からはBが最後でもAへ戻る。消失・ルート不一致では停止 | 実際のアクティブエディター、パスの大文字小文字・選択位置 |
| 未保存編集・Undo | 表示・復帰にsave/edit/closeを呼ばず、同じ文書をshowTextDocumentへ渡す | dirty文書の保持、Undo/Redoの順序、カーソルとスクロール。模擬文書の合格で代用しない |
| 複数入力 | 前回の実行組と、表示中の結果からの復帰先を分離 | A/B往復と複数グループの操作。前回再実行は現行どおり最後の成功組 |
| 既存タブ再利用・移動 | URIとview typeを照合。同一グループ向けの要求、移動後の入力再探索、別グループ停止 | グループ間の安全な自動移動・重複抑止は未解決。手動ドラッグ後の再利用を別試験 |
| 画像・リンク | 現行仮想FSのバイナリ代理読込と書込み拒否の既存試験合格。URIやFSを変更していない | 同じフォルダ以下の画像の描画・リンクの実操作。`../`や外部ファイルを新たに保証しない |
| 手動更新 | 保存・provider読取・再表示で再変換せず、明示実行で更新する既存試験合格。新しい往復・言語関数から変換を呼ばない | Auto Save、パレット、画面切替を通じた実動作 |
| 失敗時保持 | 実Workerの例外・不正値・停止、状態保存失敗で成功結果と組を保持する既存試験合格 | 新表示経路での失敗通知、描画中の保持。表示失敗と変換失敗を分ける |
| 再起動後復元 | 保存済み最後の1件からcontrollerとFSを再生成。欠けたJSを実行せず表示できる。復帰の対応も初期記録から作る | OS上の終了・再起動、復元タブとactivationの順序。カーソル等の位置情報は新たに永続化していない |
| 標準「ソースを表示」 | 公式実装はactivePreviewResourceを開くので、結果URIが対象となる [S7] | 独自の「元入力へ戻る」との画面上の区別 |

現行の永続復元は**最後の成功1件**。複数入力の古い成功結果は同一セッションのメモリー保持に限る。固定するのは生成Markdown本文であり、画像ファイル・テーマ・外部URLの状態まで凍結しない。これらを今回の欠落や追加保証に読み替えない。

## 5. auto/en/jaと言語資源・補助表示

### 5.1 標準方式

`package.nls.json`（英語）と`package.nls.ja.json`（日本語）は、manifestの静的なcommand titleや設定説明を翻訳する。選択はVS Code側の言語に従う。独自の`markdownPreviewViaJsTransforms.language`を定義しただけで切り替わる仕組みではない。[V3]

実行時の標準`vscode.l10n`もVS Codeの言語資源を使用する。独自設定を尊重した案内は、設定値から辞書を選ぶ層などが別途必要。本N1では小さな辞書を使い、auto→本体の日本語ならja、その他ならen、明示en/ja→指定値、という経路を試験した。原例外・stack・パス・生成Markdown・ユーザーconsoleを翻訳対象にしない。

既存IDをそのまま標準NLSで翻訳する案は、キー割当の対応を保てるが「拡張だけ別言語」の要件を満たさない。この簡略案を無断採用しない。

### 5.2 検証した独自切替候補

本N1のmanifestは、各操作について次の3入口を宣言する。内部の5処理は元のIDのまま。

| 設定 | 表示する入口 | titleの由来 | 条件 |
|---|---|---|---|
| auto／未設定 | 既存のcanonical ID | package.nlsによる本体言語 | `config.markdownPreviewViaJsTransforms.language != en && ... != ja` |
| en | `<既存ID>.n1_en` | 固定英語 | `config.markdownPreviewViaJsTransforms.language == en` |
| ja | `<既存ID>.n1_ja` | 固定日本語 | `config.markdownPreviewViaJsTransforms.language == ja` |

`.n1_en`／`.n1_ja`は試験用の名前であり、次期製品の識別子決定ではない。独自設定は`scope: application`で、入力ごとの言語切替を避ける。既存のtransformsFolder、timeoutMs、状態キーを変更しない。

独自のeffectiveLanguageコンテキストをactivation後に設定する方式は、初期化まで入口が消える／違う言語が出る問題を持ち得る。そのため今回の候補は`config.*`条件を直接使い、autoは標準NLSを使用した。[V4] 条件式の排他と未設定時fallbackは試験済みだが、拡張の登録前・ロード直後の実際のUI描画を保証したものではない。

`registerCommand`はハンドラーを登録し、表示titleを動的変更する引数を持たない。同一IDのtitleをen/jaで二重宣言して`when`により切り替える方式も使っていない。コマンドの主表示とmenusの表示条件は別の役割である。[V2][V5][S8]

### 5.3 確認できた副作用

公式1.105.1の関数を実行して以下を確認した。依存サービスを模擬した関数単位の確認であり、GUIの実測とは区別する。[S9][S10]

| 表示・操作 | 標準NLS＋既存ID | 独自en/jaの別入口 | 判定 |
|---|---|---|---|
| 主表示 | 本体localeで翻訳 | 独自設定で対応入口を選ぶ | 別入口の宣言・転送は成立、GUIは未検証 |
| 既存キーによる実行 | 既存IDを実行 | 既存IDを残すので実行経路は維持 | 模擬コマンド転送と既存登録を確認。実キー入力は未試験 |
| パレット右側のキー | 既存IDの割当を検索 | alias IDの割当を検索するため既存IDのキーを自動表示しない | **補助表示の機能差を確認** |
| 歯車からキー設定 | 既存IDが対象 | 表示中のalias IDが対象 [S11] | 設定先が分かれる。既存割当をコピーして解決したとはしない |
| 英語原文の補助表示 | 日本語翻訳に`original`が付く場合があり、本体のshowAlias条件で表示 | 固定文字列titleは同じoriginalを持たない | 本体UIのlocaleにも左右され、独自設定だけで全表示を制御できない |
| 最近使ったコマンド | canonical IDの履歴 | alias IDごとの履歴 | 順位・履歴が分かれる。言語切替時の実残留はGUI未検証 |
| キー割当編集画面 | 5ID | 既存5＋別入口10の候補を持つ | commandPaletteのwhenで他画面まで隠せる保証はない。GUI確認が必要 |
| 原例外・パス | 原文 | 原文を翻訳済み外枠に挿入 | 代表メッセージ試験で保持 |

PROSPECT.mdの「右側の文」が、主ラベル、原言語別名、キー表示、その他の補助欄のどれを指すかは、実画面との照合が未了。本件では勝手に主ラベルだけへ限定せず、上表の各要素を別々に評価した。

### 5.4 比較と判断保留

| 案 | 利点 | 未達・負担 |
|---|---|---|
| 標準NLSで全UIを本体言語へ合わせる | ID・キー表示・履歴を一体で維持しやすい | 拡張独自en/jaを失う。条件変更なのでユーザー判断が必要 |
| 案内だけ独自設定、コマンドは標準NLS | IDと案内の独自切替を両立しやすい | コマンド主表示が独自設定に従わない |
| 今回の別入口方式 | 主表示と代表案内を独自設定へ合わせる構成 | キー補助表示、履歴、設定先、候補数に差異。副作用を無視して採用しない |
| 独自Quick Pickを別コマンドで開く | 一覧内のlabel/description/detailを独自制御できる | VS Codeの標準パレットそのものではなく、追加操作になる。今回未実装 |

現時点の推奨は、別入口案を「完全互換」とせず実機で副作用を確認すること。補助表示と既存キー設定画面まで現行と同等が必須なら、この案の採用を停止し、標準NLS案などの条件変更を明示して判断する。

## 6. GUI未実施項目と引継ぎ

`mpvjt-n1-probe-2026-10-27.zip`に隔離コピー、専用入力・identityと異常系JS、N1追加コード、全40試験、成功・失敗ログ、元ハーネスの改名バックアップ、`Launch-N1.ps1`、詳細な`GUI-CHECKLIST.md`を収録する。製品の新VSIXではない。

GUI手順は、実在するCode.exeを指定し、TEMP内の新しいuser-data／extensions／ワークスペースで起動する。再起動試験だけ同じセッションを使う。既存ユーザー環境を変更しない。PowerShellランチャーは静的確認のみで、Windows上の実行結果はない。

実機で残るのは、G01〜G15の同領域・タブ数・未保存編集・Undo・複数入力・タブ再利用・生openWith・画像／リンク・失敗時保持・再起動・信頼・元URIの比較、および本体en/ja×独自auto/en/jaの6組のパレット／案内／キー表示／履歴である。1.105.1、宣言下限1.105.0、実際に使用中の版は別々に記録する。日本語Language Packのない環境で`--locale=ja`だけを指定して、日本語UI試験完了とはしない。

本N1では全既存メッセージの翻訳、将来の切替キー`ctrl+shift+alt+v v`、テンプレート作成、README再編、二言語製品文書、公開準備を実装していない。既存コアの日本語メッセージはそのままで、独自切替は代表メッセージを検証する範囲。N2以降の完成仕様として扱わない。

## 7. 次の判断と実行指示

ユーザー判断が必要な点は、①2タブを残す同領域表示で意図を満たすか、②別グループの既存結果をどう扱うか、③独自言語の別入口によるキー表示・履歴・設定先の差を許容するか。現時点で選択を確定させていない。

次の作業はN1のGUI確認。推奨はWorkモードの高性能モデル・高推論による結果照合と、ユーザーのWindows実機操作。固定のモデル名や自動切替は前提にしない。

> Markdown Preview via JS TransformsのN1検証を継続してください。最新のIDAD・sources.md・MGMT.md・PROCESS_CHART.mdと、docs/mpvjt-n1-validation-2026-10-27.md、N1検証キットのGUI-CHECKLIST.md、今回の実機結果を確認してください。合格・不合格・未実施を項目別に照合し、同領域と厳密同一タブ、既存キーの実行と補助表示を区別してください。機能削減が必要な方式の採用は停止し、残る判断と選択肢を整理してください。N2以降の実装、GitHub書込み、VSIX更新、Marketplace操作は行わないでください。追加報告は新規文書に保存し、独立に照合してください。

旧0.2.0の工程5・6を未完了へ戻さない。本N1のGUIが未検証であることと、現行製品の既存受入を混同しない。

## 8. 保存と照合の記録

新規保存先は開発ルートの`docs/mpvjt-n1-validation-2026-10-27.md`、`docs/mpvjt-n1-probe-2026-10-27.zip`、`docs/SAVE-VERIFICATION-N1-2026-10-27.json`。既存同名がないことを確認して作成する。既存ファイルを直接上書きしない。

Libraryの`/references/chatgpt-file-handoff-to-dropbox.md`を取得し、現行ツールが`source_file`に絶対ローカル実ファイルパスを明示的に受け付ける仕様を確認した。この正規方式を利用する。保存成功と保存後照合を分離し、Dropboxから取得した生バイト、サイズ、SHA-256、Dropbox Content Hashを完成版と比較する。**実際の保存・照合結果は別添の保存照合JSONと最終報告を正本とし、この段落だけを保存成功の証拠にしない。**

## 9. 公式資料

以下は今回確認した一次資料。Web API文書の現在の記述と、1.105.1に固定した実装を区別した。実装の読取や関数単位の試験を、現行全バージョンのGUI保証に拡張しない。

- [V1 Built-in Commands: vscode.openWith](https://code.visualstudio.com/api/references/commands)
- [V2 VS Code API: TextDocumentShowOptions、Tab、TabGroups、registerCommand、l10n](https://code.visualstudio.com/api/references/vscode-api)
- [V3 Microsoft localization tooling: package.nls.json](https://github.com/microsoft/vscode-l10n#packagenlsjson)
- [V4 When clause contexts: config.*](https://code.visualstudio.com/api/references/when-clause-contexts)
- [V5 Contribution Points: commands / menus](https://code.visualstudio.com/api/references/contribution-points)
- [S1 editorCommands.ts 1.105.1 — openWith、reopenEditorWith、moveActiveEditor](https://github.com/microsoft/vscode/blob/1.105.1/src/vs/workbench/browser/parts/editor/editorCommands.ts)
- [S2 showPreview.ts 1.105.1 — inPlaceとsideBySide](https://github.com/microsoft/vscode/blob/1.105.1/extensions/markdown-language-features/src/commands/showPreview.ts)
- [S3 preview.ts 1.105.1 — リソース読取・変更通知](https://github.com/microsoft/vscode/blob/1.105.1/extensions/markdown-language-features/src/preview/preview.ts)
- [S4 mainThreadCustomEditors.ts 1.105.1 — TextEditorの複数表示](https://github.com/microsoft/vscode/blob/1.105.1/src/vs/workbench/api/browser/mainThreadCustomEditors.ts)
- [S5 customEditors.ts 1.105.1 — singlePerResource](https://github.com/microsoft/vscode/blob/1.105.1/src/vs/workbench/contrib/customEditor/browser/customEditors.ts)
- [S6 editorResolverService.ts 1.105.1 — 既存エディター再利用の条件](https://github.com/microsoft/vscode/blob/1.105.1/src/vs/workbench/services/editor/browser/editorResolverService.ts)
- [S7 showSource.ts 1.105.1 — 標準ソース表示の復帰対象](https://github.com/microsoft/vscode/blob/1.105.1/extensions/markdown-language-features/src/commands/showSource.ts)
- [S8 menusExtensionPoint.ts 1.105.1 — command titleとメニュー](https://github.com/microsoft/vscode/blob/1.105.1/src/vs/workbench/services/actions/common/menusExtensionPoint.ts)
- [S9 extensionNls.ts 1.105.1 — original言語の保持](https://github.com/microsoft/vscode/blob/1.105.1/src/vs/platform/extensionManagement/common/extensionNls.ts)
- [S10 commandsQuickAccess.ts 1.105.1 — キー検索・補助表示・履歴](https://github.com/microsoft/vscode/blob/1.105.1/src/vs/platform/quickinput/browser/commandsQuickAccess.ts)
- [S11 Workbench commandsQuickAccess.ts 1.105.1 — label／alias／歯車](https://github.com/microsoft/vscode/blob/1.105.1/src/vs/workbench/contrib/quickaccess/browser/commandsQuickAccess.ts)
- [S12 previewManager.ts 1.105.1 — 標準CustomTextEditor登録](https://github.com/microsoft/vscode/blob/1.105.1/extensions/markdown-language-features/src/preview/previewManager.ts)

実行した公式2ファイルはキットの`evidence/official`に、MITライセンスとともに収録。Git blob SHAとコピー一致は`evidence/official-sources.json`へ記録した。
