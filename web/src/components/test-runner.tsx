"use client";

import { useCallback, useMemo, useState } from "react";

type TestCase = {
  id: string;
  label: string;
  expected: unknown;
  run: () => unknown | Promise<unknown>;
};

type TestResult = {
  id: string;
  label: string;
  expected: string;
  actual: string;
  passed: boolean;
  durationMs: number;
  error?: string;
};

const defaultTestCases: TestCase[] = [
  {
    id: "sum",
    label: "Sum of [3, 5, 8, 13] equals 29",
    expected: 29,
    run: () => [3, 5, 8, 13].reduce((acc, value) => acc + value, 0),
  },
  {
    id: "fibonacci",
    label: "10th Fibonacci number equals 55",
    expected: 55,
    run: () => fibonacci(10),
  },
  {
    id: "slugify",
    label: 'Slugify "Agentic Test Playground" to "agentic-test-playground"',
    expected: "agentic-test-playground",
    run: () => slugify("Agentic Test Playground"),
  },
  {
    id: "date-window",
    label: "Next release window is 14 days from today",
    expected: () => addDays(new Date(), 14).toISOString().slice(0, 10),
    run: () => addDays(truncateToDate(new Date()), 14).toISOString().slice(0, 10),
  },
  {
    id: "guard-phrase",
    label: "Phrase \"red fox\" is allowed (not block-listed)",
    expected: true,
    run: () => !isBlockedPhrase("red fox"),
  },
  {
    id: "median",
    label: "Median of [4, 1, 10, 8, 3] equals 4",
    expected: 4,
    run: () => median([4, 1, 10, 8, 3]),
  },
];

const blockedPhrases = ["lorem ipsum", "do not use", "placeholder"];

const fibonacci = (n: number): number => {
  if (n <= 1) {
    return n;
  }
  let prev = 0;
  let curr = 1;
  for (let index = 2; index <= n; index += 1) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
};

const slugify = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const truncateToDate = (value: Date): Date => {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
};

const addDays = (value: Date, days: number): Date => {
  const result = new Date(value);
  result.setDate(result.getDate() + days);
  return result;
};

const isBlockedPhrase = (value: string): boolean => {
  return blockedPhrases.some((phrase) => value.toLowerCase().includes(phrase));
};

