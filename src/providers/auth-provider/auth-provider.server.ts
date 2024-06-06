import { cookies } from "next/headers";

export const authProviderServer = {
    check: async () => {
        const cookieStore = cookies();
        const auth = cookieStore.get("auth");

        if (auth) {
            return {
                success: true,
                authenticated: true,
            };
        }
        return {
            success: false,
            authenticated: false,
            logout: true,
            redirectTo: "/login",
        };
    },
    getIdentity: async () => {
        const cookieStore = cookies();
        const auth =
            cookieStore.get("auth") === undefined
                ? ""
                : cookieStore.get("auth")?.value;
        return auth;
    },
};
