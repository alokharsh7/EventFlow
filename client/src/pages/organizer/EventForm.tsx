import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventApi } from '@/api/eventApi';
import { CATEGORIES } from '@/utils/categories';
import { toast } from 'sonner';

const EventForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [form, setForm] = useState({
    title: '', description: '', category: 'Music', location: '',
    event_date: '', total_seats: '', base_price: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      eventApi.getById(id).then(res => {
        const e = res.data.data.event;
        setForm({
          title: e.title, description: e.description, category: e.category,
          location: e.location, event_date: e.event_date.slice(0, 16),
          total_seats: String(e.total_seats), base_price: String(e.base_price),
        });
      }).catch(() => navigate('/organizer/dashboard')).finally(() => setFetching(false));
    }
  }, [id]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.title.length < 3) errs.title = 'Min 3 characters';
    if (!form.event_date || new Date(form.event_date) <= new Date()) errs.event_date = 'Must be in the future';
    if (!form.total_seats || Number(form.total_seats) <= 0) errs.total_seats = 'Must be > 0';
    if (form.base_price === '' || Number(form.base_price) < 0) errs.base_price = 'Must be ≥ 0';
    if (!form.location) errs.location = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, total_seats: Number(form.total_seats), base_price: Number(form.base_price) };
      if (isEdit) await eventApi.update(id, payload);
      else await eventApi.create(payload);
      toast.success(isEdit ? 'Event updated!' : 'Event created! 🎉');
      navigate('/organizer/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  if (fetching) return <main className="pt-16"><div className="container mx-auto px-4 py-20 text-center"><div className="skeleton h-96 max-w-2xl mx-auto rounded-2xl" /></div></main>;

  const categories = CATEGORIES.filter(c => c !== 'All');

  return (
    <main className="pt-16">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-8">{isEdit ? 'Edit Event' : 'Create Event'}</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Title" error={errors.title}>
            <input value={form.title} onChange={e => update('title', e.target.value)} className="ef-input" placeholder="Event title" />
          </Field>

          <Field label="Description">
            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4} className="ef-input resize-none" placeholder="Describe your event..." />
          </Field>

          <Field label="Category">
            <select value={form.category} onChange={e => update('category', e.target.value)} className="ef-input">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Location" error={errors.location}>
            <input value={form.location} onChange={e => update('location', e.target.value)} className="ef-input" placeholder="City, Country" />
          </Field>

          <Field label="Event Date & Time" error={errors.event_date}>
            <input type="datetime-local" value={form.event_date} onChange={e => update('event_date', e.target.value)} className="ef-input" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Total Seats" error={errors.total_seats}>
              <input type="number" min="1" value={form.total_seats} onChange={e => update('total_seats', e.target.value)} className="ef-input" placeholder="100" />
            </Field>
            <Field label="Base Price (₹)" error={errors.base_price}>
              <input type="number" min="0" value={form.base_price} onChange={e => update('base_price', e.target.value)} className="ef-input" placeholder="500" />
            </Field>
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-accent-bright transition-colors shadow-[0_0_20px_hsl(var(--primary)/0.3)] disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
          </button>
        </form>
      </div>

      <style>{`
        .ef-input {
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--bg-elevated));
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          transition: border-color 0.2s;
        }
        .ef-input:focus {
          border-color: hsl(var(--primary));
          outline: none;
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
        }
        .ef-input::placeholder { color: hsl(var(--muted-foreground)); }
      `}</style>
    </main>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-muted-foreground">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
  </div>
);

export default EventForm;
