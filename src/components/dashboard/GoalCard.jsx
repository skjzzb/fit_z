export default function GoalCard({ protein, target }) {
  const percentage = Math.min((protein / target) * 100, 100)

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="text-sm font-semibold mb-2">
        Daily Protein Goal
      </h3>

      <p className="text-xs text-gray-500 mb-2">
        {protein}g / {target}g
      </p>

      <div className="w-full bg-gray-200 h-3 rounded-full">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs mt-2 text-gray-500">
        {percentage.toFixed(0)}% completed
      </p>
    </div>
  )
}