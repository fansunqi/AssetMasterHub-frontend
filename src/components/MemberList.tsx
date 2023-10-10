import React, { useRef } from "react";
import {
    FileOutlined, PlusSquareOutlined, UpOutlined, DownOutlined
} from "@ant-design/icons";
import { Drawer, Form, Input, MenuProps, Tooltip } from "antd";
import { Breadcrumb, Layout, Menu, theme, Space, Table, Tag, Switch, Modal, Button, Radio } from "antd";
import type { RadioChangeEvent } from "antd";
const { Column } = Table;
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import MenuItem from "antd/es/menu/MenuItem";
import { renderAuthority } from "../utils/transformer";
import type { ColumnsType } from "antd/es/table";
import { DataType, MemberData } from "../utils/types";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { EditOutlined } from "@ant-design/icons";

interface MemberListProps {
    Members: MemberData[] | undefined;
    department_page: boolean;
    department_path: string;
    refList?: React.MutableRefObject<any>[]; // Make the parameter optional
    setTourOpen?: (t: boolean) => void;
    TourOpen?: boolean;
}
interface UrlData {
    Name?:string;
    Department?: string;
    Authority?: number;
    pageSize:number;
    current?: number;
}
const MemberList = (props: MemberListProps) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [ChangeAuthorityValue, setChangeAuthorityValue] = useState(2);
    const [isRemakeModalOpen, setIsRemakeModalOpen] = useState(false);
    const [NowUser, setNowUser] = useState("");
    const [NowAuthority, setNowAuthority] = useState(0);
    const [LockLoading, setLockLoading] = useState(false);
    const [data, setData] = useState<DataType[] | undefined>(); // 存储加载该系统管理员管理的资产管理员和员工的信息
    const [IsRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [Loading, setLoading] = useState(false);
    const router = useRouter();
    const query = router.query;
    const tableRef = useRef<ActionType>(null);
    const defaultRefList = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const resolvedRefList = props.refList || defaultRefList;
    const FetchMemberList = () => {
        if(props.department_page) {
            request(
                `/api/User/department/${LoadSessionID()}/${props.department_path}`,
                "GET"
            )
                .then((res) => {
                    const now_data: DataType[] = [];
                    for (let i = 0; i < res.member.length; i++) {
                        now_data.push({
                            key: i,
                            Name: res.member[i].Name,
                            Department: res.member[i].Department,
                            Authority: res.member[i].Authority,
                            lock: res.member[i].lock
                        });
                    }
                    setData(now_data);
                })
                .catch((err) => {
                    console.log(err.message);
                    Modal.error({
                        title: "无权获取对应用户信息",
                        content: "请重新登录",
                        onOk: () => { window.location.href = "/"; }
                    });
                });
        }
    };
    const showRemakeModal = (UserName: string, Authority: number) => {
        setNowUser(UserName);
        setNowAuthority(Authority);
        setIsRemakeModalOpen(true);
    };

    const handleRemakeOk = () => {
        setIsRemakeModalOpen(false);
    };

    const handleRemakeCancel = () => {
        setIsRemakeModalOpen(false);
    };
    const handleRemoveOk = () => {
        setIsRemoveModalOpen(false);
    };

    const handleRemoveCancel = () => {
        setIsRemoveModalOpen(false);
    };
    const showRemoveModal = (UserName: string, Authority: number) => {
        console.log("UserName",UserName);
        setNowUser(UserName);
        console.log("NowUser",NowUser);
        setIsRemoveModalOpen(true);
        setNowAuthority(Authority);
    };
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log("selectedRowKeys changed: ", newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const onChange3 = ({ target: { value } }: RadioChangeEvent) => {
        console.log("target value checked", value);
        setChangeAuthorityValue(value);
        console.log("ChangeAuthorityValue: ", ChangeAuthorityValue);
        return value;
    };
    const hasSelected = selectedRowKeys.length > 0;
    const RemakePassword = (username: string) => {
        // 重置密码操作，将用户输入的旧密码重新生成到<一个固定值>
        request(
            "/api/User/RemakePassword",
            "POST",
            {
                SessionID: LoadSessionID(),
                UserName: username,
            }
        )
            .then(() => {
                Modal.success({
                    title: "成功",
                    content: "密码已重置为yiqunchusheng",
                });
                handleRemakeOk();
            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "重置失败",
                        content: err.toString().substring(5),
                    });
                }
            });
    };
    const ChangeAuthority = (username: string, Authority: number) => {
        let ans = Authority == 2 ? 3 : 2;
        request(
            "/api/User/ChangeAuthority",
            "PUT",
            {
                SessionID: LoadSessionID(),
                UserName: username,
                Authority: ans,
            }
        )
            .then(() => {
                Modal.success({
                    title: "成功",
                    content: `身份已设为${renderAuthority(ans)}`,
                });
                tableRef.current?.reload();
            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "设置失败",
                        content: err.toString().substring(5),
                    });
                }
            });
    };
    const ChangeLock = (username: string) => {
        setLockLoading(true);
        request(
            "/api/User/lock",
            "PUT",
            {
                SessionID: LoadSessionID(),
                UserName: username,
            }
        )
            .then(() => {
                setLockLoading(false);
                tableRef.current?.reload();

            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "解锁/锁定失败",
                        content: err.toString().substring(5),
                    });
                    setLockLoading(false);
                }
            });
    };
    const RemoveUser = (UserName: string, Authority: number) => {
        request(
            `/api/User/remove/${LoadSessionID()}/${UserName}`,
            "DELETE"
        )
            .then((res) => {
                let answer: string = `成功删除${renderAuthority(Authority)} ${UserName}`;
                Modal.success({ title: "删除成功", content: answer });
                handleRemoveOk();
                tableRef.current?.reload();
            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "删除失败",
                        content: err.toString().substring(5),
                    });
                }
            });
        
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        // FetchMemberList();
        console.log("ChangeAuthorityValue has been updated:", ChangeAuthorityValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query, ChangeAuthorityValue, props]);
    const columns: ProColumns<MemberData>[] = [
        {
            title:"姓名",
            dataIndex:"Name",
            key:"Name",
            width:"200px"
        },
        {
            title:"所属部门",
            dataIndex:"Department",
            key:"Department",
            search: props.department_page?false:undefined,
            width:"150px"
        },
        {
            title:"身份",
            dataIndex:"Authority",
            key:"Authority",
            valueType: "select",
            width:"100px",
            valueEnum: {
                2: {
                    text: "资产管理员",
                    color: "blue"
                },
                3: {
                    text: "员工",
                    color: "yellow"
                },
            },
        },
        {
            title:"管理",
            key:"action",
            search:false,
            width:"300px",
            render:(text, record, _, action) => (
                <Space size="middle">
                    <Switch ref={resolvedRefList[0]} checkedChildren="解锁" unCheckedChildren="锁定" onChange={() => { if(!props.TourOpen){ChangeLock(record.Name);} }} checked={!record.lock} loading={LockLoading} />
                    <Button ref={resolvedRefList[1]} danger onClick={() => {if(!props.TourOpen) {showRemakeModal(record.Name, record.Authority);} }}>重置密码</Button>
                    
                    <Button ref={resolvedRefList[2]} danger onClick={() => {if(!props.TourOpen){showRemoveModal(record.Name, record.Authority); }}}>删除员工</Button>
                    <div ref={resolvedRefList[3]}>
                        {record.Authority == 3 && <Button type="text" onClick={() => { if(!props.TourOpen){ChangeAuthority(record.Name, record.Authority);} }} icon={<UpOutlined />}>提拔为资产管理员</Button>}
                        {record.Authority == 2 && <Button type="text" danger onClick={() => { if(!props.TourOpen){ChangeAuthority(record.Name, record.Authority);} }} icon={<DownOutlined />}>降为普通员工</Button>}
                    </div>
                </Space>
            )
        }
    ];
    const [open2, setOpen2] = useState(false);    //创建员工侧边栏的显示
    const [UserName, setUserName] = useState("");// 储存新建用户的名称
    const showDrawer2 = () => {
        setOpen2(true);
    };
    // 在特定部门下创建新员工
    const CreateNewUser = (DepartmentPath: string, UserName: string) => {
        setLoading(true);
        request(
            "/api/User/add",
            "POST",
            {
                "SessionID": LoadSessionID(),
                "UserName": UserName,
                "Department": DepartmentPath
            }
        )
            .then((res) => {
                setOpen2(false);
                let answer: string = `成功创建员工 ${UserName}`;
                Modal.success({ title: "创建成功", content: answer });
                onClose2();
                tableRef.current?.reload();
                setLoading(false);
            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {
                    setOpen2(false);
                    Modal.error({
                        title: "创建失败",
                        content: err.toString().substring(5),
                    });
                    setLoading(false);
                }
            });
        
    };
    const onClose2 = () => {
        setOpen2(false);
    };
    const handleUserAdd = (e: any) => {
        setUserName(e.target.value);
    };
    return (
        <div>
            {props.department_page && <Button
                type="primary"
                icon={<PlusSquareOutlined />}
                style={{ float: "left", marginLeft: "30px", marginTop:"-24px" }}
                onClick={showDrawer2}
            >
                新增员工
            </Button>}
            <Drawer title="创建新员工" placement="right" onClose={onClose2} open={open2}>
                <Form
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    autoComplete="off"
                >
                    <Form.Item
                        label="用户名"
                        name = "UserName"
                        rules={[{ required: true, message: "请输入员工用户名" }]}
                    >
                        <Input onChange={handleUserAdd} />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit" loading = {Loading} onClick={() => {if(UserName) CreateNewUser(props.department_path, UserName);}}>
                            确认提交
                        </Button>
                    </Form.Item>
                </Form>
            </Drawer>
            <ProTable className="ant-pro-table"
                columns={columns}
                options={{ reload: true, setting: false }}
                rowKey="ID"
                actionRef={tableRef}
                request={async (params = {}) => {
                    const loadSessionID = LoadSessionID();
                    let urldata:UrlData={pageSize:20, current:params.current, Name:"", Department:"", Authority:-1};
                    if(params.Name != undefined) urldata.Name=params.Name;
                    if(params.Department != undefined) urldata.Department=params.Department;
                    if(params.Authority != undefined) urldata.Authority=params.Authority;
                    let url = `/api/User/member/${loadSessionID}/${urldata.current}/Name=${urldata.Name}/Department=${urldata.Department}/Authority=${urldata.Authority}`;
                    if (props.department_page) url = `/api/User/department/${loadSessionID}/${props.department_path}/${urldata.current}/Name=${urldata.Name}/Authority=${urldata.Authority}`;
                    console.log(url);
                    return (
                        request(
                            url,
                            "GET"
                        )
                            .then((res) => {
                                return Promise.resolve({ data: res.member, success: true , total:res.TotalNum});
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
            <Modal title="重置密码" open={isRemakeModalOpen} onOk={() => { RemakePassword(NowUser); }} onCancel={handleRemakeCancel}>
                将 {NowUser} 密码重置为 yiqunchusheng
            </Modal>
            <Modal title="删除员工" open={IsRemoveModalOpen} onOk={() => {console.log("NowUserWhileRemove",NowUser);RemoveUser(NowUser, NowAuthority); }} onCancel={handleRemoveCancel} >
                请确认删除 {renderAuthority(NowAuthority)} {NowUser}
            </Modal>
        </div>
    );
};
export default MemberList;