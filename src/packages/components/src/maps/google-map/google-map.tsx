import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { LayoutProps } from "@doar/shared/styled";
import { MapKey } from "@doar/shared/data";
import Map from "./map";
import Marker from "./marker";
import { StyledMap } from "./style";

const render = (status: Status) => {
    return <h1>{status}</h1>;
};

type MapProps = google.maps.MapOptions &
    LayoutProps & {
        marker?: boolean;
    };

const MyMap: React.FC<MapProps> = ({ width, height, marker, ...options }) => {
    return (
        <StyledMap width={width} height={height}>
            <Wrapper apiKey={MapKey} render={render}>
                <Map {...options}>
                    {marker && <Marker position={options.center} />}
                </Map>
            </Wrapper>
        </StyledMap>
    );
};

MyMap.defaultProps = {
    center: { lat: -3.745, lng: -38.523 },
    width: "100%",
    height: "400px",
    zoom: 12,
};

export default MyMap;
