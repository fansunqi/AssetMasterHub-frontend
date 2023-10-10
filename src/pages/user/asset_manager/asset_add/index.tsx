import { FC, useMemo, useRef} from "react";
import React from "react";
import {
    PlusOutlined,
    CheckOutlined,
    QuestionCircleOutlined
} from "@ant-design/icons";
import {
    StepsForm,
    ProForm,
    ProFormDigit,
    ProFormTextArea,
    ProFormText,
    ProFormTreeSelect,
    ProFormSelect,
    ProFormMoney,
    ProList,
    ProFormDateTimePicker,
} from "@ant-design/pro-components";
import { Layout, Select, theme, Modal, Button, Breadcrumb, Row, Col, Form, message, Tour, Tooltip } from "antd";
import type {TourProps} from "antd";
import { useRouter } from "next/router";
const { Header, Content, Footer, Sider } = Layout;
import { useState, useEffect } from "react";
import { request } from "../../../../utils/network";
import { LoadSessionID } from "../../../../utils/CookieOperation";
import UserInfo from "../../../../components/UserInfoUI";
import SiderMenu from "../../../../components/SiderUI";
import AssetAddFromExcelUI from "../../../../components/AssetAddFromExcelUI";
import OSS from "ali-oss";
import "react-quill/dist/quill.snow.css"; // 导入默认的样式文件
import { Rule } from "rc-field-form/lib/interface"; // 导入正确的规则类型
const { Option } = Select;
import { AssetData } from "../../../../utils/types";

interface MyEditorState {
    content: string;
}

const { Item } = Form;
const MAX_FILE_SIZE = 10 * 1024 * 1024;


class MyEditor extends React.Component<{ 
    name: string;
    label: string;
    width: string;
    placeholder: string;
    rules: Rule[];
  }, MyEditorState> {
    constructor(props: { 
      name: string;
      label: string;
      width: string;
      placeholder: string;
      rules: Rule[];
    }) {
        super(props);
        this.state = {
            content: ""
        };
    }
  
    handleChange = (value: string) => {
        this.setState({ content: value });
    };
  
    render() {
        const { name, label, width, placeholder, rules } = this.props;
        let ReactQuill;
        if (typeof window !== "undefined") {
            ReactQuill = require("react-quill");
            require("react-quill/dist/quill.snow.css");
        }
        return (
            <Item
                name={name}
                label={label}
                rules={rules} // 将规则传递给表单项
            >
                {ReactQuill ? <ReactQuill value={this.state.content} onChange={this.handleChange} /> : null}
            </Item>
        );
    }
}
  
  
  

interface DepartmentData {
    DepartmentName: string;
    DepartmentId: string;
}

let ListLike = [
    {
        id: "1",
        name: "语雀的天空",
        class: "",
        father: 0,
        count: 0,
        money: 0,
        datetime: "",
        position: "",
        describe: "",
    },
];

interface MyDic {
    [key: string]: string;
}

type DataItem = (typeof ListLike)[number];

let AddList: DataItem[] = [];

let AllProList: string[][][] = [];

const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};


interface MyFormProps {
    inputCount: number;
  }
  

