import LoginUI from "../components/LoginUI";
import {Button,Form} from "antd";
import { useRouter } from "next/router";

const Login = () => {
    const router = useRouter();
    const isRoot = router.pathname === "/";
    console.log(router.pathname);
    return !isRoot ? (
        <p>mistake</p>
    )
        :(<LoginUI />);
};

export default Login;
