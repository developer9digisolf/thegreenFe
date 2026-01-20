import { IMegamenu } from "@doar/shared/types";
import {
    StyledSubNavItem,
    StyledSubNavlink,
    StyledMegaMenu,
    StyledMegaMenuInner,
    StyledMegamenuList,
    StyledMegamenuLabel,
} from "./style";

interface IProps {
    menu: IMegamenu[];
}

const Megamenu = ({ menu }: IProps) => {
    return (
        <StyledMegaMenu className="submenu">
            <StyledMegaMenuInner>
                {menu?.map((megaNav) => (
                    <StyledMegamenuList key={megaNav.id}>
                        <>
                            {megaNav?.title && (
                                <StyledMegamenuLabel>
                                    {megaNav?.title}
                                </StyledMegamenuLabel>
                            )}
                            {megaNav?.submenu?.map(
                                ({ id, label, url, Icon }) => (
                                    <StyledSubNavItem key={id}>
                                        <StyledSubNavlink path={url}>
                                            {Icon && <Icon />}
                                            {label}
                                        </StyledSubNavlink>
                                    </StyledSubNavItem>
                                )
                            )}
                        </>
                    </StyledMegamenuList>
                ))}
            </StyledMegaMenuInner>
        </StyledMegaMenu>
    );
};

export default Megamenu;
