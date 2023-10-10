export type Board = (0 | 1)[][];

/**
 * @note 用于前后端交互的 Board 数据格式
 */
export interface BoardMetaData {
    id: number;
    name: string;
    createdAt: number;
    userName: string;
}

export interface AssetData{
    Name: string;   //资产名称
    ID: number;   //资产编号 (唯一标识) （不同的产品可能有不同的ID)
    Status: number;  //0-4，生命周期状态
    Owner: string;  //所有者 (可以是任意字符串) （不同的产品可能有不同的Owner）
    Description: string; 	//描述 (可以是任意字符串) （不同的产品可以有不同的Description）
    CreateTime: string;
    IsReceive: boolean;  //是否可以领用（目前资产在该部门的资产管理员下且状态为闲置中
    IsReturn: boolean;  //是否可以退库（目前资产在该员工名下且状态为使用中）
    IsMaintenance: boolean; //是否可以维保（目前资产在该员工名下且状态为使用中）
    IsTransfers: boolean;   //是否可以转移（目前资产在该员工名下且状态为使用中）
    Class:string;   //资产所属的固定分类
    Time:string;    //资产的截至时间
    Number:number;  //如果是数量型资产，表示资产数量，如果不是数量型则返回1
    Type:number;  //0就是条目型，1就是数量型
    Position:string;
    AssetValue:number;
}

export interface ApplyApprovalData{
    Name:string;
    AssetID:string;
    ApplyID:string;     //这次申请的ID
    ApplyTime:string;   //提出申请的时间
    Operation:number;   //0：领用，1：退库，2：维保，3：转移
    FromPerson:string;  //所有操作本质上都是从一个人的名下转到另一个人名下，这里写源员工/资产管理员名
    ToPerson:string;    //这里写目标员工/资产管理员名
    Applicant:string;   //提出申请的人
    Valid:boolean;  //0表示不可以被同意，对应的情况比如多个人申请同一个资产，但资产管理员刚刚同意把资产转移到另一个人名下，那么其他人提出的申请就是无效的，虽然要向资产管理员展示但资产管理员只能驳回申请
    Message:string;
}

export interface AppData {
    IsInternal: boolean;
    IsLock: boolean;
    AppName: string;
    AppUrl: string;
}
export interface NewAppData {
    IsInternal: boolean;
    IsLock: boolean;
    AppName: string;
    AppUrl: string;
    AppImage:string;
}
export interface CardUIProps {
    state: number;
    appname: string;
    img: string;
    url: string;
    internal:boolean;
}

export interface MemberData {
    Name: string;
    Department: string;
    Authority: number;
    lock: boolean;
}
export interface DepartmentData {
    DepartmentName: string;
    DepartmentPath: string;
    DepartmentId: number;
}
export interface DepartmentPathData {
    Name: string;
    Path: string;
}
export interface DataType {
    key: React.Key;
    Name: string;
    Department: string;
    Authority: number;
    lock: boolean;
}
export interface AssetHistory{
    Review_Time:string,
    ID:number,
    Type:number,
    Initiator:string,
    Participant:string,
    Asset_Admin:string,
}
export interface AssetDetailInfo{
    Name:string,
    ID:number,
    Status:number,
    Owner:string,
    Description:string,
    CreateTime:string,
    History:AssetHistory[],
    PropetyName:string[],  //自定义属性，键
    PropetyValue:string[], //自定义属性，值
    Class:string,
    LabelVisible:LabelVisible,
    ImageUrl:string[],
    AssetValue:number,  //（资产的价值，实时更新，需要支持小数）
    Type:number,    //如果是0就是条目型，1就是数量型
    LossStyle:number,  //0代表指数折旧，1代表线性折旧
    Time:string,    //过期时间
    Position:string,  //位置
    Parent:string,  //父条目
    Volume:number,  //如果是数量型资产，返回数量，如果是条目型返回1

}

export interface LabelVisible{
    Name:boolean,
    Status:boolean,
    Owner:boolean,
    Description:boolean,
    CreateTime:boolean,
    Class: boolean,
}
const url_list = [
    "https://cs-company.oss-cn-beijing.aliyuncs.com/test/blue.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/test/chess1.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/test/chess2.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/test/green.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/test/player.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/test/okset.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/asset_label/1.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/asset_label/47.png",
    "https://cs-company.oss-cn-beijing.aliyuncs.com/asset_label/53.png",
];

export const TestDetailInfo: AssetDetailInfo = {
    Name: "测试资产",
    ID: 1,
    Status: 1,
    Owner: "张三",
    Description: "这是一个测试资产",
    CreateTime: "2022-04-23",
    Class: "一本好书",
    History: [
        {
            Review_Time: "2022-04-23",
            ID: 1,
            Type: 1,
            Initiator: "李四",
            Participant: "王五",
            Asset_Admin: "赵六",
        },
        {
            Review_Time: "2022-04-22",
            ID: 2,
            Type: 2,
            Initiator: "王五",
            Participant: "赵六",
            Asset_Admin: "李四",
        },
        {
            Review_Time: "2022-04-21",
            ID: 3,
            Type: 3,
            Initiator: "赵六",
            Participant: "李四",
            Asset_Admin: "王五",
        },
    ],
    PropetyName: ["大小", "高低"],
    PropetyValue: ["100", "200"],
    LabelVisible: {
        Name: true,
        Class: true,
        Status: true,
        Owner: true,
        Description: true,
        CreateTime: false,
    },
    ImageUrl:url_list,
    Type:1,
    AssetValue:90.8,
    LossStyle:1,
    Time:"2023-05-24 20:05:45",
    Position:"老北京",
    Parent:"父资产1",
    Volume:1234,

};