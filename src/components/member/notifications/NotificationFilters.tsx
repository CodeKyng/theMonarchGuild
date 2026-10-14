import { Bell, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NotificationFilters({ filter, onFilter }: { filter: string; onFilter: (value: string) => void }) {
  return <Card className="border-border/70 shadow-sm"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Your activity</h2><p className="mt-1 text-sm text-muted-foreground">Messages and reputation awards sent directly to you.</p></div><Select value={filter} onValueChange={(value) => onFilter(value ?? "all")}><SelectTrigger aria-label="Filter notifications" className="w-full bg-background sm:w-48"><Filter className="size-4 text-muted-foreground" aria-hidden="true" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all"><span className="inline-flex items-center gap-2"><Bell className="size-3.5" />All notifications</span></SelectItem><SelectItem value="unread">Unread only</SelectItem><SelectItem value="message">New messages</SelectItem><SelectItem value="reputation">Recognition</SelectItem></SelectContent></Select></CardContent></Card>;
}
