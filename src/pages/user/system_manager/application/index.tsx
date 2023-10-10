import React, {useRef} from "react";
import {
    FileOutlined, PlusSquareOutlined, QuestionCircleOutlined
} from "@ant-design/icons";
import type { MenuProps, TourProps } from "antd";
import { Layout, Menu, theme, Space, Table, Modal, Button, Input, Form, Drawer,Tour } from "antd";
const { Column } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { LoadSessionID } from "../../../../utils/CookieOperation";
import MenuItem from "antd/es/menu/MenuItem";
import MemberList from "../../../../components/MemberList";
import DepartmentUI from "../../../../components/DepartmentControlUI";
import  UserInfo  from "../../../../components/UserInfoUI";
import ApplicationUI from "../../../../components/ApplicationUI";
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
    const [UserID, setUserID]= useState(0);
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const ref5 = useRef(null);
    const [TourOpen, setTourOpen] = useState(false);
    const steps: TourProps["steps"] = [
        {
            title: "添加业务实体",
            description: "点击按钮添加业务实体及系统管理员",
            target: () => ref1.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "飞书同步",
            description: "点击按钮以同步所有飞书用户至指定部门",
            target: () => ref2.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "业务实体列表",
            description: "查看所有业务实体及对应的系统管理员,点击移除按钮可以删除对应实体及管理员,点击设置同步部门可以修改飞书同步的部门",
            target: () => ref3.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "移除业务实体",
            description: "删除业务实体及对应管理员",
            target: () => ref4.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "业务实体列表",
            description: "设置飞书同步部门,用于飞书同步",
            target: () => ref5.current,
            nextButtonProps:{children:"结束导览"},
            prevButtonProps:{children:"上一步"},
        },
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
                if(res.Authority != 1 ){
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
                <Sider className= "sidebar" width="13%">
                    <SiderMenu UserAuthority={UserAuthority} />
                </Sider>
                <Layout className="site-layout" >
                    <Header className="ant-layout-header">
                        <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD} Profile={true} ID={UserID}></UserInfo>
                        <Button style={{  margin: 30}} className="header_button" onClick={() => { setTourOpen(true); }} icon={<QuestionCircleOutlined />}>
                            使用帮助
                        </Button>
                    </Header>
                    <ApplicationUI refList={[ref1,ref2,ref3,ref4,ref5]} setTourOpen={setTourOpen} TourOpen={TourOpen}/>
                    <Tour open={TourOpen} onClose={() => setTourOpen(false)} steps={steps} />
                </Layout>
            </Layout >
        );
    };
};

export default App;