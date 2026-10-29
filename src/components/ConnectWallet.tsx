import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { baseSepolia } from "thirdweb/chains";
import { LoaderCircle, Unlink, Wallet } from "lucide-react";
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

/** Compact connect control for the top header (all roles). */
export function HeaderConnectWallet() {
  return (
    <div className="tw-wallet-host relative z-30 max-w-[9.5rem] shrink-0 overflow-hidden sm:max-w-none">
      <ConnectButton
        client={thirdwebClient}
        chain={baseSepolia}
        wallets={wallets}
        connectButton={{ label: "Connect" }}
        theme="dark"
      />
    </div>
  );
}

/** Full card that links the connected wallet address to the user profile in Firestore. */
export default function ConnectWallet() {
  const { user } = useAuth();
  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
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
    if (!user || !account?.address) return;
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
  }, [user, account?.address, linkedAddress]);

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
      if (activeWallet) {
        try {
          disconnect(activeWallet);
        } catch {
          // ignore
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
    <Card size="sm" className="min-w-0 border-primary/20 bg-primary/[0.03] shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="size-4" />
          </span>
          <div className="min-w-0 space-y-0.5">
            <CardTitle className="text-sm font-semibold">Connect wallet</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Link a wallet for task rewards and on-chain identity.
            </CardDescription>
          </div>
        </div>
        <div className="tw-wallet-host w-full shrink-0 sm:w-auto">
          <ConnectButton
            client={thirdwebClient}
            chain={baseSepolia}
            wallets={wallets}
            connectButton={{ label: "Connect Wallet" }}
            theme="dark"
          />
        </div>
      </CardHeader>

      {(loading || linkedAddress || saving || feedback) && (
        <CardContent className="space-y-2.5 pt-0">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading wallet status…
            </div>
          )}

          {!loading && linkedAddress && (
            <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Linked to profile</p>
                <p className="mt-0.5 font-mono text-sm font-medium" title={linkedAddress}>
                  {shortAddress(linkedAddress)}
                </p>
                <p className="mt-0.5 break-all text-xs text-muted-foreground">{linkedAddress}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => void unlinkWallet()}
                className="w-full shrink-0 sm:w-auto"
              >
                {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Unlink className="size-4" />}
                Unlink
              </Button>
            </div>
          )}

          {!loading && saving && !linkedAddress && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Linking wallet to your profile…
            </p>
          )}

          {feedback && (
            <p
              role={feedback.type === "error" ? "alert" : "status"}
              className={
                feedback.type === "error"
                  ? "text-sm text-destructive"
                  : "text-sm text-emerald-600 dark:text-emerald-400"
              }
            >
              {feedback.message}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
