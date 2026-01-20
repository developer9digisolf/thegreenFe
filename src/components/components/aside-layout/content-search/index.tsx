import { Search } from "react-feather";
import { Input } from "@doar/components";
import { StyledForm } from "./style";

const ContentSearch = () => {
    return (
        <StyledForm className="content-search">
            <Search strokeWidth="2.8px" size={20} />
            <Input
                type="text"
                id="post-search"
                name="post-serach"
                placeholder="Search..."
            />
        </StyledForm>
    );
};

export default ContentSearch;
