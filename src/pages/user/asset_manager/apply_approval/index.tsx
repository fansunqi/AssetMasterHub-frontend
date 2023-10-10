import React ,{useRef}from "react";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Tour,Button } from "antd";
import {
    QuestionCircleOutlined
} from "@ant-design/icons";
import type {TourProps} from "antd";
const { Column, ColumnGroup } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { logout, LoadSessionID } from "../../../../utils/CookieOperation";
import ApplyApprovalList from "../../../../components/ApplyApprovalListUI";
import UserInfo from "../../../../components/UserInfoUI";
import SiderMenu from "../../../../components/SiderUI";
const App = () => {
    const [state, setState] = useState(true); // 用户是否处在登录状态
    const [collapsed, setCollapsed] = useState(false);
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(2); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const router = useRouter();
    const query = router.query;
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [UserID, setUserID]= useState(0);
    const [TourOpen, setTourOpen] = useState(false);
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const steps: TourProps["steps"] = [
        {
            title: "资产审批列表",
            description: "显示所有部门员工提交的资产更改申请，点击右上角按钮可实现刷新和调整列表密度",
            target: () => ref1.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "批复申请",
            description: "通过员工提出的申请，由于申请间存在相互影响，一些申请不能同意，只能拒绝",
            target: () => ref2.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "拒绝申请",
            description: "拒绝员工提出的申请",
            target: () => ref3.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "查看申请理由",
            description: "点击可以查看员工提出申请的解释信息",
            target: () => ref4.current,
            nextButtonProps:{children:"结束导览"},
            prevButtonProps:{children:"上一步"},
        }
    ];
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
                if(res.Authority != 2 ){
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
    }, [router, query, state]);
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
                    <Content>
                        <Breadcrumb style={{ margin: "30px" }}>
                            <Breadcrumb.Item >资产审批</Breadcrumb.Item>
                        </Breadcrumb>
                        <div style={{background: colorBgContainer }} >
                            <ApplyApprovalList refList={[ref2,ref3,ref4]}/>
                        </div>
                        <Tour open={TourOpen} onClose={() => setTourOpen(false)} steps={steps} />
                    </Content>
                </Layout>
            </Layout>
        );
    }
};

export default App;