'use client';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow';
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
    purple: 'bg-purple-50 text-purple-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-100 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-4xl ${colorClasses[color]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface PackageDashboardStatsProps {
  stats: {
    totalBookings: number;
    paidBookings: number;
    pendingPayments: number;
    totalRevenue?: number;
    total: number;
    pending: number;
    submitted: number;
    under_review: number;
    accepted: number;
    rejected: number;
    needs_revision: number;
  };
}

export default function PackageDashboardStats({ stats }: PackageDashboardStatsProps) {
  return (
    <div className="space-y-6">
      {/* Booking Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="📋"
            color="blue"
          />
          <StatsCard
            title="Paid Bookings"
            value={stats.paidBookings}
            icon="✅"
            color="green"
          />
          <StatsCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon="⏳"
            color="orange"
          />
          {stats.totalRevenue !== undefined && (
            <StatsCard
              title="Total Revenue"
              value={`CA$${stats.totalRevenue.toLocaleString()}`}
              icon="💰"
              color="green"
            />
          )}
        </div>
      </div>

      {/* Application Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          <StatsCard
            title="Total Apps"
            value={stats.total}
            icon="📄"
            color="blue"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon="⏳"
            color="yellow"
          />
          <StatsCard
            title="Submitted"
            value={stats.submitted}
            icon="📨"
            color="blue"
          />
          <StatsCard
            title="Reviewing"
            value={stats.under_review}
            icon="🔍"
            color="orange"
          />
          <StatsCard
            title="Accepted"
            value={stats.accepted}
            icon="✅"
            color="green"
          />
          <StatsCard
            title="Needs Revision"
            value={stats.needs_revision}
            icon="✏️"
            color="purple"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon="❌"
            color="red"
          />
        </div>
      </div>
    </div>
  );
}
