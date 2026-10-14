import { useState } from "react";
import { sendEmailVerification, sendPasswordResetEmail, type User } from "firebase/auth";
import { AtSign, CheckCircle2, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { auth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInSecurityCard({ user }: { user: User }) {
  const [busy, setBusy] = useState<"verify" | "reset" | "">("");
  const [feedback, setFeedback] = useState("");
  const hasPassword = user.providerData.some((provider) => provider.providerId === "password");
  async function send(action: "verify" | "reset") {
    if (!user.email || busy) return;
    setBusy(action); setFeedback("");
    try {
      if (action === "verify") await sendEmailVerification(user);
      else await sendPasswordResetEmail(auth, user.email);
      setFeedback(action === "verify" ? "Verification email sent. Check your inbox." : "Password reset email sent. Check your inbox.");
    } catch (error) {
      console.error(`Failed to send ${action} email:`, error);
      setFeedback("We couldn’t send that email right now. Try again shortly.");
    } finally { setBusy(""); }
  }
  return <Card className="border-border/70 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4 text-primary" aria-hidden="true" />Sign-in security</CardTitle><p className="text-sm text-muted-foreground">Protect access to your Guild account.</p></CardHeader><CardContent className="space-y-3"><div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-background"><AtSign className="size-4 text-muted-foreground" /></span><div className="min-w-0 flex-1"><p className="text-sm font-medium">Email verification</p><p className="mt-1 text-xs text-muted-foreground">{user.emailVerified ? "Your sign-in email is verified." : "Verify your email to help secure account recovery."}</p></div>{user.emailVerified ? <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-label="Verified" /> : <Button type="button" size="sm" variant="outline" onClick={() => void send("verify")} disabled={busy !== "" || !user.email}>{busy === "verify" ? <LoaderCircle className="size-4 animate-spin" /> : "Send link"}</Button>}</div><div className="flex items-start gap-3 rounded-xl border border-border/70 p-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted"><KeyRound className="size-4 text-muted-foreground" /></span><div className="min-w-0 flex-1"><p className="text-sm font-medium">Password</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{hasPassword ? "Request a secure password reset link by email." : "Your password is managed by your connected sign-in provider."}</p></div>{hasPassword && <Button type="button" size="sm" variant="outline" onClick={() => void send("reset")} disabled={busy !== "" || !user.email}>{busy === "reset" ? <LoaderCircle className="size-4 animate-spin" /> : "Reset"}</Button>}</div>{feedback && <p role="status" className="text-xs leading-5 text-muted-foreground">{feedback}</p>}</CardContent></Card>;
}
