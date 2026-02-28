import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '@/api/bookingApi';
import { formatDateTime } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import { isFuture } from '@/utils/formatDate';
import QRTicket from '@/components/bookings/QRTicket';
import { toast } from 'sonner';
import { MapPin, Calendar } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-success',
  cancelled: 'bg-destructive',
  pending: 'bg-warning',
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMy();
      setBookings(res.data.data.bookings || []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this booking? Seats will be released.')) return;
    try {
      await bookingApi.cancel(id);
      toast.success('Booking cancelled');
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <main className="pt-16">
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold mb-2">My Tickets</h1>
        <p className="text-muted-foreground mb-8">All your event bookings in one place</p>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground mb-4">No bookings yet.</p>
            <Link to="/" className="text-primary hover:underline font-medium">Start exploring events →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="flex rounded-2xl border border-border bg-card overflow-hidden animate-fade-in">
                {/* Accent bar */}
                <div className={`w-1.5 ${STATUS_COLORS[b.status] || 'bg-muted'}`} />
                <div className="flex-1 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-1">{b.event_title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDateTime(b.event_date)}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {b.event_location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{b.seats_booked} seat{b.seats_booked > 1 ? 's' : ''}</span>
                      <span className="font-mono text-sm font-bold text-primary">{formatCurrency(b.amount_paid)}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        b.status === 'confirmed' ? 'bg-success/15 text-success' :
                        b.status === 'cancelled' ? 'bg-destructive/15 text-destructive' : 'bg-warning/15 text-warning'
                      }`}>{b.status}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setSelectedBooking(b)}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-accent-bright transition-colors">
                      View Ticket
                    </button>
                    {b.status === 'confirmed' && isFuture(b.event_date) && (
                      <button onClick={() => handleCancel(b.id)}
                        className="rounded-lg border border-destructive/50 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && <QRTicket booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
    </main>
  );
};

export default MyBookingsPage;
