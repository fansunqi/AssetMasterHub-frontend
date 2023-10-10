import React,{useRef} from "react";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button, Tour } from "antd";
import {QuestionCircleOutlined} from "@ant-design/icons";
const { Column, ColumnGroup } = Table;
import type {TourProps} from "antd";
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { logout, LoadSessionID } from "../../../../utils/CookieOperation";
import UserInfo from "../../../../components/UserInfoUI";
import {IfCodeSessionWrong} from "../../../../utils/CookieOperation";
import SiderMenu from "../../../../components/SiderUI";
import AssetWarnList from "../../../../components/AssetWarnList";
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
    const [UserAuthority, setUserAuthority] = useState(2); // 用户的角色权限，0超级，1系统，2资产，3员工
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
    const steps: TourProps["steps"] = [
        {
            title: "资产告警",
            description: "资产基于自身告警策略会显示告警信息",
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
            target: () => ref1.current,
        },
        {
            title: "调整策略",
            description: "点击可调整告警策略",
            nextButtonProps:{children:"结束导览"},
            prevButtonProps:{children:"上一步"},
            target: () => ref2.current,
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
    }, [router, query]);
    if (state) {
        return (
            <Layout className="site-layout">
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
                        <Breadcrumb style={{ margin: "16px 30px" }}>
                            <Breadcrumb.Item>资产告警</Breadcrumb.Item>
                        </Breadcrumb>
                        <div  style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                            <AssetWarnList refList={[ref2]} setTourOpen={setTourOpen} TourOpen={TourOpen}/>
                        </div>
                        <Tour open={TourOpen} onClose={() => setTourOpen(false)} steps={steps} />
                    </Content>
                </Layout>
            </Layout>
        );
    }
};

export default App;