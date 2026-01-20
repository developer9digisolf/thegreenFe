import classnames from "clsx";
import { StyledCardLink } from "./style";
import { ICardLinkProps } from "./types";

const CardLink = ({
    children,
    className,
    path,
    ...restProps
}: ICardLinkProps) => {
    return (
        <StyledCardLink
            path={path}
            className={classnames(className, "card-link")}
            {...restProps}
        >
            {children}
        </StyledCardLink>
    );
};

export default CardLink;
