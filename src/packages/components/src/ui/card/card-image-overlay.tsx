import classnames from "clsx";
import { StyledCardImgOverlay } from "./style";
import { ICardCommonProps } from "./types";

const CardImageOverlay = ({
    children,
    className,
    ...restProps
}: ICardCommonProps) => {
    return (
        <StyledCardImgOverlay
            className={classnames(className, "card-img-overlay")}
            {...restProps}
        >
            {children}
        </StyledCardImgOverlay>
    );
};

export default CardImageOverlay;
