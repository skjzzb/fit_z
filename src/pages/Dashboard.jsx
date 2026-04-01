import DashboardLayout from "../components/dashboard/DashboardLayout"
import SummaryCards from "../components/dashboard/SummaryCards"
import AddMeal from "../components/dashboard/AddMeal"
import MealList from "../components/dashboard/MealList"
import ChartCard from "../components/dashboard/ChartCard"
import WeeklyChart from "../components/dashboard/WeeklyChart"
import GoalCard from "../components/dashboard/GoalCard"






import { useMeals } from "../hooks/useMeals"
import { useNutrition } from "../hooks/useNutrition"
import { useAuth } from "../hooks/useAuth"

export default function Dashboard() {

  const { session } = useAuth()
  const userId = session?.user?.id

  const { meals, deleteMeal } = useMeals(userId)
  const { dailyTotals } = useNutrition(userId)
  const { weeklyData } = useNutrition(userId)

  return (
    <DashboardLayout>

      <h1 className="text-lg font-semibold">
        Welcome {session?.user?.user_metadata?.full_name}
      </h1>

      <SummaryCards
        protein={dailyTotals?.protein || 0}
        calories={dailyTotals?.calories || 0}
        meals={meals.length}
      />
      <GoalCard
        protein={dailyTotals?.protein || 0}
        target={150}
      />

      <div className="bg-white p-4 rounded-xl shadow">
        <AddMeal userId={userId} />
      </div>

      <MealList meals={meals} onDelete={deleteMeal} />

      <ChartCard />
      <WeeklyChart data={weeklyData || []} />

    </DashboardLayout>
  )
}