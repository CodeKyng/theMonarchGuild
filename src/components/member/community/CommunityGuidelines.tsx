import { HeartHandshake, Lightbulb, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const guidelines = [
  { text: "Lead with respect and assume good intent.", icon: HeartHandshake },
  { text: "Share useful context when asking for help.", icon: Lightbulb },
  { text: "Celebrate progress and give credit to collaborators.", icon: Sparkles },
  { text: "Never share passwords, seed phrases, or private keys.", icon: ShieldCheck },
];
export default function CommunityGuidelines() {
  return <div className="space-y-4"><Card className="border-border/70 shadow-sm"><CardHeader><CardTitle>Community guidelines</CardTitle><p className="text-sm text-muted-foreground">A few habits help make this a useful space for everyone.</p></CardHeader><CardContent className="space-y-4">{guidelines.map(({ text, icon: Icon }) => <div key={text} className="flex gap-3"><Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><p className="text-sm leading-5 text-muted-foreground">{text}</p></div>)}</CardContent></Card><Card className="border-amber-500/20 bg-amber-500/5 shadow-none"><CardContent className="p-4"><p className="text-sm font-semibold">Your guild, your growth</p><p className="mt-1 text-sm leading-5 text-muted-foreground">Ask questions, share what you know, and make room for others to learn with you.</p></CardContent></Card></div>;
}
