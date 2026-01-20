import classnames from "clsx";
import { SpaceProps, FlexboxProps, LayoutProps } from "@doar/shared/styled";
import { StyledListGroupItem } from "./style";

interface IListGroupItem extends SpaceProps, FlexboxProps, LayoutProps {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
    active?: boolean;
    disabled?: boolean;
    action?: boolean;
    href?: string;
    flush?: boolean;
    horizontal?: boolean;
}

const ListGroupItem = ({
    as,
    className,
    children,
    active,
    disabled,
    action,
    href,
    flush,
    horizontal,
    ...restProps
}: IListGroupItem) => {
    return (
        <StyledListGroupItem
            as={as}
            className={classnames(className, "list-group-item")}
            $active={active}
            $disabled={disabled}
            $action={action}
            href={href}
            $flush={flush}
            $horizontal={horizontal}
            {...restProps}
        >
            {children}
        </StyledListGroupItem>
    );
};

ListGroupItem.displayName = "ListGroupItem";

export default ListGroupItem;
