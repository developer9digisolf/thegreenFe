import classnames from "clsx";
import { SpaceProps, LayoutProps } from "@doar/shared/styled";
import { StyledImage } from "./style";

export interface ImageProps extends SpaceProps, LayoutProps {
    /**
     * image's source.
     */
    src: string;
    /**
     * image's alt text.
     */
    alt?: string;
    /**
     * image's shapes
     */
    shape?: "rounded" | "circle" | "thumbnail";

    /**
     *Use the `fluid` to scale image nicely to the parent element.
     */
    fluid?: boolean;
    /**
     *Use the `align` to align image.
     */
    align?: "left" | "right";
    /**
     *Use the `fit` to resized to fit image's container.
     */
    fit?: "cover" | "contain";
    /**
     * Optional. Extra Class Name
     */
    className?: string;
}

const Image = ({
    src,
    alt,
    size,
    shape,
    fluid,
    align,
    fit,
    className,
    ...restProps
}: ImageProps) => {
    return (
        <StyledImage
            src={src}
            alt={alt}
            $shape={shape}
            $size={size}
            $fluid={fluid}
            $align={align}
            $fit={fit}
            className={classnames(className)}
            {...restProps}
        />
    );
};

export default Image;
