import classnames from "clsx";
import { StyledCard } from "./style";
import { ICardProps } from "./types";

const Card = ({ children, className, color, ...restProps }: ICardProps) => {
    return (
        <StyledCard
            className={classnames(className, "card")}
            {...restProps}
            $color={color}
        >
            {children}
        </StyledCard>
    );
};

export default Card;
