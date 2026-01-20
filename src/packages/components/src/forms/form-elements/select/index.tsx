import { forwardRef } from "react";
import classnames from "clsx";
import { StyledSelect } from "./style";
import Feedback from "../feedback";
import { IInputProps } from "../types";

interface IProps extends IInputProps {
    children: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, IProps>(
    (
        {
            className,
            disabled,
            state,
            feedbackText,
            id,
            name,
            value,
            onChange,
            onBlur,
            onClick,
            children,
            showState,
            showErrorOnly,
            width,
            height,
            customStyle,
            ...restProps
        },
        ref
    ) => {
        return (
            <>
                <StyledSelect
                    className={classnames(className, "custom-select")}
                    ref={ref}
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onClick={onClick}
                    onBlur={onBlur}
                    $state={state}
                    $showState={showState}
                    $showErrorOnly={showErrorOnly}
                    $width={width}
                    $height={height}
                    $customStyle={customStyle}
                    disabled={disabled}
                    {...restProps}
                >
                    {children}
                </StyledSelect>
                {feedbackText && showState && (
                    <Feedback
                        state={state}
                        showState={showState}
                        showErrorOnly={showErrorOnly}
                    >
                        {feedbackText}
                    </Feedback>
                )}
            </>
        );
    }
);

Select.displayName = "Select";

Select.defaultProps = {
    showErrorOnly: true,
};

export default Select;
