import classnames from "clsx";
import { SpaceProps, FlexboxProps } from "@doar/shared/styled";
import { StyledGroup } from "./style";

interface IGroupProps extends FlexboxProps, SpaceProps {
    children: React.ReactNode;
    className?: string;
    size?: "sm";
}

const ImageGroup = ({
    children,
    className,
    size,
    ...restProps
}: IGroupProps) => {
    return (
        <StyledGroup
            className={classnames(className)}
            $size={size}
            {...restProps}
        >
            {children}
        </StyledGroup>
    );
};

export default ImageGroup;
