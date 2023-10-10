import { useRouter } from "next/router";
import { Collapse, Card, Toast, List, Button, Image } from "antd-mobile";
import { ProCard, ProTable, ProColumns } from "@ant-design/pro-components";
import { request } from "../../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../../utils/CookieOperation";
import { useState, useEffect } from "react";
import { AssetDetailInfo, AssetHistory, TestDetailInfo } from "../../utils/types"; //对列表中数据的定义在 utils/types 中
import { Modal, Badge, Descriptions,Empty } from "antd";
import { DateTransform, renderStatus, renderStatusBadge, renderStatusChanges, renderAssetType, renderLossStyle } from "../../utils/transformer";
import ReactHtmlParser from "react-html-parser";
const AssetPage = () => {
    const router = useRouter();
    const query = router.query;
    const id = query.id;
    const [DetailInfo, setDetailInfo] = useState<AssetDetailInfo>();
    const [NoUpdate, setNoUpdate] = useState(false);
    const [ShowHistoryDetail, setShowHistoryDetail] = useState(0);
    // const location = useLocation();
    // const queryParams = new URLSearchParams(location.search);
    // const id = queryParams.get("id");
    const assetData = {
        name: "Asset Name",
        type: "Asset Type",
        value: "$1,000",
        description: "Asset Description",
    };
    const Historycolumns: ProColumns<AssetHistory>[] = [

        {
            title: "审批号",
            dataIndex: "ID",
            search: false,
            // fixed:"left"
        },
        {
            title: "申请类型",
            dataIndex: "Type",
            key: "Type",
            valueType: "select",
            valueEnum: {
                0: {
                    text: "领用",
                    status: "Success",
                },
                1: {
                    text: "退库",
                    status: "Error",
                },
                2: {
                    text: "维保",
                    status: "Warning",
                },
                3: {
                    text: "转移",
                    status: "Processing",
                },
                4: {
                    text: "清退",
                    status: "Default",
                },
                5: {
                    text: "退维",
                    status: "Success",
                },
                6: {
                    text: "调拨",
                    status: "Processing",
                },
                7: {
                    text: "录入",
                    status: "Success",
                },
                8: {
                    text: "变更",
                    status: "Warning",
                }
            },
        },
        {
            title: "发起者",
            dataIndex: "Initiator",
        },
        {
            title: "参与者",
            dataIndex: "Participant",
            search: false,
        },
        {
            title: "审批人",
            dataIndex: "Asset_Admin",
        },
        {
            title: "审批时间",
            dataIndex: "Review_Time",
            search: false,
            render: (text: any, record: any) => {
                console.log(text);
                // TODO 不是很理解如果返回值为 undefined，前端默认会解析为 -
                return (text != "-") ? DateTransform(text) : "-";
            },
            // fixed:"right"
        },
    ];
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        if (!NoUpdate) {
            request(`/api/User/QR_Asset_Detail/${id}`, "GET")
                .then(
                    (res) => {
                        setDetailInfo(res.Asset_Detail);
                        setNoUpdate(true);
                        console.log(res.Asset_Detail);
                        console.log(DetailInfo);

                    }
                )
                .catch(
                    (err: string) => {
                        setDetailInfo(TestDetailInfo);
                    }
                );
        }
    }, [router, query, id, DetailInfo, NoUpdate]);

    return (
        <div>
            <Collapse defaultActiveKey={["1"]}>
                <Collapse.Panel key="1" title="基本信息">
                    <Descriptions title="资产信息" bordered>
                        <Descriptions.Item label="资产名称">{DetailInfo?.Name}</Descriptions.Item>
                        <Descriptions.Item label="ID">{DetailInfo?.ID}</Descriptions.Item>
                        <Descriptions.Item label="创建时间">{DateTransform(DetailInfo?.CreateTime)}</Descriptions.Item>
                        <Descriptions.Item label="当前所有者">{DetailInfo?.Owner}</Descriptions.Item>
                        <Descriptions.Item label="状态" span={2}>
                            <Badge status={renderStatusBadge(DetailInfo?.Status)} text={renderStatus(DetailInfo?.Status)} />
                        </Descriptions.Item>
                        <Descriptions.Item label="类别" >
                            {DetailInfo?.Class}
                        </Descriptions.Item>
                        <Descriptions.Item label="资产类型" span={2}>
                            {renderAssetType(DetailInfo?.Type)}
                        </Descriptions.Item>
                        <Descriptions.Item label="资产自定义属性" span={3}>
                            {DetailInfo?.PropetyName?.map((name, index) => (
                                <div key={index}>
                                    <span>{name}:  </span>
                                    <span>{DetailInfo?.PropetyValue[index]}</span>
                                </div>
                            ))}
                        </Descriptions.Item>
                        <Descriptions.Item label="主资产" >
                            {DetailInfo?.Parent}
                        </Descriptions.Item>
                        <Descriptions.Item label="位置" span={2}>
                            {DetailInfo?.Position}
                        </Descriptions.Item>
                        <Descriptions.Item label="价值">
                            {DetailInfo?.Volume}
                        </Descriptions.Item>
                        <Descriptions.Item label="折旧类型">
                            {renderLossStyle(DetailInfo?.LossStyle)}
                        </Descriptions.Item>
                        <Descriptions.Item label="过期时间" span={3}>
                            {DetailInfo?.Time}
                        </Descriptions.Item>
                        <Descriptions.Item label="资产描述" span={3}>
                            {DetailInfo?.Description ? ReactHtmlParser(DetailInfo?.Description) : ""}
                        </Descriptions.Item>
                    </Descriptions>
                </Collapse.Panel>
                <Collapse.Panel key="2" title="历史记录">
                    <List mode="card" header='资产历史记录(最近十条)'>
                        {DetailInfo?.History.map(row => (

                            <div key={row.ID}>

                                <List.Item key={row.ID} title={"审批号:" + row.ID} description={DateTransform(row.Review_Time)} clickable onClick={() => setShowHistoryDetail(ShowHistoryDetail == 0 ? row.ID : 0)}>

                                    <Badge status={renderStatusBadge(row.Type)} />{" " + renderStatusChanges(row.Type)}
                                </List.Item>
                                {ShowHistoryDetail == row.ID && <Card title="详细信息" >
                                    <ProCard split="horizontal">
                                        <ProCard split="horizontal">
                                            <ProCard split="vertical">
                                                <ProCard title="审批号">{row.ID}</ProCard>
                                                <ProCard title="申请类型"><Badge status={renderStatusBadge(row.Type)} />{renderStatusChanges(row.Type)}</ProCard>
                                                <ProCard title="审批时间">{DateTransform(row.Review_Time)}</ProCard>
                                            </ProCard>
                                            <ProCard split="vertical">
                                                <ProCard title="发起者">{row.Initiator}</ProCard>
                                                <ProCard title="参与者">{row.Participant}</ProCard>
                                                <ProCard title="审批人">{row.Asset_Admin} </ProCard>
                                            </ProCard>
                                            {/* <ProCard split="vertical">
                                                        <ProCard title="资产描述">{DetailInfo?.Description}</ProCard>
                                                    </ProCard> */}
                                        </ProCard>
                                    </ProCard>
                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <Button
                                            color="primary"
                                            onClick={() => {
                                                setShowHistoryDetail(0);
                                            }}

                                        >
                                            关闭
                                        </Button>
                                    </div>
                                </Card>}
                            </div>


                        ))}
                    </List>
                </Collapse.Panel>
                <Collapse.Panel key="3" title="资产图片">
                    {DetailInfo?.ImageUrl.length != 0 ?
                        <div style={{ height: "500px", overflowY: "auto", overflowX: "hidden", display: "flex", flexWrap: "wrap" }}>
                            {DetailInfo?.ImageUrl.map((url, index) => (
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
                                            alt={url}
                                            lazy
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        : <div style={{ display: "fill" }}>
                            <Empty
                                description={
                                    <span>
                                        暂无图片
                                    </span>
                                }
                            />
                        </div>}
                </Collapse.Panel>
            </Collapse>
        </div >
    );
};

export default AssetPage;