const median = (values: number[]): number => {
  if (values.length === 0) {
    throw new Error("Median requires at least one value");
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};

const formatValue = (value: unknown): string => {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toString() : value.toFixed(6);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (value === null || value === undefined) {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const normalizeExpected = (expected: TestCase["expected"]): unknown => {
  if (typeof expected === "function") {
    return expected();
  }
  return expected;
};

const isSameValue = (a: unknown, b: unknown): boolean => {
  if (typeof a === "number" && typeof b === "number") {
    return Math.abs(a - b) < 1e-6;
  }
  return formatValue(a) === formatValue(b);
};

export default function TestRunner() {
  const [customLabel, setCustomLabel] = useState("2^8 equals 256");
  const [customExpression, setCustomExpression] = useState("Math.pow(2, 8)");
  const [customExpected, setCustomExpected] = useState("256");
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const tests = useMemo(() => {
    const customTest: TestCase | null =
      customLabel.trim().length > 0 && customExpression.trim().length > 0
        ? {
            id: "custom",
            label: customLabel.trim(),
            expected: customExpected.trim(),
            run: () => evaluateExpression(customExpression),
          }
        : null;

    return customTest ? [...defaultTestCases, customTest] : defaultTestCases;
  }, [customExpression, customExpected, customLabel]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setHasCopied(false);
    const executed: TestResult[] = [];

    for (const test of tests) {
      const started = performance.now();
      try {
        const actualValue = await Promise.resolve(test.run());
        const expectedValue = normalizeExpected(test.expected);
        const durationMs = performance.now() - started;

        executed.push({
          id: test.id,
          label: test.label,
          expected: formatValue(expectedValue),
          actual: formatValue(actualValue),
          passed: isSameValue(actualValue, expectedValue),
          durationMs,
        });
      } catch (error) {
        const durationMs = performance.now() - started;
        executed.push({
          id: test.id,
          label: test.label,
          expected: formatValue(normalizeExpected(test.expected)),
          actual: "—",
          passed: false,
          durationMs,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    setResults(executed);
    setIsRunning(false);
  }, [tests]);

  const report = useMemo(() => {
    if (!results) {
      return "";
    }
    return results
      .map((result) => {
        const latency = `${result.durationMs.toFixed(2)}ms`;
        if (result.error) {
          return `✗ ${result.label}\n  error: ${result.error}\n  expected: ${result.expected}\n  actual: ${result.actual}\n  latency: ${latency}`;
        }
        const status = result.passed ? "✓" : "✗";
        return `${status} ${result.label}\n  expected: ${result.expected}\n  actual: ${result.actual}\n  latency: ${latency}`;
      })
      .join("\n\n");
  }, [results]);

  const handleCopyReport = useCallback(async () => {
    if (!results || !report) {
      return;
    }
    try {
      await navigator.clipboard.writeText(report);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      setHasCopied(false);
    }
  }, [report, results]);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Live Test Playground</h2>
        <p className="text-sm text-slate-300">
          Update the expression or expected outcome, then run the entire stack of checks with a
          single click.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Custom expression
            <textarea
              value={customExpression}
              onChange={(event) => setCustomExpression(event.target.value)}
              spellCheck={false}
              className="mt-2 h-24 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-slate-100 focus:border-white/30 focus:outline-none"
            />
          </label>
        </div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Expected output
          <input
            value={customExpected}
            onChange={(event) => setCustomExpected(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-slate-100 focus:border-white/30 focus:outline-none"
          />
        </label>
        <label className="md:col-span-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Preview label
          <input
            value={customLabel}
            onChange={(event) => setCustomLabel(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 focus:border-white/30 focus:outline-none"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRun}
          disabled={isRunning}
          className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-700/50"
        >
          {isRunning ? "Running…" : "Run all tests"}
        </button>
        <button
          type="button"
          onClick={handleCopyReport}
          disabled={!results || results.length === 0 || isRunning}
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-400"
        >
          {hasCopied ? "Report copied!" : "Copy report"}
        </button>
        {results && (
          <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            {results.filter((result) => result.passed).length} / {results.length} passing
          </span>
        )}
      </div>

      <div className="space-y-4">
        {(results ?? tests).map((item) => {
          const result = results?.find((entry) => entry.id === item.id);
          const isPassing = result ? result.passed : false;
          const statusLabel = !results
            ? "Pending"
            : result?.error
              ? "Error"
              : result?.passed
                ? "Pass"
                : "Fail";

          return (
            <article
              key={item.id}
              className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow shadow-slate-950/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-white">{item.label}</h3>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    !results
                      ? "border border-white/10 text-slate-300"
                      : result?.error
                        ? "border border-rose-400/60 bg-rose-400/10 text-rose-100"
                        : isPassing
                          ? "border border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
                          : "border border-amber-400/60 bg-amber-400/10 text-amber-100"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
              {results ? (
                <dl className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Expected</dt>
                    <dd className="font-mono text-sm text-slate-100">{result?.expected ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Actual</dt>
                    <dd className="font-mono text-sm text-slate-100">{result?.actual ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Latency</dt>
                    <dd className="text-sm text-slate-100">
                      {result ? `${result.durationMs.toFixed(2)} ms` : "—"}
                    </dd>
                  </div>
                  {result?.error && (
                    <div className="md:col-span-3">
                      <dt className="text-xs uppercase tracking-wide text-rose-300">Error</dt>
                      <dd className="text-sm text-rose-200">{result.error}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-slate-300">
                  Ready to run. Expected output:{" "}
                  <span className="font-mono text-slate-100">
                    {formatValue(normalizeExpected(item.expected))}
                  </span>
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

const evaluateExpression = (expression: string): unknown => {
  const evaluator = new Function(`return (${expression});`);
  return evaluator();
};
