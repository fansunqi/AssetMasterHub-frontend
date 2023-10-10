import cookie from "react-cookies";
import {Modal} from "antd";
const getCookie = (key: string, default_value: string): string => {
    const rgx = new RegExp("(?:^|(?:; ))" + key + "=([^;]*)");
    const result = document.cookie.match(rgx);
    if (result) {
        return result[1];
    } else {
        return default_value;
    }
};

const setCookie = (key: string, value: string) => {
    //设置 Cookie
    document.cookie = key + "=" + value;
};

const generateRandomString = (num: number) => {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result1 = "";
    const charactersLength = characters.length;
    for (let i = 0; i < num; i++) {
        result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result1;
};
//
const LoadSessionID= () => {
    return cookie.load("SessionID")?cookie.load("SessionID"):"";
};
//用户登出，删除cookie
const logout = () => {
    cookie.remove("SessionID");
};
// 用户登录，保存cookie
const CreateCookie = (key:string) => {
    let SessionID = generateRandomString(32);
    console.log(`${key} is`,SessionID);
    cookie.save(key, SessionID, { path: "/" });
};
// 根据错误码判断是否SessionID过期或错误，若是则应该登出
const IfCodeSessionWrong=(err:any,router:any)=>{
    if (err.type === 1) {
        console.log("return code=-2,  SessionError");
        Modal.error({
            title: "会话失败",
            content: "请重新登陆",
        });
        router.push("/");
        return false;
    }
    return true;
};
export { getCookie, setCookie, generateRandomString,LoadSessionID, logout, CreateCookie,IfCodeSessionWrong };