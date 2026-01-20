import { Card, Anchor, Text } from "@doar/components";
import { StyledBody, StyledIcon, StyledFooter } from "./style";

interface IProps {
    icon: string;
    title: string;
    desc: string;
    topics: number;
}

const HelpBox = ({ icon, title, desc, topics }: IProps) => {
    return (
        <Card>
            <StyledBody>
                <StyledIcon>
                    <i className={`fa ${icon}`} />
                </StyledIcon>
                <h5>
                    <Anchor path="#!" variant="link1">
                        {title}
                    </Anchor>
                </h5>
                <Text color="text3">{desc}</Text>
            </StyledBody>
            <StyledFooter>
                <span>{topics} Topics</span>
                <Anchor path="#!">
                    <i className="fa fa-arrow-right" />
                </Anchor>
            </StyledFooter>
        </Card>
    );
};

export default HelpBox;
