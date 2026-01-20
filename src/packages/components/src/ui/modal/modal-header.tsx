import classnames from "clsx";
import { StyledHeader } from "./style";
import { IProps } from "./types";

const ModalHeader = ({ className, children, ...restProps }: IProps) => {
    return (
        <StyledHeader
            className={classnames(className, "modal-header")}
            {...restProps}
        >
            {children}
        </StyledHeader>
    );
};

export default ModalHeader;
