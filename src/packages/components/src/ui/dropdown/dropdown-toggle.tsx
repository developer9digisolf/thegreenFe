import Button, { ButtonProps } from "../button/button";

const DropdownToggle = (props: ButtonProps) => {
    const { children, ...restProps } = props;
    return <Button {...restProps}>{children}</Button>;
};

DropdownToggle.defaultProps = {
    label: "DropdownToggle",
    className: "dropdown-toggle",
};

DropdownToggle.displayName = "DropdownToggle";

export default DropdownToggle;
