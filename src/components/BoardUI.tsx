import { BOARD_LENGTH } from "../constants/constants";
import { Board } from "../utils/types";
import Square from "./Square";

interface BoardUIProps {
    board: Board;
    flip: (i: number, j: number) => void;
}

const BoardUI = (props: BoardUIProps) => {
    /**
     * @todo [Step 2] 请在下述两处代码缺失部分以正确显示一个灰色边框的 50x50 棋盘
     * @note 这里两处将类型声明为 any[] 是为了在填入缺失代码前也不至于触发 ESLint Error
     */
    const rowList: any[] = [];

    for (let i = 0; i < BOARD_LENGTH; ++i) {
        const cellList: any[] = [];

        for (let j = 0; j < BOARD_LENGTH; ++j) {
            cellList.push(
                <div onClick={() => props.flip(i, j)} key={j}>
                    {/* Step 2 BEGIN */}
                    <Square color = {props.board[i][j]===1?"red":"white"} key = {BOARD_LENGTH*i+j}></Square>
                    {/* Step 2 END */}
                </div>
            );
        }

        rowList.push(
            // Step 2 BEGIN
            <div style={{ display: "flex", flexDirection: "row" }} key={i}>
                {cellList}
            </div>
            // Step 2 END
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {rowList}
        </div>
    );
};

export default BoardUI;
