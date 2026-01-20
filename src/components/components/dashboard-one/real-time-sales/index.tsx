import { MouseEvent } from "react";
import ApexCharts from "apexcharts";
import { Card, Row, Col, SectionTitle, ApexBarChart } from "@doar/components";
import { RealTimeSalesData } from "@doar/shared/data/dashboard-one";
import { useAppSelector } from "../../../redux/hooks";
import {
    StyledBodyTitle,
    StyledBullet,
    StyledHeader,
    StyledList,
    StyledListItem,
    StyledListText,
    StyledBodyStatus,
    StyledBodyText,
    StyledChart,
    StyledBody,
} from "./style";

const RealTimeSales = () => {
    const { theme } = useAppSelector((state) => state.theme);
    const chartOptions = RealTimeSalesData.options;
    const chartToggle = (e: MouseEvent<HTMLButtonElement>) => {
        const target = e.currentTarget;
        target.classList.toggle("hidden");
        const id: string = chartOptions.chart.id;
        ApexCharts.exec(id, "toggleSeries", target.value);
    };
    const darkChartOptions = {
        ...chartOptions,
        xaxis: {
            ...chartOptions.xaxis,
            axisBorder: {
                color: "#ffffff0f",
            },
            axisTicks: {
                color: "#ffffff0f",
            },
            labels: {
                style: {
                    ...chartOptions.xaxis.labels.style,
                    colors: ["#ffffff78"],
                },
            },
        },
        grid: {
            ...chartOptions.grid,
            borderColor: "#ffffff0f",
        },
    };

    return (
        <Card height="100%">
            <StyledHeader>
                <SectionTitle title="Real-Time Sales" />
                <StyledList>
                    {RealTimeSalesData.series.map((sr, i) => (
                        <StyledListItem
                            key={sr.name}
                            value={sr.name}
                            onClick={chartToggle}
                        >
                            <StyledBullet bg={chartOptions.colors[i]} />
                            <StyledListText>{sr.name}</StyledListText>
                        </StyledListItem>
                    ))}
                </StyledList>
            </StyledHeader>
            <StyledBody>
                <Row>
                    <Col col>
                        <StyledBodyTitle>
                            $150,200{" "}
                            <StyledBodyStatus color="success">
                                <i className="fa fa-arrow-up" /> 0.20%
                            </StyledBodyStatus>
                        </StyledBodyTitle>
                        <StyledBodyText>Total Sales</StyledBodyText>
                    </Col>
                    <Col col>
                        <StyledBodyTitle>
                            $21,880{" "}
                            <StyledBodyStatus color="danger">
                                <i className="fa fa-arrow-down" /> 1.04%
                            </StyledBodyStatus>
                        </StyledBodyTitle>
                        <StyledBodyText>Avg. Sales Per Day</StyledBodyText>
                    </Col>
                </Row>
                <StyledChart>
                    <ApexBarChart
                        options={
                            theme !== "dark" ? chartOptions : darkChartOptions
                        }
                        series={RealTimeSalesData.series}
                        height="100%"
                    />
                </StyledChart>
            </StyledBody>
        </Card>
    );
};

export default RealTimeSales;
