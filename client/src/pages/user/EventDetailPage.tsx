import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi } from '@/api/eventApi';
import { bookingApi } from '@/api/bookingApi';
import { waitlistApi } from '@/api/waitlistApi';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCategoryColor } from '@/utils/categories';
import { toast } from 'sonner';
import { MapPin, Calendar, User, Minus, Plus } from 'lucide-react';
import Loader from '@/components/common/Loader';

const EventDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);
  const [waitlistPos, setWaitlistPos] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    eventApi.getById(id!).then(res => setEvent(res.data.data.event)).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!event) return null;

  const basePrice = Number(event.base_price);
  const currentPrice = Number(event.current_price);
  const isDynamic = currentPrice !== basePrice;
  const isSurge = currentPrice > basePrice;
  const maxSeats = Math.min(4, event.available_seats);
  const total = currentPrice * seats;

  const handleBook = async () => {
    setError('');
    setBooking(true);
    try {
      await bookingApi.create({ event_id: event.id, seats_requested: seats });
      toast.success('Booking confirmed! 🎉');
      navigate('/my-bookings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleJoinWaitlist = async () => {
    try {
      const res = await waitlistApi.join(event.id);
      setWaitlistPos(res.data.data.position);
      toast.success('Joined waitlist!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to join waitlist');
    }
  };

  return (
    <main className="pt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left: Event info */}
          <div className="animate-fade-in">
            <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold mb-4"
              style={{ backgroundColor: getCategoryColor(event.category) + '22', color: getCategoryColor(event.category) }}>
              {event.category}
            </span>

            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(event.event_date)}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.location}</span>
              <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> Hosted by {event.organizer_name}</span>
            </div>

            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Seats', value: event.total_seats },
                { label: 'Available', value: event.available_seats },
                { label: 'Base Price', value: formatCurrency(basePrice) },
                { label: 'Current Price', value: formatCurrency(currentPrice) },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="font-mono text-lg font-bold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Booking widget */}
          <div className="animate-fade-in lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-border bg-elevated p-6">
              <h3 className="font-display text-xl font-bold mb-4">Book Tickets</h3>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold text-primary">{formatCurrency(currentPrice)}</span>
                  <span className="text-sm text-muted-foreground">/ seat</span>
                </div>
                {isDynamic && (
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${isSurge ? 'bg-destructive/15 text-destructive' : 'bg-success/15 text-success'}`}>
                    {isSurge ? '🔥 Surge Pricing' : '🎉 Early Bird Discount'}
                  </span>
                )}
              </div>

              {!user ? (
                <button onClick={() => navigate('/login', { state: { from: `/events/${id}` } })}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-accent-bright transition-colors">
                  Login to Book
                </button>
              ) : user.role === 'organizer' ? (
                <p className="text-center text-sm text-muted-foreground py-4">Organizer view — manage in dashboard</p>
              ) : event.available_seats === 0 ? (
                <div>
                  <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-center">
                    <p className="text-sm font-bold text-destructive">SOLD OUT</p>
                  </div>
                  {waitlistPos !== null ? (
                    <p className="text-center text-sm text-success font-medium">You're #{waitlistPos} on the waitlist ✓</p>
                  ) : (
                    <button onClick={handleJoinWaitlist}
                      className="w-full rounded-lg border border-primary py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                      Join Waitlist
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {/* Seat selector */}
                  <div className="mb-4 flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm text-muted-foreground">Seats</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSeats(Math.max(1, seats - 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground hover:border-primary"><Minus className="h-4 w-4" /></button>
                      <span className="font-mono text-lg font-bold w-6 text-center">{seats}</span>
                      <button onClick={() => setSeats(Math.min(maxSeats, seats + 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground hover:border-primary"><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>

                  <div className="mb-4 flex justify-between text-sm">
                    <span className="text-muted-foreground">{seats} × {formatCurrency(currentPrice)}</span>
                    <span className="font-mono font-bold text-foreground">{formatCurrency(total)}</span>
                  </div>

                  {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

                  <button onClick={handleBook} disabled={booking}
                    className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-accent-bright transition-colors shadow-[0_0_20px_hsl(var(--primary)/0.3)] disabled:opacity-50">
                    {booking ? 'Booking...' : 'Book Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EventDetailPage;
