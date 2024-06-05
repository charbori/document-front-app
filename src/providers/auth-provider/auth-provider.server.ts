import { cookies } from "next/headers";

export const authProviderServer: AuthBinding = {
    check: async () => {
        const cookieStore = cookies();
        const auth = cookieStore.get("auth");

        if (auth) {
            return {
                authenticated: true,
            };
        }
        return {
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
                : cookieStore.get("auth").value;
        return auth;
    },
    verificationUser: async ({ verificationCode }) => {
        console.log("test server verification : " + verificationCode);
    },
};
