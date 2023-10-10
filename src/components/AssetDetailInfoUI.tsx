import React from "react";
import { Button, Modal, Badge, Checkbox, Col, Row, Descriptions, Empty } from "antd";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import { AssetDetailInfo, AssetHistory, LabelVisible, TestDetailInfo } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { ProTable, ProColumns, ProCard } from "@ant-design/pro-components";
import { DateTransform, renderStatus, renderStatusBadge, renderKey, renderAssetType, renderLossStyle } from "../utils/transformer";
import { DownloadOutlined } from "@ant-design/icons";
import LabelDef from "./AssetLabelUI";
import OSS from "ali-oss";
import ReactHtmlParser from "react-html-parser";
import { Image } from "antd-mobile";

interface AssetDetailProps {
    setVisibleDetail: (visible: boolean) => void;
    DetailInfo: AssetDetailInfo
    ShowFullDetail?: boolean;
}

export const AssetDetailCard = (props: AssetDetailProps) => {
    const [DetailInfo, setDetailInfo] = useState<AssetDetailInfo>(props.DetailInfo);
    const router = useRouter();
    const query = router.query;
    const [LabelChangeVisible, setLabelChangeVisible] = useState(false);
    const [AllowDownload, setAllowDownload] = useState(false);   //下载标签按钮是否允许点击

    const labelArray = ["Name", "Class", "Status", "Owner", "Description", "CreateTime"];   //标签名称的类别
    const Historycolumns: ProColumns<AssetHistory>[] = [

        {
            title: "审批号",
            dataIndex: "ID",
            search: false
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
            render: (text: any, record) => {
                console.log(text);
                // TODO 不是很理解如果返回值为 undefined，前端默认会解析为 -
                return (text != "-") ? DateTransform(text) : "-";
            },
        },
    ];
    const showFullDetail = props.ShowFullDetail===false?false:true;
    const downloadLabel = async () => { //标签下载
        request(`/api/Asset/Label/${LoadSessionID()}/${DetailInfo?.ID}`, "GET")
            .then(
                (res) => {
                    console.log(res.name);
                    ossClient.get(res.name)
                        .then(response => {
                            return response;
                        })
                        .then(response => {
                            const blob = new Blob([response.content], response.res.headers);
                            const url = URL.createObjectURL(blob);
                            console.log(url);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `label_${DetailInfo.ID}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
            )
            .catch(err => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "下载标签失败",
                        content: err.toString().substring(5),
                    });
                }
            });
        const ossClient = new OSS({
            accessKeyId: "LTAI5tMmQshPLDwoQEMm8Xd7",
            accessKeySecret: "YG0kjDviIqxkz9GtTZGTLhhlVsPqID",
            region: "oss-cn-beijing",
            bucket: "cs-company",
            secure: true // true for https
        });
    };
    const UpdateLabel = (DetailInfo: AssetDetailInfo, AllowDownload: boolean) => {  //向后端更新标签内容中显示的信息
        request(`/api/Asset/Label/${LoadSessionID()}/${DetailInfo?.ID}`, "POST", DetailInfo.LabelVisible)
            .then(
                () => { setAllowDownload(AllowDownload); }
            );

    };
    const handleLabelVisabelChange = (key: keyof LabelVisible) => { //更新前端显示中标签显示的内容
        setAllowDownload(false);
        setDetailInfo((prevDetailInfo) => ({
            ...prevDetailInfo,
            LabelVisible: {
                ...prevDetailInfo.LabelVisible,
                [key]: !prevDetailInfo.LabelVisible[key],
            },
        }));
        console.log(DetailInfo.LabelVisible);
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
    }, [router, query]);
    return (
        <ProCard
            tabs={{
                type: "card",
                onChange: (key) => { setLabelChangeVisible(false); }
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
                        {showFullDetail && <Button key="back" type="primary" onClick={() => { UpdateLabel(DetailInfo, false); setLabelChangeVisible(false); props.setVisibleDetail(false); }} style={{ marginRight: "10px" }}>
                            返回
                        </Button>}
                    </div>
                </div>
            </ProCard.TabPane>
            {showFullDetail && <ProCard.TabPane key="History" tab="历史记录" >
                <ProTable
                    columns={Historycolumns}
                    options={false}
                    rowKey="ID"
                    request={async (params = {}) =>
                        request(`/api/User/Asset_Detail/${LoadSessionID()}/${DetailInfo?.ID}`, "GET")
                            .then(response => {
                                let filteredData = response.Asset_Detail.History;
                                if (params.Type) {
                                    filteredData = filteredData.filter(
                                        (item: AssetHistory) => item.Type == params.Type
                                    );
                                }
                                if (params.Initiator) {
                                    filteredData = filteredData.filter(
                                        (item: AssetHistory) => item.Initiator == params.Initiator
                                    );
                                }
                                if (params.Asset_Admin) {
                                    filteredData = filteredData.filter(
                                        (item: AssetHistory) => item.Asset_Admin == params.Asset_Admin
                                    );
                                }

                                return Promise.resolve({ data: filteredData, success: true });
                            })
                            .catch((err) => {

                                let filteredData = TestDetailInfo.History;
                                if (params.Type) {
                                    filteredData = filteredData.filter(
                                        (item: AssetHistory) => item.Type == params.Type
                                    );
                                }
                                if (params.Initiator) {
                                    filteredData = filteredData.filter(
                                        (item: AssetHistory) => item.Initiator == params.Initiator
                                    );
                                }
                                if (params.Asset_Admin) {
                                    filteredData = filteredData.filter(
                                        (item: AssetHistory) => item.Asset_Admin == params.Asset_Admin
                                    );
                                }
                                return Promise.resolve({ data: filteredData, success: false });
                            })
                    }
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                    <Button key="back" type="primary" onClick={() => { UpdateLabel(DetailInfo, false); setLabelChangeVisible(false); props.setVisibleDetail(false); }} style={{ marginRight: "10px" }}>
                        返回
                    </Button>
                </div>
            </ProCard.TabPane>}
            {showFullDetail && <ProCard.TabPane key="LabelDef" tab="标签定义" >
                <LabelDef DetailInfo={DetailInfo} LabelVisible={DetailInfo.LabelVisible} />
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <div style={{ textAlign: "center" }}>
                    {!LabelChangeVisible && <Button type="dashed" onClick={() => setLabelChangeVisible(true)} block={true}> 编辑标签 </Button>}
                </div>
                {LabelChangeVisible && <Row>

                    {labelArray.map(label => (
                        <Col span={8} key={label}>
                            <Checkbox
                                value={label}
                                onChange={(e) => handleLabelVisabelChange(label as keyof LabelVisible)}
                                defaultChecked={DetailInfo.LabelVisible[label as keyof LabelVisible]}
                            >
                                {renderKey(label as keyof LabelVisible)}
                            </Checkbox>
                        </Col>
                    ))}
                </Row>}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>

                    {LabelChangeVisible && <Button key="update" shape="round" type="default" onClick={() => { UpdateLabel(DetailInfo, true); }} style={{ marginRight: "10px" }}>
                        更新
                    </Button>}


                    {LabelChangeVisible && <Button key="download" shape="round" onClick={downloadLabel} icon={<DownloadOutlined />} disabled={!AllowDownload} style={{ marginRight: "10px" }}>
                        下载标签
                    </Button>}
                    <Button key="back" type="primary" onClick={() => { UpdateLabel(DetailInfo, false); setLabelChangeVisible(false); props.setVisibleDetail(false); }} style={{ marginRight: "10px" }}>
                        返回
                    </Button>
                </div>
            </ProCard.TabPane>}
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
                    {showFullDetail && <Button key="back" type="primary" onClick={() => { UpdateLabel(DetailInfo, false); setLabelChangeVisible(false); props.setVisibleDetail(false); }} style={{ marginRight: "10px" }}>
                        返回
                    </Button>}
                </div>
            </ProCard.TabPane>
        </ProCard >
    );
};
