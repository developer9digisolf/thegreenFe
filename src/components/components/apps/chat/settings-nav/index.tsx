import { MoreVertical } from "react-feather";
import ReactTooltip from "react-tooltip";
import { StyledNav, StyledLink } from "./style";

const SettingsNav = () => {
    return (
        <StyledNav>
            <StyledLink path="#!" data-tip="Channel Settings">
                <MoreVertical />
            </StyledLink>
            <ReactTooltip place="left" effect="solid" />
        </StyledNav>
    );
};

export default SettingsNav;
