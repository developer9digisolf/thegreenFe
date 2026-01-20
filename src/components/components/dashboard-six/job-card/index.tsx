import { CardBody } from "@doar/components";
import { IJobConversion } from "@doar/shared/types";
import { StyledCard, StyleTitle, StyledAmount, StyledIcon } from "./style";

type TProps = Omit<IJobConversion, "id">;

const JobCard = ({ title, amount, icon, color }: TProps) => {
    return (
        <StyledCard borderBottomColor={color}>
            <CardBody>
                <StyleTitle>{title}</StyleTitle>
                <StyledAmount color={color}>{amount}</StyledAmount>
                <StyledIcon $bg={color}>
                    <i className={icon} />
                </StyledIcon>
            </CardBody>
        </StyledCard>
    );
};

export default JobCard;
