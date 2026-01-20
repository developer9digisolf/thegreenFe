import classnames from "clsx";
import { SpaceProps } from "@doar/shared/styled";
import { StyledNav, StyledBreadcrumb } from "./style";

interface IBreadcrumb extends SpaceProps {
    children: React.ReactNode;
    /**
     * Extra class name
     */
    className?: string;
    /**
     * Element type. Default is `nav`
     */
    as?: React.ElementType;
}

export const Breadcrumb = ({
    children,
    className,
    as,
    ...restProps
}: IBreadcrumb) => (
    <StyledNav aria-label="breadcrumb" as={as}>
        <StyledBreadcrumb
            className={classnames(className, "breadcrumb")}
            {...restProps}
        >
            {children}
        </StyledBreadcrumb>
    </StyledNav>
);

export default Breadcrumb;
