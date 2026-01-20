import { SpaceProps } from "@doar/shared/styled";

export interface IProps {
    children: React.ReactNode;
    /**
     * Pass extra classes
     */
    className?: string;
}

export interface IBody extends IProps, SpaceProps {}

export interface IClose extends IProps {
    onClose?: () => void;
}

export interface IModal extends IProps {
    /**
     * When `true` The modal will show itself.
     */
    show: boolean;
    /**
     * Modal Sizes
     */
    size?: "xl" | "lg" | "md" | "sm";
    /**
     * vertically center the Dialog in the window
     */
    centered?: boolean;
    /**
     * Callback function for close modal
     */
    onClose: () => void;
}
