import classnames from "clsx";
import { Tab, TabPanel, TabList } from "react-tabs";
import type { TabsProps } from "react-tabs";
import { StyledTabs, StyledTabContent } from "./style";

interface IProps {
    className?: string;
    children: React.ReactNode;
}

interface ITab extends TabsProps {
    justified?: boolean;
    vertical?: boolean;
    variation?: "line";
}

export const TabWrap = ({
    className,
    children,
    justified,
    vertical,
    variation,
    defaultFocus,
    defaultIndex,
    disabledTabClassName,
    domRef,
    forceRenderTabPanel,
    onSelect,
    selectedIndex,
    selectedTabClassName,
    selectedTabPanelClassName,
}: ITab) => {
    return (
        <StyledTabs
            className={classnames(className, "react-tabs")}
            $justified={justified}
            $vertical={vertical}
            $variation={variation}
            defaultFocus={defaultFocus}
            defaultIndex={defaultIndex}
            disabledTabClassName={disabledTabClassName}
            domRef={domRef}
            forceRenderTabPanel={forceRenderTabPanel}
            onSelect={onSelect}
            selectedIndex={selectedIndex}
            selectedTabClassName={selectedTabClassName}
            selectedTabPanelClassName={selectedTabPanelClassName}
        >
            {children}
        </StyledTabs>
    );
};

export const TabContent = ({ className, children }: IProps) => {
    return (
        <StyledTabContent
            className={classnames(className, "react-tabs__content")}
        >
            {children}
        </StyledTabContent>
    );
};

export { Tab, TabPanel, TabList };
