import {
    MoreVertical,
    Info,
    Star,
    Share,
    Download,
    Copy,
    Folder,
    Edit,
    Trash,
} from "react-feather";
import { DropdownToggle, DropdownMenu } from "@doar/components";
import { StyledDropdown, StyledItem } from "./style";

interface IProps {
    handleDetails?: () => void;
    handleImportant?: () => void;
    marked?: boolean;
    handleShare?: () => void;
    handleCopy?: () => void;
    handleMove?: () => void;
}

const FileDropdown = ({
    handleDetails,
    handleImportant,
    marked,
    handleShare,
    handleCopy,
    handleMove,
}: IProps) => {
    return (
        <StyledDropdown direction="down">
            <DropdownToggle variant="texted">
                <MoreVertical />
            </DropdownToggle>
            <DropdownMenu>
                <StyledItem onClick={handleDetails}>
                    <Info /> View Details
                </StyledItem>
                <StyledItem onClick={handleImportant}>
                    <Star /> {marked ? "Unmark" : "Mark"} as Important
                </StyledItem>
                <StyledItem onClick={handleShare}>
                    <Share /> Share
                </StyledItem>
                <StyledItem>
                    <Download /> Download
                </StyledItem>
                <StyledItem onClick={handleCopy}>
                    <Copy /> Copy to
                </StyledItem>
                <StyledItem onClick={handleMove}>
                    <Folder /> Move to
                </StyledItem>
                <StyledItem>
                    <Edit /> Rename
                </StyledItem>
                <StyledItem>
                    <Trash /> Delete
                </StyledItem>
            </DropdownMenu>
        </StyledDropdown>
    );
};

export default FileDropdown;
