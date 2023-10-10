import { AssetDetailInfo, LabelVisible } from "../utils/types";
import { ProCard } from "@ant-design/pro-components";
import { DateTransform, renderStatus, renderValue, renderKey } from "../utils/transformer";
import { QRCode } from "react-qr-svg"; // 引入生成二维码的组件
import { Row, Col } from "antd";

function getVisibleKeys(obj: LabelVisible): (keyof LabelVisible)[] {
    return Object.keys(obj).filter(key => obj[key as keyof LabelVisible]) as (keyof LabelVisible)[];
};
const LabelDef = (props: { DetailInfo: AssetDetailInfo | undefined, LabelVisible: LabelVisible }) => {
    // const visibleKeys = Object.keys(props.LabelVisible).filter(key => props.LabelVisible[key]) as (keyof LabelVisible)[];
    // const qrcodeData = `https://cs-company-frontend-debug-cses.app.secoder.net/assets?id=${props.DetailInfo?.ID}`; // 二维码的链接地址
    const qrcodeData = `https://cs-company-frontend-cses.app.secoder.net/assets?id=${props.DetailInfo?.ID}`; // 二维码的链接地址
    const visableKeys = getVisibleKeys(props.LabelVisible);
    const rows = [];
    for (let i = 0; i < visableKeys.length; i += 2) {
        const key1 = visableKeys[i];
        const key2 = visableKeys[i + 1];
        const value1 = renderValue(key1, props.DetailInfo);
        const value2 = renderValue(key2, props.DetailInfo);
        const col1 =
                <ProCard title=<div style={{ fontWeight: "bold" }}>{renderKey(key1)}</div>>
                    {value1}
                </ProCard>;
        const col2 =
                <ProCard title=<div style={{ fontWeight: "bold" }}>{renderKey(key2)}</div>>
                    {value2}
                </ProCard>;
        rows.push([col1, col2]);
    }
    return (
        <div >
            <ProCard split="horizontal" style={{ height: "300px" }}>
                <Row>
                    <Col span={18}>
                        <div style={{ height: "100%" }}>

                            {rows.map(row => (
                                <ProCard split="vertical" key={row.join()}>
                                    {row}
                                </ProCard>
                            ))}
                        </div>
                    </Col>
                    <Col span={6} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <QRCode
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                                level="Q"
                                style={{ width: 128 }}
                                value={qrcodeData}
                            />
                        </div>
                    </Col>
                </Row>

                <br></br>
            </ProCard>
        </div>
    );
};
export default LabelDef;