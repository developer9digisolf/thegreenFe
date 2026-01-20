import classnames from "clsx";
import { StyledCardColumns } from "./style";
import { ICardCommonProps } from "./types";

const CardColumns = ({
    children,
    className,
    ...restProps
}: ICardCommonProps) => {
    return (
        <StyledCardColumns
            className={classnames(className, "card-columns")}
            {...restProps}
        >
            {children}
        </StyledCardColumns>
    );
};

export default CardColumns;
