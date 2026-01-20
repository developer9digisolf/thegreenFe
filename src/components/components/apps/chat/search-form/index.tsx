import { Search } from "react-feather";
import { StyledForm, StyledInput, StyledButton } from "./style";

const SearchForm = () => {
    return (
        <StyledForm>
            <StyledInput
                id="chat-search"
                name="chat-search"
                placeholder="Search"
            />
            <StyledButton type="submit" variant="texted">
                <Search />
            </StyledButton>
        </StyledForm>
    );
};

export default SearchForm;
