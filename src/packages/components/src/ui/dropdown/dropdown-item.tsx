import classnames from "clsx";
import { StyledDropItem } from "./style";

interface IDropItem {
    children: React.ReactNode;
    path: string;
    className?: string;
    active?: boolean;
}

const DropdownItem = ({ children, path, className, active }: IDropItem) => (
    <StyledDropItem
        active={active}
        path={path}
        className={classnames(className, "dropdown-item")}
    >
        {children}
    </StyledDropItem>
);

export default DropdownItem;
