"use client"

import * as React from "react"
import logo from "../../public/logo.svg"

import {
  IconDashboard,
  IconUsers,
  IconFileText,
  IconCalendar,
  IconPhone,
  IconAward,
  IconSettings,
  IconHelp,
  IconSearch,
  IconChartBar,
  IconUserCheck,
  IconBuilding,
  IconBriefcase,
  IconClock,
  IconBell
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"

// Role-based navigation configuration
const getNavigationData = (user) => {
  const baseNav = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    }
  ];

  const adminNav = [
    {
      title: "Employee Management",
      url: "/employees",
      icon: IconUsers,
    },
    {
      title: "Task Management",
      url: "/tasks",
      icon: IconFileText,
    },
    {
      title: "Project Management",
      url: "/projects",
      icon: IconBriefcase,
    },
    {
      title: "Attendance Management",
      url: "/attendance",
      icon: IconClock,
    },
    // {
    //   title: "Payroll Management",
    //   url: "/payroll",
    //   icon: IconBuilding,
    // },
    // {
    //   title: "Recruitment",
    //   url: "/recruitment",
    //   icon: IconBriefcase,
    // },
    {
      title: "Performance",
      url: "/performance",
      icon: IconAward,
    },
    {
      title: "Announcements",
      url: "/announcements",
      icon: IconBell,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: IconChartBar,
    }
  ];

  const salesNav = [
    {
      title: "Sales Calls",
      url: "/sales/calls",
      icon: IconPhone,
    },
    {
      title: "Leads",
      url: "/sales/leads",
      icon: IconUserCheck,
    },
    {
      title: "Sales Reports",
      url: "/sales/reports",
      icon: IconChartBar,
    }
  ];

  const employeeNav = [
    {
      title: "My Tasks",
      url: "/tasks",
      icon: IconFileText,
    },
    {
      title: "Attendance",
      url: "/attendance",
      icon: IconClock,
    },
    {
      title: "Time Tracking",
      url: "/time-tracking",
      icon: IconClock,
    }
  ];

  const commonNav = [
    {
      title: "Profile",
      url: "/profile",
      icon: IconUserCheck,
    }
  ];

  let navMain = [...baseNav];

  // Add role-specific navigation
  if (user?.role === 'admin') {
    navMain = [...navMain, ...adminNav];
  } else if (user?.role === 'project_manager' || (user?.role === 'employee' && user?.designation === 'project_manager')) {
    // Project managers get admin nav but with attendance upload instead of management
    const projectManagerNav = adminNav.map(item => {
      if (item.title === 'Attendance Management') {
        return { ...item, title: 'Attendance Upload', url: '/attendance/upload' };
      }
      return item;
    });
    navMain = [...navMain, ...projectManagerNav];
  } else if (user?.designation === 'sales') {
    navMain = [...navMain, ...salesNav];
  } else {
    navMain = [...navMain, ...employeeNav];
  }

  // Add common navigation
  navMain = [...navMain, ...commonNav];

  return {
    user: {
      name: user?.firstName + ' ' + user?.lastName || "User",
      email: user?.email || "",
      avatar: user?.avatar || undefined,
    },
    navMain,
    navSecondary: [
      {
        title: "Settings",
        url: "/settings",
        icon: IconSettings,
      },
      {
        title: "Help",
        url: "/help",
        icon: IconHelp,
      },
      {
        title: "Search",
        url: "/search",
        icon: IconSearch,
      },
    ],
    documents: []
  };
};

export function AppSidebar({
  ...props
}) {
  const { user } = useAuth();

  // Get role-based navigation data
  const data = getNavigationData(user);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-42 right-5 items-center justify-center rounded-lg ">
                  <Image src={logo} alt="Infinitum CRM" />
                </div>
                {/* <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Infinitum CRM</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div> */}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
