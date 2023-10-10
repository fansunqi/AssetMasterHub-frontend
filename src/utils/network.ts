/**
 * @note 本文件是一个网络请求 wrapper 示例，其作用是将所有网络请求汇总到一个函数内处理
 *       我们推荐你在大作业中也尝试写一个网络请求 wrapper，本文件可以用作参考
 */

import axios, { AxiosError, AxiosResponse } from "axios";

const network = axios.create({
    baseURL: "",
});

enum NetworkErrorType {
    CORRUPTED_RESPONSE,
    SESSION_ERROR,
    UNKNOWN_ERROR,
}

export class NetworkError extends Error {
    type: NetworkErrorType;
    message: string;

    constructor(
        _type: NetworkErrorType,
        _message: string,
    ) {
        super();

        this.type = _type;
        this.message = _message;
    }

    toString(): string { return this.message; }
    valueOf(): Object { return this.message; }
}

export const request = async (
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    data?: any,
) => {
    const response = await network.request({ method, url, data })
        .catch((err: AxiosError<any,any>) => {
            // @note: 这里的错误处理显然是极其粗糙的，大作业中你可以根据组内约定的 API 文档细化错误处理
            // 判断错误返回的code如果是-2的话，则抛出SESSION_ERROR 1错误,.catch中用error.type捕获
            if (err.response?.data.code === -2) {
                throw new NetworkError(
                    NetworkErrorType.SESSION_ERROR,
                    `[${err.response?.status}] ` + (err.response?.data as any).info,
                );
            }
            else {

                throw new NetworkError(
                    NetworkErrorType.UNKNOWN_ERROR,
                    `[${err.response?.status}] ` + (err.response?.data as any).info,
                );
            }
        });
    if (response?.data.code === 0) {
        return { ...response.data, code: undefined };
    } else {
        /**
         * @note 这里的错误处理显然是极其粗糙的，大作业中你可以根据组内约定的 API 文档细化错误处理。
         *       然而事实上，如果按照类似本次小作业的 API 文档设计，即 code 不为 0 时 HTTP 状态码设为类似 400 等表示错误的状态，
         *       那么，该分支是事实不可达的，所有表示错误的 HTTP 状态响应应当在上面的 `catch` 块中已经被捕获。
         *       如果到达该分支，则说明后端的错误处理出现问题，code 和 HTTP 状态码一致性未正确处理。
         */

        throw new NetworkError(
            NetworkErrorType.UNKNOWN_ERROR,
            response?.data.info,
        );
    }
};