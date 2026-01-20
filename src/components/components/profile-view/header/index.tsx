import { StyledHeader } from "./style";

const Header = ({ children }: { children: React.ReactNode }) => {
    return <StyledHeader>{children}</StyledHeader>;
};

export default Header;
