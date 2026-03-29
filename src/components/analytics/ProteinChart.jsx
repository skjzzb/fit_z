import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'

/**
 * ProteinChart Component
 * Displays protein intake over selected period
 */
export default function ProteinChart({ data, period = 'weekly' }) {
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
    weekly: 'Weekly Protein Intake',
    monthly: 'Monthly Protein Intake',
    yearly: 'Yearly Protein Intake'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{periodLabels[period] || 'Protein Intake'}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="protein"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6' }}
              name="Protein (g)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}