import { StyledLabel } from "./style";

interface IProps {
    size?: "lg";
    children: React.ReactNode;
}

const Label = ({ children, size }: IProps) => {
    return <StyledLabel $size={size}>{children}</StyledLabel>;
};

export default Label;
