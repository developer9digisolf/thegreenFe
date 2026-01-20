import { X } from "react-feather";
import {
    Modal,
    ModalHeader,
    ModalTitle,
    ModalClose,
    ModalBody,
    ModalFooter,
    Button,
} from "@doar/components";

interface IProps {
    show: boolean;
    onClose: () => void;
}

const ModalSave = ({ show, onClose }: IProps) => {
    return (
        <Modal show={show} onClose={onClose}>
            <ModalHeader>
                <ModalTitle>Save The Report</ModalTitle>
                <ModalClose onClose={onClose}>
                    <X />
                </ModalClose>
            </ModalHeader>
            <ModalBody>
                <p>Do you want to save the report?</p>
            </ModalBody>
            <ModalFooter>
                <Button>Save</Button>
                <Button color="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ModalSave;
