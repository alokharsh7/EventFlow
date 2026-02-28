import { useState, useEffect } from 'react';
import { waitlistApi } from '@/api/waitlistApi';
import { formatDateTime } from '@/utils/formatDate';
import { toast } from 'sonner';
import { MapPin, Calendar } from 'lucide-react';

const WaitlistPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await waitlistApi.getMy();
      setItems(res.data.data.waitlist || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleLeave = async (eventId: number) => {
    if (!window.confirm('Leave this waitlist?')) return;
    try {
      await waitlistApi.leave(eventId);
      toast.success('Removed from waitlist');
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <main className="pt-16">
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold mb-2">My Waitlist</h1>
        <p className="text-muted-foreground mb-8">Events you're waiting for</p>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center"><p className="text-lg text-muted-foreground">You're not on any waitlists.</p></div>
        ) : (
          <div className="space-y-4">
            {items.map(w => (
              <div key={w.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 animate-fade-in">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-1">{w.event_title}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDateTime(w.event_date)}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {w.event_location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-display text-2xl font-bold text-primary">#{w.position}</p>
                    <p className="text-xs text-muted-foreground">Position</p>
                  </div>
                  <button onClick={() => handleLeave(w.event_id)}
                    className="rounded-lg border border-destructive/50 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors">
                    Leave
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default WaitlistPage;
