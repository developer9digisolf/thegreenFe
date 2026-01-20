import ApexChart from "react-apexcharts";
import { IMixChart } from "./types";

const MixChart = ({ options, series, width, height }: IMixChart) => {
    return (
        <ApexChart
            type="line"
            options={options}
            series={series}
            height={height}
            width={width}
        />
    );
};

export default MixChart;
