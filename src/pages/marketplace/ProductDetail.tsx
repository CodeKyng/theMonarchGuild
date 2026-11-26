import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Product Detail</h1>
      <p className="text-muted-foreground">
        Viewing product / NFT ID: <span className="font-mono">{id}</span>
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        This page will support both Merch and NFT details.
      </p>
    </div>
  );
}
