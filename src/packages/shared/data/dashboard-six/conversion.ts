import { IJobConversion } from "../../types";

const conversions: IJobConversion[] = [
    {
        id: 1,
        title: "Interview Schedules",
        amount: 540,
        icon: "fa fa-calendar",
        color: "#0168fa",
    },
    {
        id: 2,
        title: "Application Sent",
        amount: 630,
        icon: "fa fa-briefcase",
        color: "#10b759",
    },
    {
        id: 3,
        title: "Profile Viewed",
        amount: 350,
        icon: "fa fa-eye",
        color: "#00b8d4",
    },
    {
        id: 4,
        title: "Unread Messages",
        amount: 5,
        icon: "fa fa-envelope",
        color: "#00cccc",
    },
];

export default conversions;
