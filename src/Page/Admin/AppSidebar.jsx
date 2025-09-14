"use client";
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
    HomeOutlined,
    ShoppingOutlined,
    FileOutlined,
    UserOutlined
} from "@ant-design/icons";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "antd";

export function AppSidebar({ selectedKey, onSelect, collapsed }) {
    const menuItems = [
        {
            key: "home",
            icon: <HomeOutlined />,
            label: "Trang chủ"
        },
        {
            key: "products",
            icon: <ShoppingOutlined />,
            label: "Quản lý sản phẩm"
        },
        {
            key: "category",
            icon: <FileOutlined />,
            label: "Quản lý danh mục"
        },
        {
            key: "order",
            icon: <ShoppingOutlined />,
            label: "Quản lý đơn hàng"
        },
        {
            key: "users",
            icon: <UserOutlined />,
            label: "Quản lý người dùng"
        },
    ];

    return (
        <TooltipProvider delayDuration={0}>
            <Sidebar collapsed={collapsed} collapsible="icon">
                <SidebarHeader>
                    <div className="text-center mb-6 font-bold text-xl">
                        {!collapsed ? "ADMIN" : "A"}
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.key}>
                                <SidebarMenuButton
                                    onClick={() => onSelect(item.key)}
                                    isActive={selectedKey === item.key}
                                    tooltip={item.label}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <div className="text-center text-sm italic">
                        {!collapsed && "©2025: Nhóm 3"}
                    </div>
                </SidebarFooter>
            </Sidebar>
        </TooltipProvider>
    );
}
