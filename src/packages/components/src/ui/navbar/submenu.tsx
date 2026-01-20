import { ISubmenu } from "@doar/shared/types";
import { StyledSubmenu, StyledSubNavItem, StyledSubNavlink } from "./style";

interface IProps {
    menu: ISubmenu[];
}

const Submenu = ({ menu }: IProps) => {
    return (
        <StyledSubmenu className="submenu">
            {menu.map(({ id, label, url, Icon }) => (
                <StyledSubNavItem key={id}>
                    <StyledSubNavlink path={url}>
                        {Icon && <Icon />}
                        {label}
                    </StyledSubNavlink>
                </StyledSubNavItem>
            ))}
        </StyledSubmenu>
    );
};

export default Submenu;
