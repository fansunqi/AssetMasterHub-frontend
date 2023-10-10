import React, {useState} from "react";
import { 
    UploadOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { Button, Upload, Modal, message, Space } from "antd";
import * as XLSX from "xlsx";
import { request } from "../utils/network";
import { LoadSessionID } from "../utils/CookieOperation";
import moment from "moment";

interface ProDic {
    [key: string]: string;
}

interface MyDic {
    [key: string]: string | ProDic;
}

interface SendDic {
    [key: string]: MyDic[];
}

let AddList: MyDic[] = [];
interface AssetAddFromExcelProps {
    refList:React.MutableRefObject<any>[];
    TourOpen:boolean;
}
const AssetAddFromExcelUI = (props:AssetAddFromExcelProps) => {
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [itemlist, setitemlist] = useState<any[]>([]);
    const [file, setFile] = useState(null);

    const handleOk = () => {
        setConfirmLoading(true);
        for (let i = 0; i < itemlist.length; i++) {
            const item = itemlist[i];
            const keys = Object.keys(item);
            let now_dic: MyDic = {};
            let pro_dic: ProDic = {};
            // 遍历所有键并访问键值
            keys.forEach(key => {
                const value = item[key];
                if (key == "资产名称") {
                    now_dic["Name"] = value;
                }
                else if (key == "资产分类") {
                    now_dic["Type"] = value;
                }
                else if (key == "资产数量") {
                    now_dic["Number"] = value;
                }
                else if (key == "资产价值") {
                    now_dic["Value"] = value;
                }
                else if (key == "资产位置") {
                    now_dic["Position"] = value;
                }
                else if (key == "资产描述") {
                    now_dic["Describe"] = value;
                }
                else if (key == "资产过期时间") {
                    const excelSerialDate = parseFloat(value);
                    const excelStartDate = moment("1900-01-01");
                    const datetime = excelStartDate.add(excelSerialDate-2, "days").format("YYYY-MM-DD HH:mm:ss");
                    now_dic["Time"] = datetime;
                }
                else {
                    pro_dic[key] = value;
                }
            });
            now_dic["Property"] = pro_dic;
            AddList.push(now_dic);
        }
        const selectedFileName = document.getElementById("selected-file-name-excel");
        if(selectedFileName) selectedFileName.textContent = "";
        request(
            `/api/Asset/MutiAppend/${LoadSessionID()}`,
            "POST",
            {
                chusheng: AddList,
            }
        )
            .then((res) => {
                message.success("提交成功");
                setOpen(false);
                setConfirmLoading(false);
                AddList = [];
            })
            .catch((err) => {
                setOpen(false);
                setConfirmLoading(false);
                Modal.error({
                    content: err.message.substring(5),
                });
                AddList = [];
            });
    };

    const showModal = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        console.log("Clicked cancel button");
        setOpen(false);
    };

    // const handleBeforeUpload = (file: any) => {
    //     return false;
    // };

    const handleUpload = (event: any) => {
        const file = event.target.files[0];
        const selectedFileName = document.getElementById("selected-file-name-excel");
        if(selectedFileName) selectedFileName.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target?.result as ArrayBuffer;
            const workbook = XLSX.read(fileContent, { type: "array" });
            const Sheet = workbook.Sheets["Sheet1"];
            const Data_json = XLSX.utils.sheet_to_json(Sheet);
            const Data_list = Array.from(Data_json.values()) as any[];
            setitemlist(Data_list);
            console.log(fileContent);
        };
        reader.readAsArrayBuffer(file);   
    };
      
    return (
        <div>
            <Button ref = {props.refList[0]} type="primary" onClick={()=>{if(!props.TourOpen){showModal();}}} icon={<PlusOutlined/>}>
                通过Excel批量录入
            </Button>
            <Modal title="通过Excel批量录入"
                open={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                destroyOnClose={true}
            >   
                <a href="https://cloud.tsinghua.edu.cn/f/9d0da52504d74bcbb1e8/?dl=1" target="_blank" rel="noopener noreferrer">点此下载模板文件</a>
                <br />
                <br />
                <input
                    type="file"
                    id="upload-input-excel"
                    onChange={handleUpload}
                    style={{ display: "none" }}
                />
                <label htmlFor="upload-input-excel" className="custom-upload-button">
                </label>
                <Space style={{width:"20px"}}> </Space>
                <span id="selected-file-name-excel"></span>
                {/* <input type="file" onChange={handleUpload} /> */}
            </Modal>
            
        </div>       
    );
};

export default AssetAddFromExcelUI;