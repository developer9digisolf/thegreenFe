import {
    Calendar,
    Users,
    FileText,
    User,
    PieChart,
    Package,
    Layers,
    Box,
    ShoppingCart,
    Shield,
    Grid,
    Briefcase,
    Globe,
    UserCheck,
} from "react-feather";

const asideMenus = [
    {
        id: 1,
        label: "Dashboard",
        url: "/dashboard",
        Icon: PieChart,
    },
    {
        id: 100,
        label: "Manage Access",
        url: "/",
        Icon: Shield,
        megamenu: [
            {
                id: 101,
                title: "User",
                Icon: User,
                submenu: [
                    {
                        id: 1011,
                        label: "User Has Branch",
                        url: "/dashboard/manage-access/user-has-branch",
                    },
                    {
                        id: 1012,
                        label: "User Has Company",
                        url: "/dashboard/manage-access/user-has-company",
                    },
                    {
                        id: 1013,
                        label: "User List",
                        url: "/dashboard/manage-access/users",
                    },
                ],
            },
        ],
    },
    {
        id: 200,
        label: "Master",
        url: "/",
        Icon: Grid,
        submenu: [
            {
                id: 201,
                label: "Service Categories",
                url: "/dashboard/master/service-categories",
                Icon: Layers,
            },
            {
                id: 202,
                label: "Services",
                url: "/dashboard/master/services",
                Icon: Box,
            },
            {
                id: 203,
                label: "Shift",
                url: "/dashboard/master/shift",
                Icon: Calendar,
            },
            {
                id: 204,
                label: "Payment Method",
                url: "/dashboard/master/payment-method",
                Icon: ShoppingCart,
            },
        ],
    },
    {
        id: 300,
        label: "Organizations",
        url: "/",
        Icon: Briefcase,
        submenu: [
            {
                id: 301,
                label: "Company",
                url: "/dashboard/organizations/companies",
                Icon: Globe,
            },
            {
                id: 302,
                label: "Branch",
                url: "/dashboard/organizations/branches",
                Icon: Layers,
            },
            {
                id: 303,
                label: "Employees",
                url: "/dashboard/organizations/employees",
                Icon: Users,
                submenu: [
                    {
                        id: 3031,
                        label: "One Time Shifts",
                        url: "/dashboard/organizations/employees/one-time-shifts",
                    },
                    {
                        id: 3032,
                        label: "Recurring Shifts",
                        url: "/dashboard/organizations/employees/recurring-shifts",
                    },
                ],
            },
            {
                id: 304,
                label: "Position",
                url: "/dashboard/organizations/positions",
                Icon: UserCheck,
            },
            {
                id: 305,
                label: "Department",
                url: "/dashboard/organizations/departments",
                Icon: Layers,
            },
        ],
    },
    {
        id: 400,
        label: "Branch Service",
        url: "/",
        Icon: Box,
        submenu: [
            {
                id: 401,
                label: "Service Variant",
                url: "/dashboard/master/service-variants",
                Icon: Layers,
            },
            {
                id: 402,
                label: "Service Package",
                url: "/dashboard/master/packages",
                Icon: Package,
            },
        ],
    },
];

export default asideMenus;
