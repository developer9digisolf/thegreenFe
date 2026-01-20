/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import dayjs from "dayjs";
import { IEvent } from "@doar/shared/types";
import { flatDeep } from "@doar/shared/methods";
import Label from "../label";
import { useAppSelector } from "../../../../redux/hooks";
import {
    StyledWrap,
    StyledGroup,
    StyledItem,
    StyledTitle,
    StyledDetails,
} from "./style";

const UpcomingEvents = () => {
    const eventSources: IEvent[] = useAppSelector(
        (state) => state?.events.eventSources
    );

    const events = flatDeep(
        eventSources.map((ev) => {
            const color = ev.borderColor;
            const dd: {
                id: string;
                start: string;
                end: string;
                title: string;
                description?: string | undefined;
                color: string;
            }[] = [];
            ev.events.forEach((el) => {
                dd.push({
                    color,
                    ...el,
                });
            });
            return dd;
        })
    );
    const today = dayjs(new Date("2021-04-01"));
    const eventsWithDiff = events.map((ev) => {
        return {
            ...ev,
            diff: dayjs(new Date(ev.start)).diff(dayjs(today), "minutes"),
        };
    });

    const nearestEvents = eventsWithDiff
        .filter((ev) => ev.diff > 0)
        .sort((a, b) => (a.diff < b.diff ? -1 : 1))
        .slice(0, 3);

    return (
        <StyledWrap>
            <Label mb="15px">Upcoming Events</Label>
            <StyledGroup>
                {nearestEvents?.map((ev) => (
                    <StyledItem key={ev.id} $color={ev.color}>
                        <StyledTitle>{ev.title} Meeting</StyledTitle>
                        <StyledDetails>
                            {dayjs(ev.start).format("MMMM Do YYYY, h:mm:ss A")}
                        </StyledDetails>
                    </StyledItem>
                ))}
            </StyledGroup>
        </StyledWrap>
    );
};

export default UpcomingEvents;
