import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '@/api/eventApi';
import { analyticsApi } from '@/api/analyticsApi';
import { bookingApi } from '@/api/bookingApi';
import { formatDateTime } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCategoryColor } from '@/utils/categories';
import { toast } from 'sonner';
import { CalendarDays, Ticket, IndianRupee, BarChart3, Plus, X } from 'lucide-react';

const DashboardPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingsModal, setBookingsModal] = useState<{ eventId: number; title: string } | null>(null);
  const [eventBookings, setEventBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      eventApi.getOrganizerEvents().then(r => setEvents(r.data.data.events || [])),
      analyticsApi.overview().then(r => setOverview(r.data.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this event?')) return;
    try {
      await eventApi.remove(id);
      toast.success('Event cancelled');
      setEvents(events.map(e => e.id === id ? { ...e, status: 'cancelled' } : e));
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const openBookings = async (eventId: number, title: string) => {
    setBookingsModal({ eventId, title });
    setBookingsLoading(true);
    try {
      const res = await bookingApi.getByEvent(eventId);
      setEventBookings(res.data.data.bookings || []);
    } catch { setEventBookings([]); }
    finally { setBookingsLoading(false); }
  };

  const statCards = overview ? [
    { icon: CalendarDays, label: 'Total Events', value: overview.totalEvents },
    { icon: Ticket, label: 'Total Bookings', value: overview.totalBookings },
    { icon: IndianRupee, label: 'Total Revenue', value: formatCurrency(overview.totalRevenue) },
    { icon: BarChart3, label: 'Avg Occupancy', value: `${overview.averageOccupancy}%` },
  ] : [];

  return (
    <main className="pt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <Link to="/organizer/events/create"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-accent-bright transition-colors shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
            <Plus className="h-4 w-4" /> Create Event
          </Link>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        ) : overview && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {statCards.map(s => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5 animate-fade-in">
                <s.icon className="h-5 w-5 text-primary mb-3" />
                <p className="font-mono text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Events table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Seats</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id} className="border-b border-border/50 hover:bg-elevated/50 transition-colors">
                    <td className="px-5 py-3 font-medium">{e.title}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: getCategoryColor(e.category) + '22', color: getCategoryColor(e.category) }}>{e.category}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDateTime(e.event_date)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        e.status === 'published' ? 'bg-success/15 text-success' :
                        e.status === 'cancelled' ? 'bg-destructive/15 text-destructive' :
                        e.status === 'draft' ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground'
                      }`}>{e.status}</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-muted-foreground">{e.available_seats}/{e.total_seats}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <Link to={`/organizer/events/${e.id}/edit`} className="text-xs text-primary hover:underline">Edit</Link>
                        {e.status !== 'cancelled' && (
                          <button onClick={() => handleCancel(e.id)} className="text-xs text-destructive hover:underline">Cancel</button>
                        )}
                        <button onClick={() => openBookings(e.id, e.title)} className="text-xs text-info hover:underline">Bookings</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bookings Modal */}
      {bookingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setBookingsModal(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold">Bookings — {bookingsModal.title}</h3>
              <button onClick={() => setBookingsModal(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            {bookingsLoading ? <div className="skeleton h-40 rounded-xl" /> : eventBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {eventBookings.map(b => (
                  <div key={b.id} className="rounded-xl border border-border p-4 text-sm">
                    <div className="flex justify-between mb-1"><span className="font-medium">{b.user_name}</span><span className="font-mono text-primary">{formatCurrency(b.amount_paid)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>{b.user_email}</span><span>{b.seats_booked} seat{b.seats_booked > 1 ? 's' : ''} · <span className="capitalize">{b.status}</span></span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default DashboardPage;
