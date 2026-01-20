import cn from "clsx";
import { ISubmenu } from "@doar/shared/types";
import { StyledSubmenu, StyledSubNavItem, StyledSubNavlink } from "./style";

interface IProps {
    menu: ISubmenu[];
    className?: string;
}

const Submenu = ({ menu, className }: IProps) => {
    return (
        <StyledSubmenu className={className}>
            {menu.map(({ id, label, url, Icon }) => (
                <StyledSubNavItem key={id}>
                    <StyledSubNavlink
                        path={url}
                        className={cn(
                            location.pathname === url ? "active" : "",
                            "aside-navbar-link"
                        )}
                    >
                        {Icon && <Icon />}
                        <span>{label}</span>
                    </StyledSubNavlink>
                </StyledSubNavItem>
            ))}
        </StyledSubmenu>
    );
};

export default Submenu;
