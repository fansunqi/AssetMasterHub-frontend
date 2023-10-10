import { BOARD_LENGTH } from "../constants/constants";
import { Board } from "./types";

export const getBlankBoard = (): Board => {
    const board: Board = [];
    for (let i = 0; i < BOARD_LENGTH; ++i) {
        const row: (0 | 1)[] = [];
        for (let j = 0; j < BOARD_LENGTH; ++j) {
            row.push(0);
        }

        board.push(row);
    }

    return board;
};

export const boardToString = (board: Board): string => {
    return board.map((row) => row.join("")).join("");
};

export const stringToBoard = (str: string): Board => {
    if (str.length !== BOARD_LENGTH * BOARD_LENGTH) {
        throw new Error("Invalid parameter");
    }

    const board: Board = [];
    for (let i = 0; i < BOARD_LENGTH; ++i) {
        const row: (0 | 1)[] = [];
        for (let j = 0; j < BOARD_LENGTH; ++j) {
            const val = parseInt(str[i * BOARD_LENGTH + j], 10);
            if (val !== 0 && val !== 1) {
                return getBlankBoard();
            }

            row.push(val);
        }

        board.push(row);
    }

    return board;
};

export const stepBoard = (board: Board): Board => {
    const newBoard: Board = [];

    /**
     * @todo [Step 1] 请在下面两条注释之间的区域填写你的代码完成该游戏的核心逻辑
     * @note 你可以使用命令 yarn test step 来运行我们编写的单元测试与我们提供的参考实现对拍
     */
    // Step 1 BEGIN
    for (let i = 0; i < BOARD_LENGTH; ++i) {
        // 创建一个新的空数组
        newBoard.push([]);

        // 遍历每一行
        for (let j = 0; j < BOARD_LENGTH; ++j) {
            // 初始化棋盘上每一个格子的活细胞数量
            let aliveCounter = 0;
            // 创建一个映射，用于计算每一个方向上的棋盘格子
            const dir_map = new Map([["left", (j - 1 + BOARD_LENGTH) % BOARD_LENGTH], ["right", (j + 1) % BOARD_LENGTH], ["up", (i - 1 + BOARD_LENGTH) % BOARD_LENGTH], ["down", (i + 1) % BOARD_LENGTH]]);
            // 创建一个列表，用于检查每一个方向上的棋盘格子
            const checkList = [[dir_map.get("up"), dir_map.get("left")], [dir_map.get("up"), j], [dir_map.get("up"), dir_map.get("right")], [i, dir_map.get("left")], [i, dir_map.get("right")], [dir_map.get("down"), dir_map.get("left")], [dir_map.get("down"), j], [dir_map.get("down"), dir_map.get("right")]];

            // 遍历检查列表
            checkList.forEach((ord: any) => {
                // 如果棋盘上某一个格子的活细胞数量等于1，则活细胞数量加1
                if (board[ord[0]][ord[1]] === 1) {
                    ++aliveCounter;
                }
            });

            // 获取当前格子的状态
            const nowState = board[i][j];
            // 如果当前格子的活细胞数量等于3，则当前格子的状态为1，否则为0
            nowState === 0 ? newBoard[i].push(aliveCounter === 3 ? 1 : 0)
                : newBoard[i].push((aliveCounter === 2 || aliveCounter === 3) ? 1 : 0);
        }
    }
    // Step 1 END

    return newBoard;
};

export const flipCell = (board: Board, i: number, j: number): Board => {
    /**
     * @todo [Step 3] 请在下面两条注释之间的区域填写你的代码完成切换细胞状态的任务
     * @note 你可以使用命令 yarn test flip 来运行我们编写的单元测试以检验自己的实现
     */
    // Step 3 BEGIN
    const newBoard: Board = [];
    for (let k = 0; k < BOARD_LENGTH; ++k) {
        newBoard.push([]);
        for (let s = 0; s < BOARD_LENGTH; ++s) {
            if(k===i && s===j){
                newBoard[k].push(board[i][j]===0?1:0);
            }
            else{
                newBoard[k].push(board[k][s]);
            }
        }
    }
    return newBoard;
    // Step 3 END

    /**
     * @note 该 return 语句是为了在填入缺失代码前也不至于触发 ESLint Error
     */
    throw new Error("This line should be unreachable.");
    return board;
};

export const badFlipCell = (board: Board, i: number, j: number): Board => {
    board[i][j] = board[i][j] === 0 ? 1 : 0;
    return board;
};
