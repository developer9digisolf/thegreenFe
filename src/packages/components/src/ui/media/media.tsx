import classnames from "clsx";
import { SpaceProps, FlexboxProps, LayoutProps } from "@doar/shared/styled";
import { StyledMedia } from "./style";

interface IMediaProps extends SpaceProps, FlexboxProps, LayoutProps {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

const Media = ({ children, as, className, ...restProps }: IMediaProps) => {
    return (
        <StyledMedia
            className={classnames(className, "media")}
            as={as}
            $el={as}
            {...restProps}
        >
            {children}
        </StyledMedia>
    );
};

export default Media;
