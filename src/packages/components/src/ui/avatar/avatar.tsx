import { Children, isValidElement, FunctionComponent } from "react";
import classnames from "clsx";
import { LayoutProps, SpaceProps } from "@doar/shared/styled";

import { StyledAvatar } from "./style";

interface IAvatar extends LayoutProps, SpaceProps {
    children: React.ReactNode;
    /**
     * Pass extra classes
     */
    className?: string;
    /**
     * Default size is `38x38`
     */
    size?: "default" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
    /**
     * Default size is `square`
     */
    shape?: "circle" | "rounded" | "square";
    /**
     * An avatar can have a status indicator to indicate users availability.
     */
    status?: "online" | "offline";
}

const Avatar = ({
    size,
    shape,
    status,
    className,
    children,
    ...restProps
}: IAvatar) => {
    const RenderChild = Children.map(children, (el) => {
        if (!isValidElement(el)) return el;
        const child = el;
        if (child !== null) {
            const childType = child.type as FunctionComponent;
            const name = childType.displayName || childType.name;
            if (name === "AvatarInitial") {
                return (
                    <child.type size={size} shape={shape} {...child.props} />
                );
            }
            return <child.type {...child.props} />;
        }
        return null;
    });
    return (
        <StyledAvatar
            $size={size}
            $shape={shape}
            $status={status}
            className={classnames(className, "avatar")}
            {...restProps}
        >
            {RenderChild}
        </StyledAvatar>
    );
};

Avatar.defaultProps = {
    size: "default",
    shape: "circle",
};

export default Avatar;
