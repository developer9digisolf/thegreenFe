import { StyledForm, StyledInput } from "./style";

const SearchForm = () => {
    return (
        <StyledForm>
            <StyledInput
                id="calendar-search"
                name="calendar-search"
                placeholder="Search calendar"
            />
        </StyledForm>
    );
};

export default SearchForm;
