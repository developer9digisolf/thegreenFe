import { SpaceProps } from "@doar/shared/styled";
import { StyledLabel } from "./style";

type IProps = SpaceProps & {
    children: React.ReactNode;
};

const Label = ({ children, ...rest }: IProps) => {
    return <StyledLabel {...rest}>{children}</StyledLabel>;
};

export default Label;
