import { ElementType } from "react";
import {
    SpaceProps,
    ColorProps,
    TypographyProps,
    LayoutProps,
} from "@doar/shared/styled";
import { StyledText } from "./style";

interface IProps extends SpaceProps, ColorProps, TypographyProps, LayoutProps {
    children: React.ReactNode;
    as?: ElementType;
    className?: string;
}

const Text = ({ as, className, children, ...restProps }: IProps) => {
    return (
        <StyledText as={as} className={className} {...restProps}>
            {children}
        </StyledText>
    );
};

export default Text;
