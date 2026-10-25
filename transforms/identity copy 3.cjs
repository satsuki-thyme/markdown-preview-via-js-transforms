// 入力テキストをそのままMarkdownとして返す動作確認用サンプル。
module.exports = async function ({ text, filePath }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(text);
    }, 10000);
  });
};
