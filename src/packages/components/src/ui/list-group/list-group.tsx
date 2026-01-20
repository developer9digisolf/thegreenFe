import { Children, isValidElement, FunctionComponent } from "react";
import classnames from "clsx";
import { SpaceProps } from "@doar/shared/styled";
import { StyledListGroup } from "./style";

interface IListGroup extends SpaceProps {
    children: React.ReactNode;
    as?: React.ElementType;
    className?: string;
    flush?: boolean;
    horizontal?: boolean;
}

const ListGroup = ({
    as,
    className,
    children,
    flush,
    horizontal,
    ...restProps
}: IListGroup) => {
    const RenderChild = Children.map(children, (el) => {
        if (!isValidElement(el)) return el;
        const child = el;
        if (child !== null) {
            const childType = child.type as FunctionComponent;
            const name = childType.displayName || childType.name;
            if (name === "ListGroupItem") {
                return (
                    <child.type
                        {...child.props}
                        flush={flush}
                        horizontal={horizontal}
                    />
                );
            }
        }
        return child;
    });
    return (
        <StyledListGroup
            as={as}
            className={classnames(className, "list-group")}
            $horizontal={horizontal}
            {...restProps}
        >
            {RenderChild}
        </StyledListGroup>
    );
};

export default ListGroup;
