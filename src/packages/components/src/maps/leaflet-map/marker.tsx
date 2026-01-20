import { Marker as MarkerComponent } from "react-leaflet";
import { IMarkerProps } from "./types";

const LeafletMarker = ({ lat, lng, children }: IMarkerProps) => {
    return <MarkerComponent position={[lat, lng]}>{children}</MarkerComponent>;
};

export default LeafletMarker;
