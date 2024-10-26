import { Brush, Calendar, ChartLine, Home, Inbox, Plug2, Search, Settings, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Edit Page",
    url: "/dashboard/creator/editpage",
    icon: Brush,
  },
  {
    title: "Integrations",
    url: "/dashboard/creator/integrations",
    icon: Plug2,
  },
  {
    title: "Members",
    url: "/dashboard/creator/members",
    icon: Users,
  },
  {
    title: "Analytics",
    url: "/dashboard/creator/analytics",
    icon: ChartLine,
  }
]

export function DSidebar({title}) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
