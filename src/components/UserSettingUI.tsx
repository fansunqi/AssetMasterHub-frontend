import React from "react";
import { Layout, Tooltip, Button, Space, Modal, MenuProps, Descriptions, Form, Input, Collapse, Row } from "antd";
import { InfoCircleOutlined, WarningOutlined, UnorderedListOutlined, PoweroffOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { logout, LoadSessionID, IfCodeSessionWrong, CreateCookie } from "../utils/CookieOperation";
import { useRouter } from "next/router";
import { request } from "../utils/network";
import { useState, useEffect } from "react";
import { renderAuthority } from "../utils/transformer";
const { Header, Content, Footer, Sider } = Layout;
const { Panel } = Collapse;
import { Image } from "antd-mobile";
import OSS from "ali-oss";
import CryptoJS from "crypto-js";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { ApplyApprovalData } from "../utils/types";
interface UserSettingProps {
    ChangeName:(username:string)=>void;
    ChangeProfile: ()=>void;
    UserAuthority:number;
    UserName:string;
    UserId: number;
}
interface ToDoData {
    Detail: string;
}
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
const UserSetting = (props:UserSettingProps) => {
    const [ProfileUrl, setProfileUrl] = useState("");
    const [File, setFile] = useState<File>();
    const [ProfileChangeOpen, setProfileChangeOpen] = useState<boolean>(false);  //更新头像的modal是否打开
    const [form] = Form.useForm();
    const [UserName, setUserName] = useState<string>(props.UserName);
    const [UserPhone, setUserPhone] = useState("暂未绑定");
    const [UserAuthority, setUserAuthority] = useState(props.UserAuthority);
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [loading, setLoading]= useState(false);
    const handleSubmit1 = (values: any) => {
        if (values.username.length > 0) {
            setLoading(true);
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
                    setLoading(false);
                })
                .catch((err) => {
                    Modal.error({
                        title: "错误",
                        content: err.message.substring(5),
                    });
                    setLoading(false);
                });
            form.resetFields();
        }
        props.ChangeName(values.username);
    };
    const handleSubmit3 = (values: any) => {
        if (values.old.length > 0 && values.new1.length > 0 && values.new2.length > 0) {
            setLoading(true);
            console.log(values.old,values.new1,values.new2);
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
                    setLoading(false);
                })
                .catch((err) => {
                    Modal.error({
                        title: "错误",
                        content: err.message.substring(5),
                    });
                    setLoading(false);
                });
        }
        form.resetFields();
    };
    const handleSubmit2 = (values: any) => {
        if (values.phone.length > 0) {
            setLoading(true);
            setUserPhone(values.phone);
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
                    setLoading(false);
                })
                .catch((err) => {
                    Modal.error({
                        title: "错误",
                        content: err.message.substring(5),
                    });
                    setLoading(false);
                });
            form.resetFields();
        }
    };
    const handleCancel = () => {
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
    const UserInfoHead = (
        <p className="userinfo-title" style={{fontSize:"20px", fontWeight:550, marginLeft:"-10px"}}>
            <InfoCircleOutlined />
            {"   个人信息"}
        </p>
    );
    const UserInfoWarn = (
        <p className="userinfo-title" style={{fontSize:"20px", fontWeight:550, marginLeft:"-10px"}}>
            <WarningOutlined />
            {"   告警资产"}
        </p>
    );
    const UserInfoToDo = (
        <p className="userinfo-title" style={{fontSize:"20px", fontWeight:550, marginLeft:"-10px"}}>
            <UnorderedListOutlined />
            {"   待办事项"}
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
        ossClient.get(`/Profile/${props.UserId}.png`)
            .then(response => {
                const blob = new Blob([response.content], response.res.headers);
                setProfileUrl(URL.createObjectURL(blob));
            })
            .catch(error => {
                setProfileUrl("https://cs-company.oss-cn-beijing.aliyuncs.com/icon/default_icon.png");
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

        const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
            let result = await client.delete(`/Profile/${props.UserId}.png`);
            console.log("解析结果："+ result);
        } catch (error) {
            console.log(error);
        }
        try {
            if (File) {
                if (File.size > MAX_FILE_SIZE) {
                    Modal.error({
                        title: "头像" + File.name + "无法上传",
                        content: "图片大小过大",
                    });
                    return;
                }
            }
            //更新头像
            const path = `/Profile/${props.UserId}.png`;
            console.log(File);
            const result = await client.put(path, File, { headers });
            console.log("上传成功", result);
            const selectedFileName = document.getElementById("selected-file-name");
            if(selectedFileName) selectedFileName.textContent = "";
            setProfileChangeOpen(false);
            getProfile();
        } catch (e) {
            console.error("上传失败", e);
        }
        console.log("上传的文件:", File);
        props.ChangeProfile();
    };
    const router = useRouter();
    const query = router.query;
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        request(
            `/api/User/info/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setUserName(res.UserName);
                setUserAuthority(res.Authority);
                setEntity(res.Entity);
                setDepartment(res.Department);
                setUserPhone(res.Mobile);
            })
            .catch((err) => {
                console.log(err.message);
                Modal.error({
                    title: "登录失败",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
        getProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query]);
    const columns: ProColumns<AssetWarnData>[] = [
        {
            title: "资产名称",
            dataIndex: "Name",
            key: "Name",
            search:false
        },
        {
            title: "告警策略",
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
    ];
    const Render= (type: number) => {
        if (type == 0) return "领用";
        if (type == 1) return "退库";
        if (type == 2) return "维保";
        if (type == 3) return "转移";
    };
    const columns2: ProColumns<ToDoData>[] = [
        {
            title: "待办列表",
            dataIndex: "Detail",
            key: "Detail",
            tip: "点击前往审批",
            render: (_: any, record) => {
                return (
                    <div>
                        <Tooltip title="点击前往审批">
                            <a  className="link" onClick={() => {
                                router.push("/user/asset_manager/apply_approval");
                            }}>员工 {record.Detail}</a>
                        </Tooltip>
                    </div >);
            },
        },
    ];
    return(
        <Content style={{ width: "10px" }}>
            <div style={{ display: "flex" }}>
                <Image
                    key="111"
                    src={ProfileUrl}
                    fit="cover"
                    style={{ marginLeft: "40px", marginTop: "15px", marginBottom:"30px", width: "80px", height: "80px",  borderRadius: 5 }}
                    alt={"111"}
                    lazy
                />
                <h2 style={{marginTop:"40px", marginLeft:"30px"}}>{UserName}</h2>
            </div>
            <Collapse
                accordion
                bordered={false}
                expandIconPosition="right"
                // expandIcon={() => (
                //     <Button type="text" style={{ color: "#1890ff" }}>
                //                 展开
                //     </Button>
                // )}
                ghost
                defaultActiveKey="10"
            >
                <Panel header={UserInfoHead} key="10">
                    <Panel style={{marginTop: "-10px", marginLeft: "18px", marginBottom: "25px" }} header={UserInfoName} key="7" />
                    <Panel style={{ marginTop: "0px", marginLeft: "18px", marginBottom: "25px" }} header={UserInfoAuthority} key="4" />
                    {(UserAuthority != 0) && <Panel style={{ marginLeft: "16px", marginBottom: "25px" }} header={UserInfoEntity} key="5" />}
                    {(UserAuthority === 2 || UserAuthority === 3) && <Panel style={{ marginLeft: "16px", marginBottom: "15px" }} header={UserInfoDepartment} key="6" />}
            
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
                        <Panel header={UserInfoPhone} key="2" style={{marginBottom: "-10px" }}>
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
                        <Panel header={UserInfoPassword} key="3" style={{marginBottom: "-10px" }}>
                            <Form
                                form={form}
                                onFinish={handleSubmit3}
                                style={{ maxWidth: "400px", marginLeft: "24px" }}
                            >
                                <Form.Item name="old">
                                    <Input.Password placeholder="请输入原始密码" type="password"/>
                                </Form.Item>
                                <Form.Item name="new1">
                                    <Input.Password placeholder="请输入新密码" type="password"/>
                                </Form.Item>
                                <Form.Item name="new2">
                                    <Input.Password placeholder="请再次输入新密码" type="password"/>
                                </Form.Item>
                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                                确认更改密码
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Panel>


                    </Collapse>
                    <div>
                        <Button style={{ marginLeft: "24px", fontSize: "18px", marginBottom:"10px" }} type="link" onClick={() => {console.log("sdsds");setProfileChangeOpen(true);}}> 更改头像</Button>
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
                        (小于10MB)
                            </label>
                            <Space style={{width:"20px"}}> </Space>
                            <span id="selected-file-name"></span>
                        </Modal>
                    </div>
                </Panel>
                {UserAuthority==2 && <Panel header={UserInfoToDo} key="30">
                    <ProTable
                        style={{marginTop:"-45px",marginLeft:"7px"}}
                        columns={columns2}
                        options={{ reload: true, setting: false }}
                        request={async (params = {}) => {
                            const loadSessionID = LoadSessionID();
                            let url = `/api/Asset/Approval/${loadSessionID}`;
                            return (
                                request(
                                    url,
                                    "GET"
                                )
                                    .then((res) => {
                                        let todolist: ToDoData[] = res.ApprovalList.map((item:ApplyApprovalData)=>{return{Detail:item.Applicant + " 对 " + item.Name + " 提出了 " + Render(item.Operation) + " 申请"};});
                                        console.log(todolist);
                                        return Promise.resolve({ data: todolist, success: true});
                                    })
                            );
                        }
                        }
                        // dataSource={[]}
                        scroll={{ x: "100%", y: "calc(100vh - 300px)" }}
                        pagination={false}
                        search={false}
                        toolBarRender={false}
                    />
                </Panel>}
                {UserAuthority==3 && <Panel header={UserInfoWarn} key="50">
                    <ProTable
                        style={{marginTop:"-30px",marginLeft:"5px"}}
                        columns={columns}
                        options={{ reload: true, setting: false }}
                        rowKey="ID"
                        request={async (params = {}) => {
                            const loadSessionID = LoadSessionID();
                            let urldata:UrlData={pageSize:20, current:params.current, Name:"", AssetType:-1, WarnType:-1, IsWarning:0};
                            if(params.Name != undefined) urldata.Name=params.Name;
                            if(params.AssetType != undefined) urldata.AssetType=params.AssetType;
                            if(params.WarnType != undefined) urldata.WarnType=params.WarnType;
                            if(params.IsWarning != undefined) urldata.IsWarning=params.IsWarning;
                            // console.log("params参数："+params.Name+params.AssetType+params.WarnType);
                            let url = `/api/Asset/UserWarn/${loadSessionID}/${urldata.IsWarning}/${urldata.current}/Name=${urldata.Name}/AssetType=${urldata.AssetType}/WarnType=${urldata.WarnType}`;
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
                        // dataSource={[]}
                        scroll={{ x: "100%", y: "calc(100vh - 300px)" }}
                        pagination={{
                            showSizeChanger:false,
                        }}
                        search={false}
                        toolBarRender={false}
                    />
                </Panel>}
            </Collapse>
            
        </Content>
    );
};
export default UserSetting;