import ApexChart from "react-apexcharts";
import { IProps } from "./types";

const DonutChart = ({ options, series, width, height }: IProps) => {
    return (
        <ApexChart
            type="donut"
            options={options}
            series={series}
            height={height}
            width={width}
        />
    );
};

export default DonutChart;
