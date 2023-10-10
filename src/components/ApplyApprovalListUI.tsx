import React from "react";
import {Space, Table, Button, Modal, Empty } from "antd";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { request } from "../utils/network";
import { LoadSessionID, IfCodeSessionWrong } from "../utils/CookieOperation";
import { ApplyApprovalData } from "../utils/types"; //对列表中数据的定义在 utils/types 中
import { ProTable, ProColumns, ActionType } from "@ant-design/pro-components";
import { DateTransform } from "../utils/transformer";

interface AssetListProps {
    Assets: ApplyApprovalData[]
}
interface ApplyApprovalListProps {
    refList:React.MutableRefObject<any>[];
}
const ApplyApprovalList = (props:ApplyApprovalListProps) => {
    const [Loading, setLoading] = useState(false);
    const [ApplyReason, setApplyReason] = useState("");      //申请理由
    const [ShowApplyReason, setShowApplyReason] = useState(false); //显示申请理由Modal
    const handleApproval = (type: boolean, approval_id: string) => {
        setLoading(true);
        request(`/api/Asset/Approval/${LoadSessionID()}`, "POST",
            {
                "IsApproval": type,
                "Approval": [approval_id],
            }
        )
            .then(() => {
                Modal.success({
                    title: "批复成功",
                    content: type ? "成功批准请求" : "成功驳回请求",
                });
                setLoading(false);
                ref.current?.reload();  //重新渲染表格
            })
            .catch(
                (err: string) => {
                    if (IfCodeSessionWrong(err, router)) {
                        Modal.error({
                            title: "批复失败",
                            content: err.toString().substring(5),
                        });
                    }
                    ref.current?.reload();
                }
            );
    };
    const columns: ProColumns<ApplyApprovalData>[] = [
        {
            title: "申请编号",
            dataIndex: "ApplyID",
            key: "ApplyID",
            width:"80px"
        },
        {
            title: "资产名",
            dataIndex: "Name",
            key: "Name",
        },
        {
            title: "申请者",
            dataIndex: "Applicant",
            key: "Applicant",
        },
        {
            title: "申请类型",
            dataIndex: "Operation",
            key: "Operation",
            valueType: "select",
            valueEnum: {
                0: {
                    text: "领用",
                    status: "Success",
                },
                1: {
                    text: "退库",
                    status: "Error",
                },
                2: {
                    text: "维保",
                    status: "Warning",
                },
                3: {
                    text: "转移",
                    status: "Processing",
                }
            },
        },
        {
            title: "申请时间",
            dataIndex: "ApplyTime",
            key: "ApplyTime",
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
                return (
                    <Space>
                        <Button ref={props.refList[0]} loading={Loading} type="primary" disabled={!record.Valid} onClick={() => { handleApproval(true, record.ApplyID); }}>同意申请</Button>
                        <Button ref={props.refList[1]} loading={Loading} danger onClick={() => { handleApproval(false, record.ApplyID); }}>驳回申请</Button>
                        <Button ref={props.refList[2]} type="link" onClick={() => { setApplyReason(record.Message); setShowApplyReason(true); }}> 查看申请理由</Button>
                    </Space>
                );
            },
            width:"400px"
        }
    ];
    const router = useRouter();
    const query = router.query;
    const ref = useRef<ActionType>();
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
    }, [router, query]);

    return (
        <div>

            <ProTable
                columns={columns}
                options={false}
                // dataSource={TestData}
                actionRef={ref}
                request={async (params = {}) =>
                    request(`/api/Asset/Approval/${LoadSessionID()}`, "GET")
                        .then(response => {    // 将request请求的对象保存到state中
                            // 对获取到的信息进行筛选，其中创建时间设为不可筛选项，描述、物品名称和所有者设为包含搜索，状态和ID设为严格搜索
                            // TODO ID到底是number还是string，前后端统一一下
                            // TODO 强等于弱等于的问题，暂时没去管
                            return Promise.resolve({ data: response.ApprovalList, success: true });
                        })
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
                // scroll={{ x: "100%", y: "calc(100vh - 300px)" }}
                pagination={{
                    showSizeChanger: false
                }}
                scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
                search={false}
                tooltip={false}

            // /* </ConfigProvider> */ 
            // /* </div> */ 
            />

            <Modal title="申请理由" open={ShowApplyReason} onOk={() => setShowApplyReason(false)} onCancel={() => setShowApplyReason(false)}>
                <div style={{ maxHeight: "400px", minHeight: "50px", overflowY: "auto" }}>
                    {ApplyReason != ""
                        ?
                        <span>
                            {ApplyReason}
                        </span>
                        :
                        <Empty
                            description={
                                <span>
                                    无申请信息
                                </span>}
                        />}
                </div>
            </Modal>
        </div>
    );
};
export default ApplyApprovalList;