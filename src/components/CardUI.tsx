import { Modal, Card, Button} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import { CardUIProps } from "../utils/types";

const CardUI = (props: CardUIProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const router = useRouter();
    const query = router.query;
    const handle_click = () => {
        if(props.url == "empty" || props.state == 0) setOpen(true);
        else if(props.internal) router.push(props.url);
        else {window.location.href=props.url;}
    };
    const handle_cancel = () => {
        setOpen(false);
    };
    return (
        <>
            {props.internal && <Card className="card"
                cover={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt = "" className="card__icon" src={props.img}/>
                }
                onClick={handle_click}    
            >
                <h1 className="card__title">{props.appname}</h1>
            </Card>}
            {!props.internal && <Card className="card"
                onClick={handle_click}
            >
                <h1 className="card__title">{props.appname}</h1>
            </Card>}
            {props.state == 1 && props.url == "empty" && <Modal
                title="抱歉，该功能正在开发中"
                centered
                open={open}
                onCancel={handle_cancel}
                footer={[
                    <Button key="ok" type="primary" onClick={handle_cancel}>
                      确定
                    </Button>,
                ]}
            >
                <p>请耐心等待我们的更新</p>
            </Modal>}
            {props.state == 0 && <Modal
                title="抱歉，该功能已被您的管理员禁用"
                centered
                open={open}
                onCancel={handle_cancel}
                footer={[
                    <Button key="ok" type="primary" onClick={handle_cancel}>
                      确定
                    </Button>,
                ]}
            >
                <p>请联系管理员申请解封</p>
            </Modal>}
        </>
    );
};
export default CardUI;