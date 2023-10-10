import { Menu, Modal } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IfCodeSessionWrong, LoadSessionID } from "../utils/CookieOperation";
import { request } from "../utils/network";
import { AppData } from "../utils/types";
import { AppstoreOutlined, MailOutlined, SettingOutlined, HomeOutlined, 
    PartitionOutlined,TeamOutlined,DatabaseOutlined,GoldOutlined,BellOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";


type MenuItem = Required<MenuProps>["items"][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: "group",
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
        type,
    } as MenuItem;
}

const items: MenuProps["items"] = [
    getItem("Navigation One", "sub1", <MailOutlined />, [
        getItem("Item 1", "g1", null, [getItem("Option 1", "1"), getItem("Option 2", "2")], "group"),
        getItem("Item 2", "g2", null, [getItem("Option 3", "3"), getItem("Option 4", "4")], "group"),
    ]),

    getItem("Navigation Two", "sub2", <AppstoreOutlined />, [
        getItem("Option 5", "5"),
        getItem("Option 6", "6"),
        getItem("Submenu", "sub3", null, [getItem("Option 7", "7"), getItem("Option 8", "8")]),
    ]),

    { type: "divider" },

    getItem("Navigation Three", "sub4", <SettingOutlined />, [
        getItem("Option 9", "9"),
        getItem("Option 10", "10"),
        getItem("Option 11", "11"),
        getItem("Option 12", "12"),
    ]),

    getItem("Group", "grp", null, [getItem("Option 13", "13"), getItem("Option 14", "14")], "group"),
];


