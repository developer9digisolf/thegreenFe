import classnames from "clsx";
import { StyledCardGroup } from "./style";
import { ICardCommonProps } from "./types";

const CardGroup = ({ children, className, ...restProps }: ICardCommonProps) => {
    return (
        <StyledCardGroup
            className={classnames(className, "card-group")}
            {...restProps}
        >
            {children}
        </StyledCardGroup>
    );
};

export default CardGroup;
