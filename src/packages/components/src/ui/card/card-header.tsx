import classnames from "clsx";
import { StyledCardHeader } from "./style";
import { ICardHeaderProps } from "./types";

const CardHeader = ({
    children,
    className,
    variant,
    ...restProps
}: ICardHeaderProps) => {
    return (
        <StyledCardHeader
            className={classnames(className, "card-header")}
            $variant={variant}
            {...restProps}
        >
            {children}
        </StyledCardHeader>
    );
};

export default CardHeader;
