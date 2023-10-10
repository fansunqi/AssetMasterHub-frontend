import React,{useRef} from "react";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button,Tour } from "antd";
import {QuestionCircleOutlined} from "@ant-design/icons";
import type {TourProps} from "antd";
import {
    EditOutlined, ScissorOutlined, DeleteOutlined, PlusOutlined
} from "@ant-design/icons";
const { Column, ColumnGroup } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { LoadSessionID } from "../../../../utils/CookieOperation";
import UserInfo from "../../../../components/UserInfoUI";
import SiderMenu from "../../../../components/SiderUI";
import MessageUI from "../../../../components/MessageUI";
const App = () => {
    const [state, setState] = useState(true); // 用户是否处在登录状态
    const [collapsed, setCollapsed] = useState(false);
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(2); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const router = useRouter();
    const query = router.query;
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [UserID, setUserID]= useState(0);
    const [TourOpen, setTourOpen] = useState(false);

    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const ref5 = useRef(null);
    const ref6 = useRef(null);
    const steps: TourProps["steps"] = [
        {
            title: "消息列表",
            description: "展示资产管理员所属部门内所有操作信息，包括资产的申请审批，跨部门转移及对应的时间等信息",
            placement:"center",
            type:"primary",
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
            target: () => ref1.current,
        },
        {
            title: "未读消息",
            description: "展示所有未读消息，按照时间排列",
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
            target: () => ref2.current,
        },
        {
            title: "全部消息",
            description: "展示所有消息，包括已读和未读，按照时间排列",
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
            target: () => ref3.current,
        },
        {
            title: "设为已读",
            description: "标记已读消息",
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
            target: () => ref4.current,
        },
        {
            title: "设为未读",
            description: "标记未读",
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
            target: () => ref5.current,
        },
        {
            title: "全部已读",
            description: "一键实现所有消息已读",
            nextButtonProps:{children:"结束导览"},
            prevButtonProps:{children:"上一步"},
            target: () => ref6.current,
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
                setUserAuthority(res.Authority);
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
                        <div style={{ padding: 24, background: colorBgContainer }}>
                            <MessageUI refList={[ref1,ref2,ref3,ref4,ref5,ref6]} setTourOpen={setTourOpen} TourOpen={TourOpen}/>
                        </div>
                        <Tour open={TourOpen} onClose={() => setTourOpen(false)} steps={steps} />
                    </Content>
                </Layout>
            </Layout>
        );
    }
};

export default App;