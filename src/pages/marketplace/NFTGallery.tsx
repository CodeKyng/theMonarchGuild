export default function NFTGallery() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">NFT Gallery</h1>
      <p className="text-muted-foreground mb-6">
        Official Monarch Guild NFTs only. Filter by Rank & Role.
      </p>

      <div className="flex flex-wrap gap-3 mb-8">
        <button className="px-4 py-2 rounded-lg border text-sm">All</button>
        <button className="px-4 py-2 rounded-lg border text-sm">Rookie</button>
        <button className="px-4 py-2 rounded-lg border text-sm">Adventurer</button>
        <button className="px-4 py-2 rounded-lg border text-sm">Elder</button>
        <button className="px-4 py-2 rounded-lg border text-sm">Monarch</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* NFT cards will go here */}
        <div className="rounded-xl border border-border bg-card p-4 text-center text-muted-foreground">
          NFT grid coming soon
        </div>
      </div>
    </div>
  );
}
