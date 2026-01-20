import clsx from "clsx";
import { SpaceProps, BorderProps } from "@doar/shared/styled";
import { StyledTableResponsive, StyledTable } from "./style";

type TColor =
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";

interface IProps extends SpaceProps, BorderProps {
    children: React.ReactNode;
    className?: string;
    theadColor?: TColor;
    striped?: boolean;
    bordered?: boolean;
    hover?: boolean;
    compact?: boolean;
    color?: TColor;
    borderless?: boolean;
}

const Table = ({
    children,
    className,
    theadColor,
    striped,
    bordered,
    hover,
    compact,
    color,
    borderless,
    ...restProps
}: IProps) => {
    return (
        <StyledTableResponsive>
            <StyledTable
                className={clsx(className)}
                $theadColor={theadColor}
                $striped={striped}
                $bordered={bordered}
                $hover={hover}
                $compact={compact}
                $color={color}
                $borderless={borderless}
                {...restProps}
            >
                {children}
            </StyledTable>
        </StyledTableResponsive>
    );
};

export default Table;
