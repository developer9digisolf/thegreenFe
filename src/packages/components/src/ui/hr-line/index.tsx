import classnames from "clsx";
import { SpaceProps, BorderProps } from "@doar/shared/styled";
import { StyledHr } from "./style";

interface IProps extends SpaceProps, BorderProps {
    className?: string;
}

const HRLine = ({ className, ...restProps }: IProps) => {
    return <StyledHr className={classnames(className)} {...restProps} />;
};

export default HRLine;
