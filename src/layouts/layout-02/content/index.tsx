import { SpaceProps } from "@doar/shared/styled";
import cn from "clsx";
import { StyledContent } from "./style";

interface IProps extends SpaceProps {
    children: React.ReactNode;
    className?: string;
    fullHeight?: boolean;
    align?: "top" | "center" | "bottom";
    aside?: "minimize";
}

const Content = ({
    children,
    className,
    fullHeight,
    align,
    aside,
    ...restProps
}: IProps) => {
    return (
        <StyledContent
            $fullHeight={fullHeight}
            $align={align}
            $aside={aside}
            className={cn(className, "content")}
            {...restProps}
        >
            {children}
        </StyledContent>
    );
};

export default Content;
