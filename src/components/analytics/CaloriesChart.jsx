import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'

/**
 * CaloriesChart Component
 * Displays calorie intake over selected period
 */
export default function CaloriesChart({ data, period = 'weekly' }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No data available for {period} view
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: period === 'yearly' ? undefined : 'numeric',
      year: period === 'yearly' ? '2-digit' : undefined
    })
  }))

  const periodLabels = {
    weekly: 'Weekly Calorie Intake',
    monthly: 'Monthly Calorie Intake',
    yearly: 'Yearly Calorie Intake'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{periodLabels[period] || 'Calorie Intake'}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="calories" fill="#10B981" name="Calories" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}