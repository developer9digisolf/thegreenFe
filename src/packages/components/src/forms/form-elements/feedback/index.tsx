import { StyledFeedback } from "./style";

export interface IFeedback {
    children: React.ReactNode;
    state?: "success" | "warning" | "error";
    showState?: boolean;
    showErrorOnly?: boolean;
}

const Feedback = ({ state, showState, showErrorOnly, children }: IFeedback) => {
    return (
        <StyledFeedback
            $state={state}
            $showState={showState}
            $showErrorOnly={showErrorOnly}
        >
            {children}
        </StyledFeedback>
    );
};

export default Feedback;
