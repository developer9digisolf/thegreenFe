/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { useState, useEffect, ChangeEvent } from "react";
import dayjs from "dayjs";
import { Button, Input, Textarea, Row, Col } from "@doar/components";
import { StyledGroup, StyledLabel } from "./style";
import DatePicker from "../../../date-picker";
import TimePicker from "../../../time-picker";
import { useAppDispatch } from "../../../../redux/hooks";
import { editEvent } from "../../../../redux/slices/event";

interface IProps {
    id: string;
    category: string;
    title: string;
    startDate: string;
    endDate: string;
    description?: string;
    onClose: () => void;
}

const EditEventForm = ({
    id,
    category,
    title,
    startDate,
    endDate,
    description,
    onClose,
}: IProps) => {
    const dispatch = useAppDispatch();
    const [values, setValues] = useState({
        editAddTitle: "",
        editStartDate: "",
        editStartTime: "",
        editEndDate: "",
        editEndTime: "",
        editDescription: "",
    });
    const [showState, setShowState] = useState(false);
    const [errors, setErrors] = useState({
        editAddTitle: false,
        editStartDate: false,
        editStartTime: false,
        editEndDate: false,
        editEndTime: false,
        editDescription: false,
    });
    useEffect(() => {
        setValues((prev) => {
            return {
                ...prev,
                editAddTitle: title,
                editStartDate: dayjs(startDate).format("YYYY-MM-DD"),
                editStartTime: dayjs(startDate).format("HH:mm"),
                editEndDate: dayjs(endDate).format("YYYY-MM-DD"),
                editEndTime: dayjs(endDate).format("HH:mm"),
                editDescription: description || "",
            };
        });
    }, [title, startDate, endDate, description]);

    const changeHandler = (
        e: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        setValues((prev) => {
            return {
                ...prev,
                [e.target.name]: e.target.value,
            };
        });
        setErrors((prev) => {
            return {
                ...prev,
                [e.target.name]: e.target.value === "",
            };
        });
    };

    const getDate = (name: string, date: string) => {
        setValues((prev) => {
            return {
                ...prev,
                [name]: dayjs(new Date(date)).format("YYYY-MM-DD"),
            };
        });
    };

    const submitHandler = () => {
        setShowState(true);
        const hasError = Object.values(errors).find((err) => err);
        if (hasError) return;
        const {
            editAddTitle,
            editStartDate,
            editEndDate,
            editStartTime,
            editEndTime,
            editDescription,
        } = values;
        dispatch(
            editEvent(
                id,
                editAddTitle,
                editStartDate,
                editEndDate,
                category,
                editStartTime,
                editEndTime,
                editDescription
            )
        );
        onClose();
    };

    return (
        <form className="create-event-form">
            <StyledGroup>
                <Input
                    id="editAddTitle"
                    name="editAddTitle"
                    placeholder="Add title"
                    value={values.editAddTitle}
                    onChange={changeHandler}
                    showState={showState}
                    state={errors.editAddTitle ? "error" : "success"}
                    feedbackText="Title is required"
                />
            </StyledGroup>
            <StyledGroup mt={30}>
                <StyledLabel htmlFor="editStartDate">Start Date</StyledLabel>
                <Row gutters={10}>
                    <Col col={7}>
                        <DatePicker
                            id="editStartDate"
                            name="editStartDate"
                            placeholder="Select Date"
                            getDate={getDate}
                            currentDate={new Date(startDate)}
                        />
                    </Col>
                    <Col col={5}>
                        <TimePicker
                            id="editStartTime"
                            name="editStartTime"
                            value={values.editStartTime}
                            onChange={changeHandler}
                        />
                    </Col>
                </Row>
            </StyledGroup>
            <StyledGroup mt={30}>
                <StyledLabel htmlFor="editEndDate">End Date</StyledLabel>
                <Row gutters={10}>
                    <Col col={7}>
                        <DatePicker
                            id="editEndDate"
                            name="editEndDate"
                            placeholder="Select Date"
                            getDate={getDate}
                            currentDate={new Date(endDate)}
                        />
                    </Col>
                    <Col col={5}>
                        <TimePicker
                            id="editEndTime"
                            name="editEndTime"
                            value={values.editEndTime}
                            onChange={changeHandler}
                        />
                    </Col>
                </Row>
            </StyledGroup>
            {description && (
                <StyledGroup>
                    <Textarea
                        id="editDescription"
                        name="editDescription"
                        placeholder="Write some description (optional)"
                        value={values.editDescription}
                        onChange={changeHandler}
                    />
                </StyledGroup>
            )}
            <StyledGroup>
                <Button onClick={submitHandler} mr="5px">
                    Save Changes
                </Button>
                <Button color="secondary" onClick={onClose}>
                    Discard
                </Button>
            </StyledGroup>
        </form>
    );
};

export default EditEventForm;
