const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white px-4 py-10 lg:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="grid gap-10 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Real-time Coding Contests
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-gray-900 lg:text-5xl">
                ClashCode helps teams host focused, fair, and live programming contests.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600">
                From room creation to final standings, ClashCode gives you a single flow:
                invite participants, run problems in the arena, evaluate submissions with
                secure runners, and review results with code history.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/dashboard"
                  className="rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Go to Dashboard
                </a>
                <a
                  href="/rooms/joinRoom"
                  className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Join Contest
                </a>
                <a
                  href="/contests"
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  View Past Contests
                </a>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">How It Works</p>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  Create Room {"->"} Lobby {"->"} Arena {"->"} Live Leaderboard {"->"} Results Archive
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Built-in Fairness</p>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  Time-limited execution, secure container runs, and problem-based hidden tests.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">For Teams & Practice</p>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  Great for interview rounds, campus coding battles, and private practice contests.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Live Contest Arena
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              Resizable coding workspace with sample run, submit flow, and real-time verdict updates.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Leaderboard + History
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              Every submission contributes to a dynamic leaderboard and is preserved for post-contest review.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Results & Insights
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              Open completed contests anytime to inspect standings, verdicts, and other participants&apos; code.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
