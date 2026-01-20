import classnames from "clsx";
import { StyledCardBody } from "./style";
import { ICardBodyProps } from "./types";

const CardBody = ({ children, className, ...restProps }: ICardBodyProps) => {
    return (
        <StyledCardBody
            className={classnames(className, "card-body")}
            {...restProps}
        >
            {children}
        </StyledCardBody>
    );
};

export default CardBody;
