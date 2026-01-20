import { SpaceProps } from "@doar/shared/styled";
import { StyledList, StyledItem } from "./style";

type TListProps = SpaceProps & {
    children: React.ReactNode;
};

const List = ({ children, ...rest }: TListProps) => {
    return <StyledList {...rest}>{children}</StyledList>;
};

export default List;

export const ListItem = ({ children }: { children: React.ReactNode }) => {
    return <StyledItem>{children}</StyledItem>;
};
