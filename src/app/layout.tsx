import { DevtoolsProvider } from "@providers/devtools";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { RefineSnackbarProvider, notificationProvider } from "@refinedev/mui";
import routerProvider from "@refinedev/nextjs-router";
import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";

import { ko } from "@/locales/ko";
import { ColorModeContextProvider } from "@contexts/color-mode";
import { authProvider, authProviderServer } from "@providers/auth-provider";
import { dataProvider } from "@providers/data-provider";

export const metadata: Metadata = {
    title: ko.meta.title,
    description: ko.meta.description,
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
                                                name: "documents",
                                                list: "/documents",
                                                create: "/documents/create",
                                                edit: "/documents/edit/:id",
                                                show: "/documents/show/:id",
                                                meta: {
                                                    canDelete: true,
                                                    label: ko.nav.documents,
                                                    headers: {
                                                        Authorization:
                                                            "Bearer " +
                                                            authToken,
                                                    },
                                                },
                                            },
                                            {
                                                name: "comparisons",
                                                list: "/comparisons",
                                                create: "/comparisons/create",
                                                show: "/comparisons/show/:id",
                                                meta: {
                                                    canDelete: true,
                                                    label: ko.nav.comparisons,
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
