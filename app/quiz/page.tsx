"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import quizData from "@/data/quizlist.json";

type WordPair = { en: string; jp: string };
type CategoryKey = keyof typeof quizData;
type CategorySetting = CategoryKey | "all";
type QuestionOrder = "random" | "ordered";
type QuizMode = "jpToEn" | "enToJp";
type AnswerType = "multipleChoice" | "text";

type QuizSettings = {
  category: CategorySetting;
  order: QuestionOrder;
  mode: QuizMode;
  answerType: AnswerType;
  questionCount: number;
};

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  blocks: "Blocks",
  effects: "Effects",
  enchantments: "Enchantments",
  items: "Items",
};

function shuffle<T>(array: T[]): T[] {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function getPoolByCategory(category: CategorySetting): WordPair[] {
  if (category === "all") {
    return (Object.values(quizData) as WordPair[][]).flat();
  }
  return quizData[category] as WordPair[];
}

function getQuestionBounds(total: number): { min: number; max: number } {
  const max = Math.max(1, total);
  const min = Math.min(5, max);
  return { min, max };
}

export default function QuizPage() {
  const allWordPairs = useMemo(
    () => (Object.values(quizData) as WordPair[][]).flat(),
    [],
  );
  const [settings, setSettings] = useState<QuizSettings>({
    category: "all",
    order: "random",
    mode: "jpToEn",
    answerType: "multipleChoice",
    questionCount: 20,
  });
  const [quizList, setQuizList] = useState<WordPair[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [showAbortModal, setShowAbortModal] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [shouldShowSuggestions, setShouldShowSuggestions] = useState(false);
  const [showResultFx, setShowResultFx] = useState(false);

  const selectedPool = useMemo(
    () => getPoolByCategory(settings.category),
    [settings.category],
  );
  const bounds = useMemo(
    () => getQuestionBounds(selectedPool.length),
    [selectedPool.length],
  );
  const effectiveQuestionCount = Math.max(
    bounds.min,
    Math.min(settings.questionCount, bounds.max),
  );

  const isStarted = quizList.length > 0;
  const isFinished = isStarted && questionIndex >= quizList.length;
  const currentQuestion = !isFinished ? quizList[questionIndex] : null;

  const promptText = useMemo(() => {
    if (!currentQuestion) return "";
    return settings.mode === "jpToEn" ? currentQuestion.jp : currentQuestion.en;
  }, [currentQuestion, settings.mode]);

  const correctAnswer = useMemo(() => {
    if (!currentQuestion) return "";
    return settings.mode === "jpToEn" ? currentQuestion.en : currentQuestion.jp;
  }, [currentQuestion, settings.mode]);

  const multipleChoices = useMemo(() => {
    if (!currentQuestion || settings.answerType !== "multipleChoice") return [];
    const field = settings.mode === "jpToEn" ? "en" : "jp";
    const correct = currentQuestion[field];
    const uniqueCandidates = Array.from(
      new Set(
        selectedPool
          .map((word) => word[field])
          .filter((value) => value !== correct),
      ),
    );
    const dummyAnswers = shuffle(uniqueCandidates).slice(0, 3);
    return shuffle([correct, ...dummyAnswers]);
  }, [currentQuestion, settings.answerType, settings.mode, selectedPool]);

  const suggestionSource = useMemo(() => {
    const field = settings.mode === "jpToEn" ? "en" : "jp";
    const uniqueValues = Array.from(
      new Set(allWordPairs.map((word) => word[field])),
    );
    return uniqueValues.map((value) => ({ value, lower: value.toLowerCase() }));
  }, [allWordPairs, settings.mode]);

  const suggestions = useMemo(() => {
    if (settings.answerType !== "text" || submitted || !shouldShowSuggestions)
      return [];
    const query = textAnswer.trim().toLowerCase();
    if (!query) return [];
    return suggestionSource
      .filter((candidate) => candidate.lower.startsWith(query))
      .slice(0, 5)
      .map((candidate) => candidate.value);
  }, [
    settings.answerType,
    submitted,
    shouldShowSuggestions,
    suggestionSource,
    textAnswer,
  ]);

  const normalizedSuggestionIndex =
    activeSuggestionIndex >= suggestions.length
      ? suggestions.length - 1
      : activeSuggestionIndex;

  const progressPercent = isStarted
    ? Math.round(
        (Math.min(questionIndex + 1, quizList.length) / quizList.length) * 100,
      )
    : 0;

  const startQuiz = () => {
    const preparedPool =
      settings.order === "random" ? shuffle(selectedPool) : [...selectedPool];
    const prepared = preparedPool.slice(0, effectiveQuestionCount);
    setQuizList(prepared);
    setQuestionIndex(0);
    setCorrectCount(0);
    setSubmitted(false);
    setIsCorrect(false);
    setSelectedChoice("");
    setTextAnswer("");
    setShowAbortModal(false);
    setActiveSuggestionIndex(-1);
    setShouldShowSuggestions(false);
    setShowResultFx(false);
  };

  const moveNext = () => {
    setSubmitted(false);
    setIsCorrect(false);
    setSelectedChoice("");
    setTextAnswer("");
    setActiveSuggestionIndex(-1);
    setQuestionIndex((prev) => prev + 1);
    setShouldShowSuggestions(false);
    setShowResultFx(false);
  };

  const submitAnswer = (answer: string) => {
    if (submitted || !currentQuestion) return;
    const matched = answer === correctAnswer;
    setSubmitted(true);
    setIsCorrect(matched);
    setShowResultFx(true);
    setActiveSuggestionIndex(-1);
    setShouldShowSuggestions(false);
    if (matched) setCorrectCount((prev) => prev + 1);
  };

  const handleTextSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitAnswer(textAnswer.trim());
  };

  const applySuggestion = (value: string) => {
    setTextAnswer(value);
    setActiveSuggestionIndex(-1);
    setShouldShowSuggestions(false);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0 || submitted) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) =>
        Math.min(prev + 1, suggestions.length - 1),
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (
      (event.key === "Enter" || event.key === "Tab") &&
      normalizedSuggestionIndex >= 0
    ) {
      event.preventDefault();
      applySuggestion(suggestions[normalizedSuggestionIndex]);
    }
  };

  const resetToSettings = () => {
    setQuizList([]);
    setQuestionIndex(0);
    setCorrectCount(0);
    setSubmitted(false);
    setIsCorrect(false);
    setSelectedChoice("");
    setTextAnswer("");
    setShowAbortModal(false);
    setActiveSuggestionIndex(-1);
    setShouldShowSuggestions(false);
    setShowResultFx(false);
  };

  useEffect(() => {
    if (!showResultFx) return;
    const timer = setTimeout(() => setShowResultFx(false), 700);
    return () => clearTimeout(timer);
  }, [showResultFx]);

  return (
    <main className="relative w-full bg-white text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <section className="border border-slate-200 rounded-xl bg-white p-6 sm:p-8 lg:p-10">
          <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Minecraft 用語クイズ
          </h1>
          <p className="mb-8 text-sm text-slate-600 sm:text-base">
            カテゴリ・出題形式を選んでクイズを開始できます．
          </p>

          {!isStarted && (
            <section className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  出題範囲
                </label>
                <select
                  value={settings.category}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      category: event.target.value as CategorySetting,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                >
                  <option value="all">全カテゴリ</option>
                  {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map(
                    (category) => (
                      <option key={category} value={category}>
                        {CATEGORY_LABELS[category]}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-900">
                  出題順
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, order: "random" }))
                    }
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      settings.order === "random"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    ランダム
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, order: "ordered" }))
                    }
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      settings.order === "ordered"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    登録順
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-900">
                  出題モード
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, mode: "jpToEn" }))
                    }
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      settings.mode === "jpToEn"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    日本語 → 英語
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, mode: "enToJp" }))
                    }
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      settings.mode === "enToJp"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    英語 → 日本語
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-900">
                  回答形式
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        answerType: "multipleChoice",
                      }))
                    }
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      settings.answerType === "multipleChoice"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    4択
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, answerType: "text" }))
                    }
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      settings.answerType === "text"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    テキスト入力
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <p className="font-semibold text-slate-900">出題数</p>
                  <span className="font-medium text-slate-900">
                    {effectiveQuestionCount}問
                  </span>
                </div>
                <input
                  type="range"
                  min={bounds.min}
                  max={bounds.max}
                  value={effectiveQuestionCount}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      questionCount: Number(event.target.value),
                    }))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>{bounds.min}問</span>
                  <span>{bounds.max}問</span>
                </div>
              </div>

              <button
                type="button"
                onClick={startQuiz}
                className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                クイズ開始
              </button>
            </section>
          )}

          {isStarted && !isFinished && currentQuestion && (
            <section className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>
                    問題 {questionIndex + 1} / {quizList.length}
                  </span>
                  <span>正解数: {correctCount}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <p className="mb-3 text-xs font-semibold tracking-wider text-slate-500">
                  問題
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {promptText}
                </p>
              </div>

              {settings.answerType === "multipleChoice" ? (
                <div className="grid gap-2">
                  {multipleChoices.map((choice) => {
                    const isSelected = selectedChoice === choice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        disabled={submitted}
                        onClick={() => {
                          setSelectedChoice(choice);
                          submitAnswer(choice);
                        }}
                        className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                          submitted
                            ? choice === correctAnswer
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                              : isSelected
                                ? "border-rose-500 bg-rose-50 text-rose-800"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            : "border-slate-300 bg-white text-slate-900 hover:border-slate-500"
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <form onSubmit={handleTextSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={textAnswer}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setTextAnswer(nextValue);
                        setActiveSuggestionIndex(-1);
                        setShouldShowSuggestions(nextValue.trim().length > 0);
                      }}
                      onFocus={() =>
                        setShouldShowSuggestions(textAnswer.trim().length > 0)
                      }
                      onBlur={() => setShouldShowSuggestions(false)}
                      onKeyDown={handleInputKeyDown}
                      disabled={submitted}
                      placeholder="答えを入力"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                    />
                    {suggestions.length > 0 && (
                      <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-md">
                        {suggestions.map((suggestion, index) => (
                          <li key={suggestion}>
                            <button
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => applySuggestion(suggestion)}
                              className={`w-full px-3 py-2 text-left text-sm ${
                                index === normalizedSuggestionIndex
                                  ? "bg-slate-100 text-slate-900"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {suggestion}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitted || textAnswer.trim().length === 0}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    回答する
                  </button>
                </form>
              )}

              {submitted && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={moveNext}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    次の問題へ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAbortModal(true)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    一時中断
                  </button>
                  {!isCorrect && (
                    <p className="text-sm text-slate-600">
                      正解: {correctAnswer}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {isFinished && (
            <section className="space-y-6 text-center">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-600">クイズ終了</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {correctCount} / {quizList.length}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  正答率: {Math.round((correctCount / quizList.length) * 100)}%
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={startQuiz}
                  className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  同じ設定で再挑戦
                </button>
                <button
                  type="button"
                  onClick={resetToSettings}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  出題設定に戻る
                </button>
              </div>
            </section>
          )}
        </section>

        {isStarted && !isFinished && !submitted && (
          <button
            type="button"
            onClick={() => setShowAbortModal(true)}
            className="fixed bottom-5 left-5 z-20 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            一時中断
          </button>
        )}

        <AnimatePresence>
          {submitted && showResultFx && (
            <motion.div
              className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div
                className={`rounded-2xl border px-10 py-8 text-center backdrop-blur-xl ${
                  isCorrect
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : "border-rose-300 bg-rose-100 text-rose-700"
                }`}
              >
                <p className="text-5xl font-bold sm:text-6xl">
                  {isCorrect ? "○ 正解" : "× 不正解"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showAbortModal && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/30 p-4">
            <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-900">
                クイズを中断しますか？
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                進行状況が失われますがよろしいですか？
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowAbortModal(false)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={resetToSettings}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(225,29,72,0.4)]"
                >
                  中断して戻る
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
