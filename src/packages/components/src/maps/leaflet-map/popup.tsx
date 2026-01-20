import { Popup } from "react-leaflet";

const LeafletPopup = ({ children }: { children: React.ReactNode }) => {
    return <Popup>{children}</Popup>;
};

export default LeafletPopup;
