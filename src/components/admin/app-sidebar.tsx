"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  Package,
  PieChart,
  Settings2,
  ShoppingCart,
  SquareTerminal,
  Store,
} from "lucide-react"

import { NavMain } from "@/components/admin/nav-main"
import { NavProjects } from "@/components/admin/nav-projects"
import { NavUser } from "@/components/admin/nav-user"
import { TeamSwitcher } from "@/components/admin/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar: string
  }
  teamName?: string
}

export function AppSidebar({ user, teamName, ...props }: AppSidebarProps) {
  // This is sample data.
  const data = {
    user: user || {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: teamName || "Acme Inc",
        logo: Store,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
        isActive: true,
        items: [
          {
            title: "Overview",
            url: "/admin",
          },
          {
            title: "Analytics",
            url: "/admin",
          },
          {
            title: "Reports",
            url: "/admin",
          },
        ],
      },
      {
        title: "Products",
        url: "/admin/products",
        icon: Package,
        items: [
          {
            title: "All Products",
            url: "/admin/products",
          },
          {
            title: "New Product",
            url: "/admin/products/new",
          },
          {
            title: "Categories",
            url: "/admin/products",
          },
        ],
      },
      {
        title: "Orders",
        url: "/admin/orders",
        icon: ShoppingCart,
        items: [
          {
            title: "All Orders",
            url: "/admin/orders",
          },
          {
            title: "Pending",
            url: "/admin/orders",
          },
          {
            title: "Completed",
            url: "/admin/orders",
          },
        ],
      },
      {
        title: "Settings",
        url: "/admin",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "/admin",
          },
          {
            title: "Store",
            url: "/admin",
          },
          {
            title: "Payments",
            url: "/admin",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
