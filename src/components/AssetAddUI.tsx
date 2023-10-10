import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormTextArea,
    ProFormText,
    ProFormTreeSelect,
    ProFormSelect,
    ProFormMoney,
} from "@ant-design/pro-components";
import { useRouter } from "next/router";
import { Button, Form, message, TreeSelect, Modal, Space, Tag } from "antd";
import { LoadSessionID } from "../utils/CookieOperation";
import { request } from "../utils/network";
import { useState } from "react";

const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};

// const treeData = [
//     {
//         title: "Node1",
//         value: "0",
//         children: [
//             {
//                 title: "Child Node1",
//                 value: "2",
//             },
//         ],
//     },
//     {
//         title: "Node2",
//         value: "1",
//         children: [
//             {
//                 title: "Child Node3",
//                 value: "3",
//             },
//             {
//                 title: "Child Node4",
//                 value: "4",
//             },
//             {
//                 title: "Child Node5",
//                 value: "5",
//             },
//         ],
//     },
// ];

const defaultData = [
    {
        id: "1",
        name: "语雀的天空",
        image:
        "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
        desc: "我是一条测试的描述",
    },
    {
        id: "2",
        name: "Ant Design",
        image:
        "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
        desc: "我是一条测试的描述",
    },
    {
        id: "3",
        name: "蚂蚁金服体验科技",
        image:
        "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
        desc: "我是一条测试的描述",
    },
    {
        id: "4",
        name: "TechUI",
        image:
        "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
        desc: "我是一条测试的描述",
    },
];

  type DataItem = (typeof defaultData)[number];

const AssetAddUI = () => {
    const [form] = Form.useForm<{ name: string; class: string; father: number; count: number; money: number; position: string; describe: string }>();
    const router = useRouter();
    const query = router.query;
    const [treeData, setAsset] = useState<[]>(); // 储存资产列表树
    const [dataSource, setDataSource] = useState<DataItem[]>(defaultData);
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
        <div>
            <ModalForm<{
                name: string;
                class: string;
                father: number;
                count: number;
                money: number;
                position: string;
                describe: string;
            }>
                title="新建资产"
                trigger={
                    <Button type="primary">
                        <PlusOutlined />
                        新建资产
                    </Button>
                }
                form={form}
                autoFocusFirstInput
                modalProps={{
                    destroyOnClose: true,
                    onCancel: () => console.log("run"),
                }}
                submitTimeout={2000}
                onFinish={async (values) => {
                    await waitTime(2000);
                    console.log(values.name);
                    console.log(values.class);
                    console.log(values.father);
                    console.log(values.count);
                    console.log(values.money);
                    console.log(values.position);
                    console.log(values.describe);
                    message.success("提交成功");
                    return true;
                }}
            >
                <ProForm.Group>
                    <ProFormText 
                        width="lg" 
                        name="name" 
                        label="资产名称" 
                        placeholder="请输入名称"
                        rules={[{ required: true, message: "这是必填项" }]} 
                    />
                </ProForm.Group>
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
                        }}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormSelect
                        name="father"
                        label="所属主资产"
                        width="lg"
                        tooltip="如果该资产有所属的主资产，请在这里添加"
                        valueEnum={{
                            1: "资产1",
                            2: "资产2",
                        }}
                        placeholder="请选择所属的主资产"
                    />
                </ProForm.Group>
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
                        initialValue={0.00}
                        min={0}
                        rules={[{ required: true, message: "这是必填项" }]} 
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormTextArea
                        name="position"
                        label="资产位置"
                        width="lg"
                        placeholder="请输入位置"
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormTextArea
                        name="describe"
                        label="资产描述"
                        width="lg"
                        placeholder="请输入描述"
                    />
                </ProForm.Group>
            </ModalForm>
            {/* <ProList<DataItem>
                rowKey="id"
                headerTitle="基础列表"
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
                    avatar: {
                        dataIndex: "image",
                        editable: false,
                    },
                    description: {
                        dataIndex: "desc",
                    },
                    subTitle: {
                        render: () => {
                            return (
                                <Space size={0}>
                                    <Tag color="blue">Ant Design</Tag>
                                    <Tag color="#5BD8A6">TechUI</Tag>
                                </Space>
                            );
                        },
                    },
                    actions: {
                        render: (text, row, index, action) => [
                            <a
                                onClick={() => {
                                    action?.startEditable(row.id);
                                }}
                                key="link"
                            >
                                编辑
                            </a>,
                        ],
                    },
                }}
            /> */}
        </div>
        
        
    );
};
export default AssetAddUI;