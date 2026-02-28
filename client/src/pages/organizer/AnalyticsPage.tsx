import { useState, useEffect } from 'react';
import { analyticsApi } from '@/api/analyticsApi';
import { formatCurrency } from '@/utils/formatCurrency';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

const PERIODS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('30d');
  const [revenue, setRevenue] = useState<any[]>([]);
  const [eventStats, setEventStats] = useState<any[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      analyticsApi.revenue(period).then(r => setRevenue(r.data.data.revenue || [])),
      analyticsApi.bookingsByEvent().then(r => setEventStats(r.data.data.events || [])),
      analyticsApi.peakHours().then(r => {
        const hours = r.data.data.peakHours || [];
        const full = Array.from({ length: 24 }, (_, h) => ({
          hour: `${h}:00`,
          booking_count: hours.find((p: any) => p.hour === h)?.booking_count || 0,
        }));
        setPeakHours(full);
      }),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [period]);

  const accentColor = '#6C63FF';

  return (
    <main className="pt-16">
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold mb-8">Analytics</h1>

        {/* Period selector */}
        <div className="flex gap-2 mb-8">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                period === p.value ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}>
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="skeleton h-72 rounded-2xl" />
            <div className="skeleton h-48 rounded-2xl" />
            <div className="skeleton h-72 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Revenue chart */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-bold mb-4">Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 19%)" />
                  <XAxis dataKey="date" stroke="#9090A8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9090A8" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 10, color: '#F0F0F8' }} />
                  <Line type="monotone" dataKey="revenue" stroke={accentColor} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </section>

            {/* Bookings by event */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-bold mb-4">Bookings by Event</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Event</th>
                      <th className="px-4 py-2 font-medium">Confirmed</th>
                      <th className="px-4 py-2 font-medium">Occupancy</th>
                      <th className="px-4 py-2 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventStats.map(e => (
                      <tr key={e.event_id} className="border-b border-border/50">
                        <td className="px-4 py-3 font-medium">{e.title}</td>
                        <td className="px-4 py-3 font-mono">{e.confirmed_bookings}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${e.occupancy_pct}%` }} />
                            </div>
                            <span className="font-mono text-xs text-muted-foreground w-12 text-right">{e.occupancy_pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-primary">{formatCurrency(e.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Peak hours */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-bold mb-4">Peak Hours</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 19%)" />
                  <XAxis dataKey="hour" stroke="#9090A8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9090A8" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A1A24', border: '1px solid #2A2A38', borderRadius: 10, color: '#F0F0F8' }} />
                  <Bar dataKey="booking_count" fill={accentColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default AnalyticsPage;
