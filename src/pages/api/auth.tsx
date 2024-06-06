import type { NextApiRequest, NextApiResponse } from "next";

import axios from "axios";
import { loginApiEndPoint } from "../../utils/common_var";

type ResponseData = {
    message: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        var authToken = "";
        const response2 = await axios
            .post(loginApiEndPoint ?? "", {
                username: req.body.username,
                password: req.body.password,
            })
            .then(function (response) {
                authToken = response.data.data;
                if (response.data.data) {
                    //@ts-ignore
                    res.cookies.set("auth", response.data.data);
                }
                return response.data.data;
            })
            .catch(function (error) {
                return error;
            });
        if (await response2) {
            res.status(200).json({ message: "", data: authToken });
        }
    } else if (req.method === "GET" && req.query.type === "logout") {
        res.status(200).json({ message: "delete", data: "" });
    }
}
