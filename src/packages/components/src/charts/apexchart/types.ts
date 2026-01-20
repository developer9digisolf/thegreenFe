/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IProps {
    options: {
        [x: string]: unknown;
    };
    series:
        | Array<{
              name?: string;
              data: any[];
          }>
        | number[];
    width?: string | number;
    height?: string | number;
}

type TType =
    | "bar"
    | "line"
    | "column"
    | "area"
    | "histogram"
    | "pie"
    | "donut"
    | "rangeBar"
    | "radialBar"
    | "scatter"
    | "bubble"
    | "heatmap"
    | "candlestick"
    | "radar"
    | "polarArea";

export interface IMixChart extends IProps {
    type?: TType;
    series: Array<{
        name?: string;
        data: any[];
        type: TType;
    }>;
}
