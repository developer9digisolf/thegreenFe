"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import classnames from "clsx";
import { CSSTransition } from "react-transition-group";
import { StyledBackdrop, StyledModal } from "./style";
import { IModal } from "./types";

const Modal = ({
    className,
    show,
    size,
    centered,
    children,
    onClose,
    ...restProps
}: IModal) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) {
        return null;
    }

    return createPortal(
        <>
            <StyledBackdrop $show={show} />
            <StyledModal
                $show={show}
                $size={size}
                $centered={centered}
                className={classnames(className)}
                onClick={onClose}
                {...restProps}
            >
                <CSSTransition
                    in={show}
                    timeout={400}
                    unmountOnExit
                    classNames="modal"
                >
                    {() => (
                        <div className="modal-dialog">
                            <div
                                className="modal-content"
                                onClick={(e) => e.stopPropagation()}
                                onKeyPress={() => { }}
                                role="button"
                                tabIndex={0}
                            >
                                {children}
                            </div>
                        </div>
                    )}
                </CSSTransition>
            </StyledModal>
        </>,
        document.body
    );
};

Modal.defaultProps = {
    size: "md",
    centered: true,
};

export default Modal;
