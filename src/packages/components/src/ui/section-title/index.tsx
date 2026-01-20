import { TypographyProps } from "@doar/shared/styled";
import { StyledTitle, StyledDesc } from "./style";

interface IProps {
    title: string;
    desc?: string;
    descProps?: TypographyProps;
    titleProps?: TypographyProps;
}

const SectionTitle = ({ title, desc, descProps, titleProps }: IProps) => {
    return (
        <>
            <StyledTitle $hasDesc={Boolean(desc)} {...titleProps}>
                {title}
            </StyledTitle>
            {desc && (
                <StyledDesc
                    {...descProps}
                    dangerouslySetInnerHTML={{ __html: desc }}
                />
            )}
        </>
    );
};

export default SectionTitle;
