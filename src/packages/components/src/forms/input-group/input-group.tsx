import classname from "clsx";
import { SpaceProps } from "@doar/shared/styled";
import { StyledInputGroup } from "./style";

interface IProps extends SpaceProps {
    className?: string;
    children: React.ReactNode;
}

const InputGroup = ({ children, className, ...rest }: IProps) => {
    return (
        <StyledInputGroup
            className={classname(className, "input-group")}
            {...rest}
        >
            {children}
        </StyledInputGroup>
    );
};

export default InputGroup;
