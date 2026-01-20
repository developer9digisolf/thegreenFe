import {
    SpaceProps,
    ColorProps,
    TypographyProps,
    LayoutProps,
} from "@doar/shared/styled";
import { StyledLink, StyledAnchor } from "./style";

interface IProps extends SpaceProps, ColorProps, TypographyProps, LayoutProps {
    path: string;
    children: React.ReactNode;
    className?: string | undefined;
    rel?: string | undefined;
    label?: string | undefined;
    target?: "_blank" | "_self" | "_parent" | "_top";
    onClick?: (e: React.MouseEvent) => void;
    variant?: "link1" | "link2" | "link3";
}

const Anchor = ({
    path,
    children,
    className,
    rel,
    label,
    target,
    onClick,
    variant,
    ...rest
}: IProps) => {
    const internal = /^\/(?!\/)/.test(path);
    if (!internal) {
        const isHash = path.startsWith("#");
        if (isHash) {
            return (
                <StyledAnchor
                    aria-label={label}
                    rel={rel}
                    className={className}
                    href={path}
                    onClick={onClick}
                    $variant={variant}
                    {...rest}
                >
                    {children}
                </StyledAnchor>
            );
        }
        return (
            <StyledAnchor
                aria-label={label}
                rel={rel}
                className={className}
                href={path}
                target={target}
                onClick={onClick}
                $variant={variant}
                {...rest}
            >
                {children}
            </StyledAnchor>
        );
    }

    return (
        <StyledLink
            aria-label={label}
            rel="preload"
            className={className}
            to={path}
            onClick={onClick}
            $variant={variant}
            {...rest}
        >
            {children}
        </StyledLink>
    );
};

Anchor.defaultProps = {
    target: "_blank",
    rel: "noopener noreferrer",
};

Anchor.displayName = "Anchor";

export default Anchor;
