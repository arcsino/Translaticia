const guideSteps = [
  "クイズページでカテゴリ・出題モード・回答形式を選びます．",
  "出題数をスライダーで調整し，クイズを開始します．",
  "回答後の正誤と正解を確認しながら次の問題へ進みます．",
  "分からない単語は繰り返し挑戦して定着させます．",
];

const tips = [
  "まずは「日本語 → 英語」で語彙を思い出す練習をします．",
  "慣れてきたら「英語 → 日本語」に切り替えて理解を強化します．",
  "テキスト入力ではサジェストを使ってスペルを確認しながら学習します．",
];

export default function GuidePage() {
  return (
    <main className="w-full bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
          <p className="text-sm font-semibold text-slate-600">Help</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            使い方ガイド
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            このアプリは，マイクラを英語設定で遊ぶための学習支援ツールです．日英の用語クイズを通じて，
            実際のプレイで迷わない語彙力を育てます．
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              🧭 操作手順
            </h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-700 sm:text-base">
              {guideSteps.map((step, index) => (
                <li key={step}>
                  <span className="mr-2 font-semibold text-slate-900">
                    {index + 1}.
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              💡 回答のコツ
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700 sm:text-base">
              {tips.map((tip) => (
                <li key={tip}>- {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">
              📮 お問い合わせ
            </h2>
            <p className="mt-3 text-sm text-slate-700 sm:text-base">
              不具合報告・改善提案は GitHub Issue で受け付けています．
            </p>
            <a
              href="https://github.com/arcsino/Translaticia/issues"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              GitHub Issue を開く
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
