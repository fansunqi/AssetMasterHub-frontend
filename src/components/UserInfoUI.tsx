import React from "react";
import {
    DownOutlined, LogoutOutlined, UserOutlined, BellOutlined, PoweroffOutlined
} from "@ant-design/icons";
import { Space, Modal, Button, Dropdown, Row, Descriptions, Card, Spin, Menu } from "antd";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { request } from "../utils/network";
import { LoadSessionID, logout, IfCodeSessionWrong } from "../utils/CookieOperation";
import type { MenuProps } from "antd";
import { renderAuthority } from "../utils/transformer";
import { Image } from "antd-mobile";
type MenuItem = Required<MenuProps>["items"][number];
import OSS from "ali-oss";
interface UserinfoProps {
    Name: string;
    Authority: number;
    Department: string;
    Entity: string;
    TODO: boolean;
    TOREAD: boolean;
    Profile:boolean;
    ID:number;
}
const UserInfo = (props:UserinfoProps) => {
    const router = useRouter();
    const query = router.query;
    const [ProfileUrl, setProfileUrl] = useState("");
    const [state, setState] = useState(false);  //路径保护变量
    const [LogoutLoadings, setLogoutLoadings] = useState<boolean>(true); //登出按钮是否允许点击
    const [Logouting, setLogouting] = useState<boolean>(false); //登出是否正在进行中
    const TODOitems: MenuProps["items"] = [
        {
            key: "1",
            label: (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    {props.Authority == 2 && props.TODO && <Button
                        type="link"
                        style={{ margin: "auto" }}
                        onClick={() => {
                            router.push("/user/asset_manager/apply_approval");
                        }}
                    >
                        您有新的待办事项
                    </Button>}
                    {props.Authority == 2 && !props.TODO && <Button
                        type="link"
                        style={{ margin: "auto" }}
                    >
                        暂无新待办事项
                    </Button>}
                </div>
            ),
        },
        {
            key: "2",
            label: (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    {props.TOREAD && <Button
                        type="link"
                        style={{ margin: "auto" }}
                        onClick={() => {
                            router.push("/user/message");
                        }}
                    >
                        您有新的消息
                    </Button>}
                    {props.Authority == 2 && !props.TODO && <Button
                        type="link"
                        style={{ margin: "auto" }}
                    >
                        暂无新消息
                    </Button>}
                </div>
            ),
        },
    ];
    const items: MenuProps["items"] = [
        {
            key: "1",
            label: (
                <Descriptions title={props.Name} bordered>
                    <Descriptions.Item label="身份" span={2}>
                        <UserOutlined /> {renderAuthority(props.Authority)}
                    </Descriptions.Item>
  
                    {props.Authority !== 0 && (
                        <Descriptions.Item label="业务实体" span={2}>
                            {props.Entity}
                        </Descriptions.Item>
                    )}

                    {(props.Authority === 2 || props.Authority === 3) && (
                        <Descriptions.Item label="部门" span={2}>
                            {props.Department}
                        </Descriptions.Item>
                    )}
                </Descriptions>
            ),
        },

    ];
    const logoutSendMessage = () => {
        request(
            "/api/User/logout",
            "POST",
            { SessionID: LoadSessionID(), }
        )
            .then(() => {setLogouting(true); router.push("/");})
            .catch((err) => { setLogoutLoadings(false); router.push("/"); });
    };

    const enterLoading = () => {
        setTimeout(() => {
            setLogoutLoadings(false);
        }, 1000);
    };
    const getProfile = async () => {
        // 获取头像url
        const ossClient = new OSS({
            accessKeyId: "LTAI5tMmQshPLDwoQEMm8Xd7",
            accessKeySecret: "YG0kjDviIqxkz9GtTZGTLhhlVsPqID",
            region: "oss-cn-beijing",
            bucket: "cs-company",
            secure: true // true for https
        });
        ossClient.get(`/Profile/${props.ID}.png`)
            .then(response => {
                const blob = new Blob([response.content], response.res.headers);
                setProfileUrl(URL.createObjectURL(blob));
            })
            .catch(error => {
                setProfileUrl("https://cs-company.oss-cn-beijing.aliyuncs.com/icon/default_icon.png");
                console.log(error);
            });
    };
    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        // FetchUserinfo();
        getProfile();
        enterLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query, props]);
    const DropdownMenu = (
        <Menu>
            {props.Authority==2 && props.TODO && 
                <Menu.Item key="1" onClick={() => router.push("/user/asset_manager/apply_approval")}>
                    您有新的待办事项
                </Menu.Item>
            }
            {props.Authority==2 && !props.TODO && 
                <Menu.Item key="2">
                    暂无待办事项
                </Menu.Item>
            }
            {props.TOREAD && 
                <Menu.Item key="3" onClick={() => {if(props.Authority == 3) router.push("/user/employee/message");else router.push("/user/asset_manager/message");}}>
                    您有新的消息
                </Menu.Item>
            }
            {!props.TOREAD && 
                <Menu.Item key="4" onClick={() => {}}>
                    暂无新消息
                </Menu.Item>
            }
        </Menu>
    );
    return (
        <>
            <div className="logo" color="#fff" >CSCompany 资产管理系统</div>
            <div className="right-menu">
                <Dropdown  menu={{ items }}>
                    <Button type = "text" icon={<Image
                        key="111"
                        src={ProfileUrl}
                        fit="cover"
                        style={{marginTop:"-10px", width: "40px", height: "40px",  borderRadius: 100 }}
                        alt={"111"}
                        lazy
                    /> }></Button>
                </Dropdown>
                <Space>{""}</Space>
                {(!props.TODO && !props.TOREAD) && <Dropdown overlay={DropdownMenu}>
                    <Button type = "text" className="header_button" icon={<BellOutlined />}>消息列表<DownOutlined /></Button>
                </Dropdown>}
                {(props.Authority==2 || props.Authority==3) && (props.TODO || props.TOREAD) && <Dropdown overlay={DropdownMenu}>
                    <Button type = "text" className="header_button has_unread">
                        <span className="badge"></span>
                        <BellOutlined/>
                            消息列表
                        <DownOutlined />
                    </Button>
                </Dropdown>}
                <Button type = "text" loading = {LogoutLoadings} className="header_button" icon={<PoweroffOutlined />} onClick={() => { setLogoutLoadings(true);logoutSendMessage();logout(); }}>退出登录</Button>
            </div>
        </>
    );
};
export default UserInfo;