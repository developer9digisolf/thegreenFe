import { PositionProps } from "@doar/shared/styled";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import { StyledWrap } from "./style";

type TProps = PositionProps & {
    children: React.ReactNode;
};

const ScrollBar = ({ children, ...rest }: TProps) => {
    return (
        <StyledWrap {...rest} className="scrollbar">
            <PerfectScrollbar>{children}</PerfectScrollbar>
        </StyledWrap>
    );
};

export default ScrollBar;
