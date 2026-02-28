import { useState, useEffect } from 'react';
import { eventApi } from '@/api/eventApi';
import EventCard from '@/components/events/EventCard';
import { CATEGORIES, getCategoryColor } from '@/utils/categories';
import { Search, MapPin } from 'lucide-react';

const HomePage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (category !== 'All') filters.category = category;
      if (location) filters.location = location;
      const res = await eventApi.getAll(filters);
      setEvents(res.data.data.events || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const filtered = searchTerm
    ? events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : events;

  return (
    <main className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        {/* Gradient blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Discover Events That<br /><span className="text-primary">Move You</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Find and book unforgettable experiences — concerts, conferences, comedy shows, and more.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location..."
                className="w-full rounded-lg border border-border bg-elevated pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors"
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="w-full rounded-lg border border-border bg-elevated pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-colors"
              />
            </div>
            <button type="submit" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent-bright transition-colors shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Category pills */}
      <section className="sticky top-16 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
              style={category === cat && cat !== 'All' ? { backgroundColor: getCategoryColor(cat), borderColor: getCategoryColor(cat) } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Events grid */}
      <section className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No events found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        )}
      </section>
    </main>
  );
};

export default HomePage;
