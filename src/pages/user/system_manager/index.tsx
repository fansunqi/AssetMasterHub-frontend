import React,{useRef} from "react";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button, Tour } from "antd";
import {QuestionCircleOutlined} from "@ant-design/icons";
import type {TourProps} from "antd";
const { Column, ColumnGroup } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../utils/network";
import { logout, LoadSessionID } from "../../../utils/CookieOperation";
import MemberList from "../../../components/MemberList";
import UserInfo from "../../../components/UserInfoUI";
import {IfCodeSessionWrong} from "../../../utils/CookieOperation";
import SiderMenu from "../../../components/SiderUI";
interface MemberData {
    Name: string;
    Department: string;
    Authority: number;
    lock: boolean;
}
const App = () => {
    const [state, setState] = useState(true); // 用户是否处在登录状态
    const [collapsed, setCollapsed] = useState(false);
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(1); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [Member, setMember] = useState<MemberData[]>(); // 存储加载该系统管理员管理的资产管理员和员工的信息
    const router = useRouter();
    const query = router.query;
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const [UserID, setUserID]= useState(0);
    const [TourOpen, setTourOpen] = useState(false);

    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const ref5 = useRef(null);
    const steps: TourProps["steps"] = [
        {
            title: "用户管理面板",
            description: "展示业务实体内所有员工及其所属部门，您可以通过姓名、所属部门、身份条件检索对应的员工",
            target: () => ref1.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "解锁/锁定按钮",
            description: "点击可切换员工状态，控制其是否允许登录",
            target: () => ref2.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "重置密码",
            description: "如员工忘记密码，系统管理员可帮助重置",
            target: () => ref3.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "删除员工",
            description: "可以删除员工或系统管理员",
            target: () => ref4.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "身份变更",
            description: "资产管理员可以通过此按钮改变员工身份，注意规定一个部门内至多只能有一个资产管理员，如果提升多个同部门员工为资产管理员，系统会拒绝该请求",
            target: () => ref5.current,
            nextButtonProps:{children:"结束导览"},
            prevButtonProps:{children:"上一步"},
        }
    ];
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
        // setState(true);
        // if (state) {
        //     request(`/api/User/member/${LoadSessionID()}`, "GET")
        //         .then((res) => {
        //             // const Member = JSON.parse(res.jsonString) as MemberData;
        //             setMember(res.member);
        //         })
        //         .catch((err) => {
        //             console.log(err.message);
        //             if (IfCodeSessionWrong(err, router)) {

        //                 setState(false);
        //                 Modal.error({
        //                     title: "无权获取用户列表",
        //                     content: "请重新登录",
        //                     onOk: () => { window.location.href = "/"; }
        //                 });
        //             }
        //         });
        // }
    }, [router, query, state]);
    if (state) {

        return (
            <Layout className="site-layout">
                <Sider className= "sidebar" width="13%">
                    <SiderMenu UserAuthority={UserAuthority} />
                </Sider>
                <Layout className="site-layout" >
                    <Header className="ant-layout-header">
                        <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD} Profile={true} ID={UserID}></UserInfo>
                        <Button style={{  margin: 30}} className="header_button" onClick={() => {setTourOpen(true); }} icon={<QuestionCircleOutlined />}>
                                使用帮助
                        </Button>
                    </Header>
                    <Content>
                        <Breadcrumb style={{ margin: "16px 30px" }}>
                            <Breadcrumb.Item>用户管理</Breadcrumb.Item>
                        </Breadcrumb>
                        <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                            <MemberList
                                Members={Member}
                                department_page={false}
                                department_path={"000000000"}
                                refList={[ref2,ref3,ref4,ref5]} 
                                setTourOpen={setTourOpen} 
                                TourOpen={TourOpen}
                            />
                        </div>
                        <Tour open={TourOpen} onClose={() => setTourOpen(false)} steps={steps} />
                    </Content>
                </Layout>
            </Layout>
        );
    }
};

export default App;