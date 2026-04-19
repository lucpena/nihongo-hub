"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { useRouter } from "next/navigation"
import { Progress } from "./ui/progress"
import { ACCOUNT_LEVEL_UP } from "@/lib/system"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    level: number
    experience: number
  } | null // for when it's loading 
}) {
  const { isMobile } = useSidebar()
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })

      if(res.ok) {
        // server deleted cookie
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error("Error login out: ", error);
    }
  }

  if(!user) return null;

  const initials = user.name ? user.name.substring(0,2).toUpperCase() : "??";
  const displayAvatar = user.avatar ? user.avatar : "/avatar.png"

  const nextLevelXp = ACCOUNT_LEVEL_UP; 
  const xpPercentage = Math.min((user.experience / nextLevelXp) * 100, 100);


  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-auto py-2"
            >
              <Avatar className="h-8 w-8 rounded-lg mt-0.5">
                <AvatarImage src={displayAvatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                
                {/* Always visible Level and XP bar */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold text-primary w-8">
                    Lv. {user.level || 1}
                  </span>
                  <Progress value={xpPercentage} className="h-1.5 flex-1" />
                </div>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg mt-0.5">
                  <AvatarImage src={displayAvatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  {/* <span className="truncate text-xs text-muted-foreground">{user.email}</span> */}
                  
                  {/* XP details in the dropdown */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold text-primary w-8">
                      Lv. {user.level || 1}
                    </span>
                    <Progress value={xpPercentage} className="h-1.5 flex-1" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 ml-10">
                    {user.experience} / {nextLevelXp} XP
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}