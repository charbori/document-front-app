"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { AppIcon } from "@components/app-icon";
import { AuthPageProps } from "@refinedev/core";
import { AuthPage as AuthPageBase, ThemedTitleV2 } from "@refinedev/mui";

export const AuthPage = (props: AuthPageProps) => {
    const { t } = useTranslation();
    
    return (
        <AuthPageBase
            {...props}
            formProps={{
                defaultValues: { email: "", password: "" },
            }}
            title={
                <ThemedTitleV2
                    collapsed={false}
                    text={t("meta.title")}
                    icon={<AppIcon />}
                />
            }
        />
    );
};
