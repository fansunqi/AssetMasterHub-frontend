import React from "react";
import {PlusSquareOutlined} from "@ant-design/icons";
import { Layout,theme, Switch, Space, Table, Modal, Button, Input, Form, Drawer, Breadcrumb } from "antd";
const { Column } = Table;
import { useRouter } from "next/router";
const {Content} = Layout;
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import { AppData, NewAppData } from "../utils/types";
import OSS from "ali-oss";
interface ApplicationProps {
    refList: React.MutableRefObject<any>[];
    setTourOpen: (t: boolean) => void;
    TourOpen: boolean;
}
const ApplicationUI = (props: ApplicationProps) => {
    const [Open, setOpen] = useState(false); //添加新url的侧边栏显示
    const [Authority, setAuthority] = useState(3); // 根据Authority判断当前应该显示的应用列表
    const [AppName, setAppName] = useState(""); //储存新建应用的名称
    const [AppUrl, setAppUrl] = useState(""); //储存新建应用的路径
    const [AppList, setAppList] = useState<NewAppData[]>(); // 储存所有已有应用的信息 
    const [Loading, setLoading] = useState(false);
    const [LockLoading, setLockLoading] = useState(false);
    const [File, setFile] = useState<File>(); // 使用useState来管理files数组
    const [PhotoUrl, setPhotoUrl] = useState("");
    const router = useRouter();
    const query = router.query;
    const handleAppAdd = (e: any) => {
        setAppName(e.target.value);
    };
    const handleUrlAdd = (e: any) => {
        setAppUrl(e.target.value);
    };
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const fetchList = (Authority: number) => {
        request(
            `/api/User/NewApp/${LoadSessionID()}/${Authority}`,
            "GET"
        )
            .then((res) => {
                setAppList(res.AppList);
            })
            .catch((err) => {
                if (IfCodeSessionWrong(err, router)) {
                    setOpen(false);
                    Modal.error({
                        title: "获取应用信息失败",
                        content: err.toString().substring(5),
                    });
                }
            });

    };
    // 向后端发送创建新应用的请求
    const CreateNewApp = async (AppName: string, AppUrl: string, NowAuthority: number) => {
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
            const nowtime = Date.now();
            const fileExtension = File?.name.split(".").pop();
            const path = "/AppPhotos/" + nowtime + "." + fileExtension;
            const result = await client.put(path, File, { headers });
            const fileurl = "https://cs-company.oss-cn-beijing.aliyuncs.com" + path;
            const selectedFileName = document.getElementById("selected-file-name");
            if(selectedFileName) selectedFileName.textContent = "";
            request(
                `/api/User/App/${LoadSessionID()}/${NowAuthority}`,
                "POST",
                {
                    "AppName": AppName,
                    "AppUrl": AppUrl,
                    "AppImage": fileurl
                }
            )
                .then((res) => {
                    setOpen(false);
                    let answer: string = `成功创建应用 ${AppName}`;
                    Modal.success({ title: "创建成功", content: answer });
                    fetchList(NowAuthority);
                })
                .catch((err: string) => {
                    if (IfCodeSessionWrong(err, router)) {
                        setOpen(false);
                        Modal.error({
                            title: "创建失败",
                            content: err.toString().substring(5),
                        });
                    }
                });
        } catch (e) {
            console.error("上传失败", e);
        }
        console.log("上传的文件:", File);
        
    };

    const RemoveApp = (Authority: number, AppName: string) => {
        request(
            `/api/User/App/delete/${LoadSessionID()}/${Authority}/${AppName}`,
            "DELETE"
        )
            .then((res) => {
                let answer: string = `成功删除应用 ${AppName}`;
                Modal.success({ title: "删除成功", content: answer });
                fetchList(Authority);
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
    const ChangeLock = (AppName: string, AppUrl: string) => {
        setLockLoading(true);
        request(
            `/api/User/App/${LoadSessionID()}/${Authority}`,
            "PUT",
            {
                "AppName": AppName,
                "AppUrl": AppUrl
            }
        )
            .then(() => {
                setLockLoading(false);
                fetchList(Authority);
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
    const handleUser = () => {
        setAuthority(2);
        fetchList(2);
    };
    const handleAM = () => {
        setAuthority(3);
        fetchList(3);
    };
    const onClose = () => {
        setOpen(false);
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
        
    };

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        fetchList(Authority);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query]);
    return (
        <Content>
            {/* {Authority == 3 && <Button
                type="primary"
                style={{ float: "left", margin: 30 }}
                onClick={() => { handleUser(); }}
                ref={props.refList[0]}
            >
                切换到资产管理员应用列表
            </Button>}
            {Authority == 2 && <Button
                type="primary"
                style={{ float: "left", margin: 30 }}
                onClick={() => { handleAM(); }}
                ref={props.refList[0]}
            >
                切换到普通员工应用列表
            </Button>} */}
            <Button style={{marginTop:"40px", marginLeft:"20px",marginBottom:"-10px"}} className={Authority==2 ? "log_title_select" : "log_title"} type="text" key="0" onClick={() => { handleUser(); }}>
                资产管理员应用列表
            </Button>
            <Button style={{marginTop:"25px",marginBottom:"-10px"}} className={Authority==3 ? "log_title_select" : "log_title"} type="text" key="1" onClick={() => { handleAM(); }}>
                员工应用列表
            </Button>
            <Button
                type="primary"
                icon={<PlusSquareOutlined />}
                style={{ marginLeft:"30px",marginBottom:"-10px" }}
                onClick={() => setOpen(true)}
                ref={props.refList[1]}
            >
                添加应用
            </Button>
            <Drawer title="添加应用" placement="right" onClose={onClose} open={Open} >
                <Form
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    autoComplete="off"
                >
                    <Form.Item
                        label="应用名称"
                        name="AppName"
                        rules={[{ required: true, message: "请输入应用名称" }]}
                    >
                        <Input onChange={handleAppAdd} />
                    </Form.Item>
                    <Form.Item
                        label="应用url"
                        name="AppUrl"
                        rules={[{ required: true, message: "请输入应用url" }]}
                    >
                        <Input onChange={handleUrlAdd} />
                    </Form.Item>
                    <Form.Item
                        label="应用图标"
                        name="AppImage"
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
                    </Form.Item>
                    
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit" loading={Loading} onClick={() => { if (AppName && AppUrl) CreateNewApp(AppName, AppUrl, Authority); }}>
                            确认提交
                        </Button>
                    </Form.Item>
                </Form>
            </Drawer>
            <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                <Table dataSource={AppList} ref={props.refList[2]}>
                    <Column title="应用名称" dataIndex="AppName" key="AppName" width="300px" />
                    <Column
                        title="管理"
                        key="action"
                        render={(_: any, record: AppData) => (
                            <Space size="middle">
                                <Switch ref={props.refList[3]}checkedChildren="解锁" unCheckedChildren="禁用" onChange={() => { if(!props.TourOpen){ChangeLock(record.AppName, record.AppUrl); }}} checked={!record.IsLock} loading={LockLoading} />
                                {!record.IsInternal && <Button type="primary" loading={Loading} onClick={() => { if(!props.TourOpen){RemoveApp(Authority, record.AppName);} }} ref={props.refList[4]}>移除该应用</Button>}

                            </Space>
                        )}
                    />
                </Table>
            </div>
        </Content>
    );
};

export default ApplicationUI;
