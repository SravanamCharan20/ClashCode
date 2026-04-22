const keyHighlights = [
  {
    title: "Real-time multiplayer",
    desc: "Create rooms, invite friends, and compete in the same contest timeline.",
  },
  {
    title: "Instant verdict engine",
    desc: "Get AC, WA, and TLE updates quickly with low-latency judging.",
  },
  {
    title: "Fair and secure",
    desc: "Docker-based sandbox execution keeps results consistent and trustworthy.",
  },
];

const Home = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white text-gray-900">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-indigo-100/80 blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-72 h-[22rem] w-[22rem] rounded-full bg-sky-100/80 blur-[100px]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 pb-16 pt-10 lg:px-6">
        <section className="relative overflow-hidden rounded-[2.25rem] border border-gray-200/80 bg-white/85 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-indigo-200/50 to-cyan-100/40 blur-3xl" />
          <div className="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
              Premium real-time contest platform
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Compete. Code. Dominate.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
              Real-time coding contests with your friends. Create multiplayer rooms, get
              instant judged verdicts, and climb dynamic leaderboards designed for serious
              practice.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="/rooms/createRoom"
                className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)] transition hover:bg-black"
              >
                Start Contest
              </a>
              <a
                href="/rooms/joinRoom"
                className="rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Join Room
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Built for competitive programmers and engineering teams that value speed,
              precision, and fairness.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-indigo-100/80 via-sky-100/30 to-cyan-100/50 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Arena Room #CC-724</span>
                  <span className="font-medium text-emerald-600">Live</span>
                </div>
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3 font-mono text-xs text-gray-700">
                  {`function solve(input) {\n  // two pointers approach\n  return bestScore;\n}`}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-center font-semibold text-emerald-700">
                    AC +100
                  </span>
                  <span className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-center font-semibold text-red-700">
                    WA -5
                  </span>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-center font-semibold text-amber-700">
                    TLE retry
                  </span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Why ClashCode</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Built for serious practice.</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {keyHighlights.map((panel) => (
              <article
                key={panel.title}
                className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-100/70 to-cyan-100/60 blur-2xl transition group-hover:scale-110" />
                <h3 className="relative mt-4 text-xl font-medium tracking-tight">{panel.title}</h3>
                <p className="relative mt-3 text-sm leading-6 text-gray-600">{panel.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-r from-indigo-50 via-sky-50 to-cyan-50 p-10 shadow-[0_20px_50px_rgba(99,102,241,0.14)]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Start now</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Start your first contest now.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Spin up a room, invite your crew, and run a premium real-time coding showdown in minutes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/rooms/createRoom"
                className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
              >
                Start Contest
              </a>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-8 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ClashCode</p>
          <div className="flex gap-5">
            <a href="/about" className="transition hover:text-gray-900">
              About
            </a>
            <a href="https://github.com" className="transition hover:text-gray-900">
              GitHub
            </a>
            <a href="/contact" className="transition hover:text-gray-900">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default Home;
