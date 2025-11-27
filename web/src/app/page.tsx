import Link from "next/link";
import TestRunner from "@/components/test-runner";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 rounded-full bg-sky-500/40 blur-[120px] sm:h-64 sm:w-64" />
        <div className="absolute -bottom-32 left-12 h-64 w-64 rounded-full bg-purple-500/30 blur-[120px]" />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-20 md:px-10 lg:px-12">
        <span className="w-fit rounded-full border border-white/15 bg-white/5 px-4 py-1 text-sm font-medium text-slate-200 backdrop-blur">
          Agentic QA Harness
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
          Test ideas in seconds with an interactive playground.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Quickly validate assumptions, perform one-off calculations, or share reproducible checks
          with your team. Every test runs entirely in the browser, so you can experiment without
          leaving this page.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="#playground"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Open playground
          </Link>
          <Link
            href="#recipes"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40"
          >
            Explore recipes
          </Link>
        </div>
        <dl className="grid max-w-3xl grid-cols-1 gap-6 text-sm text-slate-300 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Latency</dt>
            <dd className="mt-1 text-lg font-semibold text-white">&lt; 5 ms per run</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Prebuilt checks</dt>
            <dd className="mt-1 text-lg font-semibold text-white">6 ready to use</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Sharing</dt>
            <dd className="mt-1 text-lg font-semibold text-white">Copy-friendly reports</dd>
          </div>
        </dl>
      </header>

      <main
        id="playground"
        className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 pb-24 md:px-10 lg:px-12"
      >
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
            <TestRunner />
          </div>
          <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold text-white">How it works</h2>
            <ol className="space-y-4 text-sm text-slate-200">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
                  1
                </span>
                <div>
                  Define or tweak the sample cases to match the scenario you want to verify.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
                  2
                </span>
                <div>
                  Hit <span className="font-semibold text-white">Run all tests</span> to execute each
                  case locally with precise timing.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
                  3
                </span>
                <div>
                  Copy the plain-text report to share outcomes or drop in your notes.
                </div>
              </li>
            </ol>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              The playground persists state while you stay on the page. Refresh to return to the
              default recipe set.
            </div>
          </div>
        </section>

        <section
          id="recipes"
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          aria-label="Recipe suggestions"
        >
          {[
            {
              title: "Math sanity checks",
              description: "Validate calculator flows, edge cases, and rounding."
            },
            {
              title: "Content rules",
              description:
                "Verify strings against allow lists, blocked phrases, and formatting conventions."
            },
            {
              title: "Date handling",
              description: "Ensure upcoming release windows and deadlines compute correctly."
            }
          ].map((recipe) => (
            <article
              key={recipe.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
            >
              <h3 className="text-lg font-semibold text-white">{recipe.title}</h3>
              <p className="mt-2 text-sm text-slate-200">{recipe.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
