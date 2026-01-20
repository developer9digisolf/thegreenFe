import ApexChart from "react-apexcharts";
import { IProps } from "./types";

const BarChart = ({ options, series, width, height }: IProps) => {
    return (
        <ApexChart
            type="bar"
            options={options}
            series={series}
            height={height}
            width={width}
        />
    );
};

export default BarChart;
