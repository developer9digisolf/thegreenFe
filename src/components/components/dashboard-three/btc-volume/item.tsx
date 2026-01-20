import {
    StyledItem,
    StyledBullet,
    StyledTitle,
    StyledCoin,
    StyledRate,
} from "./style";

interface IProps {
    color: string;
    title: string;
    coin: string;
    rate: string;
    status: "up" | "down";
}

const Item = ({ color, title, coin, rate, status }: IProps) => {
    return (
        <StyledItem>
            <StyledBullet bg={color} />
            <StyledTitle>{title}</StyledTitle>
            <StyledCoin>{coin}</StyledCoin>
            <StyledRate $status={status}>
                {rate} <i className={`fa fa-arrow-${status}`} />
            </StyledRate>
        </StyledItem>
    );
};

export default Item;
