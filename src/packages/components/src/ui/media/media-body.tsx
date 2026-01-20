import classnames from "clsx";
import { SpaceProps } from "@doar/shared/styled";
import { StyledMediaBody } from "./style";

interface IMediaBodyProps extends SpaceProps {
    className?: string;
    children: React.ReactNode;
}

const MediaBody = ({ children, className, ...restProps }: IMediaBodyProps) => {
    return (
        <StyledMediaBody
            className={classnames(className, "media-body")}
            {...restProps}
        >
            {children}
        </StyledMediaBody>
    );
};

export default MediaBody;
