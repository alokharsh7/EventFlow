const Footer = () => (
  <footer className="border-t border-border bg-card py-8">
    <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-center">
      <p className="font-display text-lg font-semibold">
        ⚡ Event<span className="text-primary">Flow</span>
      </p>
      <p className="text-sm text-muted-foreground font-body">
        © {new Date().getFullYear()} EventFlow. Discover. Book. Experience.
      </p>
    </div>
  </footer>
);

export default Footer;
