"use client";

import dataProviderSimpleRest from "@refinedev/simple-rest";

const API_URL = "http://172.30.1.199:8080/api/content";

export const dataProvider = dataProviderSimpleRest(API_URL);
