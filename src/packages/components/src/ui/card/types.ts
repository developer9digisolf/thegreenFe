import {
    SpaceProps,
    PositionProps,
    LayoutProps,
    TypographyProps,
    BorderProps,
    ColorProps,
    FlexboxProps,
} from "@doar/shared/styled";

export interface ICardCommonProps {
    className?: string;
    children: React.ReactNode;
}

export interface ICardProps extends ICardCommonProps, LayoutProps, SpaceProps {
    color?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
}

export interface ICardImageProps {
    src: string;
    alt?: string;
    className?: string;
    isTop?: boolean;
    isBottom?: boolean;
}

export interface ICardTitleProps extends ICardCommonProps {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export interface ICardBodyProps
    extends ICardCommonProps,
        SpaceProps,
        PositionProps,
        LayoutProps,
        FlexboxProps,
        TypographyProps {}

export interface ICardHeaderProps
    extends ICardCommonProps,
        SpaceProps,
        ColorProps,
        TypographyProps {
    variant?: "flexbcenter";
}

export interface ICardFooterProps
    extends ICardCommonProps,
        SpaceProps,
        BorderProps {}

export interface ICardLinkProps extends ICardCommonProps {
    path: string;
}
