import {
    Children,
    isValidElement,
    useState,
    useCallback,
    FunctionComponent,
} from "react";
import classnames from "clsx";
import { useClickOutside } from "@doar/shared/hooks";
import { StyledDropdown } from "./style";

interface DropdownProps {
    children: React.ReactNode;
    /**
     * Required. Default is `down`.
     */
    direction: "up" | "down" | "left" | "right";
    className?: string;
}

const Dropdown = ({
    children,
    direction,
    className,
    ...restProps
}: DropdownProps) => {
    const [show, setShow] = useState(false);

    const handleClick = () => {
        setShow((prev) => !prev);
    };
    const onClose = useCallback(() => {
        setShow(false);
    }, []);

    const containerRef = useClickOutside<HTMLDivElement>(onClose);

    const RenderChild = Children.map(children, (el) => {
        if (!isValidElement(el)) return el;
        const child = el;
        if (child !== null) {
            const childType = child.type as FunctionComponent;
            const name = childType.displayName || childType.name;
            if (name === "DropdownToggle") {
                return <child.type {...child.props} onClick={handleClick} />;
            }
            if (name === "DropdownMenu") {
                return (
                    <child.type
                        {...child.props}
                        direction={direction}
                        show={show}
                    />
                );
            }
        }
        return null;
    });

    return (
        <StyledDropdown
            {...restProps}
            className={classnames(className, "dropdown")}
            ref={containerRef}
        >
            {RenderChild}
        </StyledDropdown>
    );
};

Dropdown.defaultProps = {
    direction: "down",
};

export default Dropdown;
