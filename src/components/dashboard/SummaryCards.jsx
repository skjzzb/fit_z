export default function SummaryCards({ protein, calories, meals }) {
  return (
    <div className="grid grid-cols-3 gap-3">

      <div className="bg-blue-500 text-white p-3 rounded-xl shadow text-center">
        <p className="text-xs opacity-80">Protein</p>
        <p className="text-lg font-bold">{protein}g</p>
      </div>

      <div className="bg-green-500 text-white p-3 rounded-xl shadow text-center">
        <p className="text-xs opacity-80">Calories</p>
        <p className="text-lg font-bold">{calories}</p>
      </div>

      <div className="bg-purple-500 text-white p-3 rounded-xl shadow text-center">
        <p className="text-xs opacity-80">Meals</p>
        <p className="text-lg font-bold">{meals}</p>
      </div>

    </div>
  )
}