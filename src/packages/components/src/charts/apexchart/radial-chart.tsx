import ApexChart from "react-apexcharts";
import { IProps } from "./types";

const RadialChart = ({ options, series, width, height }: IProps) => {
    return (
        <ApexChart
            type="radialBar"
            options={options}
            series={series}
            height={height}
            width={width}
        />
    );
};

export default RadialChart;
