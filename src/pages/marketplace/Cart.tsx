export default function Cart() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
      <p className="text-muted-foreground mb-8">
        Review your items before checkout.
      </p>

      <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
        Cart is empty for now. Add items from the Shop or NFT Gallery.
      </div>
    </div>
  );
}
