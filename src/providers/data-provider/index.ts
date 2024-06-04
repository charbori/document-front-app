"use client";

import { videoApiEndPoint } from "../../utils/common_var";

import dataProviderSimpleRest from "@refinedev/simple-rest";

const API_URL = videoApiEndPoint;

export const dataProvider = dataProviderSimpleRest(API_URL);
