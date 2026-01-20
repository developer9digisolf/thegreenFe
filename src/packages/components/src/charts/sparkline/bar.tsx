import { Sparklines, SparklinesBars } from "react-sparklines";
import { ISparklineProps } from "./types";

const SparklinesBar = ({
    data,
    limit,
    width,
    height,
    svgWidth,
    svgHeight,
    preserveAspectRatio,
    margin,
    min,
    max,
    style,
    points,
    barStyle,
    barHeight,
    barWidth,
    onMouseMove,
}: ISparklineProps) => {
    return (
        <Sparklines
            data={data}
            limit={limit}
            width={width}
            height={height}
            svgWidth={svgWidth}
            svgHeight={svgHeight}
            preserveAspectRatio={preserveAspectRatio}
            margin={margin}
            min={min}
            max={max}
            style={style}
        >
            <SparklinesBars
                points={points}
                height={barHeight}
                style={barStyle}
                barWidth={barWidth}
                margin={margin}
                onMouseMove={onMouseMove}
            />
        </Sparklines>
    );
};

export default SparklinesBar;
