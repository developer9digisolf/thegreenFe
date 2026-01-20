import { useState, useEffect, useRef } from "react";
import classnames from "clsx";
import { StyledDropMenu } from "./style";

interface IDropMenu {
    children: React.ReactNode;
    show?: boolean;
    direction?: "up" | "down" | "left" | "right";
    className?: string;
}

interface IMenuMeasure {
    clientWidth: number;
    clientHeight: number;
    clientLeft: number;
    clientTop: number;
    offsetWidth: number;
    offsetHeight: number;
    offsetLeft: number;
    offsetTop: number;
}

const DropdownMenu = ({
    children,
    show,
    direction,
    className,
    ...restProps
}: IDropMenu) => {
    const [menuMeasure, setMenuMeasure] = useState<IMenuMeasure>({
        clientWidth: 0,
        clientHeight: 0,
        clientLeft: 0,
        clientTop: 0,
        offsetWidth: 0,
        offsetHeight: 0,
        offsetLeft: 0,
        offsetTop: 0,
    });
    const menuRef: React.Ref<HTMLDivElement> = useRef(null);

    useEffect(() => {
        setMenuMeasure((prev) => {
            return {
                ...prev,
                clientWidth: menuRef?.current?.clientWidth || 0,
                clientHeight: menuRef?.current?.clientHeight || 0,
                clientLeft: menuRef?.current?.clientLeft || 0,
                clientTop: menuRef?.current?.clientTop || 0,
                offsetWidth: menuRef?.current?.offsetWidth || 0,
                offsetHeight: menuRef?.current?.offsetHeight || 0,
                offsetLeft: menuRef?.current?.offsetLeft || 0,
                offsetTop: menuRef?.current?.offsetTop || 0,
            };
        });
    }, [show]);

    return (
        <StyledDropMenu
            $menuWidth={menuMeasure.offsetWidth}
            $show={show}
            $direction={direction}
            ref={menuRef}
            className={classnames(className, "dropdown-menu")}
            {...restProps}
        >
            {children}
        </StyledDropMenu>
    );
};

DropdownMenu.displayName = "DropdownMenu";

export default DropdownMenu;
