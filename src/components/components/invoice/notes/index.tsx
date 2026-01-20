import Label from "../label";

interface IProps {
    label: string;
    text: string;
}

const Notes = ({ label, text }: IProps) => {
    return (
        <>
            <Label>{label}</Label>
            <p>{text}</p>
        </>
    );
};

export default Notes;
