import classnames from "clsx";
import { StyledDropDivider } from "./style";

interface IDropDivider {
    className?: string;
}

const DropdownDivider = ({ className }: IDropDivider) => (
    <StyledDropDivider className={classnames(className, "dropdown-divider")} />
);

export default DropdownDivider;
