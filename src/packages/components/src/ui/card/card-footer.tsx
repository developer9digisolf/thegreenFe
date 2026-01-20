import classnames from "clsx";
import { StyledCardFooter } from "./style";
import { ICardFooterProps } from "./types";

const CardFooter = ({
    children,
    className,
    ...restProps
}: ICardFooterProps) => {
    return (
        <StyledCardFooter
            className={classnames(className, "card-footer")}
            {...restProps}
        >
            {children}
        </StyledCardFooter>
    );
};
export default CardFooter;
