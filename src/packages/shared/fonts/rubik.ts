import { css } from "styled-components";
import rubikLatin300Woff2 from "./rubik/rubik-v12-latin-300.woff2";
import rubikLatin300Woff from "./rubik/rubik-v12-latin-300.woff";

import rubikLatinRegularWoff2 from "./rubik/rubik-v12-latin-regular.woff2";
import rubikLatinRegularWoff from "./rubik/rubik-v12-latin-regular.woff";

import rubikLatin500Woff2 from "./rubik/rubik-v12-latin-500.woff2";
import rubikLatin500Woff from "./rubik/rubik-v12-latin-500.woff";

import rubikLatin600Woff2 from "./rubik/rubik-v12-latin-600.woff2";
import rubikLatin600Woff from "./rubik/rubik-v12-latin-600.woff";

import rubikLatin700Woff2 from "./rubik/rubik-v12-latin-700.woff2";
import rubikLatin700Woff from "./rubik/rubik-v12-latin-700.woff";

import rubikLatin800Woff2 from "./rubik/rubik-v12-latin-800.woff2";
import rubikLatin800Woff from "./rubik/rubik-v12-latin-800.woff";

import rubikLatin900Woff2 from "./rubik/rubik-v12-latin-900.woff2";
import rubikLatin900Woff from "./rubik/rubik-v12-latin-900.woff";

export const Rubik = css`
    /* rubik-300 - latin */
    @font-face {
        font-family: "Rubik";
        font-display: swap;
        font-style: normal;
        font-weight: 300;
        src: url(${rubikLatin300Woff2});
        src: url(${rubikLatin300Woff2}) format("woff2"),
            url(${rubikLatin300Woff}) format("woff");
    }
    /* rubik-regular - latin */
    @font-face {
        font-family: "Rubik";
        font-display: swap;
        font-style: normal;
        font-weight: 400;
        src: url(${rubikLatinRegularWoff2});
        src: url(${rubikLatinRegularWoff2}) format("woff2"),
            url(${rubikLatinRegularWoff}) format("woff");
    }
    /* rubik-500 - latin */
    @font-face {
        font-family: "Rubik";
        font-display: swap;
        font-style: normal;
        font-weight: 500;
        src: url(${rubikLatin500Woff2});
        src: url(${rubikLatin500Woff2}) format("woff2"),
            url(${rubikLatin500Woff}) format("woff");
    }
    /* rubik-600 - latin */
    @font-face {
        font-family: "Rubik";
        font-display: swap;
        font-style: normal;
        font-weight: 600;
        src: url(${rubikLatin600Woff2});
        src: url(${rubikLatin600Woff2}) format("woff2"),
            url(${rubikLatin600Woff}) format("woff");
    }
    /* rubik-700 - latin */
    @font-face {
        font-family: "Rubik";
        font-display: swap;
        font-style: normal;
        font-weight: 700;
        src: url(${rubikLatin700Woff2});
        src: url(${rubikLatin700Woff2}) format("woff2"),
            url(${rubikLatin700Woff}) format("woff");
    }
    /* rubik-800 - latin */
    @font-face {
        font-family: "Rubik";
        font-display: swap;
        font-style: normal;
        font-weight: 800;
        src: url(${rubikLatin800Woff2});
        src: url(${rubikLatin800Woff2}) format("woff2"),
            url(${rubikLatin800Woff}) format("woff");
    }
    /* rubik-900 - latin */
    @font-face {
        font-family: "Rubik";
        font-display: swap;
        font-style: normal;
        font-weight: 900;
        src: url(${rubikLatin900Woff2}); /* IE9 Compat Modes */
        src: url(${rubikLatin900Woff2}) format("woff2"),
            url(${rubikLatin900Woff}) format("woff");
    }
`;
