import styled, { themeGet, css } from "@doar/shared/styled";

export const StyledHeader = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 10px;
    height: 100%;
    color: ${themeGet("colors.text2")};
    transition: all 0.2s;

    &:hover {
        color: ${themeGet("colors.primary")};
    }

    .company-name {
        margin: 0 8px;
        font-weight: 500;
        font-size: 13px;
        display: none;
        @media (min-width: 992px) {
            display: inline;
        }
    }

    .chevron {
        margin-left: 4px;
        opacity: 0.5;
    }
`;

export const StyledDropMenu = styled.div`
    width: 250px;
    padding: 10px 0;
    background-color: #fff;
    border: 1px solid ${themeGet("colors.border")};
    border-radius: 4px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    margin-top: 10px;
`;

export const StyledCompanyInfo = styled.div`
    padding: 10px 20px;
`;

export const StyledCompanyName = styled.h6`
    margin-bottom: 2px;
    font-weight: 700;
    color: ${themeGet("colors.text1")};
`;

export const StyledCompanyRole = styled.p`
    font-size: 11px;
    color: ${themeGet("colors.text3")};
    margin-bottom: 0;
`;

export const StyledDivider = styled.div`
    height: 1px;
    background-color: ${themeGet("colors.border")};
    margin: 10px 0;
`;

export const StyledDropItem = styled.div<{ $active?: boolean }>`
    padding: 8px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    color: ${themeGet("colors.text2")};

    &:hover {
        background-color: ${themeGet("colors.gray100")};
        color: ${themeGet("colors.primary")};
    }

    ${({ $active }) =>
        $active &&
        css`
            background-color: ${themeGet("colors.primaryLight")};
            color: ${themeGet("colors.primary")};
            font-weight: 500;
        `}

    .item-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .active-icon {
        color: ${themeGet("colors.primary")};
    }
`;

export const StyledEmpty = styled.div`
    padding: 20px;
    text-align: center;
    color: ${themeGet("colors.text3")};
    font-size: 12px;
`;
