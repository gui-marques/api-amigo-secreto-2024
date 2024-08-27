import { getYesterday } from "../utils/getYesterday";

export const validatePassword = (password: string): boolean => {
    const yesterdayPassword = getYesterday().split('/').join('');
    return password === yesterdayPassword;
}

export const createToken = () => {
    const yesterdayPassword = getYesterday().split('/').join('');
    return `${process.env.DEFAULT_TOKEN}${yesterdayPassword}`;
}

export const validateToken = (token: string) => {
    const currentToken = createToken();
    return token === currentToken;
}