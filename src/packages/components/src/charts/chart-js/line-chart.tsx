import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

export interface IProps {
    data: {
        labels: string[];
        datasets: Array<{
            label?: string;
            data: number[];
            backgroundColor?: string;
            borderColor?: string;
            borderWidth?: number;
            tension?: number;
            fill?: boolean;
            pointRadius?: number;
        }>;
    };
    options: {
        [x: string]: unknown;
    };
    width?: number | string;
    height?: number | string;
}

const LineChart = ({ data, options, width, height }: IProps) => (
    <Line
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

LineChart.defaultProps = {
    width: "100%",
    height: "100%",
};

export default LineChart;
