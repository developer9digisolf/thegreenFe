import { SpaceProps } from "@doar/shared/styled";
import { StyledContainer } from "./style";

interface IProps extends SpaceProps {
    children: React.ReactNode;
    className?: string;
}

const Container = ({ className, ...props }: IProps) => {
    return <StyledContainer className={className} {...props} />;
};

export default Container;
