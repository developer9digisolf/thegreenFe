import classnames from "clsx";
import { StyledSpinner } from "./style";

export interface IProps {
    /**
     * Pass extra classes
     */
    className?: string;
    /**
     *  Default is `border`.
     */
    variant?: "border" | "grow";
    /**
     * Default is `text`.
     */
    color?:
        | "primary"
        | "secondary"
        | "success"
        | "danger"
        | "warning"
        | "info"
        | "light"
        | "dark"
        | "white";
    /**
     * Default is `md`.
     */
    size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Spinner = ({
    className,
    variant = "border",
    color,
    size,
    ...restProps
}: IProps) => {
    return (
        <StyledSpinner
            className={classnames(className, "spinner", `spinner-${variant}`)}
            $variant={variant}
            $color={color}
            $size={size}
            {...restProps}
        />
    );
};

Spinner.defaultProps = {
    variant: "border",
    size: "md",
};

export default Spinner;
