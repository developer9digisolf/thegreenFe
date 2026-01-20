import { StyledMediaLeft } from "./style";

interface IImgProps {
    alignMent?: "top" | "middle" | "end";
    children: React.ReactNode;
}

const MediaLeft = ({ children, alignMent, ...restProps }: IImgProps) => {
    return (
        <StyledMediaLeft $alignMent={alignMent} {...restProps}>
            {children}
        </StyledMediaLeft>
    );
};

export default MediaLeft;
