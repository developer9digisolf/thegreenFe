import { Card, CardBody, ApexAreaChart } from "@doar/components";
import { IConversion } from "@doar/shared/types";
import { useAppSelector } from "../../../redux/hooks";
import {
    StyledCardTitle,
    StyledCardBottom,
    StyledCardRate,
    StyledCardText,
    StyledChangePercent,
    StyledChart,
} from "./style";

type IProps = Omit<IConversion, "id">;

const Conversion = ({ title, rate, change, chart }: IProps) => {
    const { theme } = useAppSelector((state) => state.theme);
    const chartOptions = chart?.options || {};
    const darkChartOptions = { ...chartOptions, colors: ["#b4bdce"] };

    return (
        <Card>
            <CardBody>
                <StyledCardTitle>{title}</StyledCardTitle>
                <StyledCardBottom>
                    <StyledCardRate>{rate}</StyledCardRate>
                    <StyledCardText>
                        <StyledChangePercent $growth={change.growth}>
                            {change?.percentage}{" "}
                            {change?.growth === "up" && (
                                <i className="fa fa-arrow-up" />
                            )}
                            {change?.growth === "down" && (
                                <i className="fa fa-arrow-down" />
                            )}{" "}
                        </StyledChangePercent>
                        {change?.time && <>{change?.time}</>}
                    </StyledCardText>
                </StyledCardBottom>
                <StyledChart>
                    {chart && (
                        <ApexAreaChart
                            options={
                                theme !== "dark"
                                    ? chartOptions
                                    : darkChartOptions
                            }
                            series={chart?.series}
                            height={70}
                        />
                    )}
                </StyledChart>
            </CardBody>
        </Card>
    );
};

export default Conversion;
