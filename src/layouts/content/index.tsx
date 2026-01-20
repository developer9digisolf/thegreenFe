import { SpaceProps, BorderProps } from "@doar/shared/styled";
import { Container } from "@doar/components";
import { StyledContent } from "./style";

interface IProps extends SpaceProps, BorderProps {
    children: React.ReactNode;
    className?: string;
    fullHeight?: boolean;
    align?: "top" | "center" | "bottom";
}

const Content = ({
    children,
    className,
    fullHeight,
    align,
    ...restProps
}: IProps) => {
    return (
        <StyledContent
            $fullHeight={fullHeight}
            $align={align}
            className={className}
            {...restProps}
        >
            <Container className="container" pl="0" pr="0">
                {children}
            </Container>
        </StyledContent>
    );
};

export default Content;
