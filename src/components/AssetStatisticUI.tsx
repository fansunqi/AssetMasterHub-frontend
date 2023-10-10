import { Breadcrumb, Button, Modal, Space } from "antd";
import React, { PureComponent, useEffect, useState } from "react";
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line} from "recharts";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { request } from "../utils/network";
import { LoadSessionID } from "../utils/CookieOperation";
import { ProList } from "@ant-design/pro-components";
import {AreaChartOutlined} from "@ant-design/icons";

interface  AssetStatisticData {
    Type: string;
    Value: number;
}
interface ValueData {
    Date: string;
    NumValue: number;
    ItemValue: number;
    TotalValue: number;
}
const data1 = [
    { name: "维保中", Value: 400, color: "#E91E63" },
    { name: "闲置中", Value: 300, color: "#9C27B0" },
    { name: "使用中", Value: 300, color: "#2196F3" },
    { name: "已清退", Value: 200, color: "#4CAF50" }
];
const colors = data1.map(item => item.color);
const AssetStatistic= () => {
    const RADIAN = Math.PI / 180;
    const router = useRouter();
    const query = router.query;
    const [TotalNum, setTotalNum] = useState(0);
    const [NumTotalNum, setNumTotalNum] = useState(0);
    const [ItemTotalNum, setItemTotalNum] = useState(0);
    const [NumKindNum, setNumKindNum] = useState(0);
    const [NumProportion, setNumProportion] = useState<AssetStatisticData[]>([]);
    const [ItemProportion, setItemProportion] = useState<AssetStatisticData[]>([]);
    const [Proportion, setProportion] = useState<AssetStatisticData[]>([]);
    const [ValueList, setValueList] = useState<ValueData[]>([]);
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(
            `/api/Asset/StatisticsRealFast/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setTotalNum(res.TotalNum);
                setProportion(res.Proportion);
                // setValueList(res.Value);
            })
            .catch((err) => {
                console.log(err.message);
                Modal.error({
                    title: "获取信息失败",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
        request(
            `/api/Asset/StatisticsFast/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setNumTotalNum(res.NumTotalNum);
                setNumKindNum(res.NumKindNum);
                setItemTotalNum(res.ItemTotalNum);
                setNumProportion(res.NumProportion);
                setItemProportion(res.ItemProportion);
                // setValueList(res.Value);
            })
            .catch((err) => {
                console.log(err.message);
                Modal.error({
                    title: "获取信息失败",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
        request(
            `/api/Asset/StatisticsSlow/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setValueList(res.Value);
            })
            .catch((err) => {
                console.log(err.message);
                Modal.error({
                    title: "获取信息失败",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
    }, [router, query]);
    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index
    }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
      
        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };
    const data = [
        {
            content: (
                <>
                    <div style={{fontSize:"24px", marginTop:"15px", fontWeight:"bold", marginLeft:"30px"}}>{`数量型资产总数：${NumTotalNum}`}</div>
                </>
            ),
            colors: "#9bd4fd"
        },
        {
            content: (
                <>
                    <div style={{fontSize:"24px", marginTop:"15px",  fontWeight:"bold", marginLeft:"30px"}}>{`数量型资产类型数：${NumKindNum}`}</div>
                </>
            ),
            colors: "#82b3d5;"
        },
        {
            content: (
                <>
                    <div style={{fontSize:"24px", marginTop:"15px", fontWeight:"bold", marginLeft:"30px"}}>{`条目型资产总数：${ItemTotalNum}`}</div>
                </>
            ),
            colors:"#6b91ad"
        }
    ];
    const data2 = [
        {
            content: (
                <>
                    <div style={{fontSize:"24px", marginTop:"15px", fontWeight:"bold", marginLeft:"60px"}}>{`资产总数：${TotalNum}`}</div>
                </>
            ),
            colors: "#9bd4fd"
        },
    ];
    const [ghost, setGhost] = useState<boolean>(false);
    const [openNumPie, setOpenNumPie] = useState(true);
    const [openNumBar, setOpenNumBar] = useState(false);
    const [openItemPie, setOpenItemPie] = useState(false);
    const [openItemBar, setOpenItemBar] = useState(false);
    const [AllAsset, setAllAsset] = useState(true);
    return (
        <div className="Div">
            <div> 
                <Breadcrumb style={{ marginLeft: "6px", marginBottom:"20px", fontSize:"26px"}}>
                    <Breadcrumb.Item>资产统计</Breadcrumb.Item>
                </Breadcrumb>
                <Button className={AllAsset == true ? "log_title_select" : "log_title"} type="text" key="0" onClick={() => {setAllAsset(true);}}>
                    总体资产分布
                </Button>
                <Button className={AllAsset == false ? "log_title_select" : "log_title"} type="text" key="1" onClick={() => {setAllAsset(false); console.log(AllAsset);}}>
                    详细资产分布
                </Button>
            </div>
            {AllAsset && <div>
                <ProList<any>
                    ghost={ghost}
                    itemCardProps={{
                        ghost,
                        className: "customCard",
                    }}
                    rowSelection={{}}
                    grid={{ gutter: 16, column: 2}}
                    onItem={(record: any) => {
                        return {
                            onMouseEnter: () => {
                                console.log(record);
                            },
                            onClick: () => {
                                console.log(record);
                            },
                        };
                    }}
                    metas={{
                        content: {},
                    }}
                    dataSource={data2.map((item) => ({
                        ...item,
                        itemCardProps: {
                            style: { backgroundColor: item.colors }, // 设置卡片的背景颜色
                        },
                    }))}
                    style={{marginLeft:"380px"}}
                />
                <div className="Divv" style={{marginLeft:"350px", padding:"5px"}}>
                    <Breadcrumb style={{ marginLeft: "170px", marginTop:"15px"}}>
                        <Breadcrumb.Item>总体资产分布</Breadcrumb.Item>
                    </Breadcrumb>
                    
                    {(TotalNum > 0) ? <PieChart width={400} height={400} style={{marginLeft:"45px", marginTop:"-20px"}}>
                        <Pie
                            dataKey="Value"
                            isAnimationActive={false}
                            data={Proportion}
                            cx="50%"
                            cy="50%"
                            width={400}
                            outerRadius={130}
                            fill="#8884d8"
                            labelLine={false}
                            label={renderCustomizedLabel}
                        >
                            {data1.map((entry, index) => (
                                <Cell key={index} fill={data1[index].color} className="pie-slice" onClick={()=>{}}/>
                            ))}
                        </Pie>
                        <Tooltip/>
                        <Legend iconSize={20} />
                    </PieChart> : <h1></h1>}
                    <Space style={{marginLeft:"250px"}}> </Space>
                </div>
            </div>}
            {!AllAsset && <div>
                <ProList<any>
                    ghost={ghost}
                    itemCardProps={{
                        ghost,
                        className: "customCard",
                    }}
                    rowSelection={{}}
                    grid={{ gutter: 16, column: 3}}
                    onItem={(record: any) => {
                        return {
                            onMouseEnter: () => {
                                console.log(record);
                            },
                            onClick: () => {
                                console.log(record);
                            },
                        };
                    }}
                    metas={{
                        content: {},
                    }}
                    dataSource={data.map((item) => ({
                        ...item,
                        itemCardProps: {
                            style: { backgroundColor: item.colors }, // 设置卡片的背景颜色
                        },
                    }))}
                />
                <div style={{display:"flex"}}>
                    <div className="Divv" style={{marginLeft:"50px"}}>
                        <Breadcrumb style={{ marginLeft: "170px", marginTop:"15px"}}>
                            <Breadcrumb.Item>数量型资产分布</Breadcrumb.Item>
                        </Breadcrumb>
                    
                        {(NumTotalNum > 0) ? <PieChart width={400} height={400} style={{marginLeft:"45px", marginTop:"-20px"}}>
                            <Pie
                                dataKey="Value"
                                isAnimationActive={false}
                                data={NumProportion}
                                cx="50%"
                                cy="50%"
                                width={400}
                                outerRadius={130}
                                fill="#8884d8"
                                labelLine={false}
                                label={renderCustomizedLabel}
                            >
                                {data1.map((entry, index) => (
                                    <Cell key={index} fill={data1[index].color} className="pie-slice" onClick={()=>{}}/>
                                ))}
                            </Pie>
                            <Tooltip/>
                            <Legend iconSize={20} />
                        </PieChart> : <h1></h1>}
                        <Space style={{marginLeft:"250px"}}> </Space>
                    </div>
                    <div className="Divv" style={{marginLeft:"90px"}}>
                        <Breadcrumb style={{ marginLeft: "170px", marginTop:"15px"}}>
                            <Breadcrumb.Item>条目型资产分布</Breadcrumb.Item>
                        </Breadcrumb>
                        <div style={{display:"flex"}}>
                        </div>
                        {(ItemTotalNum > 0)  ? <PieChart width={400} height={400} style={{marginLeft:"45px", marginTop:"-20px"}}>
                            <Pie
                                dataKey="Value"
                                isAnimationActive={false}
                                data={ItemProportion}
                                cx="50%"
                                cy="50%"
                                width={850}
                                outerRadius={130}
                                fill="#8884d8"
                                labelLine={false}
                                label={renderCustomizedLabel}
                            >
                                {data1.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={data1[index].color} className="pie-slice"/>
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend iconSize={20} />
                        </PieChart> : <h1></h1>}
                    </div>
                
                </div>
                <div style={{display:"flex", marginTop:"-20px"}}>
                    <Space style={{marginLeft:"10px"}}> </Space>
                
                
                </div>
                <div className="Divv2">
                    <Breadcrumb style={{ marginLeft: "130px", marginTop:"10px", marginBottom:"40px"}}>
                        <Breadcrumb.Item >单月资产净值变化</Breadcrumb.Item>
                    </Breadcrumb>
                    <LineChart
                        width={1100}
                        height={300}
                        data={ValueList}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="Date" />
                        <YAxis />
                        <Tooltip
                        />
                        <Legend
                            payload={[
                                { value: "条目型价值", type: "line", color: "#8884d8" },
                                { value: "数量型价值", type: "line", color: "#82ca9d" },
                                { value: "总价值", type: "line", color: "#1890ff" },
                            ]}
                        />
                        <Line type="monotone" dataKey="ItemValue" name="条目型价值" stroke="#8884d8" />
                        <Line type="monotone" dataKey="NumValue" name="数量型价值" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="TotalValue" name="总价值" stroke="#1890ff" />
                    </LineChart>
                </div>
            </div>}

        </div>
    );

};
export default AssetStatistic;