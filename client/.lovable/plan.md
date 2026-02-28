

# EventFlow — Full-Stack Event Booking Platform Frontend

## Overview
A premium, dark-themed event booking platform with multi-role support (User & Organizer). Features a sophisticated design system with custom typography (Clash Display, DM Sans, JetBrains Mono), a purple-indigo accent palette, and polished UI interactions. Connects to an external REST API backend.

---

## Phase 1: Design System & Core Setup

- **Custom CSS variables** — Dark luxury color palette (near-black backgrounds, purple-indigo accents, semantic status colors)
- **Typography setup** — Clash Display for headings, DM Sans for body, JetBrains Mono for prices/IDs via Google Fonts + CDN
- **Custom component primitives** — Buttons (primary, ghost), inputs, cards, badges, and loaders built from scratch (no shadcn) with hover glows and transitions
- **Axios instance** — Configured with base URL from env, automatic Bearer token injection, and global 401 redirect
- **Auth Context** — React Context for login/logout/user state with localStorage persistence and token verification on mount
- **Protected Route component** — Role-based route guards for user and organizer routes
- **Utility functions** — Date formatting (en-IN locale), currency formatting (₹ INR), and future-date checks

## Phase 2: Auth Pages

- **Login page** — Split two-column layout: decorative left panel with gradient orb, logo, tagline, and feature bullets; right panel with email/password form (show/hide toggle), inline error handling, role-based redirect on success
- **Register page** — Same split layout with Full Name, Email, Password, Confirm Password fields, and a stylized role toggle ("I'm a User 🎟️" / "I'm an Organizer 🎪"), client-side validation, and auto-login on success

## Phase 3: Navigation & Layout

- **Navbar** — Fixed top with blur backdrop, "⚡EventFlow" logo, conditional links based on auth state and role, avatar circle with first initial, logout button, mobile hamburger menu with slide-down animation
- **Footer** — Simple branded footer

## Phase 4: Home & Event Discovery (User)

- **Hero section** — Full-width dark section with CSS grid background pattern, gradient blob, large Clash Display heading "Discover Events That Move You", and a prominent search/filter bar (location, category dropdown, date picker, search button)
- **Category filter pills** — Horizontal scrollable pills (All, Music, Tech, Comedy, Sports, Food, Art, Business) with color coding
- **Events grid** — Responsive 1/2/3 column grid of EventCards with skeleton loading states and empty state messaging
- **EventCard component** — Category badge, dynamic pricing tag (🔥 Surge / 🎉 Early Bird), title with 2-line clamp, location + date meta, price display with strikethrough for dynamic pricing, seat availability pill (Sold Out / ⚡ N left / N available), hover lift + glow effect

## Phase 5: Event Detail & Booking (User)

- **Event detail page** — Two-column layout: left side with full event info (category, title, date, location, organizer, description, stats row); right side with sticky booking widget
- **Booking widget states** — Seat selector with +/- buttons and live total calculation when available; "SOLD OUT + Join Waitlist" when no seats; "Login to Book" for unauthenticated users; "Organizer View" message for organizers
- **Waitlist integration** — Join waitlist on sold-out events, shows queue position confirmation

## Phase 6: My Bookings & Tickets (User)

- **My Bookings page** — Vertical list of booking cards with colored left accent bar (green=confirmed, red=cancelled), event details, amount in monospace, status badge, "View Ticket" and "Cancel" actions
- **QR Ticket modal** — Physical ticket-style design with dashed border divider, event info, large QR code image (from base64), booking ID in monospace, download button that saves the QR as PNG
- **Cancel booking flow** — Confirmation prompt before cancellation, toast feedback, list refresh

## Phase 7: Waitlist Page (User)

- **Waitlist page** — List of waitlisted events showing event details, large position number in accent color ("Position #2"), "Leave Waitlist" button with confirmation and toast feedback, empty state message

## Phase 8: Organizer Dashboard

- **Dashboard page** — Page header with "Create New Event" CTA, four stats cards (Total Events, Total Bookings, Total Revenue in ₹, Avg Occupancy %) pulled from analytics overview endpoint
- **Events table** — Columns for Title, Category, Date, Status (color-coded badge), Seats, and Actions (Edit, Cancel, View Bookings)
- **View Bookings modal** — Shows list of attendees for a specific event with name, email, seats, amount, and status

## Phase 9: Event Management (Organizer)

- **Create Event page** — Form with Title, Description (textarea), Category (styled select), Location, Date/Time (datetime-local), Total Seats, Base Price (₹), client-side validation (future date, min chars, positive numbers), success toast + redirect
- **Edit Event page** — Same form pre-filled with existing event data from API, submit updates via PUT

## Phase 10: Analytics (Organizer)

- **Period selector** — Toggle buttons for 7 Days / 30 Days / 90 Days
- **Revenue line chart** — Recharts LineChart with accent-colored line, dark grid, formatted tooltip
- **Bookings by event table** — Event name, confirmed bookings count, occupancy progress bar (accent-colored fill), revenue
- **Peak hours bar chart** — Recharts BarChart showing booking activity across 24 hours with filled gaps

