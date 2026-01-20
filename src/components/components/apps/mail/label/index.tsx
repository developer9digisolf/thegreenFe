import { SpaceProps } from "@doar/shared/styled";
import { StyledTitle } from "./style";

type IProps = SpaceProps & {
    children: React.ReactNode;
};

const Label = ({ children, ...restProps }: IProps) => {
    return <StyledTitle {...restProps}>{children}</StyledTitle>;
};

export default Label;
