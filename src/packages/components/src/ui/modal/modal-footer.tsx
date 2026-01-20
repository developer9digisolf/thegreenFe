import classnames from "clsx";
import { StyledFooter } from "./style";
import { IProps } from "./types";

const ModalFooter = ({ className, children, ...restProps }: IProps) => {
    return (
        <StyledFooter
            className={classnames(className, "modal-body")}
            {...restProps}
        >
            {children}
        </StyledFooter>
    );
};

export default ModalFooter;
