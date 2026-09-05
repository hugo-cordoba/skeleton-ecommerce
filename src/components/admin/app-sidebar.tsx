"use client"

import * as React from "react"
import {
  Store,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings2,
} from "lucide-react"

import { NavMain } from "@/components/admin/nav-main"
import { NavUser } from "@/components/admin/nav-user"
import { TeamSwitcher } from "@/components/admin/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: Store,
      plan: "Enterprise",
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
        {
          title: "Inventory",
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
        {
          title: "Cancelled",
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
          title: "Shipping",
          url: "/admin",
        },
        {
          title: "Payments",
          url: "/admin",
        },
      ],
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar: string
  }
  teams?: Array<{
    name: string
    logo: React.ElementType
    plan: string
  }>
}

export function AppSidebar({ user, teams, ...props }: AppSidebarProps) {
  const sidebarData = {
    ...data,
    user: user || data.user,
    teams: teams || data.teams,
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
