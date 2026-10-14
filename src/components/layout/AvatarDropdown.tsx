"use client"

import {
  BadgeCheckIcon,
  LogOutIcon,
} from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export function AvatarDropdown() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const [signOutError, setSignOutError] = useState("")

  const initials = (user?.displayName || user?.email || "A")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("")

  async function handleSignOut() {
    setSignOutError("")
    try {
      await signOut(auth)
      navigate("/login", { replace: true })
    } catch (error) {
      console.error("Failed to sign out:", error)
      setSignOutError("Could not sign out. Please try again.")
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open account menu">
            <Avatar>
              <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || ""} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => role && navigate(`/${role}/account`)}>
            <BadgeCheckIcon />
            Account
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {signOutError && <p role="alert" className="px-2 py-1 text-xs text-destructive">{signOutError}</p>}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOutIcon />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
