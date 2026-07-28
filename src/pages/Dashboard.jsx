import ProgressBar from "../components/ProgressBar";

const Dashboard = () => {
  const goals = JSON.parse(localStorage.getItem("dreamyscape-goals")) || [];

  const dreams = JSON.parse(localStorage.getItem("dreamyscape-dreams")) || [];

  const totalGoals = goals.length;

  const completedGoals = goals.filter((goal) => goal.completed).length;

  const progress =
    totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-5xl font-bold mb-10">Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="border rounded-xl p-6">
          <h2 className="text-lg">Total Goals</h2>

          <p className="text-4xl mt-4">{totalGoals}</p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="text-lg">Completed</h2>

          <p className="text-4xl mt-4">{completedGoals}</p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="text-lg">Progress</h2>

          <p className="text-4xl mt-4">{progress}%</p>
        </div>
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-5">Overall Progress</h2>

        <ProgressBar progress={progress} />
      </div>
      <div className="border rounded-xl p-6">
        <h2 className="text-lg">Dreams</h2>

        <p className="text-4xl mt-4">{dreams.length}</p>
      </div>
    </div>
  );
};

export default Dashboard;
