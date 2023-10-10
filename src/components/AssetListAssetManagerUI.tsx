import React, { useRef } from "react";
import { Skeleton, theme, Space, Table, Button, Modal, Menu, Tooltip, Badge, Form, Select, Input, List, Divider, Checkbox, Col, Row, Breadcrumb } from "antd";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import { AssetData, AssetDetailInfo, AssetHistory, MemberData, LabelVisible, TestDetailInfo } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { ProTable, ProColumns, TableDropdown, ProCard, ProForm, ModalForm, ProFormTreeSelect, ActionType, ProList } from "@ant-design/pro-components";
import { DateTransform, renderStatus, renderStatusChanges, renderStatusBadge, renderKey } from "../utils/transformer";
import OSS from "ali-oss";
import { AssetDetailCard } from "./AssetDetailInfoUI";
import { table } from "console";
interface AssetListProps {
    ManagerName: string;
    setVisibleDetail: (visible: boolean) => void;
    setAssetName: (name: string) => void;
    VisibleDetail: boolean;
    refList: React.MutableRefObject<any>[];
    setTourOpen: (t: boolean) => void;
    TourOpen: boolean;
}
interface UrlData {
    pageSize: number;
    current?: number;
    Name?: string;
    ID?: number;
    Class?: string;
    Status?: number;
    Owner?: string;
    Prop?: string;
    PropValue?: string;
}
const { Option } = Select;

const layout = {
    labelCol: {
        // xs: {span:24},
        // sm: {sapn:7}
        flex: "100px",
    },
    wrapperCol: {
        xs: { span: 24 },
        // sm: {span:17}
        // span: "1"
    },
};

const tailLayout = {
    wrapperCol: { offset: 16, span: 8 },
};

