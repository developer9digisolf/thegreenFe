import classnames from "clsx";
import { StyledButtonToolbar } from "./style";

interface IToolbarProps {
    children: React.ReactNode;
    /**
     * Pass a label to make button group accessible
     */
    label?: string;
    /**
     * Pass extra class names
     */
    className?: string;
}

const ButtonToolbar = ({ children, className, label }: IToolbarProps) => {
    return (
        <StyledButtonToolbar
            role="toolbar"
            className={classnames(className, "btn-toolbar")}
            aria-label={label}
        >
            {children}
        </StyledButtonToolbar>
    );
};

ButtonToolbar.defaultProps = {
    label: "button toolbar",
};

export default ButtonToolbar;
