const Home = () => {
  return (
    <div>
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6">
        <h1 className="text-6xl md:text-7xl font-bold mb-6">
          Turn Dreams
          <br />
          Into Reality
        </h1>

        <p className="max-w-2xl text-lg">
          DreamyScape helps you organize your goals, track progress and stay
          focused on what matters most.
        </p>

        <button className="mt-8 px-8 py-3 border rounded-lg">
          Start Your Journey
        </button>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-10">
          Featured Dreams
        </h2>
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-10">
            Why DreamyScape?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="border rounded-xl p-6">
              <h3 className="font-semibold text-xl mb-3">Track Goals</h3>

              <p>Organize and monitor personal goals.</p>
            </div>

            <div className="border rounded-xl p-6">
              <h3 className="font-semibold text-xl mb-3">Visualize Dreams</h3>

              <p>Keep important ambitions visible.</p>
            </div>

            <div className="border rounded-xl p-6">
              <h3 className="font-semibold text-xl mb-3">Celebrate Progress</h3>

              <p>Review completed achievements.</p>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-4 gap-5">
          <div className="border rounded-xl p-6">Travel Japan</div>

          <div className="border rounded-xl p-6">AWS Certification</div>

          <div className="border rounded-xl p-6">Remote Software Career</div>

          <div className="border rounded-xl p-6">Build AI Products</div>
        </div>
      </section>
    </div>
  );
};

export default Home;
