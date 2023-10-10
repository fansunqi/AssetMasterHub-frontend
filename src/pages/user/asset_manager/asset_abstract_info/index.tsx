import React, { useRef } from "react";
import { Layout, Modal, Button, Descriptions, Badge, Empty, Skeleton } from "antd";
import { useRouter } from "next/router";
const { Header, Content, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { logout, LoadSessionID, IfCodeSessionWrong } from "../../../../utils/CookieOperation";
import { DateTransform, renderStatus, renderStatusBadge, renderKey, renderAssetType, renderLossStyle } from "../../../../utils/transformer";
import UserInfo from "../../../../components/UserInfoUI";
import { AssetData } from "../../../../utils/types";
import SiderMenu from "../../../../components/SiderUI";
import { AssetDetailInfo, TestDetailInfo } from "../../../../utils/types";
import { ProCard } from "@ant-design/pro-components";
import ReactHtmlParser from "react-html-parser";
import { Image } from "antd-mobile";
const App = () => {
    const [state, setState] = useState(true); // 用户是否处在登录状态
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(3); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const [UserID, setUserID] = useState(0);
    const [DetailInfo, setDetailInfo] = useState<AssetDetailInfo>(TestDetailInfo);
    const [Load, setLoad] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(true); //从资产列表跳到资产详细页面时的占位骨架
    const router = useRouter();
    const query = router.query;
    const Asset_id = query.id;
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        if (Load) {
            request(
                `/api/User/info/${LoadSessionID()}`,
                "GET"
            )
                .then((res) => {
                    setState(true);
                    setUserName(res.UserName);
                    setUserApp(res.UserApp);
                    setUserAuthority(res.Authority);
                    if (res.Authority != 2) {
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
                    request(`/api/User/Asset_Detail/${LoadSessionID()}/${Asset_id}`, "GET")
                        .then(
                            (res) => {
                                setDetailInfo(res.Asset_Detail);
                                console.log(res.Asset_Detail);
                                console.log(DetailInfo);
                                setLoad(false);
                                setShowSkeleton(false);
                            }
                        )
                        .catch(
                            (err: string) => {
                                setDetailInfo(TestDetailInfo);
                                if (IfCodeSessionWrong(err, router)) {
                                    Modal.error({
                                        title: "获取详情信息失败",
                                        content: err.toString().substring(5),
                                    });
                                }
                            }
                        );
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
        }

    }, [router, query, Asset_id, DetailInfo, Load]);
    if (state) {
        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider className="sidebar" width="13%">
                    <SiderMenu UserAuthority={UserAuthority} />
                </Sider>
                <Layout className="site-layout" >
                    <Header className="ant-layout-header">
                        <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD} Profile={true} ID={UserID}></UserInfo>
                    </Header>
                    <Content>
                        {!showSkeleton && <ProCard
                            tabs={{
                                type: "card",
                            }}
                        >
                            <ProCard.TabPane key="Info" tab="资产信息" >
                                <div>
                                    <Descriptions title="资产信息" bordered labelStyle={{ fontWeight: "bold" }}>
                                        <Descriptions.Item label="资产名称">{DetailInfo.Name}</Descriptions.Item>
                                        <Descriptions.Item label="ID">{DetailInfo.ID}</Descriptions.Item>
                                        <Descriptions.Item label="创建时间">{DateTransform(DetailInfo.CreateTime)}</Descriptions.Item>
                                        <Descriptions.Item label="当前所有者">{DetailInfo?.Owner}</Descriptions.Item>
                                        <Descriptions.Item label="状态" span={2}>
                                            <Badge status={renderStatusBadge(DetailInfo?.Status)} text={renderStatus(DetailInfo.Status)} />
                                        </Descriptions.Item>
                                        <Descriptions.Item label="类别" >
                                            {DetailInfo.Class}
                                        </Descriptions.Item>
                                        {DetailInfo.Type == 0 && <Descriptions.Item label="资产类型" span={2}>
                                            {renderAssetType(DetailInfo.Type)}
                                        </Descriptions.Item>}
                                        {DetailInfo.Type == 1 && <Descriptions.Item label="资产类型" span={1}>
                                            {renderAssetType(DetailInfo.Type)}
                                        </Descriptions.Item>}
                                        {DetailInfo.Type == 1 && <Descriptions.Item label="资产数量" span={1}>
                                            {DetailInfo.Volume}
                                        </Descriptions.Item>}
                                        <Descriptions.Item label="资产自定义属性" span={3}>
                                            {DetailInfo.PropetyName?.map((name, index) => (
                                                <div key={index}>
                                                    <span>{name}:  </span>
                                                    <span>{DetailInfo.PropetyValue[index]}</span>
                                                </div>
                                            ))}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="主资产" >
                                            {DetailInfo.Parent}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="位置" span={2}>
                                            {DetailInfo.Position}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="价值">
                                            {DetailInfo.AssetValue}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="折旧类型">
                                            {renderLossStyle(DetailInfo.LossStyle)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="过期时间" span={3}>
                                            {DetailInfo.Time}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="资产描述" span={3}>
                                            {ReactHtmlParser(DetailInfo?.Description)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                                        <Button key="back" type="primary" onClick={() => {
                                            router.push("/user/asset_manager/asset_warn");
                                        }} style={{ marginRight: "10px" }}>
                                            返回
                                        </Button>
                                    </div>
                                </div>
                            </ProCard.TabPane>
                            <ProCard.TabPane key="photos" tab="资产图片">
                                {DetailInfo.ImageUrl.length != 0 ?
                                    <div style={{ height: "400px", overflowY: "auto", overflowX: "hidden", display: "flex", flexWrap: "wrap" }}>
                                        {DetailInfo.ImageUrl.map((url, index) => (
                                            <div
                                                style={{ flex: "0 0 50%", marginBottom: "10px" }}
                                                key={url}
                                            >
                                                <div style={{ position: "relative", width: "100%", paddingBottom: "100%" }}>
                                                    <Image
                                                        key={index}
                                                        src={url}
                                                        fit="scale-down"
                                                        style={{ position: "absolute", top: 0, left: 0, borderRadius: 8, width: "100%", height: "100%" }}
                                                        alt={DetailInfo.ID + "_" + index}
                                                        lazy
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    :
                                    <div style={{ display: "fill" }}>
                                        <Empty
                                            description={
                                                <span>
                                                    暂无图片
                                                </span>
                                            }
                                        />
                                    </div>}
                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                                    <Button key="back" type="primary" onClick={() => {
                                        router.push("/user/asset_manager/asset_warn");
                                    }} style={{ marginRight: "10px" }}>
                                        返回
                                    </Button>
                                </div>
                            </ProCard.TabPane>
                        </ProCard >}
                        {showSkeleton && <Skeleton active />}
                    </Content>
                </Layout>
            </Layout>
        );
    }
};
export default App; 