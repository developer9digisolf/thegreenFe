import styled from "@doar/shared/styled";

export const StyledLoader = styled.div`
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    
    .loader-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
    }

    .loader-logo {
        height: 80px;
        width: auto;
        animation: pulse 2s infinite ease-in-out;
    }

    .spinner-wrapper {
        position: relative;
    }

    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
    }
`;
