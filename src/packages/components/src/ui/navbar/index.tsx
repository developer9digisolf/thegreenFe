import { useCallback } from "react";
import { IMenu } from "@doar/shared/types";
import { getSiblings } from "@doar/shared/methods";
import { useClickOutside } from "@doar/shared/hooks";
import { StyledNavbar, StyledNavitem, StyledNavlink } from "./style";
import Submenu from "./submenu";
import Megamenu from "./megamenu";

interface IProps {
    menus: IMenu[];
}

const Navbar = ({ menus }: IProps) => {
    const clickHandler = (e: React.MouseEvent, hasChildren: boolean) => {
        if (hasChildren) {
            e.preventDefault();
            let target = e.currentTarget as HTMLElement;
            if (target.nodeName === "A") {
                target = target.parentElement as HTMLElement;
            }
            const submenu = target.querySelector(".submenu");
            const siblings = getSiblings(target);
            submenu?.classList.toggle("open");
            siblings.forEach((sib) => {
                sib.childNodes.forEach((child) => {
                    const childHT = child as HTMLElement;
                    childHT?.classList?.remove("open");
                });
            });
        }
    };
    const onClose = useCallback(() => {
        const nav = document.querySelector(".navbar");
        const submenu = nav?.querySelectorAll(".submenu");
        submenu?.forEach((el) => el.classList.remove("open"));
    }, []);

    const containerRef = useClickOutside<HTMLUListElement>(onClose);
    return (
        <StyledNavbar ref={containerRef} className="navbar">
            {menus &&
                menus.map((nav: IMenu) => {
                    const {
                        submenu,
                        megamenu,
                        id: navId,
                        Icon: NavIcon,
                        label: navLabel,
                    } = nav;
                    const hasSubmenu = !!submenu?.length;
                    const hasMegamenu = !!megamenu?.length;
                    const hasChildren = hasSubmenu || hasMegamenu;
                    return (
                        <StyledNavitem
                            $hasSubmenu={hasChildren}
                            key={navId}
                            onClick={(e) => clickHandler(e, hasChildren)}
                        >
                            <StyledNavlink path={hasChildren ? "#!" : nav.url}>
                                {NavIcon && <NavIcon />}
                                {navLabel}
                            </StyledNavlink>
                            {submenu && <Submenu menu={submenu} />}
                            {megamenu && <Megamenu menu={megamenu} />}
                        </StyledNavitem>
                    );
                })}
        </StyledNavbar>
    );
};

Navbar.defaultProps = {
    menus: [],
};

export default Navbar;
