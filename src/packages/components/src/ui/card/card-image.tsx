import classnames from "clsx";
import { StyledCardImage } from "./style";
import { ICardImageProps } from "./types";

const CardImage = ({
    src,
    alt,
    className,
    isTop,
    isBottom,
    ...restProps
}: ICardImageProps) => {
    const topClass = isTop ? "card-img-top" : "";
    const bottomClass = isBottom ? "card-img-bottom" : "";
    return (
        <StyledCardImage
            src={src}
            alt={alt}
            className={classnames(
                className,
                "card-image",
                topClass,
                bottomClass
            )}
            $isTop={isTop}
            $isBottom={isBottom}
            {...restProps}
        />
    );
};

export default CardImage;
