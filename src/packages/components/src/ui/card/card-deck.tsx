import classnames from "clsx";
import { StyledCardDeck } from "./style";
import { ICardCommonProps } from "./types";

const CardDeck = ({ children, className, ...restProps }: ICardCommonProps) => {
    return (
        <StyledCardDeck
            className={classnames(className, "card-deck")}
            {...restProps}
        >
            {children}
        </StyledCardDeck>
    );
};

export default CardDeck;
