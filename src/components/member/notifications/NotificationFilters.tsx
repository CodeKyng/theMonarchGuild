import { Bell, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NotificationFilters({
  filter,
  onFilter,
}: {
  filter: string;
  onFilter: (value: string) => void;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Your activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Messages, follows, task rewards, withdrawals, and more.
          </p>
        </div>
        <Select value={filter} onValueChange={(value) => onFilter(value ?? "all")}>
          <SelectTrigger aria-label="Filter notifications" className="w-full bg-background sm:w-52">
            <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="inline-flex items-center gap-2">
                <Bell className="size-3.5" />
                All notifications
              </span>
            </SelectItem>
            <SelectItem value="unread">Unread only</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
            <SelectItem value="follow">Follows</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
            <SelectItem value="reputation">Recognition</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
