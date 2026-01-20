import { SpaceProps } from "@doar/shared/styled";
import classnames from "clsx";
import { StyledGroup } from "./style";

interface IProps extends SpaceProps {
    className?: string;
    children: React.ReactNode;
}

const FormGroup = ({ children, className, ...rest }: IProps) => {
    return (
        <StyledGroup className={classnames(className, "form-group")} {...rest}>
            {children}
        </StyledGroup>
    );
};

export default FormGroup;