const AssetList = (props: AssetListProps) => {
    const [IsSomeRowCanNotDispatch, setIsSomeRowCanNotDispatch] = useState<boolean>(false);  //是否可以调拨
    const [IsSomeRowCanNotReturn, setIsSomeRowCanNotReturn] = useState<boolean>(false);  //是否可以清退
    const [SelectedRows, setSelectedRows] = useState<AssetData[]>([]);
    const [Detail, setDetail] = useState<boolean>(false);
    const [DetailInfo, setDetailInfo] = useState<AssetDetailInfo>(TestDetailInfo);
    const [PropList, setPropList] = useState<string[]>([]);
    const tableRef = useRef<ActionType>(null);
    // 资产调拨的内容
    const [searchText, setSearchText] = useState(""); // 搜索框中的内容
    const [selectedEmployee, setSelectedEmployee] = useState<MemberData | null>(null); // 最后选中的员工
    const [Employee, setEmployee] = useState<MemberData[] | null>(null); // 获取转移时的员工列表
    const [selectedTransferAsset, setTransferAsset] = useState<AssetData>();
    const [treeData, setAsset] = useState<[]>(); // 储存要转移到的部门的资产列表树
    const [Open1, setOpen1] = useState(false); // 判断是否需要打开资产转移的第一步Modal
    const [Open2, setOpen2] = useState(false); // 判断是否需要打开资产转移的第二步Modal
    const [form] = Form.useForm<{ class: string; }>(); // 第二个Modal的格式
    const [loading, setLoading] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(false); //从资产列表跳到资产详细页面时的占位骨架
    const [Loading2, setLoading2] = useState(false);
    const columns: ProColumns<AssetData>[] = [
        {
            title: "资产编号",
            dataIndex: "ID",
            key: "ID",
        },
        {
            title: "资产名称",
            dataIndex: "Name",
            key: "Name",
            tip: "点击资产可查看详情信息",
            render: (_: any, record) => {
                return (
                    <div ref={props.refList[2]}>
                        <Tooltip title="点击查看详情">
                            <a style={{ marginInlineStart: 8, color: "#007AFF" }} onClick={() => {
                                if (!props.TourOpen) {
                                    props.setTourOpen(false);
                                    FetchDetail(record.ID);
                                    props.setVisibleDetail(true);
                                    props.setAssetName(record.Name);
                                    setShowSkeleton(true);
                                    setTimeout(() => {
                                        setShowSkeleton(false);
                                    }, 3000);
                                }
                            }}>{record.Name}</a>
                        </Tooltip>
                    </div >);
            },
        },
        {
            title: "类别",
            dataIndex: "Class",
            key: "Class",
        },
        {
            title: "状态",
            dataIndex: "Status",
            key: "Status",
            valueType: "select",
            valueEnum: {
                0: {
                    text: "闲置中",
                    status: "Success",
                },
                1: {
                    text: "使用中",
                    status: "Error",
                },
                2: {
                    text: "维保中",
                    status: "Warning",
                },
                3: {
                    text: "已清退",
                    status: "Processing",
                },
                4: {
                    text: "已删除",
                    status: "Default",
                    disabled: true,
                }
            },
        },
        {
            title: "所有者",
            dataIndex: "Owner",
            key: "Owner",
        },
        {
            title: "创建时间",
            dataIndex: "CreateTime",
            key: "CreateTime",
            search: false,
            render: (text: any, record) => {
                return DateTransform(text);
            },
        },
        {
            title: "操作",
            valueType: "option",
            key: "option",
            render: (text, record, _, action) => {
                const options = [
                    { key: "receive", name: "清退", disabled: record.Status == 3, onClick: () => {if(!props.TourOpen){hanleChange([record.ID], 0);}} },
                    { key: "return", name: "退维", disabled: record.Status != 2, onClick: () => {if(!props.TourOpen){hanleChange([record.ID], 1);}} },
                    { key: "maintenance", name: "调拨", disabled: record.Status != 0, onClick: () => { if(!props.TourOpen){setOpen1(true); setTransferAsset(record); GetMemberList(1, "");} } },
                ];
                const menuItems = options.map(option => (
                    <Menu.Item key={option.key} disabled={option.disabled} onClick={option.onClick}>
                        {option.name}
                    </Menu.Item>
                ));
                return (
                    <div ref={props.refList[3]}>
                        <TableDropdown
                            key="actionGroup"
                            onSelect={() => {action?.reload();}}
                            menus={options}
                        />
                    </div>
                );
            },
        }
    ];
    // 分页多选相关
    const [mySelectedRowKeys, handleMySelectedRowKeys] = useState<number[]>([]);  // 选中的项目
    const [mySelectedRows, handleMySelectedRows] = useState<AssetData[]>([]);
    // 由于cancleRowKeys不影响dom，所以不使用useState定义
    let cancleRowKeys: number[] = []; // 取消选择的项目
    const onSelect = (record: AssetData, selected: any) => {
        if (!selected) {
            cancleRowKeys = [record.ID];
        }
    };

    const onMulSelect = (selected: any, selectedRows: any, changeRows: any) => {
        if (!selected) {
            cancleRowKeys = changeRows.map((item: AssetData) => item.ID);
        }
    };

    const onChange = (selectedRowKeys: any, selectedRows: any) => {
        if (cancleRowKeys.length) {
            const keys = mySelectedRowKeys.filter((item) => !cancleRowKeys.includes(item));
            const Rows = mySelectedRows.filter((item:AssetData) => !cancleRowKeys.includes(item.ID));
            handleMySelectedRowKeys(keys);
            handleMySelectedRows(Rows);
            console.log(Rows);
            cancleRowKeys = [];
            let cannotd=0;
            let cannotr=0;
            for (const newrow of Rows) {
                if (newrow.Status!=0) {
                    setIsSomeRowCanNotDispatch(true);
                    cannotd=1;
                }
                if (newrow.Status==3) {
                    setIsSomeRowCanNotReturn(true);
                    cannotr=1;
                }
            }
            if(cannotd==0) setIsSomeRowCanNotDispatch(false);
            if(cannotr==0) setIsSomeRowCanNotReturn(false);
        } else {
            const mergedRowKeys = mySelectedRowKeys.concat(selectedRowKeys);
            const mergedRows = mySelectedRows.concat(selectedRows);
            const uniqueRowKeys: number[] = [];
            const uniqueRows: AssetData[] = [];
            for (const key of mergedRowKeys) {
                if (!uniqueRowKeys.includes(key)) {
                    uniqueRowKeys.push(key);
                }
            }
            for (const row of mergedRows) {
                if (!uniqueRows.includes(row)) {
                    uniqueRows.push(row);
                }
            }
            handleMySelectedRowKeys(uniqueRowKeys);
            handleMySelectedRows(uniqueRows);
            console.log(uniqueRows);
            let cannotd=0;
            let cannotr=0;
            for (const newrow of uniqueRows) {
                if (newrow.Status!=0) {
                    setIsSomeRowCanNotDispatch(true);
                    cannotd=1;
                }
                if (newrow.Status==3) {
                    setIsSomeRowCanNotReturn(true);
                    cannotr=1;
                }
            }
            if(cannotd==0) setIsSomeRowCanNotDispatch(false);
            if(cannotr==0) setIsSomeRowCanNotReturn(false);
        }
    };

    const router = useRouter();
    const query = router.query;
    const [PropForm] = Form.useForm();
    const FetchDetail = (AssetID: number) => {
        request(`/api/User/Asset_Detail/${LoadSessionID()}/${AssetID}`, "GET")
            .then(
                (res) => {
                    setDetailInfo(res.Asset_Detail);
                    console.log(res.Asset_Detail);
                    console.log(DetailInfo);
                    setDetail(true);

                }
            )
            .catch(
                (err: string) => {
                    setDetailInfo(TestDetailInfo);
                    setDetail(true);
                    if (IfCodeSessionWrong(err, router)) {
                        Modal.error({
                            title: "获取详情信息失败",
                            content: err.toString().substring(5),
                        });
                    }
                }
            );
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
    }, [router, query, DetailInfo]);
    const hanleChange = (AssetIDList: number[], operation: number, MoveTo: string = "", Type = "") => {
        setLoading(true);
        setLoading2(true);
        
        request(`/api/Asset/Manage/${LoadSessionID()}`, "POST",
            {
                "operation": operation,
                "AssetList": AssetIDList,
                "MoveTo": MoveTo,
                "Type": Type,
            }
        )
            .then(() => {
                handleMySelectedRowKeys([]);
                handleMySelectedRows([]);
                setLoading(false);
                setLoading2(false);
                setOpen2(false);
                Modal.success({
                    title: "操作成功",
                    content: "成功更改资产状态",
                });
                tableRef.current?.reload();
            })
            .catch(
                (err: string) => {
                    setLoading(false);
                    setLoading2(false);
                    if (IfCodeSessionWrong(err, router)) {
                        handleMySelectedRowKeys([]);
                        handleMySelectedRows([]);
                        Modal.error({
                            title: "申请失败",
                            content: err.toString().substring(5),
                        });
                    }
                }
            );
    };
    const themeConfig = {
        token: {
            colorPrimary: "red",
            borderRadius: 4,
            // TODO 可以验证下是否透明也行
            colorBgElevated: "white",
        },
        algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
    };
    const onPropChange = (value: string) => {
        PropForm.setFieldsValue({ Prop: value });
    };

    const onFinish = (values: any) => {
        console.log(values);

    };

    const onReset = () => {
        console.log(PropForm.getFieldValue("Prop"), PropForm.getFieldValue("PropValue"));
        PropForm.resetFields();
    };
    const PropSearch = () => {
        return (
            <Form
                {...layout}
                form={PropForm}
                name="control-hooks"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}

            >
                <ProForm.Group>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginLeft: "28px" }}>
                        <Form.Item name="Prop" label="自定义属性"
                        // rules={[{ required: true, message: "属性不能为空" }]}
                        >
                            <Select
                                placeholder="选择部门下资产的自定义属性"
                                onChange={onPropChange}
                                allowClear
                                style={{ width: "100px" }}
                            >
                                {PropList.map((item) => (
                                    <Option key={item} value={item}>
                                        {item}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="PropValue" label="属性值"
                        // rules={[{ required: true, message: "属性值不能为空" }]}
                        >
                            <Input placeholder="属性值" />
                        </Form.Item>
                        <Form.Item {...tailLayout}>
                            <Button htmlType="button" onClick={onReset}>
                                重置
                            </Button>
                        </Form.Item>
                    </div>
                </ProForm.Group>
            </Form>
        );
    };
    // 资产转移第一步modal的相关函数
    const [PageID, setPageID] = useState(1);
    const [TotalNum, setTotalNum] = useState(0);
    const GetMemberList = (PageID:number, Name: string) => {
        request(`/api/User/member/${LoadSessionID()}/${PageID}/Name=${Name}/Department=/Authority=2`, "GET")
            .then((res) => {
                setTotalNum(res.TotalNum);
                setEmployee(res.member);
            })
            .catch((err) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "无权获取用户列表",
                        content: "请重新登录",
                        onOk: () => { window.location.href = "/"; }
                    });
                }
            });
    };
    const handleSearch = (e: any) => {
        setSearchText(e.target.value);
        setPageID(1);
        GetMemberList(1, e.target.value);
    };
    const handleSelectEmployee = (employee: MemberData) => {
        setSelectedEmployee(employee);
    };
    const filteredData = Employee ? Employee : [];
    const handleOk1 = () => { // 资产转移第一步的ok键，获取部门的资产分类树，同时打开第二步的modal
        request(
            "/api/Asset/DepartmentTree",
            "POST",
            {
                SessionID: LoadSessionID(),
                UserName: selectedEmployee?.Name,
            }
        )
            .then((res) => {
                setAsset(res.treeData);
                console.log(res.treeData);
            })
            .catch((err) => {
                Modal.error({
                    title: "错误",
                    content: err.message.substring(5),
                });
            });
        setOpen1(false);
        setOpen2(true);
    };
    const pagination = {
        current: PageID,
        pageSize: 20,
        total: TotalNum,
        showSizeChanger: false,
        onChange: (page: number) => {
            setPageID(page);
            GetMemberList(page, searchText);
        },
    };
    return (
        <>
            {showSkeleton && <Skeleton active />}
            <div ref={props.refList[0]}>

                {!props.VisibleDetail && <Divider orientation="center" >自定义属性</Divider>}
                {!props.VisibleDetail && <PropSearch />}
            </div>
            <div ref={props.refList[1]}>
                {!props.VisibleDetail && <Divider orientation="center" >基本属性</Divider>}
            </div>
            {props.VisibleDetail && !showSkeleton && <AssetDetailCard setVisibleDetail={props.setVisibleDetail} DetailInfo={DetailInfo} />}

            {
                !props.VisibleDetail && <ProTable className="ant-pro-table"
                    columns={columns}
                    options={{ reload: true, setting: false }}
                    rowKey="ID"
                    rowSelection={{
                        selectedRowKeys: mySelectedRowKeys,
                        onSelect,
                        onSelectMultiple: onMulSelect,
                        onSelectAll: onMulSelect,
                        onChange,
                    }}
                    tableAlertRender={() => {
                        return (
                            <Space size={4}>
                                已选 {mySelectedRowKeys.length} 项
                                <a style={{ marginInlineStart: 8, color: "#007AFF" }} onClick={() => {
                                    handleMySelectedRowKeys([]);
                                    handleMySelectedRows([]);
                                }}>
                                    取消选择
                                </a>

                            </Space>
                        );
                    }}
                    tableAlertOptionRender={() => {
                        return (
                            <Space size={16} >
                                <Button type="primary" loading={loading} disabled={IsSomeRowCanNotReturn} onClick={() => {hanleChange(mySelectedRowKeys, 0);}}>清退资产</Button>
                                <Button type="primary" loading={loading} disabled={IsSomeRowCanNotDispatch} onClick={() => { setOpen1(true); GetMemberList(1, ""); }}>调拨资产</Button>
                            </Space>
                        );
                    }}
                    actionRef={tableRef}
                    request={async (params = {}) => {
                        const loadSessionID = LoadSessionID();
                        let urldata: UrlData = { pageSize: 20, current: params.current, Name: "", ID: -1, Status: -1, Class: "", Owner: "", Prop: "", PropValue: "" };
                        if (params.Name != undefined) urldata.Name = params.Name;
                        if (params.ID != undefined) urldata.ID = params.ID;
                        if (params.Status != undefined) urldata.Status = params.Status;
                        if (params.Class != undefined) urldata.Class = params.Class;
                        if (params.Owner != undefined) urldata.Owner = params.Owner;
                        if (PropForm.getFieldValue("Prop")) {
                            urldata.Prop = PropForm.getFieldValue("Prop");
                            if (PropForm.getFieldValue("PropValue")) {
                                urldata.PropValue = PropForm.getFieldValue("PropValue");
                            }
                        }
                        let url = `/api/Asset/Info/${loadSessionID}/${urldata.current}/ID=${urldata.ID}/Name=${urldata.Name}/Class=${urldata.Class}/Status=${urldata.Status}/Owner=${urldata.Owner}/Prop=${urldata.Prop}/PropValue=${urldata.PropValue}`;
                        console.log(url);
                        return (
                            request(
                                url,
                                "GET"
                            )
                                .then((res) => {
                                    setPropList(res.DepartmentProp);
                                    return Promise.resolve({ data: res.Asset, success: true, total: res.TotalNum });
                                })
                        );
                    }
                    }
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
                    pagination={{
                        showSizeChanger: false
                    }}
                    search={{
                        defaultCollapsed: false,
                        defaultColsNumber: 1,
                        split: true,
                        span: 8,
                        searchText: "查询",
                    }}
                    toolBarRender={false}
                />
            }

            {
                !props.VisibleDetail && <Modal
                    title="请选择要调拨到的管理员"
                    bodyStyle={{ padding: "20px" }}
                    visible={Open1}
                    onCancel={() => setOpen1(false)}
                    onOk={handleOk1}
                    okButtonProps={{ disabled: !selectedEmployee }}
                    okText="下一步"
                    style={{marginTop:"-100px"}}
                >
                    <Input placeholder="搜索管理员名称" value={searchText} onChange={handleSearch} />
                    <ProList
                        dataSource={Employee ? Employee : []}
                        renderItem={item => (
                            <List.Item
                                onClick={() => handleSelectEmployee(item)}
                                className={`employee-item ${selectedEmployee && selectedEmployee.Name === item.Name ? "selected" : ""}`}
                            >
                                <div className="employee-name">{item.Name}</div>
                                <div className="department">{item.Department}</div>
                            </List.Item>
                        )}
                        pagination={pagination}
                        scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
                    />
                </Modal>
            }
            {
                !props.VisibleDetail && <ModalForm<{
                    class: string;
                }>
                    title="请选择资产分类"
                    form={form}
                    autoFocusFirstInput
                    modalProps={{
                        destroyOnClose: true,
                        onCancel: () => { setOpen2(false); setOpen1(true); },
                    }}
                    loading={Loading2}
                    submitTimeout={1000}
                    open={Open2}
                    onFinish={async (values) => {
                        if (mySelectedRowKeys.length > 0) hanleChange(mySelectedRowKeys, 2, selectedEmployee?.Name, values.class);
                        else hanleChange([selectedTransferAsset ? selectedTransferAsset.ID : 0], 2, selectedEmployee?.Name, values.class);
                        
                        return true;
                    }}
                >
                    <ProForm.Group>
                        <ProFormTreeSelect
                            label="资产分类"
                            name="class"
                            width="lg"
                            rules={[{ required: true, message: "这是必选项" }]}
                            fieldProps={{
                                fieldNames: {
                                    label: "title",
                                },
                                treeData,
                                placeholder: "请选择资产分类",
                            }}
                        />
                    </ProForm.Group>

                </ModalForm>
            }
        </>
    );
};
export default AssetList;