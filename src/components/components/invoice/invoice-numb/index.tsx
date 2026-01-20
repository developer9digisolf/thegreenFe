import Label from "../label";
import { StyledNumb } from "./style";

interface IProps {
    label: string;
    invoice: string;
}

const InvoiceNumb = ({ label, invoice }: IProps) => {
    return (
        <>
            <Label>{label}</Label>
            <StyledNumb>{invoice}</StyledNumb>
        </>
    );
};

export default InvoiceNumb;
