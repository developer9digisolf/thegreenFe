import classnames from "clsx";
import { StyledCardText } from "./style";
import { ICardCommonProps } from "./types";

const CardText = ({ children, className, ...restProps }: ICardCommonProps) => {
    return (
        <StyledCardText
            className={classnames(className, "card-text")}
            {...restProps}
        >
            {children}
        </StyledCardText>
    );
};

export default CardText;
