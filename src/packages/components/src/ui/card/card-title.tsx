import classnames from "clsx";
import { StyledCardHeading } from "./style";
import { ICardTitleProps } from "./types";

const CardTitle = ({
    children,
    className,
    as,
    ...restProps
}: ICardTitleProps) => {
    return (
        <StyledCardHeading
            as={as}
            className={classnames(className, "card-title")}
            {...restProps}
        >
            {children}
        </StyledCardHeading>
    );
};

export default CardTitle;
