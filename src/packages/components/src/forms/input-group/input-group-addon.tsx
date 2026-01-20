import classname from "clsx";
import { SpaceProps } from "@doar/shared/styled";
import { StyledInputGroupWrap } from "./style";

interface IProps extends SpaceProps {
    className?: string;
    children: React.ReactNode;
    dir?: "append" | "prepend";
}

const InputGroupAddon = ({
    children,
    dir = "append",
    className,
    ...rest
}: IProps) => {
    return (
        <StyledInputGroupWrap
            className={classname(className, `input-group-${dir}`)}
            $dir={dir}
            {...rest}
        >
            {children}
        </StyledInputGroupWrap>
    );
};

export default InputGroupAddon;
