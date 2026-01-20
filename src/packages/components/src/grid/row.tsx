import { SpaceProps } from "@doar/shared/styled";
import { StyledRow } from "./style";
import { RowProps } from "./types";

interface IRowProps extends SpaceProps, RowProps {
    children: React.ReactNode;
    className?: string;
    gutters?: number;
    noGutter?: boolean;
}

const Row = ({ className, gutters, noGutter, ...props }: IRowProps) => {
    return (
        <StyledRow
            $gutters={gutters}
            $noGutter={noGutter}
            className={className}
            {...props}
        />
    );
};

export default Row;
