import classnames from "clsx";
import { ColorProps, TypographyProps } from "@doar/shared/styled";
import { StyledInitialText } from "./style";

interface IAvatarText extends ColorProps, TypographyProps {
    children: React.ReactNode;
    className?: string;
    size?: "default" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
    shape?: "circle" | "rounded" | "square";
}

const AvatarInitial = ({
    children,
    size,
    shape,
    className,
    ...restProps
}: IAvatarText) => {
    return (
        <StyledInitialText
            $size={size}
            $shape={shape}
            className={classnames(className, "avatar-initial")}
            {...restProps}
        >
            {children}
        </StyledInitialText>
    );
};

export default AvatarInitial;
