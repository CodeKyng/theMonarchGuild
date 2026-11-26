export default function MyCollection() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">My Collection</h1>
      <p className="text-muted-foreground mb-8">
        NFTs owned by your connected wallet.
      </p>

      <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
        Connect your wallet to view your Monarch Guild NFTs.
      </div>
    </div>
  );
}
