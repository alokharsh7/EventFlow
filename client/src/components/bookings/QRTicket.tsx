interface Props {
  booking: {
    id: number;
    event_title?: string;
    event_date?: string;
    event_location?: string;
    seats_booked: number;
    amount_paid: string;
    qr_code: string;
  };
  onClose: () => void;
}

const QRTicket = ({ booking, onClose }: Props) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = booking.qr_code;
    link.download = `EventFlow-Ticket-${booking.id}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Event info */}
        <h2 className="font-display text-xl font-bold text-foreground mb-1">{booking.event_title}</h2>
        <p className="text-sm text-muted-foreground mb-1">{booking.event_date}</p>
        <p className="text-sm text-muted-foreground mb-4">{booking.event_location}</p>

        {/* Dashed divider */}
        <div className="border-t-2 border-dashed border-border my-4" />

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <img src={booking.qr_code} alt="QR Ticket" className="h-48 w-48 rounded-lg" />
        </div>

        <div className="border-t-2 border-dashed border-border my-4" />

        {/* Booking details */}
        <div className="flex justify-between text-sm text-muted-foreground mb-6">
          <span>ID: <span className="font-mono text-foreground">#{booking.id}</span></span>
          <span>Seats: <span className="text-foreground font-semibold">{booking.seats_booked}</span></span>
          <span>Paid: <span className="font-mono text-primary font-semibold">₹{Number(booking.amount_paid).toLocaleString('en-IN')}</span></span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleDownload} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-accent-bright transition-colors">
            Download Ticket
          </button>
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRTicket;
