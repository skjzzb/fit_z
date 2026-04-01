export default function MealList({ meals, onDelete }) {
  if (!meals.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow text-center text-gray-500">
        No meals logged today
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <h3 className="font-semibold text-sm">Today's Meals</h3>

      {meals.map((meal) => (
        <div
          key={meal.id}
          className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50">
        
          <div>
            <p className="text-sm font-medium">
              {meal.foods?.name}
            </p>
            <p className="text-xs text-gray-500">
              {meal.quantity} qty
            </p>
          </div>

          <button
            onClick={() => onDelete(meal.id)}
            className="text-red-500 text-xs"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}