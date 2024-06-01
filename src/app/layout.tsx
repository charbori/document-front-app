import { DevtoolsProvider } from "@providers/devtools";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { RefineSnackbarProvider, notificationProvider } from "@refinedev/mui";
import routerProvider from "@refinedev/nextjs-router";
import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";

import { ColorModeContextProvider } from "@contexts/color-mode";
import { authProvider, authProviderServer } from "@providers/auth-provider";
import { dataProvider } from "@providers/data-provider";

export const metadata: Metadata = {
    title: "kvi video manager",
    description: "kvi video manager",
    icons: {
        icon: "/favicon.ico",
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = cookies();
    const theme = cookieStore.get("theme");
    const defaultMode = theme?.value === "dark" ? "dark" : "light";
    const authToken = await authProviderServer.getIdentity();

    return (
        <html lang="ko">
            <body>
                <Suspense>
                    <RefineKbarProvider>
                        <ColorModeContextProvider defaultMode={defaultMode}>
                            <RefineSnackbarProvider>
                                <DevtoolsProvider>
                                    <Refine
                                        routerProvider={routerProvider}
                                        dataProvider={dataProvider}
                                        notificationProvider={
                                            notificationProvider
                                        }
                                        authProvider={authProvider}
                                        resources={[
                                            {
                                                name: "video",
                                                list: "/video",
                                                //create: "/video/create",
                                                edit: "/video/edit/:id",
                                                show: "/video/show/:id",
                                                meta: {
                                                    canDelete: true,
                                                    headers: {
                                                        Authorization:
                                                            "Bearer " +
                                                            authToken,
                                                    },
                                                },
                                            },
                                            {
                                                name: "category",
                                                list: "/video/category",
                                                create: "/video/category/create",
                                                edit: "/video/category/edit/:id",
                                                show: "/video/category/show/:id",
                                                meta: {
                                                    canDelete: true,
                                                    headers: {
                                                        Authorization:
                                                            "Bearer " +
                                                            authToken,
                                                    },
                                                },
                                            },
                                        ]}
                                        options={{
                                            syncWithLocation: true,
                                            warnWhenUnsavedChanges: true,
                                            useNewQueryKeys: true,
                                            projectId: "16twLM-WXE0Ia-SRHcxi",
                                        }}
                                    >
                                        {children}
                                        <RefineKbar />
                                    </Refine>
                                </DevtoolsProvider>
                            </RefineSnackbarProvider>
                        </ColorModeContextProvider>
                    </RefineKbarProvider>
                </Suspense>
            </body>
        </html>
    );
}
