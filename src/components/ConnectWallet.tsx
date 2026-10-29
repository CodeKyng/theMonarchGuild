import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ConnectButton, useActiveAccount, useDisconnect } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { baseSepolia } from "thirdweb/chains";
import { Link2, LoaderCircle, Unlink, Wallet } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebase";
import { thirdwebClient } from "@/lib/thirdweb";

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
];

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function ConnectWallet() {
  const { user } = useAuth();
  const account = useActiveAccount();
  const { disconnect } = useDisconnect();
  const [linkedAddress, setLinkedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      setLoading(false);
      return;
    }
    getDoc(doc(db, "users", user.uid))
      .then((snapshot) => {
        if (!active) return;
        const data = snapshot.data() ?? {};
        const address = typeof data.walletAddress === "string" ? data.walletAddress : null;
        setLinkedAddress(address && address.startsWith("0x") ? address : null);
      })
      .catch((error) => {
        console.error("Failed to load linked wallet:", error);
        if (active) setFeedback({ type: "error", message: "Could not load your linked wallet." });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !account?.address || saving) return;
    const address = account.address;
    if (linkedAddress?.toLowerCase() === address.toLowerCase()) return;

    let cancelled = false;
    (async () => {
      setSaving(true);
      setFeedback(null);
      try {
        await updateDoc(doc(db, "users", user.uid), {
          walletAddress: address,
          walletLinkedAt: serverTimestamp(),
        });
        if (!cancelled) {
          setLinkedAddress(address);
          setFeedback({ type: "success", message: "Wallet linked to your profile." });
        }
      } catch (error) {
        console.error("Failed to link wallet:", error);
        if (!cancelled) {
          setFeedback({ type: "error", message: "Could not link this wallet. Try again." });
        }
      } finally {
        if (!cancelled) setSaving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, account?.address, linkedAddress, saving]);

  async function unlinkWallet() {
    if (!user) return;
    setSaving(true);
    setFeedback(null);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        walletAddress: null,
        walletLinkedAt: null,
      });
      setLinkedAddress(null);
      if (account) {
        try {
          await disconnect();
        } catch {
          // ignore disconnect errors
        }
      }
      setFeedback({ type: "success", message: "Wallet unlinked from your profile." });
    } catch (error) {
      console.error("Failed to unlink wallet:", error);
      setFeedback({ type: "error", message: "Could not unlink wallet. Try again." });
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <Card className="border-primary/15">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="size-5 text-primary" />
          <CardTitle>Connect wallet</CardTitle>
        </div>
        <CardDescription>
          Link a wallet to your guild profile for task rewards, on-chain activity, and identity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Loading wallet status…
          </div>
        ) : (
          <>
            {linkedAddress && (
              <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Linked to profile</p>
                  <p className="break-all font-mono text-sm font-medium" title={linkedAddress}>
                    {shortAddress(linkedAddress)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{linkedAddress}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => void unlinkWallet()}
                  className="shrink-0"
                >
                  {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Unlink className="size-4" />}
                  Unlink
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Link2 className="mt-0.5 size-4 shrink-0" />
                <span>
                  {linkedAddress
                    ? "Connect again to switch wallets, or unlink to remove the address from your profile."
                    : "Connect your wallet to save the address on your profile."}
                </span>
              </div>
              <div className="shrink-0">
                <ConnectButton
                  client={thirdwebClient}
                  chain={baseSepolia}
                  wallets={wallets}
                  connectButton={{ label: "Connect Wallet" }}
                  theme="dark"
                />
              </div>
            </div>

            {saving && !linkedAddress && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Linking wallet to your profile…
              </p>
            )}

            {feedback && (
              <p
                role={feedback.type === "error" ? "alert" : "status"}
                className={
                  feedback.type === "error" ? "text-sm text-destructive" : "text-sm text-emerald-600 dark:text-emerald-400"
                }
              >
                {feedback.message}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
