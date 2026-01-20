import { IMenu } from "@doar/shared/types";
import { getSiblings } from "@doar/shared/methods";
import { StyledNavbar, StyledNavitem, StyledNavlink } from "./style";
import Submenu from "./submenu";
import Megamenu from "./megamenu";

interface IProps {
    menus: IMenu[];
}

const NavbarAside = ({ menus }: IProps) => {
    const clickHandler = (e: React.MouseEvent, hasChildren: boolean) => {
        if (hasChildren) {
            e.preventDefault();
            let target = e.currentTarget as HTMLElement;
            if (target.nodeName === "A") {
                target = target.parentElement as HTMLElement;
            }
            const submenu = target.querySelector(".mega-submenu");
            const siblings = getSiblings(target);
            submenu?.classList.toggle("open");
            target.classList.toggle("open");
            siblings.forEach((sib) => {
                sib.classList.remove("open");
                sib.childNodes.forEach((child) => {
                    const childHT = child as HTMLElement;
                    childHT?.classList?.remove("open");
                });
            });
        }
    };
    return (
        <StyledNavbar className="aside-navbar">
            {menus?.map((nav: IMenu) => {
                const { submenu, megamenu, id: navId, label: navLabel } = nav;
                const hasSubmenu = !!submenu?.length;
                const hasMegamenu = !!megamenu?.length;
                const hasChildren = hasSubmenu || hasMegamenu;
                return (
                    <StyledNavitem $hasSubmenu={hasChildren} key={navId}>
                        <StyledNavlink
                            path={hasChildren ? "#!" : nav.url}
                            className="aside-navbar-label"
                        >
                            {navLabel}
                        </StyledNavlink>
                        {submenu && (
                            <Submenu menu={submenu} className="submenu" />
                        )}
                        {megamenu && (
                            <Megamenu
                                menu={megamenu}
                                hasChildren={hasChildren}
                                onClick={clickHandler}
                            />
                        )}
                    </StyledNavitem>
                );
            })}
        </StyledNavbar>
    );
};

NavbarAside.defaultProps = {
    menus: [],
};

export default NavbarAside;
