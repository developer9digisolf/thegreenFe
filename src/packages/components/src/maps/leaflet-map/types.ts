import { LayoutProps } from "@doar/shared/styled";

export interface IProps extends LayoutProps {
    children: React.ReactNode;
    /**
     * Required. Pass google maps latitude
     */
    lat: number;
    /**
     * Required. Pass google maps longitude
     */
    lng: number;
    /**
     * 	The initial Map zoom level. Required. Valid values: Integers between zero, and up to the supported maximum zoom level.
     */
    zoom?: number;
    /**
     * Pass `true` to make map zoomable
     */
    scrollWheelZoom?: boolean;
}

export interface IMarkerProps {
    children: React.ReactNode;
    lat: number;
    lng: number;
}

export interface LayerOptions {
    pane?: string;
    attribution?: string;
}

export interface InteractiveLayerOptions extends LayerOptions {
    interactive?: boolean;
    bubblingMouseEvents?: boolean;
}

export type LineCapShape = "butt" | "round" | "square" | "inherit";

export type LineJoinShape = "miter" | "round" | "bevel" | "inherit";

export type FillRule = "nonzero" | "evenodd" | "inherit";

export interface PathOptions extends InteractiveLayerOptions {
    stroke?: boolean;
    color?: string;
    weight?: number;
    opacity?: number;
    lineCap?: LineCapShape;
    lineJoin?: LineJoinShape;
    dashArray?: string | number[];
    dashOffset?: string;
    fill?: boolean;
    fillColor?: string;
    fillOpacity?: number;
    fillRule?: FillRule;
}

export interface ICircleProps extends IMarkerProps, PathOptions {
    radius?: number;
}
