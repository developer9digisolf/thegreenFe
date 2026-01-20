import { List, AlertCircle, Settings } from "react-feather";
import { StyledNav, StyledLink } from "./style";

const Toolbar = () => {
    return (
        <StyledNav>
            <StyledLink path="#!">
                <List />
            </StyledLink>
            <StyledLink path="#!">
                <AlertCircle />
            </StyledLink>
            <StyledLink path="#!">
                <Settings className="settings" />
            </StyledLink>
        </StyledNav>
    );
};

export default Toolbar;
