"use client";
import { AppIcon } from "@components/app-icon";
import type { AuthPageProps } from "@refinedev/core";
import { AuthPage as AuthPageBase, ThemedTitleV2 } from "@refinedev/mui";
import { useEffect, useState } from "react";

export const AuthPage = (props: AuthPageProps) => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <AuthPageBase
            {...props}
            formProps={{
                defaultValues: { email: "", password: "" },
            }}
            title={
                hasMounted && (
                    <ThemedTitleV2
                        collapsed={false}
                        text="kvi Video Manager"
                        icon={<AppIcon />}
                    />
                )
            }
        />
    );
};
