import { Folder } from "react-feather";
import { Nav, NavLink } from "@doar/components";
import Label from "../label";
import { StyledWrap } from "./style";

const LabelNav = () => {
    return (
        <StyledWrap>
            <Label pl="10px">Label</Label>
            <Nav customStyle="sidebar" fontSize="13px">
                <NavLink path="#!">
                    <Folder />
                    <span>Social</span>
                </NavLink>
                <NavLink path="#!">
                    <Folder />
                    <span>Promotions</span>
                </NavLink>
                <NavLink path="#!">
                    <Folder />
                    <span>Updates</span>
                </NavLink>
                <NavLink path="#!">
                    <Folder />
                    <span>Business</span>
                </NavLink>
                <NavLink path="#!">
                    <Folder />
                    <span>Finance</span>
                </NavLink>
            </Nav>
        </StyledWrap>
    );
};

export default LabelNav;