// submenu keys of first level
const SiderMenu = ({ UserAuthority }: { UserAuthority: number }) => {
    const [AppList, setAppList] = useState<AppData[]>(); // 储存所有已有应用的信息
    const router = useRouter();
    const query = router.query;
    const [openKeys, setOpenKeys] = useState(["sub1"]);
    const [OuterAppList,setOuterAppList] = useState<AppData[]>(); // 储存外部应用的信息

    const items_super:MenuProps["items"] = [    //超级管理员侧边栏
        getItem("首页", "1", <HomeOutlined />),
        getItem("业务实体管理", "2", <PartitionOutlined />),
    ];
    
    const items_system:MenuProps["items"] = [   //系统管理员侧边栏
        getItem("首页", "1", <HomeOutlined />),
        // <CompassOutlined />
        // <ApartmentOutlined />
        // <TeamOutlined />
        // <PartitionOutlined />
        getItem("员工管理", "2", <TeamOutlined />, [
            getItem("用户列表", "2-1"),
            getItem("部门管理", "2-2"),
        ]),
        getItem("应用管理", "3", <AppstoreOutlined />),
        getItem("操作日志", "4", <DatabaseOutlined />),
    ];
    const items_asset:MenuProps["items"] = [    //资产管理员侧边栏
        getItem("首页", "1", <HomeOutlined />),
        getItem("消息列表", "2", <BellOutlined />),
        getItem("资产管理", "3", <GoldOutlined />, [
            getItem("资产定义", "3-1"),
            getItem("资产录入", "3-2"),
            getItem("资产审批", "3-3"),
            getItem("资产变更", "3-4"),
            getItem("资产查询", "3-5"),
            getItem("资产统计", "3-6"),
            getItem("资产告警", "3-7"),
        ]),
        getItem("外部应用", "4", <AppstoreOutlined />, OuterAppList?.map((item,id)=>( getItem(item.AppName, item.AppUrl)))),
    ];
    const items_employee:MenuProps["items"] = [ //员工侧边栏
        getItem("首页", "1", <HomeOutlined />),
        getItem("消息列表", "2", <BellOutlined />),
        getItem("资产管理", "3", <GoldOutlined />),
        getItem("外部应用", "4", <AppstoreOutlined />, OuterAppList?.map((item,id)=>( getItem(item.AppName, item.AppUrl)))),
    ];
    const GetOuterApp = (Authority:number) =>{
        request(
            `/api/User/NewApp/${LoadSessionID()}/${Authority}`,"GET"
        )
            .then((res) => {
                setOuterAppList(res.AppList);
                console.log(res.AppList);
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
        if(UserAuthority===2||UserAuthority===3){
            GetOuterApp(UserAuthority);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, query]);
    const super_onCLick: MenuProps["onClick"] = (e) => {
        switch (e.key){
        case "1": router.push("/main_page"); return;
        case "2": router.push("/user/super_manager"); return;
        default: router.push("/main_page"); return;
        }
    };
    const system_onCLick: MenuProps["onClick"] = (e) => {
        switch (e.key){
        case "1": router.push("/main_page"); return;
        case "2-1": router.push("/user/system_manager"); return;
        case "2-2": router.push("/user/system_manager/department"); return;
        case "3": router.push("/user/system_manager/application"); return;
        case "4": router.push("/user/system_manager/log"); return;
        default: router.push("/main_page"); return;
        }
    };
    
    const asset_onCLick: MenuProps["onClick"] = (e) => {
        switch (e.key){
        case "1": router.push("/main_page"); return;
        case "2": router.push("/user/asset_manager/message"); return;
        case "3-1": router.push("/user/asset_manager/asset_define"); return;
        case "3-2": router.push("/user/asset_manager/asset_add"); return;
        case "3-3": router.push("/user/asset_manager/apply_approval"); return;
        case "3-4": router.push("/user/asset_manager/asset_change"); return;
        case "3-5": router.push("/user/asset_manager/asset_info"); return;
        case "3-6": router.push("/user/asset_manager/asset_statistic"); return;
        case "3-7": router.push("/user/asset_manager/asset_warn"); return;
        default: window.location.href = e.key; return;
        }
    };
    const employee_onCLick: MenuProps["onClick"] = (e) => {
        switch (e.key){
        case "1": router.push("/main_page"); return;
        case "2": router.push("/user/employee/message"); return;
        case "3": router.push("/user/employee"); return;
        default: window.location.href = e.key; return;
        }
    };
    const employee_now = () => {
        switch (router.pathname){
        case "/main_page": return ["1"];
        case "/user/employee/message": return ["2"];
        case "/user/employee": return ["3"];
        default: return ["1"];
        }
    };
    const asset_now = () => {
        switch (router.pathname){
        case "/main_page": return ["1"];
        case "/user/asset_manager/message": return ["2"];
        case "/user/asset_manager/asset_define": return ["3-1"];
        case "/user/asset_manager/asset_add": return ["3-2"];
        case "/user/asset_manager/apply_approval": return ["3-3"];
        case "/user/asset_manager/asset_change": return ["3-4"];
        case "/user/asset_manager/asset_info": return ["3-5"];
        case "/user/asset_manager/asset_statistic": return ["3-6"];
        case "/user/asset_manager/asset_warn": return ["3-7"];
        default: return ["1"];
        }
    };
    const system_now = () => {
        switch (router.pathname){
        case "/main_page": return ["1"];
        case "/user/system_manager": return ["2-1"];
        case "/user/system_manager/department": return ["2-2"];
        case "/user/system_manager/application": return ["3"];
        case "/user/system_manager/log": return ["4"];
        default: return ["1"];
        }
    };
    const super_now = () => {
        switch (router.pathname){
        case "/main_page": return ["1"];
        case "/user/super_manager": return ["2"];
        default: return ["1"];
        }
    };
    const handleUser = (App: AppData) => {
        if (App.AppUrl != "empty") {
            if (App.IsInternal) router.push(App.AppUrl);
            else window.location.href = App.AppUrl;
        }
    };
    const menuItems = AppList ? AppList.map((AppInfo, index) => (
        <Menu.Item key={index} disabled={AppInfo.IsLock} onClick={() => {
            if (AppInfo.AppUrl != "empty") {
                if (AppInfo.IsInternal) router.push(AppInfo.AppUrl);
                else window.location.href = AppInfo.AppUrl;
            }
        }}>
            {AppInfo.AppName}
        </Menu.Item>
    )) : [];
    const get_now = ()=>{
        switch (UserAuthority){
        case 0:return super_now() ;
        case 1:return system_now(); 
        case 2:return asset_now(); 
        case 3:return employee_now();
        }
    };
    const get_items = ()=>{
        switch (UserAuthority){
        case 0:return items_super ;
        case 1:return items_system; 
        case 2:return items_asset; 
        case 3:return items_employee;
        }
    };
    return (
        <>
            <div className="blank">
                <img src="/company.png" className="img_style_main" />
            </div>
            {/* <Menu mode="inline">
                <Menu.Item key={30} onClick={() => { router.push("/main_page"); }}>
                    {"首页"}
                </Menu.Item>
                {UserAuthority == 3 && <Menu.Item key={40} onClick={() => { router.push("/user/employee/message"); }}>
                    消息列表
                </Menu.Item>}
                {UserAuthority == 2 && <Menu.Item key={40} onClick={() => { router.push("/user/asset_manager/message"); }}>
                    消息列表
                </Menu.Item>}
                {menuItems}
            </Menu> */}
            <Menu
                onClick={(e)=>{
                    switch (UserAuthority){
                    case 0:super_onCLick(e); return;
                    case 1:system_onCLick(e); return;
                    case 2:asset_onCLick(e); return;
                    case 3:employee_onCLick(e); return;
                    }
                }}
                defaultSelectedKeys={
                    get_now()
                }
                mode="inline"
                items={get_items()}
                style={{fontWeight: "bold",fontSize:"18px"}}
            />
        </>
    );
};
export default SiderMenu;