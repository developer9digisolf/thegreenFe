import { useState } from "react";
import Modal from "./modal";
import ModalHeader from "./modal-header";
import ModalTitle from "./modal-title";
import ModalClose from "./modal-close";
import ModalBody from "./modal-body";
import ModalFooter from "./modal-footer";
import Button from "../button/button";

interface IProps {
    centered?: boolean;
    size?: "xl" | "lg" | "md" | "sm";
}

const DemoModal = ({ size, centered }: IProps) => {
    const [show, setShow] = useState(false);
    const clickHandler = () => {
        setShow((prev) => {
            if (prev) {
                document.body.classList.remove("doar-modal-open");
            } else {
                document.body.classList.add("doar-modal-open");
            }
            return !prev;
        });
    };

    return (
        <>
            <Modal
                show={show}
                onClose={clickHandler}
                size={size}
                centered={centered}
            >
                <ModalHeader>
                    <ModalTitle>Modal Title</ModalTitle>
                    <ModalClose onClose={clickHandler}>x</ModalClose>
                </ModalHeader>
                <ModalBody>
                    <p>
                        It is a long established fact that a reader will be
                        distracted by the readable content of a page when
                        looking at its layout. The point of using Lorem Ipsum is
                        that it has a more-or-less normal distribution of
                        letters, as opposed to using &apos;Content here, content
                        here&apos;, making it look like readable English.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={clickHandler}>
                        Close
                    </Button>
                    <Button color="primary">Save changes</Button>
                </ModalFooter>
            </Modal>
            <Button onClick={clickHandler}>Open Modal</Button>
        </>
    );
};

export default DemoModal;
