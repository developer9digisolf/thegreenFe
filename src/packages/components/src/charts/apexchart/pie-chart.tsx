import ApexChart from "react-apexcharts";
import { IProps } from "./types";

const PieChart = ({ options, series, width, height }: IProps) => {
    return (
        <ApexChart
            type="pie"
            options={options}
            series={series}
            height={height}
            width={width}
        />
    );
};

export default PieChart;
