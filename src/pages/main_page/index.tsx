import React from "react";
import { Layout, Menu, Dropdown, Button, Divider, Space, Modal, MenuProps, Descriptions, Form, Input, Collapse } from "antd";
import { UserOutlined, BellOutlined, DownOutlined, PoweroffOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { logout, LoadSessionID, IfCodeSessionWrong, CreateCookie } from "../../utils/CookieOperation";
import { useRouter } from "next/router";
import { request } from "../../utils/network";
import { useState, useEffect } from "react";
import CardUI from "../../components/CardUI";
import { AppData, NewAppData } from "../../utils/types";
import { renderAuthority } from "../../utils/transformer";
import SiderMenu from "../../components/SiderUI";
import UserInfo from "../../components/UserInfoUI";
import cookie from "react-cookies";
const { Header, Content, Footer, Sider } = Layout;
const { Panel } = Collapse;
import {
    ProFormRadio,
    ProFormSwitch,
    ProList,
} from "@ant-design/pro-components";
import { Image } from "antd-mobile";
import OSS from "ali-oss";
import UserSetting from "../../components/UserSettingUI";
import { ItemChildrenWrap } from "antd-mobile/es/components/dropdown/item";

const App = () => {
    const logoutSendMessage = () => {
        request(
            "/api/User/logout",
            "POST",
            { SessionID: LoadSessionID(), }
        )
            .then(() => { router.push("/"); })
            .catch((err) => { router.push("/"); });
    };
    const router = useRouter();
    const query = router.query;
    const [AppList, setAppList] = useState<AppData[]>(); // 储存所有已有应用的信息 
    const [NewAppList, setNewAppList] = useState<NewAppData[]>();
    const [state, setState] = useState(false); // 用户是否处在登录状态
    const [UserAuthority, setUserAuthority] = useState(0); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const rolelist = ["超级管理员", "系统管理员", "资产管理员", "员工"];
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const [ghost, setGhost] = useState<boolean>(false);
    const [UserPhone, setUserPhone] = useState("暂未绑定");
    const [ProfileUrl, setProfileUrl] = useState("");
    const [File, setFile] = useState<File>(); // 使用useState来管理files数组
    const [ProfileChangeOpen, setProfileChangeOpen] = useState<boolean>(false);  //更新头像的modal是否打开
    const [Profileprop, setProfileprop]=useState(false);
    const [UserID, setUserID] = useState(0);
    const [FeishuLogin,setFeishuLogin] = useState(false);
    const GetApp = (Authority: number) => {
        request(
            `/api/User/App/${LoadSessionID()}/${Authority}`,
            "GET"
        )
            .then((res) => {
                setAppList(res.AppList);
            })
            .catch((err) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "获取应用信息失败",
                        content: err.toString().substring(5),
                    });
                }
            });
        request(
            `/api/User/NewApp/${LoadSessionID()}/${Authority}`,
            "GET"
        )
            .then((res) => {
                setNewAppList(res.AppList);
            })
            .catch((err) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "获取应用信息失败",
                        content: err.toString().substring(5),
                    });
                }
            });

    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        if(!FeishuLogin){
            setFeishuLogin(true);
            if (query.hasOwnProperty("code")) { //飞书登录
                request("/api/User/feishu_login", "POST", {
                    "code": query.code,
                    "SessionID": LoadSessionID()
                })
                    .then((res) => {
                        request(
                            `/api/User/info/${LoadSessionID()}`,
                            "GET"
                        )
                            .then((res) => {
                                setState(true);
                                setUserName(res.UserName);
                                setUserAuthority(res.Authority);
                                if (res.Authority == 2 || res.Authority == 3) GetApp(res.Authority);
                                else if (res.Authority == 0) {
                                    let userapp: AppData[] = [{ IsInternal: true, IsLock: false, AppName: "业务实体管理", AppUrl: "/user/super_manager" },
                                        { IsInternal: true, IsLock: false, AppName: "系统管理员列表", AppUrl: "/user/super_manager" }];
                                    setAppList(userapp);
                                }
                                else if (res.Authority == 1) {
                                    let userapp: AppData[] = [{ IsInternal: true, IsLock: false, AppName: "用户列表", AppUrl: "/user/system_manager" },
                                        { IsInternal: true, IsLock: false, AppName: "角色管理", AppUrl: "/user/system_manager" },
                                        { IsInternal: true, IsLock: false, AppName: "部门管理", AppUrl: "/user/system_manager/department" },
                                        { IsInternal: true, IsLock: false, AppName: "应用管理", AppUrl: "/user/system_manager/application" },
                                        { IsInternal: true, IsLock: false, AppName: "操作日志", AppUrl: "/user/system_manager/log" }];
                                    setAppList(userapp);
                                }
                                setEntity(res.Entity);
                                setDepartment(res.Department);
                                setTODO(res.TODO);
                                setTOREAD(res.TOREAD);
                                setUserPhone(res.Mobile);
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
                    })
                    .catch((err) => {
                        setState(false);
                        cookie.remove("SessionID");
                        Modal.error({
                            title: "登录失败",
                            content: "请重新登录",
                            onOk: () => { window.location.href = "/"; }
                        });
                    });
            }
            else {   //正常登录，获取用户名和密码
                request(
                    `/api/User/info/${LoadSessionID()}`,
                    "GET"
                )
                    .then((res) => {
                        setState(true);
                        setUserName(res.UserName);
                        setUserAuthority(res.Authority);
                        if (res.Authority == 2 || res.Authority == 3) GetApp(res.Authority);
                        else if (res.Authority == 0) {
                            let userapp: AppData[] = [{ IsInternal: true, IsLock: false, AppName: "业务实体管理", AppUrl: "/user/super_manager" },
                                { IsInternal: true, IsLock: false, AppName: "系统管理员列表", AppUrl: "/user/super_manager" }];
                            setAppList(userapp);
                        }
                        else if (res.Authority == 1) {
                            let userapp: AppData[] = [{ IsInternal: true, IsLock: false, AppName: "用户列表", AppUrl: "/user/system_manager" },
                                { IsInternal: true, IsLock: false, AppName: "角色管理", AppUrl: "/user/system_manager" },
                                { IsInternal: true, IsLock: false, AppName: "部门管理", AppUrl: "/user/system_manager/department" },
                                { IsInternal: true, IsLock: false, AppName: "应用管理", AppUrl: "/user/system_manager/application" },
                                { IsInternal: true, IsLock: false, AppName: "操作日志", AppUrl: "/user/system_manager/log" }];
                            setAppList(userapp);
                        }
                        setEntity(res.Entity);
                        setDepartment(res.Department);
                        setTODO(res.TODO);
                        setTOREAD(res.TOREAD);
                        setUserPhone(res.Mobile);
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
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query, state]);

    const [modalopen, setModal] = useState(false);
    const handle_cancel = () => {
        setModal(false);
    };
    const data = AppList ? AppList.filter((item) => (item.IsInternal)).map((item) => ({
        content: (
            <div style={{ display: "flex", marginBottom: "-20px" }} onClick={() => {
                if (item.IsLock) setModal(true);
                else if (item.IsInternal) router.push(item.AppUrl);
                else { window.location.href = item.AppUrl; }
            }}>
                {item.IsInternal &&
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="img_style_card" alt="" src={"/" + item.AppName + ".jpg"} />}
                {!item.IsInternal &&
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="img_style_card" alt="" src="/跳转.jpg" />}
                <div>
                    <h1 className="card__title">{item.AppName}</h1>
                    {!item.IsLock && <h1 className="card__description">点击前往</h1>}
                    {item.IsLock && <h1 className="card__description_ban">已禁用</h1>}
                </div>
            </div>
        ),
    })) : [];
    const newdata = NewAppList ? NewAppList.map((item) => ({
        content: (
            <div style={{ display: "flex", marginBottom: "-20px" }} onClick={() => {
                if (item.IsLock) setModal(true);
                else if (item.IsInternal) router.push(item.AppUrl);
                else { window.location.href = item.AppUrl; }
                console.log(item);
            }}>

                {!item.IsInternal && 
                    <Image
                        key={item.AppName}
                        src={item.AppImage ? item.AppImage : "/跳转.jpg"}
                        fit="scale-down"
                        className="img_style_card"
                        style={{width:"100px", height:"80px"}}
                        alt={item.AppImage}
                        lazy
                    />}
                <div>
                    <h1 className="card__title">{item.AppName}</h1>
                    {!item.IsLock && <h1 className="card__description">点击前往</h1>}
                    {item.IsLock && <h1 className="card__description_ban">已禁用</h1>}
                </div>
            </div>
        ),
    })) : [];
    const [form] = Form.useForm();
    const [password, setPassword] = useState("password123");
    const [phone, setPhone] = useState("1234567890");
    const [isEditing, setIsEditing] = useState(false);
    const handleSubmit1 = (values: any) => {
        if (values.username.length > 0) {
            setUserName(values.username);
            request(
                `/api/Asset/ChangeUserName/${LoadSessionID()}`,
                "POST",
                {
                    NewUserName: values.username
                }
            )
                .then((res) => {
                    Modal.success({
                        title: "更改成功",
                        content: `成功将用户名改为  ${values.username}`
                    });
                })
                .catch((err) => {
                    Modal.error({
                        title: "错误",
                        content: err.message.substring(5),
                    });
                });
            form.resetFields();
        }

    };
    const handleSubmit3 = (values: any) => {
        if (values.old > 0 && values.new1.length > 0 && values.new2.length > 0) {
            setPassword(values.password);
            request(
                `/api/Asset/ChangePassword/${LoadSessionID()}`,
                "POST",
                {
                    OldPassword: CryptoJS.MD5(values.old).toString(),
                    NewPassword1: CryptoJS.MD5(values.new1).toString(),
                    NewPassword2: CryptoJS.MD5(values.new2).toString()
                }
            )
                .then((res) => {
                    Modal.success({
                        title: "更改成功",
                        content: "成功修改密码"
                    });
                })
                .catch((err) => {
                    Modal.error({
                        title: "错误",
                        content: err.message.substring(5),
                    });
                });
        }
        form.resetFields();
    };
    const handleSubmit2 = (values: any) => {
        if (values.phone.length > 0) {
            setPhone(values.phone);
            request(
                "/api/User/change_mobile",
                "POST",
                {
                    SessionID: LoadSessionID(),
                    Mobile: values.phone
                }
            )
                .then((res) => {
                    Modal.success({
                        title: "更改成功",
                        content: `成功绑定手机号  ${values.phone}`
                    });
                })
                .catch((err) => {
                    Modal.error({
                        title: "错误",
                        content: err.message.substring(5),
                    });
                });
            form.resetFields();
        }
    };
    const handleCancel = () => {
        setIsEditing(false);
        form.resetFields();
    };
    const UserInfoName = (
        <p className="userinfo-title">
            {"用户名：" + UserName}
        </p>
    );
    const UserInfoPassword = (
        <p className="userinfo-title">
            {"密码"}
        </p>
    );
    const UserInfoPhone = (
        <p className="userinfo-title">
            {UserPhone == null ? "电话：暂未绑定" : ("电话：" + UserPhone)}
        </p>
    );
    const UserInfoAuthority = (
        <p className="userinfo-title">
            {"身份："} {renderAuthority(UserAuthority)}
        </p>
    );
    const UserInfoEntity = (
        <p className="userinfo-title">
            {"业务实体："} {Entity}
        </p>
    );
    const UserInfoDepartment = (
        <p className="userinfo-title">
            {"部门："} {Department}
        </p>
    );
    const getProfile = async () => {
        // 获取头像url
        const ossClient = new OSS({
            accessKeyId: "LTAI5tMmQshPLDwoQEMm8Xd7",
            accessKeySecret: "YG0kjDviIqxkz9GtTZGTLhhlVsPqID",
            region: "oss-cn-beijing",
            bucket: "cs-company",
            secure: true // true for https
        });
        ossClient.get(`/Profile/${UserName}.png`)
            .then(response => {
                const blob = new Blob([response.content], response.res.headers);
                setProfileUrl(URL.createObjectURL(blob));
            })
            .catch(error => {
                console.log(error);
            });
    };
    const handleFileChange = (e: any) => {
        const file = e.target.files[0]; // 获取所有选择的文件
        console.log(e.target);
        const selectedFileName = document.getElementById("selected-file-name");
        if(selectedFileName) selectedFileName.textContent = file.name;
        setFile(file); // 存储文件数组
        // 在这里处理获取到的文件
        console.log("上传的文件:", file);
    };
    const handleUpload = async () => {
        // 创建 OSS 客户端实例
        const client = new OSS({
            region: "oss-cn-beijing",
            accessKeyId: "LTAI5tNdCBrFK5BGXqTiMhwG",
            accessKeySecret: "vZpHyptCPojSG1uNGucDtWcqzMOEeF",
            bucket: "cs-company",
            secure: true,
        });

        const headers = {
            // 添加跨域请求头
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            // 其他自定义请求头
            "x-oss-storage-class": "Standard",
            "x-oss-object-acl": "public-read",
            "x-oss-tagging": "Tag1=1&Tag2=2",
            "x-oss-forbid-overwrite": "true",
        };

        try {
            // 首先检查用户之前是否有文件，如果有则删除
            let result = await client.delete(`/Profile/${UserName}.png`);
            console.log(result);
        } catch (error) {
            console.log(error);
        }
        try {
            //更新头像
            const path = `/Profile/${UserName}.png`;
            console.log(File);
            const result = await client.put(path, File, { headers });
            console.log("上传成功", result);
            setProfileChangeOpen(false);
            window.location.reload();
        } catch (e) {
            console.error("上传失败", e);
        }
        console.log("上传的文件:", File);

    };
    const ChangeName = (username:string) => {
        setUserName(username);
    };
    const ChangeProfile = () => {
        setProfileprop(!Profileprop);
    };
    if (state) {
        return (
            <Layout style={{ minHeight: "80vh" }}>
                <Sider className="sidebar" >
                    <SiderMenu UserAuthority={UserAuthority} />
                </Sider>
                <Layout className="site-layout" >
                    <Header className="ant-layout-header">
                        <UserInfo Name={UserName} Authority={UserAuthority} Entity={Entity} Department={Department} TODO={TODO} TOREAD={TOREAD} Profile={Profileprop} ID={UserID}></UserInfo>
                    </Header>
                    <div style={{ display: "flex" }}>
                        <Content style={{ width: "450px", minHeight: "80vh" }}>
                            <h1 className="main_page_headword">应用导航</h1>
                            <ProList<any>
                                ghost={ghost}
                                itemCardProps={{
                                    ghost,
                                }}
                                rowSelection={{}}
                                grid={{ gutter: 16, column: UserAuthority == 0 ? 2 : 3 }}
                                onItem={(record: AppData) => {
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
                                dataSource={data}
                            />
                            {newdata.length>0 && <>
                                <h1 className="main_page_headword">外部应用</h1>
                                <ProList<any>
                                    ghost={ghost}
                                    itemCardProps={{
                                        ghost,
                                    }}
                                    rowSelection={{}}
                                    grid={{ gutter: 16, column: UserAuthority == 0 ? 2 : 3 }}
                                    onItem={(record: AppData) => {
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
                                    dataSource={newdata}
                                />
                            </>}
                        </Content>
                        {/* <Content style={{ width: "10px" }}>
                            <div style={{ display: "flex" }}>
                                <h1 className="main_page_headword">个人信息</h1>
                                <Image
                                    key="111"
                                    src={ProfileUrl}
                                    fit="cover"
                                    style={{ marginLeft: "120px", marginTop: "15px", width: "90px", height: "90px",  borderRadius: 100 }}
                                    alt={"111"}
                                    lazy
                                />
                            </div>
                            <Panel style={{ marginTop: "30px", marginLeft: "18px", marginBottom: "40px" }} header={UserInfoAuthority} key="4" />
                            {(UserAuthority != 0) && <Panel style={{ marginLeft: "16px", marginBottom: "40px" }} header={UserInfoEntity} key="5" />}
                            {(UserAuthority === 2 || UserAuthority === 3) && <Panel style={{ marginLeft: "16px", marginBottom: "30px" }} header={UserInfoDepartment} key="6" />}
                            <Collapse
                                accordion
                                bordered={false}
                                expandIconPosition="end"
                                expandIcon={() => (
                                    <Button type="text" style={{ color: "#1890ff" }}>
                                        更改
                                    </Button>
                                )}
                                ghost
                            >
                                <Panel header={UserInfoName} key="1">
                                    <Form
                                        form={form}
                                        onFinish={handleSubmit1}
                                        style={{ maxWidth: "400px", marginLeft: "24px" }}
                                    >
                                        <Form.Item
                                            name="username"
                                            // label="新用户名"
                                            rules={[{ message: "请输入新用户名" }]}
                                        >
                                            <Input placeholder="请输入新用户名" />
                                        </Form.Item>
                                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                            <Button type="primary" htmlType="submit">
                                                确认更改用户名
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Panel>
                                <Panel header={UserInfoPhone} key="2">
                                    <Form
                                        form={form}
                                        onFinish={handleSubmit2}
                                        style={{ maxWidth: "400px", marginLeft: "24px" }}
                                    >
                                        <Form.Item
                                            name="phone"
                                        >
                                            <Input placeholder="请输入电话号码，绑定后可用于飞书登录" />
                                        </Form.Item>
                                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                            <Button type="primary" htmlType="submit">
                                                确认绑定该电话
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Panel>
                                <Panel header={UserInfoPassword} key="3">
                                    <Form
                                        form={form}
                                        onFinish={handleSubmit3}
                                        style={{ maxWidth: "400px", marginLeft: "24px" }}
                                    >
                                        <Form.Item name="old">
                                            <Input placeholder="请输入原始密码" />
                                        </Form.Item>
                                        <Form.Item name="new1">
                                            <Input placeholder="请输入新密码" />
                                        </Form.Item>
                                        <Form.Item name="new2">
                                            <Input placeholder="请再次输入新密码" />
                                        </Form.Item>
                                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                            <Button type="primary" htmlType="submit">
                                                确认更改密码
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Panel>


                            </Collapse>
                            <div>
                                <Button style={{ marginLeft: "24px", fontSize: "18px" }} type="link" onClick={() => {console.log("sdsds");setProfileChangeOpen(true);}}> 更改头像</Button>
                                <Modal
                                    title="更新头像"
                                    onOk={() => {
                                        handleUpload();
                                    }}
                                    open={ProfileChangeOpen}
                                    onCancel={() => {
                                        setProfileChangeOpen(false);
                                    }}
                                >
                                    <input
                                        type="file"
                                        id="upload-input"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                    />
                                    <label htmlFor="upload-input" className="custom-upload-button">
                                    </label>
                                    <Space style={{width:"20px"}}> </Space>
                                    <span id="selected-file-name"></span>
                                </Modal>
                            </div>
                        </Content> */}
                        <UserSetting ChangeName={ChangeName} ChangeProfile={ChangeProfile} UserAuthority={UserAuthority} UserName={UserName} UserId={UserID}/>
                    </div>
                </Layout>
                <Modal
                    title="抱歉，该功能已被您的管理员禁用"
                    centered
                    open={modalopen}
                    onCancel={handle_cancel}
                    footer={[
                        <Button key="ok" type="primary" onClick={handle_cancel}>
                            确定
                        </Button>,
                    ]}
                >
                    <p>请联系管理员申请解封</p>
                </Modal>
            </Layout>

        );
    }
};

export default App;
