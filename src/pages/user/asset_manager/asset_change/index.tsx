import React from "react";
import { Breadcrumb, Layout,theme,Table,Modal,} from "antd";
const { Column, ColumnGroup } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import {LoadSessionID } from "../../../../utils/CookieOperation";
import AssetChange from "../../../../components/AssetChangeUI";
import UserInfo from "../../../../components/UserInfoUI";
import SiderMenu from "../../../../components/SiderUI";
const App = () => {
    const [state, setState] = useState(true); // 用户是否处在登录状态
    const [collapsed, setCollapsed] = useState(false);
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(2); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const [UserID, setUserID]= useState(0);
    const router = useRouter();
    const query = router.query;
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
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
                    </Header>
                    <Content>
                        <Breadcrumb style={{ marginLeft: "30px", marginTop:"20px", marginBottom:"-10px" }}>
                            <Breadcrumb.Item>资产变更</Breadcrumb.Item>
                        </Breadcrumb>
                        <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                            <AssetChange />
                        </div>
                    </Content>
                </Layout>
            </Layout>
        );
    }
};

export default App;