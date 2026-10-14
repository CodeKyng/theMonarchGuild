import { ArrowRight, ShieldCheck, UserRoundCog } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RoleManagementCard() {
  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-400/10 via-card to-card shadow-sm">
      <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-400/20 text-amber-800 dark:text-amber-200"><UserRoundCog className="size-5" aria-hidden="true" /></span>
          <div>
            <h2 className="font-semibold">Manage a member’s role</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Open a member profile to assign Member, Staff, or Admin access. Role changes update the account’s workspace access immediately.</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" aria-hidden="true" />Admins can’t change their own role from the member profile.</p>
          </div>
        </div>
        <Button render={<Link to="/admin/members" />} className="shrink-0 gap-2 bg-amber-400 text-black hover:bg-amber-300">
          Open member access<ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  );
}
