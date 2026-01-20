import classnames from "clsx";
import { StyledTitle } from "./style";
import { IProps } from "./types";

const ModalTitle = ({ className, children, ...restProps }: IProps) => {
    return (
        <StyledTitle
            className={classnames(className, "modal-title")}
            {...restProps}
        >
            {children}
        </StyledTitle>
    );
};

export default ModalTitle;
