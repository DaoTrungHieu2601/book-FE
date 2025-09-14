import classNames from "classnames/bind";
import styles from "./Index.module.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ManagerProduct from "./Components/ManagerProducts/ManagerProduct";
import DashBoard from "./Components/DashBoard/DashBoard";
import ManagerCategory from "./Components/ManagerCategory/ManagerCategory";
import ManagerOrder from "./Components/ManagerOrder/ManagerOrder";
import ManagerUser from "./Components/ManagerUser/ManagerUser";

import { requestAdmin } from "../../config/request";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";

const cx = classNames.bind(styles);

function Admin() {
    const [selectedKey, setSelectedKey] = useState("home");
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                await requestAdmin();
            } catch (error) {
                navigate("/");
            }
        };
        checkAdmin();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        navigate("/login");
    };

    const handleProfileClick = () => {
        setSelectedKey('users');
    };

    const renderContent = () => {
        switch (selectedKey) {
            case "products":
                return <ManagerProduct />;
            case "home":
                return <DashBoard />;
            case "category":
                return <ManagerCategory />;
            case "order":
                return <ManagerOrder />;
            case "users":
                return <ManagerUser />;
            default:
                return <ManagerUser />;
        }
    };

    return (
        <SidebarProvider>
            <div className="flex h-screen w-screen">
                <AppSidebar
                    selectedKey={selectedKey}
                    onSelect={setSelectedKey}
                    collapsed={collapsed}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white p-2 border-b flex items-center h-[70px] shrink-0 justify-between">
                        <SidebarTrigger onClick={() => setCollapsed(!collapsed)} />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mr-4">
                                    <Avatar>
                                        <AvatarFallback className="bg-indigo-600 text-white font-semibold">
                                            AD
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Thông tin cá nhân</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </header>
                    <main className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
                        {renderContent()}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}

export default Admin;
