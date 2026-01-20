import { usePathname } from "next/navigation";
import { IMegamenu } from "@doar/shared/types";
import { StyledSubmenu, StyledSubNavItem, StyledSubNavlink } from "./style";

interface IProps {
    menu: IMegamenu[];
    onClick: (e: React.MouseEvent, hasChildren: boolean) => void;
    hasChildren: boolean;
}

const Megamenu = ({ menu, onClick, hasChildren }: IProps) => {
    const pathname = usePathname();
    return (
        <StyledSubmenu className="submenu">
            {menu?.map(({ id, title, Icon, submenu: megaSubmenu }) => {
                const hasMegaSubmenu = !!megaSubmenu?.length;
                return (
                    <StyledSubNavItem
                        key={id}
                        onClick={(e) => {
                            onClick(e, hasChildren);
                        }}
                        className={hasMegaSubmenu ? "with-sub" : ""}
                    >
                        <StyledSubNavlink
                            path="#!"
                            className="aside-navbar-link"
                        >
                            {Icon && <Icon />}
                            <span>{title}</span>
                        </StyledSubNavlink>
                        {hasMegaSubmenu && (
                            <StyledSubmenu className="mega-submenu">
                                {megaSubmenu?.map((subnav) => (
                                    <StyledSubNavItem key={subnav.id}>
                                        <StyledSubNavlink
                                            className={
                                                pathname === subnav.url
                                                    ? "active"
                                                    : ""
                                            }
                                            path={subnav.url}
                                        >
                                            {subnav.label}
                                        </StyledSubNavlink>
                                    </StyledSubNavItem>
                                ))}
                            </StyledSubmenu>
                        )}
                    </StyledSubNavItem>
                );
            })}
        </StyledSubmenu>
    );
};

export default Megamenu;