const App = () => {
    const [state, setState] = useState(false);  //路径保护变量
    const [UserName, setUserName] = useState<string>(""); // 用户名
    const [UserAuthority, setUserAuthority] = useState(2); // 用户的角色权限，0超级，1系统，2资产，3员工
    const [Entity, setEntity] = useState<string>(""); // 实体名称
    const [Department, setDepartment] = useState<string>("");  //用户所属部门，没有则为null
    const [TOREAD, setTOREAD] = useState(false);
    const [TODO, setTODO] = useState(false);
    const [form] = Form.useForm<{ name: string; class: string; father: number; count: number; money: number; datetime: string; position: string; describe: string }>();
    const [treeData, setAsset] = useState<[]>(); // 储存资产列表树
    const [dataSource, setDataSource] = useState<DataItem[]>(AddList);
    const [Change, setChange] = useState(false);
    const [AssetID, setAssetID] = useState<number>(1);
    const [AssetList, setAssetList] = useState<{[key : number] : string}>({});
    const [ListKey, setListKey] = useState<number>(0);
    const [ProperList, setProperList] = useState<[]>([]);
    const [loading, setLoading] = useState(false);
    const [UserID, setUserID]= useState(0);
    const router = useRouter();

    const [files, setfiles] = useState<File[][]>([]); // 使用useState来管理files数组

    const [onefiles, setoneFiles] = useState<File[]>([]);

    const [TourOpen, setTourOpen] = useState(false);

    const [visible, setVisible] = useState(false);

    const [options, setOptions] = useState([]);
    const [loading1, setLoading1] = useState(false);
    const [father, setfather] = useState<number>(-1);

    const fetchData = async (inputValue: any) => {
        setLoading1(true);

        try {
            // 发送请求到后端获取列表数据
            request(
                `/api/Asset/Info/${LoadSessionID()}/1/ID=-1/Name=${inputValue}/Class=/Status=-1/Owner=/Prop=/PropValue=`,
                "GET",
            )
                .then((res) => {
                    setOptions(res.Asset);

                })
                .catch((err) => {
                    Modal.error({
                        title: "获取资产错误",
                        content: err.message.substring(5),
                    });
                });
        } catch (error) {
            console.error("请求出错:", error);
        }

        setLoading1(false);

    
    };

    const handleSearch = (inputValue: any) => {
        // 输入内容后触发请求
        if (inputValue) {
            fetchData(inputValue);
        } else {
            setOptions([]);
        }
    };

    const handlefatherchange = (value: any) => {
        setfather(value);
    };

    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const steps: TourProps["steps"] = [
        {
            title: "新建资产",
            description: "用于添加单个资产，点击后请在弹出的提示框内完善相关资产信息",
            target: () => ref1.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "批量添加",
            description: "用于批量添加资产，点击后会下载一个格式化的 Excel 表格，请在表格内完善资产后上传该表格。请注意！由于 Secoder 平台限制，批量提交的资产数量不应多于 100 条",
            target: () => ref2.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "待录入资产列表",
            description: "完善录入资产信息后，待录入资产会在此处生成预览列表",
            target: () => ref3.current,
            nextButtonProps:{children:"下一步"},
            prevButtonProps:{children:"上一步"},
        },
        {
            title: "录入",
            description: "确认录入信息无误后，点击录入键最终实现资产录入信息提交",
            target: () => ref4.current,
            nextButtonProps:{children:"结束导览"},
            prevButtonProps:{children:"上一步"},
        }
    ];

    const handleFileChange = (e: any) => {
        const files: File[] = Array.from(e.target.files); // 获取所有选择的文件
        setoneFiles(files); // 存储文件数组
        const selectedFileName = document.getElementById("selected-file-name");
        if(selectedFileName) {
            selectedFileName.textContent="";
            for (let i=0; i<files.length;i++){
                if(i>0) selectedFileName.textContent= selectedFileName.textContent+"  ;  "+ files[i].name;
                else selectedFileName.textContent = files[i].name;            
            }
            selectedFileName.textContent += `  共 ${files.length}个文件`;
        }
        // 在这里处理获取到的文件
        console.log("上传的文件:", files);
    };

    const handleonefiles = () => {
        setfiles(prevFiles => [...prevFiles, onefiles]); // 使用setFiles更新files数组
        console.log(files);
        setoneFiles([]);
    };

    const handleUpload = async (param: number, gotpath: string) => {
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

        console.log(files);
        console.log(param);
        const now_files = files[param];
        console.log(now_files);
        const selectedFileName = document.getElementById("selected-file-name");
        for (let i = 0; i < now_files.length; i++) {
            const file = now_files[i];
            if (file.size > MAX_FILE_SIZE) {
                Modal.error({
                    title: "图片" + file.name + "无法上传",
                    content: "图片大小过大",
                });
                continue;
            }
            try {
                const filename = Date.now();
                const fileExtension = file?.name.split(".").pop();
                const path = gotpath + "/" + filename + "." + fileExtension;
                console.log(file);
                const result = await client.put(path, file, { headers });
                console.log("上传成功", result);
                if (selectedFileName) selectedFileName.textContent = "";
            } catch (e) {
                if (selectedFileName) selectedFileName.textContent = "";
                console.error("上传失败", e);
            }
            console.log("上传的文件:", file);
        }
    };


    const MyForm: FC<MyFormProps> = ({ inputCount }) => {
        const inputs = useMemo(() => {
            const result = [];
            for (let i = 0; i < inputCount; i++) {
                result.push(
                    <ProForm.Group>
                        <ProFormText
                            name={`property${i}`}
                            label={ProperList[i]}
                            placeholder={"请输入"}
                            rules={[{ required: true, message: "这是必填项" }]}
                        />
                    </ProForm.Group>
                );
            }
            return result;
        }, [inputCount]);
      
        return (
            <div>
                {inputs}
            </div>     
        );
    };

    const add = () => {
        let ok = true;
        if (AddList.length == 0) {
            message.warning("没有数据!");
            return;
        }
        setLoading(true);
        for (let i = 0; i < AddList.length; i = i + 1) {
            let item = AddList[i];
            let nowList = AllProList[i];
            let body: MyDic = {};
            for (let k = 0; k < nowList.length; k = k + 1) {
                body[nowList[k][0]] = nowList[k][1];
            }
            request(
                `/api/Asset/Append/${LoadSessionID()}`,
                "POST",
                {
                    Name: item.name,
                    Type: item.class,
                    Number: item.count,
                    Position: item.position,
                    Describe: item.describe,
                    Value: item.money,
                    Parent: item.father == -1 ? null : item.father,
                    Time: item.datetime,
                    Property: {...body},
                }
            )
                .then((res) => {
                    console.log("准备上传图片了！");
                    handleUpload(i, res.PhotoPath);
                })
                .catch((err) => {
                    setLoading(false);
                    ok = false;
                    console.log(err.message);
                    Modal.error({
                        title: "资产" + item.name +  "录入错误",
                        content: err.message.substring(5),
                    });
                });
        }
        if (ok) {
            message.success("提交成功");
            setfiles([]);
            setLoading(false);
        }
        AddList.splice(0);
        setChange((e) => !e);
    };

    const changeProperList = (value: number) => {
        request(
            `/api/Asset/AppendType/${LoadSessionID()}/${value}`,
            "GET"
        )
            .then((res) => {
                setProperList(res.Property);
            })
            .catch((err) => {
                Modal.error({
                    title: "错误",
                    content: err.message.substring(5),
                });
            });
    };

    const {
        token: { colorBgContainer },
    } = theme.useToken();

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
                setUserAuthority(res.Authority);
                if(res.Authority != 2 ){
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
    }, [state, router, Change]);
    if (state) {
        if (!treeData) {
            request(
                "/api/Asset/tree",
                "POST",
                {
                    SessionID: LoadSessionID(),
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
        }
        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Sider className= "sidebar" width="13%">
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
                        <Breadcrumb style={{ margin: "30px" }}>
                            <Breadcrumb.Item>资产录入</Breadcrumb.Item>
                        </Breadcrumb>
                        <Row gutter={[8, 6]} style={{ margin: "25px" }}>
                            <Col>
                                <Button type="primary" onClick={() => setVisible(true)}>
                                    <PlusOutlined />
                                资产录入
                                </Button>
                                <StepsForm<{
                                name: string;
                                class: string;
                                father: number;
                                count: number;
                                money: number;
                                datetime: string;
                                position: string;
                                describe: string;
                            }>
                                    
                                    formProps={{
                                        validateMessages: {
                                            required: "此项为必填项",
                                        },
                                    }}
                                    stepsFormRender={(dom, submitter) => {
                                        return (
                                            <Modal
                                                
                                                width={800}
                                                onCancel={() => setVisible(false)}
                                                open={visible}
                                                footer={submitter}
                                                destroyOnClose
                                            >
                                                <div style={{marginBottom:"25px", fontSize:"20px"}}>资产录入 </div>
                                                {dom}
                                            </Modal>
                                        );
                                    }}
                                    onFinish={async (values) => {
                                        await waitTime(1000);
                                        console.log(values.describe);
                                        setVisible(false);
                                        handleonefiles();
                                        AddList.push(
                                            {
                                                id: AssetID.toString(),
                                                name: values.name,
                                                class: values.class,
                                                father: father,
                                                count: values.count,
                                                money: values.money,
                                                datetime: values.datetime,
                                                position: values.position,
                                                describe: values.describe,
                                            }
                                        );
                                        let tempList: string[][] = [];
                                        for (let k = 0; k < ProperList.length; k = k + 1) {
                                            tempList.push([ProperList[k], form.getFieldValue(`property${k}`)]);
                                        }
                                        AllProList.push(tempList);
                                        setAssetID((e) => (e+1));
                                        setChange((e) => !e);
                                        setListKey((e) => (e+1));
                                        setfather(-1);
                                        // console.log(AddList);
                                        // console.log("--------------------");
                                        // console.log(values.datetime);
                                        // console.log("--------------------");
                                        // console.log(values.name);
                                        // console.log(values.class);
                                        // console.log(values.father);
                                        // console.log(values.count);
                                        // console.log(values.money);
                                        // console.log(values.position);
                                        // console.log(values.describe);
                                        return true;
                                    }}
                                >
                                    <StepsForm.StepForm name="base" title="资产基本信息">
                                        <ProForm.Group>
                                            <ProFormTreeSelect
                                                label="资产分类"
                                                name="class"
                                                width="lg"
                                                rules={[{ required: true, message: "这是必填项" }]} 
                                                fieldProps={{
                                                    fieldNames: {
                                                        label: "title",
                                                    },
                                                    treeData,
                                                    // treeCheckable: true,
                                                    // showCheckedStrategy: TreeSelect.SHOW_PARENT,
                                                    placeholder: "请选择资产分类",
                                                    onChange: (value) => {
                                                        changeProperList(value);
                                                    },
                                                }}
                                            />
                                        </ProForm.Group>
                                        <ProForm.Group>
                                            <ProFormText 
                                                width="lg" 
                                                name="name" 
                                                label="资产名称" 
                                                placeholder="请输入名称"
                                                rules={[{ required: true, message: "这是必填项" }]} 
                                            />
                                        </ProForm.Group>
                                        
                                        <div>
                                            <div style={{ marginBottom: "10px" }}>
                                                <span style={{ marginRight: "5px" }}>选择主资产</span>
                                                <Tooltip title="至多显示前20条搜索结果，请尽量精确搜索">
                                                    <QuestionCircleOutlined />
                                                </Tooltip>
                                            </div>
                                            <Select
                                                showSearch
                                                placeholder="输入资产名称进行搜索"
                                                defaultActiveFirstOption={false}
                                                showArrow={false}
                                                filterOption={false}
                                                onSearch={handleSearch}
                                                onChange={handlefatherchange}
                                                notFoundContent={loading1 ? "加载中..." : "无匹配结果"}
                                                style={{ width: "440px" }}
                                            >
                                                {options.map((option: AssetData) => (
                                                    <Option key={option.ID} value={option.ID}>
                                                        {option.Name + " (" + option.ID + ")"}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                    </StepsForm.StepForm>
                                    <StepsForm.StepForm name="more" title="资产详细信息">
                                        <ProForm.Group>
                                            <ProFormDigit 
                                                name="count" 
                                                label="资产数量" 
                                                width="lg"
                                                placeholder="请输入数量"
                                                rules={[{ required: true, message: "这是必填项" }]} 
                                            />
                                        </ProForm.Group>
                                        <ProForm.Group>
                                            <ProFormMoney
                                                label="资产价值"
                                                name="money"
                                                locale="zh-CN"
                                                initialValue={1.00}
                                                min={0.01}
                                                rules={[{ required: true, message: "这是必填项" }]} 
                                            />
                                        </ProForm.Group>
                                        <ProForm.Group>
                                            <ProFormDateTimePicker
                                                name="datetime"
                                                label="资产过期时间"
                                                width="lg"
                                                rules={[{ required: true, message: "这是必填项" }]}
                                                fieldProps={{
                                                    format: (value) => value.format("YYYY-MM-DD HH:mm:ss"),
                                                }}
                                            />
                                        </ProForm.Group>
                                        <ProForm.Group>
                                            <ProFormTextArea
                                                name="position"
                                                label="资产位置"
                                                width="lg"
                                                placeholder="请输入位置"
                                                rules={[{ required: true, message: "这是必填项" }]} 
                                            />
                                        </ProForm.Group>
                                        <ProForm.Group>
                                            <MyEditor
                                                name="describe"
                                                label="资产描述"
                                                width="lg"
                                                placeholder="请输入描述"
                                                rules={[{ required: true, message: "这是必填项" }]}
                                            />
                                        </ProForm.Group>
                                        <ProForm.Group tooltip="支持一次性选中多个图片，单个图片不能超过10MB" title="资产图片">
                                            <label htmlFor="upload-input" style={{marginTop:"-20px"}}className="custom-upload-button-add">
                                            </label>
                                            <input
                                                type="file"
                                                id="upload-input"
                                                onChange={handleFileChange}
                                                style={{ display: "none" }}
                                                multiple
                                            />
                                            <span id="selected-file-name"></span>
                                        </ProForm.Group>
                                        
                                    </StepsForm.StepForm>
                                    {ProperList.length > 0 && <StepsForm.StepForm name="proper" title="自定义属性">
                                        <MyForm inputCount={ProperList.length} />
                                    </StepsForm.StepForm>}
                                </StepsForm>
                            </Col>
                            <Col offset={17}>
                                <Button ref={ref4} loading={loading} type="primary" icon={<CheckOutlined />} onClick={()=>{if(!TourOpen){add();}}}>
                                    录入
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col style={{ margin: "30px", marginLeft:"28px" }}>
                                <AssetAddFromExcelUI refList={[ref2]} TourOpen={TourOpen}/>
                            </Col>
                        </Row>
                        <Row align="top">
                            <Col span={20} style={{marginLeft:"10px", fontSize:"16px"}} ref={ref3}>
                                <ProList<DataItem>
                                    key={ListKey}
                                    rowKey="id"
                                    headerTitle="待录入资产列表"
                                    
                                    dataSource={dataSource}
                                    showActions="hover"
                                    editable={{
                                        onSave: async (key, record, originRow) => {
                                            console.log(key, record, originRow);
                                            return true;
                                        },
                                    }}
                                    onDataSourceChange={setDataSource}
                                    metas={{
                                        title: {
                                            dataIndex: "name",
                                        },
                                        // subTitle: {
                                        //     render: () => {
                                        //         return (
                                        //             <Space size={0}>
                                        //                 <Tag color="blue">Ant Design</Tag>
                                        //                 <Tag color="#5BD8A6">TechUI</Tag>
                                        //             </Space>
                                        //         );
                                        //     },
                                        // },
                                        actions: {
                                            render: (text, row, index, action) => [
                                                <a
                                                    onClick={() => {
                                                        AddList.splice(index, 1);
                                                        setChange((e) => !e);
                                                    }}
                                                    key="link"
                                                >
                                                    删除
                                                </a>,
                                            ],
                                        },
                                    }}
                                />
                            </Col>
                        </Row>
                        <Tour open={TourOpen} onClose={() => setTourOpen(false)} steps={steps} />
                    </Content>
                </Layout>
            </Layout >
        );
    };
};

export default App;