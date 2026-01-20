/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export interface IProps {
    data: {
        labels: string[];
        datasets: Array<{
            label?: string;
            data: number[];
            backgroundColor: string | string[];
            borderColor?: string | string[];
            borderWidth?: number;
        }>;
    };
    options: {
        [x: string]: unknown;
    };
    width?: number | string;
    height?: number | string;
}

const HorizontalBarChart = forwardRef<any, IProps>(
    ({ data, options, width, height }, ref) => {
        return (
            <Bar
                data={data}
                ref={ref}
                options={{
                    indexAxis: "y" as const,
                    responsive: true,
                    maintainAspectRatio: false,
                    ...options,
                }}
                width={width}
                height={height}
            />
        );
    }
);

HorizontalBarChart.defaultProps = {
    width: "100%",
    height: "100%",
};

HorizontalBarChart.displayName = "HorizontalBarChart";

export default HorizontalBarChart;
