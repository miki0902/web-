import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#4a148c", // メインカラー
        },
        secondary: {
            main: "#4a148c", // アクセント
        },
        background: {
            default: "#dddddd", // 背景
            paper: "#ffffff", // コンテナ
        },
        
    },
});