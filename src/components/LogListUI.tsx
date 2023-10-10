import { ProColumns, ProList, ProTable } from "@ant-design/pro-components";
import { Badge, Button, Checkbox, Modal, Space, Table } from "antd";
import { ColumnsType } from "antd/lib/table/InternalTable";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import { request } from "../utils/network";
import { DateTransform } from "../utils/transformer";
const { Column } = Table;
interface LogData {
    ID: number;
    CreateTime: string;
    Initiator: string;
    Type: number;
    Detail: string;
}

// DateTransform(DetailInfo?.CreateTime);
const LogList = () => {
    const [activeKey, setActiveKey] = useState<React.Key | undefined>("0");
    const [PageId, setPageId] = useState(1);
    const [TotalNum, setTotalNum] = useState(0);
    const [LogList, setLogList] = useState<LogData[]>([]);
    const [success, setSuccess] = useState(-1);
    const router = useRouter();
    const query = router.query;
    const getLog = (PageType: React.Key | undefined,PageId: number, success:number) => {
        request(
            `/api/Log/Detail/${LoadSessionID()}/${PageType}/${PageId}/Success=${success}`,
            "GET"
        )
            .then((res) => {
                setTotalNum(res.TotalNum);
                setLogList(res.LogList);
                console.log(res.LogList);
            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "获取用户信息失败",
                        content: err.toString().substring(5),
                    });
                }
            });
    };
    const pagination = {
        current: PageId,
        pageSize: 20,
        total: TotalNum,
        showSizeChanger: false,
        onChange: (page: number) => {
            setPageId(page);
            getLog(activeKey, page, success);
        },
    };
    const columns: ProColumns<LogData>[] = [
        {
            title: "创建时间",
            dataIndex: "CreateTime",
            key: "CreateTime",
            search: false,
            render: (text: any) => {
                return DateTransform(text);
            },
            width:"250px"
        },
        {
            title: "描述",
            dataIndex: "Detail",
            key: "Detail",
            width:"550px"
        },
        {
            title: "用户",
            dataIndex: "Initiator",
            key: "Initiator",
            width:"200px"
        },
        {
            title: "类型",
            dataIndex: "Type",
            key: "Type",
            valueType: "select",
            valueEnum: {
                1: {
                    text: "登录登出",
                    status: "Processing",
                },
                2: {
                    text: "用户相关",
                    status: "Warning",
                },
                3: {
                    text: "资产相关",
                    status: "Error",
                },
                4: {
                    text: "业务实体相关",
                    status: "Default",
                }
            },
            width:"200px"
        },];
    const changeloglist = (PageType: number, success: number)=>{
        setActiveKey(PageType);
        setSuccess(success);
        setPageId(1);
        getLog(PageType, 1, success);
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        getLog(0,1,-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);
    const onChange = (e: any) => {
        changeloglist(1, e.target.checked==true ? 0 : -1);
    };
    return (
        <>
            <Button className={activeKey=="0"? "log_title_select":"log_title"} type="text" key="0" onClick={()=>changeloglist(0, -1)}>
                全部日志
            </Button> 
            <Button className={activeKey=="1"? "log_title_select":"log_title"} type="text" key="1" onClick={()=>changeloglist(1,-1 )}>
                登录登出
            </Button> 
            <Button className={activeKey=="2"? "log_title_select":"log_title"} type="text" key="2" onClick={()=>changeloglist(2, -1)}>
                用户管理
            </Button>
            <Button className={activeKey=="3"? "log_title_select":"log_title"} type="text" key="3" onClick={()=>changeloglist(3, -1)}>
                资产管理
            </Button>
            <Button className={activeKey=="4"? "log_title_select":"log_title"} type="text" key="4" onClick={()=>changeloglist(4, -1)}>
                业务实体
            </Button>
            {activeKey=="1" && <Checkbox onChange={onChange} style={{marginLeft:"550px", marginTop:"-60px"}}>仅显示失败信息</Checkbox>}
            <ProTable style={{marginTop:"10px", marginLeft:"-10px"}}dataSource={LogList} columns={columns} pagination={pagination} search={false} toolBarRender={false}
                scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}>
            </ProTable>
        </>
    );
};
export default LogList;