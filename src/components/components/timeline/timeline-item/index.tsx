import { StyledItem } from "./style";

const TimelineItem = ({ children }: { children: React.ReactNode }) => {
    return <StyledItem className="timeline-item">{children}</StyledItem>;
};

export default TimelineItem;
