import { Link } from 'react-router-dom';
import { formatDateTime } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCategoryColor } from '@/utils/categories';
import { MapPin, Calendar } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  category: string;
  location: string;
  event_date: string;
  base_price: string;
  current_price: string;
  available_seats: number;
  total_seats: number;
}

const EventCard = ({ event }: { event: Event }) => {
  const basePrice = Number(event.base_price);
  const currentPrice = Number(event.current_price);
  const isDynamic = currentPrice !== basePrice;
  const isSurge = currentPrice > basePrice;

  const seatLabel = () => {
    if (event.available_seats === 0) return { text: 'SOLD OUT', cls: 'bg-destructive/20 text-destructive' };
    if (event.available_seats <= 10) return { text: `⚡ ${event.available_seats} left`, cls: 'bg-warning/20 text-warning' };
    return { text: `${event.available_seats} available`, cls: 'bg-success/20 text-success' };
  };

  const seat = seatLabel();

  return (
    <Link
      to={`/events/${event.id}`}
      className="group block rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary hover:-translate-y-1 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
    >
      {/* Top row: category + pricing tag */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: getCategoryColor(event.category) + '22', color: getCategoryColor(event.category) }}
        >
          {event.category}
        </span>
        {isDynamic && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isSurge ? 'bg-destructive/15 text-destructive' : 'bg-success/15 text-success'}`}>
            {isSurge ? '🔥 Surge' : '🎉 Early Bird'}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-3 font-display text-lg font-semibold leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
        {event.title}
      </h3>

      {/* Meta */}
      <div className="mb-4 flex flex-col gap-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>
        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDateTime(event.event_date)}</span>
      </div>

      {/* Bottom row: price + seats */}
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-2">
          {isDynamic && (
            <span className="font-mono text-xs text-muted-foreground line-through">{formatCurrency(basePrice)}</span>
          )}
          <span className="font-mono text-lg font-bold text-primary">{formatCurrency(currentPrice)}</span>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${seat.cls}`}>
          {seat.text}
        </span>
      </div>
    </Link>
  );
};

export default EventCard;
