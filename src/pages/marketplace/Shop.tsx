export default function Shop() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Merch Shop</h1>
      <p className="text-muted-foreground mb-8">
        Official Monarch Guild apparel. Prices in ETH + Naira.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Product cards will go here */}
        <div className="rounded-xl border border-border bg-card p-4 text-center text-muted-foreground">
          Product grid coming soon
        </div>
      </div>
    </div>
  );
}
