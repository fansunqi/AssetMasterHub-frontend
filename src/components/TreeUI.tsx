import React from "react";
import ReactEcharts from "echarts-for-react";

interface DataItem {
    name: string;
    value: any;
    children?: DataItem[];
  }
  
  interface MyTreeChartComponentProps {
    data: DataItem[];
    onDataFromChild: (data: any) => void;
  }

const MyTreeChartComponent: React.FC<MyTreeChartComponentProps> = ({ data, onDataFromChild }) => {

    const handleItemClick = (item: DataItem) => {
        onDataFromChild(item); // 调用父组件传递的回调函数，并传递数据
    };

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
                bottom: "10%",
                right: "36%",
                symbolSize: 10,
                label: {
                    position: "top",
                    verticalAlign: "middle",
                    align: "middle",
                    fontSize: 18,
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
        style={{height: "1000px",width:"1500px"}}
        option={option}
        onEvents={{
            click: (info: any) => {
                const { data } = info;
                if (data) {
                    handleItemClick(data);
                }
            },
        }}
    />;
};
  

export default MyTreeChartComponent;
