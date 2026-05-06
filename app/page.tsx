import Link from "next/link";

export default function Home() {
  return (
    <main className="w-full bg-white text-slate-900">
      <section className="border-b border-slate-200 bg-gradient-to-br from-blue-100 via-white to-blue-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Minecraft Learning Support
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            英語設定でマイクラを楽しむための
            <span className="block bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              用語クイズアプリ
            </span>
          </h1>
          <p className="mt-6 max-w-3xl text-slate-600 sm:text-xl">
            ブロック名やエンチャント名を日英で覚えて，プレイ中に迷わない英語語彙力を身につけます．
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quiz"
              className="rounded-lg bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              クイズを始める
            </Link>
            <Link
              href="/guide"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              使い方を見る
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-10">
          <article>
            <h2 className="text-xl font-semibold text-slate-900">アプリ概要</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              用語をカテゴリや出題形式で絞り込み，反復しやすい構成で効率よく復習できます．
            </p>
          </article>
          <article>
            <h2 className="text-xl font-semibold text-slate-900">使い方</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              出題範囲と問題数を決めて開始し，4択かテキスト入力で学習スタイルに合わせて進めます．
            </p>
          </article>
          <article>
            <h2 className="text-xl font-semibold text-slate-900">
              お問い合わせ
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              改善要望や不具合報告は GitHub Issue からお寄せください．
            </p>
            <a
              href="https://github.com/arcsino/Translaticia/issues"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              GitHub Issue へ
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}
