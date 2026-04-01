export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      <div className="max-w-md mx-auto p-4 space-y-4">
        {children}
      </div>
    </div>
  )
}