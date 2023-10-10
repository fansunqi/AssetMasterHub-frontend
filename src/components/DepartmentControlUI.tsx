import React from "react";
import {
    PartitionOutlined, PlusSquareOutlined, BackwardOutlined
} from "@ant-design/icons";
import { Layout, Menu, theme, Space, Table, Modal, Button, Input, Form, Drawer, Breadcrumb } from "antd";
const { Column } = Table;
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../utils/network";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import MemberList from "../components/MemberList";
import { DepartmentData, DepartmentPathData, MemberData } from "../utils/types";
import DepartmentTree from "./DepartmentTreeUI";
interface DepartmentUIProps {
    refList: React.MutableRefObject<any>[]; // Make the parameter optional
    setTourOpen: (t: boolean) => void;
    TourOpen: boolean;
}
const DepartmentUI = (props:DepartmentUIProps) => {
    const [open1, setOpen1] = useState(false);    //添加部门侧边栏的显示
    const [open2, setOpen2] = useState(false);    //创建员工侧边栏的显示
    const [DepartmentName, setDepartmentName] = useState(""); //注册新部门名
    const [IsLeafDepartment, setLeafDepartment] = useState(false);//判断是否为叶子部门，若是则显示用户列表
    const [DepartmentList, setDepartmentList] = useState<DepartmentData[]>(); // 存储当前部门下所有部门的信息 
    const [DepartmentMemberList, setMemberList] = useState<MemberData[]>(); // 存储叶子部门下所有用户的信息
    const [UserName, setUserName] = useState("");// 储存新建用户的名称
    const [DepartmentPath, setDepartmentPath] = useState("000000000"); //储存当前的部门路径
    const [DepartmentPathList, setDepartmentPathList] = useState<DepartmentPathData[]>(); // 储存页面历史路径
    const [Loading, setLoading] = useState(false);
    const [Tree, setTree] = useState<[]>();
    const router = useRouter();
    const query = router.query;
    const handleDepartmentAdd = (e: any) => {
        setDepartmentName(e.target.value);
    };
    const handleUserAdd = (e: any) => {
        setUserName(e.target.value);
    };
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const showDrawer1 = () => {
        setOpen1(true);
    };

    const onClose1 = () => {
        setOpen1(false);
    };
    const showDrawer2 = () => {
        setOpen2(true);
    };

    const onClose2 = () => {
        setOpen2(false);
    };
    const onFinish = (values: any) => {
        console.log("Success:", values);
    };
    const fetchList = (Path: string) => {
        request(
            `/api/User/department/${LoadSessionID()}/${Path}/1/Name=/Authority=-1`,
            "GET"
        )
            .then((res) => {
                setLeafDepartment(res.is_leaf);
                if (res.is_leaf) {
                    setMemberList(res.member);
                    setDepartmentPathList(res.route);
                }
                else {
                    setDepartmentList(res.Department);
                    setDepartmentPathList(res.route);
                }
            })
            .catch((err) => {
                console.log(err.message);
                Modal.error({
                    title: "无法获取对应部门信息",
                    content: "请重新登录",
                    onOk: () => { window.location.href = "/"; }
                });
            });
        request(
            `/api/User/tree/${LoadSessionID()}`,
            "GET"
        )
            .then((res) => {
                setTree(res.treeData);
            })
            .catch((err) => {
                console.log(err.message);
                Modal.error({
                    title: "错误",
                    content: "无法获取对应部门信息",
                });
            });

    };
    const GoUp = (NowPath: string) => {
        let new_path = "000000000";
        let i = 0;
        for(i; i<9; i++){
            if(NowPath[i] == "0"){
                break;
            }
        }
        let newstr = i>1 ? NowPath.substring(0, i-1)+new_path.substring(i-1): new_path;
        setDepartmentPath(newstr);
        fetchList(newstr);
    };
    // 向后端发送创建部门的请求
    const CreateNewDepartment = (DepartmentPath: string, DepartmentName: string) => {
        setLoading(true);
        request(
            "/api/User/department/add",
            "POST",
            {
                "SessionID": LoadSessionID(),
                "DepartmentPath": DepartmentPath,
                "DepartmentName": DepartmentName
            }
        )
            .then((res) => {
                setOpen1(false);
                let answer: string = `成功创建部门 ${DepartmentName}`;
                Modal.success({ title: "创建成功", content: answer });
                setLoading(false);
                onClose1();
                fetchList(DepartmentPath);
            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {
                    setLoading(false);
                    setOpen1(false);
                    Modal.error({
                        title: "创建失败",
                        content: err.toString().substring(5),
                    });
                }
            });
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
                onClose1();
                fetchList(DepartmentPath);
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
    const RemoveDepartment = (DepartmentPath: string, DepartmentName: string) => {
        setLoading(true);
        request(
            `/api/User/department/delete/${LoadSessionID()}/${DepartmentPath}`,
            "DELETE"
        )
            .then((res) => {
                let answer: string = `成功删除部门 ${DepartmentName}`;
                Modal.success({ title: "删除成功", content: answer });
                GoUp(DepartmentPath);
                setLoading(false);
            })
            .catch((err: string) => {
                if (IfCodeSessionWrong(err, router)) {
                    Modal.error({
                        title: "删除失败",
                        content: err.toString().substring(5),
                    });
                    setLoading(false);
                }
                
            });
        
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };
  
    const handleOk = () => {
        setIsModalOpen(false);
    };
  
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    interface Item {
        title: string;
        children?: Item[];
    }
      
    function mapTitleToName(item: Item): any {
        const { title, ...rest } = item;
        const newItem: any = { ...rest, name: title };
        if (newItem.children) {
            newItem.children = newItem.children.map(mapTitleToName);
        }
        return newItem;
    }
  

    const onFinishFailed = (errorInfo: any) => {
        console.log("Failed:", errorInfo);
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        fetchList(DepartmentPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query]);
    return(
        <Content>
            <div ref={props.refList[0]}>
                <Breadcrumb className="ant-breadcrumb" style={{margin: 30 }}>
                    {DepartmentPathList && DepartmentPathList.map((path, index) => (
                        <Breadcrumb.Item key={index} onClick={() => { if(!props.TourOpen){setDepartmentPath(path.Path);fetchList(path.Path);}}} className="ant-breadcrumb-item">
                            {path.Name}
                        </Breadcrumb.Item>
                    ))}
                </Breadcrumb>
            </div>
            <Modal style={{ height: "1500px" }} width={1600} title="部门树" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <div style={{ height: "1500px" }}>
                    <DepartmentTree data={Tree?.map(mapTitleToName) ?? []} />
                </div>        
            </Modal>
            {DepartmentPath == "000000000" && <Button
                type="primary"
                icon={<PartitionOutlined />}
                style={{ float: "left", marginLeft:"30px", marginBottom:"15px"}}
                onClick={() => {showModal();}}
            >
                查看部门树
            </Button>}
            {DepartmentPath != "000000000" && <Button
                type="primary"
                icon={<BackwardOutlined />}
                style={{ float: "left", marginLeft:"30px", marginBottom:"15px"}}
                onClick={() => {GoUp(DepartmentPath);}}
            >
                回到上一级目录
            </Button>}
            <Button
                type="primary"
                icon={<PlusSquareOutlined />}
                style={{ float: "left", marginLeft:"30px", marginBottom:"15px" }}
                onClick={()=>{if(!props.TourOpen){showDrawer1();}}}
                ref={props.refList[2]}
            >
                添加部门
            </Button>
            {/* {IsLeafDepartment && <Button
                type="primary"
                icon={<PlusSquareOutlined />}
                style={{ float: "left", margin: 30 }}
                onClick={showDrawer2}
            >
                新增员工
            </Button>} */}
            <Drawer title="添加部门" placement="right" onClose={onClose1} open={open1}>
                <Form
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="部门名称"
                        name = "DepartmentName"
                        rules={[{ required: true, message: "请输入部门名称" }]}
                    >
                        <Input onChange={handleDepartmentAdd} />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit" loading = {Loading} onClick={() => {if (DepartmentName) CreateNewDepartment(DepartmentPath, DepartmentName);}}>
                            确认提交
                        </Button>
                    </Form.Item>
                </Form>
            </Drawer>
            {/* {IsLeafDepartment && <Drawer title="创建新员工" placement="right" onClose={onClose2} open={open2}>
                <Form
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
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
                        <Button type="primary" htmlType="submit" loading = {Loading} onClick={() => {if(UserName) CreateNewUser(DepartmentPath, UserName);}}>
                            确认提交
                        </Button>
                    </Form.Item>
                </Form>
            </Drawer>} */}
            <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                {IsLeafDepartment && <MemberList
                    Members={DepartmentMemberList}
                    department_page = {true}
                    department_path = {DepartmentPath}
                />}
                {!IsLeafDepartment && <Table  dataSource={DepartmentList}>
                    <Column
                        title="部门名称"
                        key="action"
                        render={(_: any, record: DepartmentData) => (
                            <>
                                <a ref={props.refList[1]} type="primary" onClick={() => { if(!props.TourOpen){setDepartmentPath(record.DepartmentPath);fetchList(record.DepartmentPath);}}}>{record.DepartmentName}</a>
                            </>
                        )}
                    />
                    <Column title="部门编号" dataIndex="DepartmentId" key="DepartmentId" />
                    <Column
                        title="管理"
                        key="action"
                        render={(_: any, record: DepartmentData) => (
                            <Space size="middle">
                                <Button ref={props.refList[3]} type="primary" loading = {Loading} onClick={() => { if(!props.TourOpen){RemoveDepartment(record.DepartmentPath, record.DepartmentName);}}}>移除该部门</Button>
                            </Space>
                        )}
                    />
                </Table>}
            </div>
        </Content>
    );
};

export default DepartmentUI;
