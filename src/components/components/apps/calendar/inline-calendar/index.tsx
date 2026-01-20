import { useState } from "react";
import Calendar from "../../../calendar";
import { StyledWrap } from "./style";

const InlineCalendar = () => {
    const [value, setValue] = useState(new Date());
    const changeHandler = () => {
        setValue(new Date());
    };
    return (
        <StyledWrap>
            <Calendar onChange={changeHandler} value={value} />
        </StyledWrap>
    );
};

export default InlineCalendar;
