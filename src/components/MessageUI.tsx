import React, { useRef } from "react";
import { theme, Form, Modal, Button, Space, Breadcrumb } from "antd";
import {
    FormOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import { AssetData } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import {
    ProTable,
    ProColumns,
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormTextArea,
    ProFormText,
    ProFormSelect,
    ProFormMoney,
    ActionType,
} from "@ant-design/pro-components";
import { DateTransform } from "../utils/transformer";
interface MessageData {
    Time: string;
    Detail: string;
    Is_Read: boolean;
    ID: number;
}
interface MessageProps {
    refList: React.MutableRefObject<any>[];
    setTourOpen: (t: boolean) => void;
    TourOpen: boolean;
}
const MessageUI = (props: MessageProps) => {
    const [MessageList, setMessageList] = useState<MessageData[]>();
    const [changekey, setchangekey] = useState(Date.now());
    const [newinfo, setnewinfo] = useState(true);
    const tableRef = useRef<ActionType>();
    const [loading, setloading] = useState(false);
    const columns: ProColumns<MessageData>[] = [
        {
            title: "消息编号",
            dataIndex: "ID",
            key: "ID",
            width:"100px"
        },
        {
            title: "状态",
            dataIndex: "Is_Read",
            key: "Is_Read",
            valueType: "select",
            valueEnum: {
                true: {
                    text: "已读",
                    status: "Success",
                },
                false: {
                    text: "未读",
                    status: "Error",
                }
            },
        },
        {
            title: "描述",
            dataIndex: "Detail",
            key: "Detail",
        },
        {
            title: "时间",
            dataIndex: "Time",
            key: "Time",
            search: false,
            render: (text: any, record) => {
                return DateTransform(text);
            },
        },
        {
            title: "操作",
            dataIndex: "",
            key: "",
            render: (_: any, record) => {
                if (record.Is_Read == false) {
                    return (
                        <Button loading={loading} type="primary" key="0" ref={props.refList[3]} onClick={() => { if (!props.TourOpen) { handleChange(record.ID); } }}>设为已读</Button>
                    );
                }
                else if (record.Is_Read == true) {
                    return (
                        <Button loading={loading} key="0" ref={props.refList[4]} onClick={() => { if (!props.TourOpen) { handleChange(record.ID); } }}>设为未读</Button>
                    );
                }

            },
        },
    ];
    const router = useRouter();
    const query = router.query;
    const [PageID, setPageID] = useState(1);
    const [TotalNum, setTotalNum] = useState(0);
    const fetchList = (Is_Read: number, PageId: number) => {
        request(
            `/api/User/Message/All/${LoadSessionID()}/${PageId}/Is_Read=${Is_Read}`,
            "GET"
        )
            .then((res) => {
                setTotalNum(res.TotalNum);
                setMessageList(res.Message);
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
        current: PageID,
        pageSize: 20,
        total: TotalNum,
        showSizeChanger: false,
        onChange: (page: number) => {
            setPageID(page);
            fetchList(newinfo?0:-1, page);
        },
    };
    const handleChange = (ID: number) => {
        setloading(true);
        request(`/api/User/Message/New/${LoadSessionID()}`, "PUT",
            {
                "ID": ID
            }
        )
            .then(() => {
                Modal.success({
                    title: "操作成功",
                    content: "成功更改消息状态",
                });
                setloading(false);
                fetchList(newinfo?0:-1, PageID);
            })
            .catch(
                (err: string) => {
                    if (IfCodeSessionWrong(err, router)) {
                        Modal.error({
                            title: "操作失败",
                            content: err.toString().substring(5),
                        });
                    }
                    setloading(false);
                }
            );
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        fetchList(0, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query]);
    const themeConfig = {
        token: {
            colorPrimary: "red",
            borderRadius: 4,
            // TODO 可以验证下是否透明也行
            colorBgElevated: "white",
        },
        algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
    };
    return (
        <div className="Div">
            <Breadcrumb style={{ marginLeft: "6px", marginBottom: "20px" }}>
                <Breadcrumb.Item>消息列表</Breadcrumb.Item>
            </Breadcrumb>
            <Button ref={props.refList[1]} className={newinfo ? "log_title_select" : "log_title"} type="text" key="1" onClick={() => { if (!props.TourOpen) { setnewinfo(true); setPageID(1); fetchList(0, 1); } }}>
                未读消息
            </Button>
            <Button ref={props.refList[2]} className={!newinfo ? "log_title_select" : "log_title"} type="text" key="0" onClick={() => { if (!props.TourOpen) { setnewinfo(false); setPageID(1); fetchList(-1, 1); } }}>
                全部消息
            </Button>
            <Button style={{marginLeft:"820px"}} type="primary" ref={props.refList[5]} onClick={() => { if (!props.TourOpen) { handleChange(-1); } }}>全部已读</Button>
            <div ref={props.refList[0]}>

                <ProTable style={{ marginTop: "-20px", marginLeft: "-33px" }}
                    columns={columns}
                    actionRef={tableRef}
                    options={false}
                    rowKey="ID"
                    dataSource={MessageList}
                    form={{
                        // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
                        syncToUrl: (values, type) => {
                            if (type === "get") {
                                return {
                                    ...values,
                                    created_at: [values.startTime, values.endTime],
                                };
                            }
                            return values;
                        },
                    }}
                    scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
                    pagination={pagination}
                    search={false}
                />
            </div>
            

        </div>
    );
};
export default MessageUI;