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
            barPercentage?: number;
            barThickness?: number;
        }>;
    };
    options: {
        [x: string]: unknown;
    };
    width?: number | string;
    height?: number | string;
}

export const BarChart = ({ data, options, width, height }: IProps) => {
    return (
        <Bar
            data={data}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                ...options,
            }}
            width={width}
            height={height}
        />
    );
};

BarChart.defaultProps = {
    width: "100%",
    height: "100%",
};

export default BarChart;
