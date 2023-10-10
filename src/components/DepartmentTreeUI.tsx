import React from "react";
import ReactEcharts from "echarts-for-react";

interface DataItem {
    name: string;
    children?: DataItem[];
}
  
interface MyTreeChartComponentProps {
    data: DataItem[];
}

const DepartmentTree: React.FC<MyTreeChartComponentProps> = ({ data }) => {

    const option = {
        tooltip: {
            trigger: "item",
            triggerOn: "mousemove",
            formatter: (params: any) => {
                const { name } = params;
                return `${name}`;
            },
        },
        series: [
            {
                type: "tree",
                data: data, // 使用传入的数据
                top: "5%",
                left: "10%",
                bottom: "5%",
                right: "15%",
                symbolSize: 9,
                label: {
                    position: "top",
                    verticalAlign: "middle",
                    align: "middle",
                    fontSize: 14,
                },
                leaves: {
                    label: {
                        position: "right",
                        verticalAlign: "middle",
                        align: "left",
                    },
                },
                expandAndCollapse: false,
                animationDuration: 550,
                animationDurationUpdate: 750,
                emphasis: {
                    focus: "descendant", // 设置焦点样式，让子节点显示高亮效果
                    blurScope: "coordinateSystem",
                    scale: 2,
                    position: "top",
                    label: {
                        show: true,
                        formatter: (params: any) => {
                            const { data } = params;
                            if (data) {
                                return data.name; // 根据数据的结构获取节点名称
                            }
                            return "";
                        },
                        color: "black",
                        fontSize: 18,
                        fontWeight: "bold",
                    },
                },
            },
        ],
    };

    return <ReactEcharts 
        style={{height: "1500px",width:"1500px"}}
        option={option}
    />;
};
  

export default DepartmentTree;
