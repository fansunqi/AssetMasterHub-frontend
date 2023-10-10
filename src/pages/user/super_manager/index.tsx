import React, { useRef } from "react";
import {
    FileOutlined, PlusSquareOutlined, LogoutOutlined, QuestionCircleOutlined, DownOutlined, SmileOutlined
} from "@ant-design/icons";
import type { MenuProps, TourProps } from "antd";
import { Layout, List, theme, Space, Table, Modal, Button, Input, Form, Drawer, message, Tag, Tour, Tooltip } from "antd";
const { Column } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../utils/network";
import { LoadSessionID, logout, IfCodeSessionWrong } from "../../../utils/CookieOperation";
import UserInfo from "../../../components/UserInfoUI";
import SiderMenu from "../../../components/SiderUI";
import { NewLark } from "@icon-park/react";
import { ProList } from "@ant-design/pro-components";

type MenuItem = Required<MenuProps>["items"][number];
type SystemData = {
    Entity: string;
    Manager: string;
    ID: string;
};
interface Option {
    value: string;
    label: string;
    children?: Option[];
}

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}
const items_: MenuItem[] = [
    getItem("管理列表", "1", <FileOutlined />),
];


const App = () => {
    const [collapsed, setCollapsed] = useState(false);  //左侧边栏是否可以收起
    const [state, setState] = useState(false);  //路径保护变量
    const [open, setOpen] = useState(false);    //右侧注册新实体边栏是否开启
    const [EntityValue, setEntityValue] = useState(""); //注册新实体名
    const [UserValue, setUserValue] = useState(""); //注册新系统管理员名
    const [System, setSystem] = useState<SystemData[]>(); // 存储所有系统管理员和其对应业务实体的信息
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserApp, setUserApp] = useState<string>(""); // 用户显示的卡片，01串
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [ChooseFeishuModel, setChooseFeishuModel] = useState<string>(""); //选择的默认同步的飞书
    const [ShowFeishu, setShowFeishu] = useState<boolean>(false);    //是否展示默认同步飞书modal
    const router = useRouter();
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const [ChooseLeafDepartment, setChooseLeafDepartment] = useState("");
    const [DepartmentsData, setDepartmentsData] = useState();
    const [FeishuDepartmentID, setFeishuDepartmentID] = useState<string>("");
    const [FeishuDepartmentName, setFeishuDepartmentName] = useState<string>("");
    const [IsChangeDepartments, setIsChangeDepartments] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();   //更新默认飞书部门后的文字提示
    const [NowFeishuDepartment, setNowFeishuDepartment] = useState({ Name: "", ID: "" });
    const [ShowSynchronousFeishu, setShowSynchronousFeishu] = useState(false); //是否显示飞书同步modal
    const [FeishuSynchronousLoading, setFeishuSynchronousLoading] = useState(false); //是否显示同步飞书用户的loading
    const [FeishuChangeDepartmentsLoading, setFeishuChangeDepartmentsLoading] = useState(false); //是否显示修改默认同步飞书部门的loading
    const [UserID, setUserID] = useState(0);
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const ref5 = useRef(null);
    const [TourOpen, setTourOpen] = useState(false);
    const steps: TourProps["steps"] = [
        {
            title: "添加业务实体",
            description: "点击按钮添加业务实体及系统管理员",
            target: () => ref1.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "飞书同步",
            description: "点击按钮以同步所有飞书用户至指定部门",
            target: () => ref2.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "业务实体列表",
            description: "查看所有业务实体及对应的系统管理员,点击移除按钮可以删除对应实体及管理员,点击设置同步部门可以修改飞书同步的部门",
            target: () => ref3.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "移除业务实体",
            description: "删除业务实体及对应管理员",
            target: () => ref4.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "业务实体列表",
            description: "设置飞书同步部门,用于飞书同步",
            target: () => ref5.current,
            nextButtonProps:{children:"结束导览"},
            prevButtonProps:{children:"上一步"},
        },
    ];
    const items: MenuProps["items"] = [
        {
            key: "2",
            label: (
                <Button
                    type="link"
                    icon={<LogoutOutlined />}
                    style={{ float: "right", margin: 10 }}
                    danger
                    onClick={() => { logoutSendMessage(); logout(); }}
                >
                    退出登录
                </Button>
            ),
            // icon: <SmileOutlined />,
            // disabled: true,
        },
    ];
    const logoutSendMessage = () => {
        request(
            "/api/User/logout",
            "POST",
            { SessionID: LoadSessionID(), }
        )
            .then(() => { router.push("/"); })
            .catch((err) => { router.push("/"); });
    };
    const handleEntityInputChange = (e: any) => {
        setEntityValue(e.target.value);
    };
    const handleUserInputChange = (e: any) => {
        setUserValue(e.target.value);
    };
    const handleFeishuChange = () => {
        console.log(ChooseLeafDepartment);
        request("/api/User/FeishuDepartment", "POST", {
            DepartmentID: ChooseLeafDepartment,
            SessionID: LoadSessionID(),
        }).then((res) => {
            setShowFeishu(false);
        });
    };
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };
    const onFinish = (values: any) => {
        console.log("Success:", values);
    };

    // 向后端发送创建用户和实体的请求，如果创建成功提示成功并关闭抽屉，否则向用户提示错误信息
    const CreateNew = (UserName: string, EntityName: string) => {
        request(
            "/api/SuperUser/Create",
            "PUT",
            {
                "SessionID": LoadSessionID(),
                "UserName": UserName,
                "EntityName": EntityName
            }
        )
            .then((res) => {
                let answer: string = `成功创建业务实体 ${EntityName} 并委派系统管理员 ${UserName}, 初始密码为 yiqunchusheng`;
                Modal.success({ title: "创建成功", content: answer, afterClose: () => { window.location.reload(); } });
                onClose();
            })
            .catch((err: any) => {
                console.log(err.type);
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "创建失败",
                        content: err.message.toString().substring(5),
                    });
                }
            });

    };
    //像后端发送删除用户和实体的请求，如果删除成功提示成功并关闭抽屉，否则向用户提示错误信息        const Delete = (UserName:string,
    const Remove = (UserName: string, EntityName: string) => {
        request(
            `/api/SuperUser/Delete/${LoadSessionID()}/${EntityName}`,
            "DELETE"
        )
            .then((res) => {
                let answer: string = `成功注销业务实体 ${EntityName} 及系统管理员 ${UserName}`;
                Modal.success({ title: "注销成功", content: answer, afterClose: () => { window.location.reload(); } });
            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {

                    Modal.error({
                        title: "注销失败",
                        content: err.toString().substring(5),
                    });
                }
            });
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log("Failed:", errorInfo);
    };

    const handleShowDepartments = (ID: string) => {
        request(`/api/User/LeafDepartment/${LoadSessionID()}/${ID}`, "GET")
            .then((res) => {
                console.log("res.Departments", res.Departments);
                setDepartmentsData(res.Departments);
            });
    };
    const handleChangeFeishuDepartment = () => {
        setFeishuChangeDepartmentsLoading(true);
        request("/api/User/FeishuDepartment", "POST", {
            DepartmentID: FeishuDepartmentID,
            SessionID: LoadSessionID(),
        }).then(() => {
            setShowFeishu(false);
            setIsChangeDepartments(false);
            setFeishuChangeDepartmentsLoading(false);
            success(`成功修改飞书同步部门为 ${FeishuDepartmentName}`);  //提示修改成功
            setNowFeishuDepartment({ Name: FeishuDepartmentName, ID: FeishuDepartmentID });
            console.log("FeishuDepartmentName", FeishuDepartmentName);
        }).catch((err) => {
            setShowFeishu(false);
            setIsChangeDepartments(false);
            setFeishuChangeDepartmentsLoading(false);
            error("修改失败失败\n" + err.toString().substring(5));
        });
    };
    const success = (message: string = "") => {
        messageApi.open({
            type: "success",
            content: message,
        });
    };
    const error = (message: string = "") => {
        messageApi.open({
            type: "error",
            content: message,
        });
    };
    const handleSynchronous = () => {
        setFeishuSynchronousLoading(true);
        request("/api/User/feishu_sync", "POST", {
            SessionID: LoadSessionID()
        })
            .then(() => {
                setShowSynchronousFeishu(false);
                setFeishuSynchronousLoading(false);
                success(`成功同步员工至 ${NowFeishuDepartment.Name}`);
            })
            .catch((err) => {
                setShowSynchronousFeishu(false);
                setFeishuSynchronousLoading(false);
                error("同步失败\n" + err.toString().substring(5));
            });
    };
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
                if (res.Authority != 0) {
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
        if (state) {

            request(
                `/api/SuperUser/info/${LoadSessionID()}`,
                "GET"
            )
                .then((res) => {
                    setState(true);
                    setSystem(res.entity_manager);
                    setNowFeishuDepartment(res.FeishuDepartment);
                })
                .catch((err) => {
                    console.log(err.message);
                    setState(false);
                    if (IfCodeSessionWrong(err, router)) {
                        Modal.error({
                            title: "无权获取系统管理员及实体信息",
                            content: "请重新登录",
                            onOk: () => { window.location.href = "/"; }
                        });
                    }
                });
        }
    }, [state, router]);
    const Feishuitems: MenuProps["items"] = [
        { label: "1", key: "sds" },
        { label: "2", key: "ads" }
    ];
    const menuProps = {
        Feishuitems,
        onClick: () => { }
    };
    if (state) {
        return (
            <Layout style={{ minHeight: "100vh" }}>
                {contextHolder}
                <Sider className="sidebar" width="13%">
                    <SiderMenu UserAuthority={UserAuthority} />
                </Sider>
                <Layout className="site-layout" >
                    <Header className="ant-layout-header">
                        <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD} Profile={true} ID={UserID}></UserInfo>
                        <Button style={{  margin: 30}} className="header_button" onClick={() => { setTourOpen(true); }} icon={<QuestionCircleOutlined />}>
                            使用帮助
                        </Button>
                    </Header>
                    <Content>
                        {/* <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}> */}
                        <Button
                            type="primary"
                            icon={<PlusSquareOutlined />}
                            style={{ float: "left", margin: 30 }}
                            onClick={()=>{if(!TourOpen){showDrawer();}}}
                            ref={ref1}
                        >
                            添加业务实体
                        </Button>
                        <Tooltip placement="top" title={"同步飞书员工"}>
                            <Button type="text" ref={ref2}
                                icon={<NewLark theme="filled" size="25" fill="#4a90e2" strokeLinejoin="bevel" />}
                                style={{ float: "right", margin: 30 }}
                                onClick={() => {if(!TourOpen){setShowSynchronousFeishu(true);}}}
                            >
                            </Button>
                        </Tooltip>
                        <Modal
                            title="同步飞书员工"
                            open={ShowSynchronousFeishu}
                            onCancel={() => setShowSynchronousFeishu(false)}
                            // onOk={handleSynchronous}
                            footer={
                                <Button type="primary" onClick={handleSynchronous} loading={FeishuSynchronousLoading}>
                                    确认
                                </Button>
                            }
                        >
                            <div style={{ marginTop: "15px" }}>

                                当前飞书同步部门: <b >{` ${NowFeishuDepartment.Name} `}</b> ,
                                点击确认以同步
                            </div>
                        </Modal>
                        
                        {/* 当前飞书同步部门: {NowFeishuDepartment.Name} */}
                        {/* <h1>{NowFeishuDepartment.Name}</h1> */}

                        {/* <Dropdown.Button
                            menu={menuProps}
                            placement="bottom"
                            icon={<NewLark theme="filled" size="20" fill="#4a90e2" strokeLinejoin="bevel" key="sdsaaa"/>}
                            key="helloword"
                        >
                            <div>
                                飞书同步
                            </div>
                        </Dropdown.Button> */}
                        {/* </div> */}
                        <Drawer title="添加业务实体" placement="right" onClose={onClose} open={open}>
                            <Form
                                name="basic"
                                labelCol={{ span: 8 }}
                                wrapperCol={{ span: 16 }}
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete="off"

                            >
                                <Form.Item
                                    label="业务实体名"
                                    name="Entity"
                                    rules={[{ required: true, message: "请输入业务实体名" }]}
                                >
                                    <Input onChange={handleEntityInputChange} />
                                </Form.Item>

                                <Form.Item
                                    label="系统管理员"
                                    name="Manager"
                                    rules={[{ required: true, message: "请输入资产管理员用户名" }]}
                                >
                                    <Input onChange={handleUserInputChange} />
                                </Form.Item>

                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="primary" htmlType="submit" onClick={() => { if (UserValue && EntityValue) { CreateNew(UserValue, EntityValue); } }}>
                                        确认提交
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Drawer>
                        <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>

                            <Table dataSource={System} ref={ref3}>
                                <Column title="业务实体" dataIndex="Entity" key="Entity" />
                                <Column title="系统管理员" dataIndex="Manager" key="Manager" />
                                <Column
                                    title="管理"
                                    key="action"
                                    render={(_: any, record: SystemData) => (
                                        <Space size="middle">
                                            <Button danger onClick={() => {if(!TourOpen){Remove(record.Manager, record.Entity);}}} ref={ref4}>
                                                移除
                                            </Button>
                                            <Button type="default"
                                                onClick={() => { if(!TourOpen){handleShowDepartments(record.ID); setShowFeishu(true);} }} 
                                                ref={ref5}> 
                                                设置飞书同步部门
                                            </Button>
                                        </Space>
                                    )}
                                />
                            </Table>

                            <div style={{ height: "100px" }}>
                                <Modal
                                    title="设置飞书同步部门"
                                    open={ShowFeishu}
                                    // onOk={() => { IsChangeDepartments ? handleChangeFeishuDepartment() : setShowFeishu(false); }}
                                    onCancel={() => { setShowFeishu(false); }}
                                    footer={
                                        <Button
                                            type="primary"
                                            onClick={() => { IsChangeDepartments ? handleChangeFeishuDepartment() : setShowFeishu(false); }}
                                            loading={FeishuChangeDepartmentsLoading}
                                        >
                                        确认提交
                                        </Button>
                                    }
                                >
                                    <ProList
                                        dataSource={DepartmentsData}
                                        renderItem={(item: { ID: string[], Name: string }) => (
                                            <List.Item
                                                onClick={() => { setFeishuDepartmentID(item.ID[0]); setFeishuDepartmentName(item.Name); setIsChangeDepartments(true); }}
                                                className={`employee-item ${FeishuDepartmentID && FeishuDepartmentID === item.ID[0] ? "selected" : ""}`}
                                            >
                                                <div className="employee-name">{item.Name}</div>
                                            </List.Item>
                                        )}
                                        pagination={{
                                            pageSize: 20,
                                            showSizeChanger: false
                                        }}
                                        scroll={{ x: "max-content", y: "100%" }}
                                    />
                                </Modal>
                            </div>
                        </div>
                        <Tour open={TourOpen} onClose={() => setTourOpen(false)} steps={steps} />

                    </Content>
                </Layout>
            </Layout >
        );
    };
};

export default App;