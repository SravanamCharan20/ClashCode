const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-10 lg:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                Competitive Coding Platform
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-gray-900 lg:text-5xl">
                Build serious contest rooms with a premium coding experience.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600">
                ClashCode is designed for deep problem solving: smooth room flow,
                focused arena workspace, and high-signal UI for long coding sessions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/dashboard"
                  className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Open Dashboard
                </a>
                <a
                  href="/rooms/joinRoom"
                  className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Join Contest Room
                </a>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Contest Flow</p>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  Create {"->"} Lobby {"->"} Arena {"->"} Results
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">UX Principle</p>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  Focus-first design, zero dashboard clutter.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Built For</p>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  Real-time coding contests and interview-style rounds.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
