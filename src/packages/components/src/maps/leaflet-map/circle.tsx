import { Circle } from "react-leaflet";
import { ICircleProps } from "./types";

const LeafletCircle = ({
    lat,
    lng,
    radius,
    stroke,
    color,
    weight,
    opacity,
    lineCap,
    lineJoin,
    dashArray,
    dashOffset,
    fill,
    fillColor,
    fillOpacity,
    fillRule,
}: ICircleProps) => {
    const fillBlueOptions = {
        stroke,
        color,
        weight,
        opacity,
        lineCap,
        lineJoin,
        dashArray,
        dashOffset,
        fill,
        fillColor,
        fillOpacity,
        fillRule,
    };
    return (
        <Circle
            center={[lat, lng]}
            radius={radius}
            pathOptions={fillBlueOptions}
        />
    );
};

LeafletCircle.defaultProps = {
    radius: 200,
    stroke: true,
    color: "red",
    weight: 2,
    opacity: 1,
    lineCap: "inherit",
    lineJoin: "inherit",
    fill: true,
    fillColor: "blue",
    fillOpacity: 0.8,
    fillRule: "inherit",
};

export default LeafletCircle;
