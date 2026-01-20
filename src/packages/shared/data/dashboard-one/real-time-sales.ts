const data = {
    options: {
        chart: {
            id: "real-time",
            height: 350,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "80%",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ["transparent"],
        },
        tooltip: {
            shared: true,
            intersect: false,
        },
        legend: {
            show: false,
        },
        xaxis: {
            categories: ["6am", "10am", "1pm", "4pm", "7pm", "10pm"],
            axisBorder: {
                show: true,
            },
            axisTicks: {
                show: true,
            },
            min: 0,
            tickAmount: 6,
            labels: {
                style: {
                    fontSize: "11px",
                },
            },
        },
        yaxis: {
            show: false,
        },
        grid: {
            show: true,
            borderColor: "#eceef4",
            strokeDashArray: 0,
            position: "back" as const,
            xaxis: {
                lines: {
                    show: true,
                },
            },
            yaxis: {
                lines: {
                    show: false,
                },
            },
        },
        colors: ["#69b2f8", "#d1e6fa"],
        fill: {
            opacity: 1,
        },
        responsive: [
            {
                breakpoint: 576,
                options: {
                    xaxis: {
                        tickAmount: 3,
                    },
                },
            },
        ],
    },
    series: [
        {
            data: [20, 60, 50, 45, 50, 60],
            name: "today",
        },
        {
            data: [10, 40, 30, 40, 55, 25],
            name: "yesterday",
        },
    ],
};

export default data;
