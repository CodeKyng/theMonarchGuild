export default function MarketplaceHome() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gold-500 mb-2">The Monarch Guild Marketplace</h1>
      <p className="text-muted-foreground mb-8">
        Welcome to the official Guild store. Merch + exclusive NFTs.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Featured Merch</h2>
          <p className="text-sm text-muted-foreground">Coming soon — Hoodies, Tees, Caps & more</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Featured NFTs</h2>
          <p className="text-sm text-muted-foreground">30 exclusive Monarch Guild avatars</p>
        </div>
      </div>
    </div>
  );
}
