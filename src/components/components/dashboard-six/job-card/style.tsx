/* eslint-disable jsx-a11y/heading-has-content */
import styled, {
    color as colorStyle,
    ColorProps,
    border,
    themeGet,
    css,
    tinycolor,
} from "@doar/shared/styled";
import { hexTorgb } from "@doar/shared/methods";
import { Card } from "@doar/components";

export const StyledCard = styled(({ ...rest }) => <Card {...rest} />)`
    position: relative;
    border-color: transparent;
    border-bottom-width: 4px;
    padding-right: 100px;
    ${(props) => css`
        box-shadow: 0 0 15px
            ${tinycolor(themeGet("colors.skinUi01")(props) as string)
                .setAlpha(0.1)
                .toRgbString()};
    `}
    ${border}
`;

export const StyleTitle = styled.h6`
    font-size: 21px;
    letter-spacing: 0.5px;
    text-transform: capitalize;
    font-weight: 600;
    color: #1b2e4b;
    margin-bottom: 8px;
`;

export const StyledAmount = styled(({ color, ...rest }) => (
    <h4 {...rest} />
))<ColorProps>`
    font-size: 30px;
    ${colorStyle};
`;

export const StyledIcon = styled.span<{ $bg: string }>`
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 25px;
    border-radius: 5px;
    margin-left: auto;
    background: ${({ $bg }) => hexTorgb($bg, 0.3)};
    color: ${({ $bg }) => $bg};
    position: absolute;
    top: 50%;
    right: 30px;
    transform: translateY(-50%);
`;
