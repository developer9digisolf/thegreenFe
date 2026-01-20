import classnames from "clsx";
import { StyledCardSubtitle } from "./style";
import { ICardCommonProps } from "./types";

const CardSubtitle = ({
    children,
    className,
    ...restProps
}: ICardCommonProps) => {
    return (
        <StyledCardSubtitle
            className={classnames(className, "card-subtitle")}
            {...restProps}
        >
            {children}
        </StyledCardSubtitle>
    );
};

export default CardSubtitle;
