import { ActionType, ModalForm, ParamsType, ProColumns, ProForm, ProFormDatePicker, ProFormDateTimePicker, ProFormDigit, ProFormInstance, ProFormSelect, ProFormText, ProFormTextArea, ProList, ProTable, StepsForm } from "@ant-design/pro-components";
import { Badge, Button, Modal, Space, Table, Descriptions, Tooltip, InputNumber, Select, Form } from "antd";
import { ColumnsType } from "antd/lib/table/InternalTable";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import { request } from "../utils/network";
import { DateTransform } from "../utils/transformer";
import { EditOutlined } from "@ant-design/icons";
const { Column } = Table;
interface AssetWarnData {
    Name:string;
    ID: number;
    AssetType: number;
    WarnType: number;
    WarnStrategy: string;
    Description: string;
    IsWarning: number;
}
interface UrlData {
    Name?:string;
    AssetType?: number;
    WarnType?: number;
    pageSize:number;
    current?: number;
    IsWarning:number;
}

interface MessageProps {
    refList: React.MutableRefObject<any>[];
    setTourOpen: (t: boolean) => void;
    TourOpen: boolean;
}

// DateTransform(DetailInfo?.CreateTime);
const AssetWarnList = (props:MessageProps) => {
    const [activeKey, setActiveKey] = useState<React.Key | undefined>("1");
    const router = useRouter();
    const query = router.query;
    const tableRef = useRef<ActionType>(null);
    const [open1, setModal1open] = useState(false);
    const [open2, setModal2open] = useState(false);
    const [open3, setModal3open] = useState(false);
    const [ChangeAsset, setChangeAsset] = useState<AssetWarnData>();
    const [WarnType, setWarnType] = useState(-1);
    const [NumWarnStrategy, setNumWarnStrategy] = useState<number | null>(1);
    const [Year, setYear] = useState<number | null>(0);
    const [Month, setMonth] = useState<number | null>(0);
    const [Date, setDate] = useState<number | null>(1);
    // const getList = (PageType: React.Key | undefined,PageId: number) => {
    //     request(
    //         `/api/Asset/Warn/${LoadSessionID()}/${PageType}/${PageId}`,
    //         "GET"
    //     )
    //         .then((res) => {
    //             setTotalNum(res.TotalNum);
    //             setAssetList(res.AssetList);
    //         })
    //         .catch((err: string) => {
    //             if (IfCodeSessionWrong(err, router)) {
    //                 Modal.error({
    //                     title: "获取用户信息失败",
    //                     content: err.toString().substring(5),
    //                 });
    //             }
    //         });
    // };
    // const pagination = {
    //     current: PageId,
    //     pageSize: 20,
    //     total: TotalNum,
    //     onChange: (page: number) => {
    //         setPageId(page);
    //         getList(activeKey, page);
    //     },
    // };
    const [visible, setVisible] = useState(false);
    const columns: ProColumns<AssetWarnData>[] = [
        {
            title: "资产名称",
            dataIndex: "Name",
            key: "Name",
            render: (_: any, record) => {
                return (
                    <div ref={props.refList[2]}>
                        <Tooltip title="点击查看详情">
                            <a style={{ marginInlineStart: 8, color: "#007AFF" }} onClick={() => {
                                if (!props.TourOpen) {
                                    props.setTourOpen(false);
                                    router.push(`/user/asset_manager/asset_abstract_info?id=${record.ID}`);
                                }
                            }}>{record.Name}</a>
                        </Tooltip>
                    </div >);
            },
        },
        {
            title: "类型",
            dataIndex: "AssetType",
            key: "AssetType",
            valueType: "select",
            valueEnum: {
                0: {
                    text: "条目型",
                    status: "Error",
                },
                1: {
                    text: "数量型",
                    status: "Warning",
                },
            },
        },
        {
            title: "状态",
            dataIndex: "IsWarning",
            key: "IsWarning",
            valueType: "select",
            valueEnum: {
                0: {
                    text: "告警",
                    status: "Error",
                },
                1: {
                    text: "正常",
                    status: "Warning",
                },
            },
        },
        {
            title: "告警策略",
            dataIndex: "WarnType",
            key: "WarnType",
            valueType: "select",
            valueEnum: {
                0: {
                    text: "数量告警",
                },
                1: {
                    text: "年限告警",
                },
                2: {
                    text: "无告警策略",
                },
            },
            hideInTable: true
            
        },
        {
            title: "具体告警策略",
            dataIndex: "WarnStrategy",
            key: "WarnStrategy",
            search:false
        },
        {
            title: "描述",
            dataIndex: "Description",
            key: "Description",
            search:false
        },
        {
            title: "操作",
            valueType: "option",
            key: "option",
            render: (text, record, _, action) => {
                return (
                    <Tooltip title="设置告警策略">
                        <Button key="receive" onClick={() => {if(!props.TourOpen){setModal1open(true);setVisible(true); setChangeAsset(record);}}}>
                            <span ref={props.refList[0]} >
                                <EditOutlined />
                            </span>
                        </Button>
                    </Tooltip>
                );
            },
        }
    ];
    const handleChange1 = (value:number) => {
        setWarnType(value);
    };
    const handleChange2 = (value:number | null) => {
        setNumWarnStrategy(value);
    };
    const handleChangeYear = (value:number | null) => {
        setYear(value);
    };
    const handleChangeMonth = (value:number | null) => {
        setMonth(value);
    };
    const handleChangeDate = (value:number | null) => {
        setDate(value);
    };
    const handleOk1 = () => {
        if (WarnType == 0) {setModal1open(false);setModal2open(true);}
        else if (WarnType == 1) {setModal1open(false);setModal3open(true);}
    };
    const [Loading, setLoading] = useState(false);
    const handleOk2 = (num:number) => {
        setLoading(true);
        request(
            `/api/Asset/Warn/${LoadSessionID()}`,
            "POST",
            {
                "AssetID": ChangeAsset?.ID,
                "WarnType": WarnType,
                "WarnStrategy": `${num}`,
            }
        )
            .then((res) => {
                setModal2open(false);
                setModal3open(false);
                setVisible(false);
                setLoading(false);
                let answer: string = `成功修改资产 ${ChangeAsset?.Name}的告警策略`;
                Modal.success({ title: "修改成功", content: answer });
                tableRef?.current?.reload();
                formRef.current?.resetFields();
            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {
                    setModal2open(false);
                    setModal3open(false);
                    setVisible(false);
                    setLoading(false);
                    formRef.current?.resetFields();
                    Modal.error({
                        title: "修改失败",
                        content: err.toString().substring(5),
                    });
                }
            });
    };
    const handleOk3 = (year:number, month:number, date: number) => {
        setLoading(true);
        request(
            `/api/Asset/Warn/${LoadSessionID()}`,
            "POST",
            {
                "AssetID": ChangeAsset?.ID,
                "WarnType": WarnType,
                "WarnStrategy": `${year}年${month}月${date}天`,
            }
        )
            .then((res) => {
                setModal2open(false);
                setModal3open(false);
                setVisible(false);
                setLoading(false);
                formRef.current?.resetFields();
                let answer: string = `成功修改资产 ${ChangeAsset?.Name}的告警策略`;
                Modal.success({ title: "修改成功", content: answer });
                tableRef?.current?.reload();
            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {
                    setModal2open(false);
                    setModal3open(false);
                    setVisible(false);
                    setLoading(false);
                    formRef.current?.resetFields();
                    Modal.error({
                        title: "修改失败",
                        content: err.toString().substring(5),
                    });
                }
            });
    };
    const formRef = useRef<ProFormInstance>();
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        // getLog(0,1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);
    return (
        <>
            {/* <Button className={activeKey=="0"? "log_title_select":"log_title"} type="text" key="0" onClick={()=>changeassetlist(0)}>
                告警资产
            </Button> 
            <Button className={activeKey=="1"? "log_title_select":"log_title"} type="text" key="1" onClick={()=>changeassetlist(1)}>
                全部资产
            </Button>  */}
            <ProTable className="ant-pro-table"
                columns={columns}
                options={{ reload: true, setting: false }}
                rowKey="ID"
                actionRef={tableRef}
                request={async (params = {}) => {
                    const loadSessionID = LoadSessionID();
                    let urldata:UrlData={pageSize:20, current:params.current, Name:"", AssetType:-1, WarnType:-1, IsWarning:2};
                    if(params.Name != undefined) urldata.Name=params.Name;
                    if(params.AssetType != undefined) urldata.AssetType=params.AssetType;
                    if(params.WarnType != undefined) urldata.WarnType=params.WarnType;
                    if(params.IsWarning != undefined) urldata.IsWarning=params.IsWarning;
                    // console.log("params参数："+params.Name+params.AssetType+params.WarnType);
                    let url = `/api/Asset/Warn/${loadSessionID}/${urldata.IsWarning}/${urldata.current}/Name=${urldata.Name}/AssetType=${urldata.AssetType}/WarnType=${urldata.WarnType}`;
                    console.log(url);
                    return (
                        request(
                            url,
                            "GET"
                        )
                            .then((res) => {
                                return Promise.resolve({ data: res.AssetList, success: true , total:res.TotalNum});
                            })
                    );
                }
                }
                scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
                pagination={{
                    showSizeChanger:false,
                }}
                search={{
                    defaultCollapsed: false,
                    defaultColsNumber: 1,
                    split: true,
                    span: 8,
                    searchText: "查询"
                }}
                toolBarRender={false}
            />
            {/* <ModalForm<{
                WarnType: number;
                Year:number;
                Month:number;
                Date:number;
                NumberWarnStrategy:number
            }>
                title="设置具体告警策略"
                open={open}
                form={form}
                autoFocusFirstInput
                modalProps={{
                    destroyOnClose: true,
                    onCancel: () => console.log("run"),
                }}
                submitTimeout={500}
                onFinish={async (values) => {
                    
                    return true;
                }}
                actionsRender={(okBtnProps, cancelBtnProps) => (
                    <>
                      <Button {...cancelBtnProps}>取消</Button>
                      <Button {...okBtnProps} type="primary">
                        下一步
                      </Button>
                    </>
                    )}
            >
                <ProForm.Group>
                    <ProFormSelect
                        name="WarnType"
                        label="告警策略"
                        width="lg"
                        tooltip="条目型资产只能选择年限告警"
                        options={[
                            {
                                value: 1,
                                label: "年限告警",
                            },
                            {
                                value: 0,
                                label: "数量告警",
                                disabled : ChangeAsset?.AssetType==0
                            }
                        ]}
                        placeholder="请选择告警策略"      
                    />
                </ProForm.Group>
            </ModalForm> */}
            {/* <Modal
                title="请选择告警类型"
                bodyStyle={{ padding: "20px" }}
                open={open1}
                onCancel={() => setModal1open(false)}
                onOk={handleOk1}
                okText="下一步"
                
            >
                <Select
                    style={{ width: "200px" ,marginLeft:"-20px"}}
                    onChange={handleChange1}
                    options={[
                        {
                            value: 1,
                            label: "年限告警",
                        },
                        {
                            value: 0,
                            label: "数量告警",
                            disabled : ChangeAsset?.AssetType==0
                        }
                    ]}
                    placeholder="告警类型"
                />
            </Modal>
            <Modal
                title="请设置具体数量告警策略"
                bodyStyle={{ padding: "20px" }}
                open={open2}
                onCancel={() => {setModal1open(true);setModal2open(false);}}
                onOk={handleOk2}
                okText="确定"
                cancelText="上一步"
            >
                <Space style={{marginLeft:"-20px"}}>
                    <div>剩余数量小于等于</div>
                    <InputNumber size="small" min={1} defaultValue={1} style={{width:"40px"}}onChange={handleChange2} />
                    <div>时告警</div>
                </Space>
            </Modal>
            <Modal
                title="请设置具体年限告警策略"
                bodyStyle={{ padding: "20px" }}
                open={open3}
                onCancel={() => {setModal1open(true);setModal3open(false);}}
                onOk={handleOk3}
                okText="确定"
                cancelText="上一步"
            >
                <Space style={{marginLeft:"-20px"}}>
                    <div>剩余使用时间小于等于</div>
                    <InputNumber size="small" min={0} max={100} defaultValue={0} style={{width:"40px"}}onChange={handleChangeYear} />
                    <div>年</div>
                    <InputNumber size="small" min={0} max={12} defaultValue={0} style={{width:"40px"}}onChange={handleChangeMonth} />
                    <div>月</div>
                    <InputNumber size="small" min={1} max={31} defaultValue={1} style={{width:"40px"}}onChange={handleChangeDate} />
                    <div>日</div>
                </Space>
            </Modal> */}
            <StepsForm
                onFinish={async (values) => {
                    console.log(values);
                    if (WarnType == 0) {
                        handleOk2(values.number);
                    }
                    else {
                        handleOk3(values.year, values.month, values.date);
                    }
                    return true;
                    
                }}
                formProps={{
                    validateMessages: {
                        required: "此项为必填项",
                    },
                }}
                formRef={formRef}
                stepsFormRender={(dom, submitter) => {
                    return (
                        <Modal
                            width={800}
                            style={{height:"500px", marginTop:"50px"}}
                            onCancel={() => {setVisible(false); formRef.current?.resetFields();}}
                            open={visible}
                            footer={submitter}
                        >
                            <div style={{marginBottom:"25px", fontSize:"20px"}}>资产告警 </div>
                            {dom}
                        </Modal>
                    );
                }}
            >
                <StepsForm.StepForm
                    name="base"
                    title="设置告警类型"
                    onFinish={async (values) => {
                        setWarnType(values.type);
                        console.log(values.type);
                        return true;
                    }}
                    style={{height:"70px", marginTop:"30px"}}
                >
                    <ProFormSelect
                        name="type"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                        width="md"
                        options={[
                            {
                                value: 1,
                                label: "年限告警",
                            },
                            {
                                value: 0,
                                label: "数量告警",
                                disabled : ChangeAsset?.AssetType==0
                            }
                        ]}
                        placeholder="告警类型"
                    />
                </StepsForm.StepForm>
                
                <StepsForm.StepForm name="time" title="设置具体告警策略" style={{height:"70px"}}>
                    {WarnType == 0 && <Space style={{marginLeft:"-20px", marginBottom:"-50px"}}>
                        <div style={{marginTop:"-25px", fontSize:"16px"}}>剩余数量小于等于</div>
                        <ProFormDigit
                            name="number" 
                            min={1} 
                            initialValue={1} 
                            width={50}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            fieldProps={{ precision: 0 }}
                        />
                        <div style={{marginTop:"-25px", fontSize:"16px"}}>时告警</div>
                    </Space>}
                    {WarnType == 1 && <Space style={{marginLeft:"-20px", marginTop:"10px"}}>
                        <div style={{marginTop:"-20px", fontSize:"16px"}}>剩余使用时间小于等于</div>
                        <ProFormDigit
                            name="year" 
                            min={0} 
                            initialValue={0} 
                            width={50}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            fieldProps={{ precision: 0 }}
                        />
                        <div style={{marginTop:"-20px", fontSize:"16px"}}>年</div>
                        <ProFormDigit
                            name="month" 
                            min={0} 
                            initialValue={0} 
                            width={50} 
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            fieldProps={{ precision: 0 }}
                        />
                        <div style={{marginTop:"-20px", fontSize:"16px"}}>月</div>
                        <ProFormDigit
                            name="date" 
                            min={0} 
                            initialValue={1} 
                            width={50}  
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            fieldProps={{ precision: 0 }}
                        />
                        <div style={{marginTop:"-20px", fontSize:"16px"}}>日时告警</div>
                    </Space>}
                </StepsForm.StepForm>
            </StepsForm>
        </>
    );
};
export default AssetWarnList;