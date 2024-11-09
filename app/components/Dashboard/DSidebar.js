import { Brush, Plug2, Users, ChartLine } from "lucide-react"

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

const items = [
  {
    title: "Edit Page",
    icon: Brush,
  },
  {
    title: "Integrations",
    icon: Plug2,
  },
  {
    title: "Members",
    icon: Users,
  },
  {
    title: "Analytics",
    icon: ChartLine,
  }
]

export function DSidebar({ title, activeTab, onTabChange }) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-2xl font-medium text-gray-900">
            {title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={activeTab === item.title ? "bg-gray-300" : ""}
                    onClick={() => onTabChange(item.title)}
                  >
                    <button>
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
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