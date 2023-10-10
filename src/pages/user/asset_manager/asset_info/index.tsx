import React,{useRef} from "react";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button,Tour } from "antd";
import {QuestionCircleOutlined} from "@ant-design/icons";
import type {TourProps} from "antd";
const { Column, ColumnGroup } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { logout, LoadSessionID } from "../../../../utils/CookieOperation";
import AssetList from "../../../../components/AssetListAssetManagerUI";
import UserInfo from "../../../../components/UserInfoUI";
import { AssetData } from "../../../../utils/types";
import SiderMenu from "../../../../components/SiderUI";

const App = () => {
    const [state, setState] = useState(true); // 用户是否处在登录状态
    const [collapsed, setCollapsed] = useState(false);
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(2); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [Asset, setAsset] = useState<AssetData[]>(); // 存储加载该系统管理员管理的资产管理员和员工的信息
    const router = useRouter();
    const query = router.query;
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [VisibleDetail,setVisibleDetail] = useState(false); //是否显示详细信息页面
    const [AssetName,setAssetName] = useState("");  //当前面包屑显示资产的详细信息
    const [UserID, setUserID]= useState(0);
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const [TourOpen, setTourOpen] = useState(false);

    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const steps: TourProps["steps"] = [
        {
            title: "自定义属性搜索面板",
            description: "根据资产的自定义属性查找资产，检索时需输入自定义属性的键，若不填入自定义属性值，则默认检索所有具有该自定义属性键的资产",
            target: () => ref1.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "基本属性搜索面板",
            description: "根据资产的基本属性搜索资产，除编号外均为模糊匹配",
            target: () => ref2.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "资产名称",
            description: "显示资产的名称，点击名称可跳转至详细信息界面",
            target: () => ref3.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "资产操作",
            description: "展开下拉框可看到资产相关操作，包括清退、退维、调拨三种",
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
            <div className="Div">
                <Layout style={{ minHeight: "100vh" }}>
                    <Sider className= "sidebar" width="13%">
                        <SiderMenu UserAuthority={UserAuthority} />
                    </Sider>
                    <Layout className="site-layout" >
                        <Header className="site-header">
                            <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD} Profile={true} ID={UserID}></UserInfo>
                            <Button disabled={VisibleDetail} style={{  margin: 30}} className="header_button" onClick={() => { setTourOpen(true); }} icon={<QuestionCircleOutlined />}>
                                使用帮助
                            </Button>
                        </Header>
                        <Content>
                            <Breadcrumb style={{ margin: "30px" }}>
                                <Breadcrumb.Item className="ant-breadcrumb-item">{VisibleDetail?"资产详情":"资产列表"}</Breadcrumb.Item>
                                {VisibleDetail && <Breadcrumb.Item className="ant-breadcrumb-item">{AssetName}</Breadcrumb.Item>}
                            </Breadcrumb>
                            <div className="Div">
                                <AssetList ManagerName={UserName} setVisibleDetail={setVisibleDetail} VisibleDetail={VisibleDetail} setAssetName={setAssetName} refList={[ref1,ref2,ref3,ref4]} setTourOpen={setTourOpen} TourOpen={TourOpen}/>
                            </div>
                            <Tour open={TourOpen} onClose={() => setTourOpen(false)} steps={steps} />
                        </Content>
                    </Layout>
                </Layout>
            </div>
        );
    }
};

export default App;