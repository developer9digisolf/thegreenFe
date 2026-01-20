interface Point {
    x: number;
    y: number;
}

interface SparklinesProps {
    data?: number[];
    limit?: number;
    width?: number;
    height?: number;
    svgWidth?: React.SVGAttributes<React.ReactSVGElement>["width"];
    svgHeight?: React.SVGAttributes<React.ReactSVGElement>["height"];
    preserveAspectRatio?: React.SVGAttributes<React.ReactSVGElement>["preserveAspectRatio"];
    margin?: number;
    min?: number;
    max?: number;
    style?: React.SVGAttributes<React.ReactSVGElement>["style"];
}

interface SparklinesBarsProps {
    points?: Point[];
    height?: number;
    style?: React.SVGAttributes<React.ReactSVGElement>["style"];
    barWidth?: number;
    margin?: number;
    onMouseMove?: (
        p: Point,
        event: React.MouseEvent<React.ReactSVGElement>
    ) => void;
}

export interface ISparklineProps extends SparklinesProps, SparklinesBarsProps {
    barStyle?: React.SVGAttributes<React.ReactSVGElement>["style"];
    barHeight?: number;
}

interface SparklinesLineProps {
    color?: React.SVGAttributes<React.ReactSVGElement>["color"];
    style?: React.SVGAttributes<React.ReactSVGElement>["style"];
    onMouseMove?: (
        event: "enter" | "click",
        value: number,
        point: Point
    ) => void;
}
interface SparklinesSpotsProps {
    spotSize?: number;
    spotStyle?: React.SVGAttributes<React.ReactSVGElement>["style"];
    spotColors?: { [change: string]: string };
}

export interface ISparklineLineProps
    extends SparklinesProps,
        SparklinesLineProps,
        SparklinesSpotsProps {
    color?: React.SVGAttributes<React.ReactSVGElement>["color"];
    lineStyle?: React.SVGAttributes<React.ReactSVGElement>["style"];
    hasSpot?: boolean;
}
