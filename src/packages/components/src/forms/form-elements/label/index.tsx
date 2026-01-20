import classnames from "clsx";
import { SpaceProps, TypographyProps, LayoutProps } from "@doar/shared/styled";
import { StyledLabel } from "./style";

interface IProps extends SpaceProps, TypographyProps, LayoutProps {
    children: React.ReactNode;
    htmlFor: string;
    className?: string;
}

const Label = ({ children, htmlFor, className, ...rest }: IProps) => {
    return (
        <StyledLabel
            htmlFor={htmlFor}
            className={classnames(className, "label")}
            {...rest}
        >
            {children}
        </StyledLabel>
    );
};

export default Label;
