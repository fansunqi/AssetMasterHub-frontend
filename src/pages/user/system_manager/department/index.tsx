import React, { useRef } from "react";
import {
    FileOutlined, PlusSquareOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import type { TourProps } from "antd";
import { Layout, Menu, theme, Space, Table, Modal, Button, Input, Form, Drawer, Tour } from "antd";
const { Column } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { LoadSessionID } from "../../../../utils/CookieOperation";
import MenuItem from "antd/es/menu/MenuItem";
import MemberList from "../../../../components/MemberList";
import DepartmentUI from "../../../../components/DepartmentControlUI";
import UserInfo from "../../../../components/UserInfoUI";
import SiderMenu from "../../../../components/SiderUI";



const App = () => {
    const [collapsed, setCollapsed] = useState(false);  //左侧边栏是否可以收起
    const [state, setState] = useState(false);  //路径保护变量
    const [DepartmentPath, setDepartmentPath] = useState("000000000");
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(1); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const [UserID, setUserID] = useState(0);
    const [TourOpen, setTourOpen] = useState(false);
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const ref5 = useRef(null);
    const steps: TourProps["steps"] = [
        {
            title: "部门管理",
            description: "逐层展示部门结构，并允许员工对部门结构进行调整，对于叶子部门，还可进一步展示员工及相关操作",
            target: () => ref1.current,
            nextButtonProps: { children: "下一步" },
            prevButtonProps: { children: "上一步" },
        },
        {
            title: "部门路径",
            description: "显示从根部门到当前部门的路径，点击路径上的任意部门可跳转至对应位置",
            target: () => ref2.current,
            nextButtonProps: { children: "下一步" },
            prevButtonProps: { children: "上一步" },
        },
        {
            title: "部门名称",
            description: "显示部门名称，用户点击后可跳转至对应部门下查看部门下组织结构",
            target: () => ref3.current,
            nextButtonProps: { children: "下一步" },
            prevButtonProps: { children: "上一步" },
        },
        {
            title: "添加部门",
            description: "用户可以在当前部门下新建新的部门，注意！由于规定资产只能挂靠于叶子部门中，当为叶子部门内添加新部门时，默认会将所有员工及资产转移至叶子部门名下",
            target: () => ref4.current,
            nextButtonProps: { children: "下一步" },
            prevButtonProps: { children: "上一步" },
        },
        {
            title: "移除部门",
            description: "删除对应部门",
            target: () => ref5.current,
            nextButtonProps: { children: "结束导览" },
            prevButtonProps: { children: "上一步" },
        }
    ];
    const router = useRouter();
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(
            `/api/User/info/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setState(true);
                setUserName(res.UserName);
                setUserApp(res.UserApp);
                setUserAuthority(res.Authority);
                if (res.Authority != 1) {
                    Modal.error({
                        title: "无权访问",
                        content: "请重新登录",
                        onOk: () => { window.location.href = "/"; }
                    });
                }
                setEntity(res.Entity);
                setDepartment(res.Department);
                setTODO(res.TODO);
                setTOREAD(res.TOREAD);
                setUserID(res.ID);
            })
            .catch((err) => {
                console.log(err.message);
                setState(false);
                Modal.error({
                    title: "登录失败",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
    }, [state, router]);

    if (state) {
        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider className="sidebar" width="13%">
                    <SiderMenu UserAuthority={UserAuthority} />
                </Sider>
                <Layout className="site-layout" >
                    <Header className="ant-layout-header">
                        <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD} Profile={true} ID={UserID}></UserInfo>
                        <Button style={{ margin: 30 }} className="header_button" onClick={() => { setTourOpen(true); }} icon={<QuestionCircleOutlined />}>
                            使用帮助
                        </Button>
                    </Header>
                    <DepartmentUI refList={[ref2,ref3,ref4,ref5]} TourOpen={TourOpen} setTourOpen={setTourOpen}/>
                    <Tour open={TourOpen} onClose={() => setTourOpen(false)} steps={steps} />
                </Layout>
            </Layout >
        );
    };
};

export default App;