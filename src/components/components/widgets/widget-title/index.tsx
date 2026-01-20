import { Anchor } from "@doar/components";
import { StyledWrap, StyledTitle } from "./style";

interface IProps {
    title: string;
    link?: {
        text: string;
        path: string;
    };
}

const WidgetTitle = ({ title, link }: IProps) => {
    return (
        <StyledWrap>
            <StyledTitle>{title}</StyledTitle>
            {link && (
                <Anchor path={link.path} color="text3">
                    {link.text}
                </Anchor>
            )}
        </StyledWrap>
    );
};

export default WidgetTitle;
