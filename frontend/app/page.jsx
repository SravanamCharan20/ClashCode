const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-gray-200 bg-white p-10 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          ClashCode
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-gray-900">
          Better navigation, cleaner flow.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500">
          Use the top navigation to move between dashboard, room creation,
          joining, lobby, and arena pages without awkward dead ends.
        </p>
      </div>
    </div>
  );
};

export default Home;
