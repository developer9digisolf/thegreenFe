import {
    Card,
    CardBody,
    SectionTitle,
    HorizontalBarChart,
} from "@doar/components";
import { ticketRequestChart } from "@doar/shared/data/dashboard-four";
import { useAppSelector } from "../../../redux/hooks";
import { StyledHeader, StyledChart } from "./style";

const TicketRequest = () => {
    const { theme } = useAppSelector((state) => state.theme);
    const chartOptions = ticketRequestChart.options;
    const darkChartOptions = {
        ...chartOptions,
        scales: {
            x: {
                ...chartOptions.scales.x,
                grid: {
                    color: "rgba(255,255,255,.04)",
                },
                ticks: {
                    ...chartOptions.scales.x.ticks,
                    color: "#97a3b9",
                },
            },
            y: {
                ...chartOptions.scales.y,
                ticks: {
                    ...chartOptions.scales.y.ticks,
                    color: "#97a3b9",
                },
            },
        },
    };

    return (
        <Card>
            <StyledHeader>
                <SectionTitle title="Tickets By Request Type" />
            </StyledHeader>
            <CardBody>
                <StyledChart>
                    <HorizontalBarChart
                        data={ticketRequestChart.data}
                        options={
                            theme !== "dark" ? chartOptions : darkChartOptions
                        }
                        width={395}
                        height={260}
                    />
                </StyledChart>
            </CardBody>
        </Card>
    );
};

export default TicketRequest;
