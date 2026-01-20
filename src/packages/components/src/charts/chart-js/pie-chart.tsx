import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface IProps {
    data: {
        labels: string[];
        datasets: Array<{
            data: number[];
            backgroundColor: string;
            borderColor?: string;
        }>;
    };
    options: {
        [x: string]: unknown;
    };
    width?: number | string;
    height?: number | string;
}

const PieChart = ({ data, options, width, height }: IProps) => (
    <Pie
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

PieChart.defaultProps = {
    width: "100%",
    height: "100%",
};

export default PieChart;
