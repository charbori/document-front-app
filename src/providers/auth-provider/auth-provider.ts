"use client";
import type { AuthProvider } from "@refinedev/core";
import type { AuthActionResponse } from "@refinedev/core/src/contexts/auth/types";
import axios from "axios";
import Cookies from "js-cookie";
import { removeAuthToken, setAuthToken } from "../../services/api";
import {
    passwordApiEndPoint,
    registerApiEndPoint,
} from "../../utils/common_var";
import parseJwt from "../../utils/jwt_util";

export const authProvider: AuthProvider = {
    login: async ({ email, username, password, remember }) => {
        try {
            const response = await axios
                .post(`/api/auth`, {
                    username: email,
                    password: password,
                })
                .then(function (response) {
                    if (response.data.data) {
                        // 쿠키에 저장 (서버사이드 확인용)
                        Cookies.set("auth", response.data.data, {
                            expires: 30,
                            path: "/",
                        });
                        
                        // localStorage에도 저장 (API 호출용)
                        setAuthToken(response.data.data);
                        
                        // 로그인 성공 후 홈페이지로 리디렉션
                        window.location.href = "/";
                        
                        const authActionResponse: AuthActionResponse = {
                            success: true,
                            redirectTo: "/",
                        };
                        return authActionResponse;
                    }
                })
                .catch(function (error) {
                    console.error("Login error:", error);
                    const authActionResponse: AuthActionResponse = {
                        success: false,
                        error: {
                            name: "로그인 실패",
                            message: "계정명과 비밀번호를 확인해주세요.",
                        },
                    };
                    return authActionResponse;
                });
            if (response == undefined) {
                return {
                    success: false,
                    error: {
                        name: "로그인 실패",
                        message: "계정명과 비밀번호를 확인해주세요.",
                    },
                };
            }
            return response;
        } catch (error) {
            console.error("Login catch error:", error);
            return {
                success: false,
                error: {
                    name: "로그인 실패",
                    message: "계정명과 비밀번호를 확인해주세요.",
                },
            };
        }
    },
    logout: async () => {
        // 쿠키와 localStorage 모두에서 토큰 제거
        Cookies.remove("auth", { path: "/" });
        removeAuthToken();
        
        const response = await axios
            .get(`/api/auth?type=logout`, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then(function (response) {
                return {
                    success: true,
                    redirectTo: "/login",
                };
            })
            .catch(function (error) {
                console.error("Logout error:", error);
                return {
                    success: false,
                    error: {
                        name: "로그아웃 실패",
                        message: "관리자에게 문의하세요.",
                    },
                };
            });
        return await response;
    },
    check: async () => {
        const auth = Cookies.get("auth");

        // const { isLoading, error, data, isFetching } = useQuery({
        //     queryKey: ["authToken"],
        //     queryFn: () => {
        //         return Cookies.get("auth");
        //     },
        // });

        if (auth) {
            // JWT 토큰이 유효한지 확인
            try {
                const parsedToken = parseJwt(auth);
                if (parsedToken && parsedToken.exp) {
                    const currentTime = Date.now() / 1000;
                    if (parsedToken.exp > currentTime) {
                        // localStorage에도 토큰이 있는지 확인하고 없으면 설정
                        const localToken = localStorage.getItem('auth_token');
                        if (!localToken) {
                            setAuthToken(auth);
                        }
                        return {
                            authenticated: true,
                        };
                    } else {
                        // 토큰이 만료된 경우
                        Cookies.remove("auth", { path: "/" });
                        removeAuthToken();
                        return {
                            authenticated: false,
                            logout: true,
                            redirectTo: "/login",
                        };
                    }
                }
            } catch (error) {
                console.error("Token parsing error:", error);
                // 토큰 파싱 에러시 로그아웃 처리
                Cookies.remove("auth", { path: "/" });
                removeAuthToken();
            }
        }

        return {
            authenticated: false,
            logout: true,
            redirectTo: "/login",
        };
    },
    getPermissions: async () => {
        const auth = Cookies.get("auth");

        if (auth) {
            const parsedUser = parseJwt(auth);
            return parsedUser?.role;
        }
        return null;
    },
    getIdentity: async () => {
        const auth = Cookies.get("auth");
        if (auth) {
            const parsedUser = parseJwt(auth);
            return parsedUser;
        }
        return null;
    },
    onError: async (error) => {
        if (error.response?.status === 401) {
            // 401 에러시 토큰 제거하고 로그아웃
            Cookies.remove("auth", { path: "/" });
            removeAuthToken();
            return {
                logout: true,
            };
        }

        return { error };
    },
    register: async ({ email, username, password, remember }) => {
        try {
            const response = await axios
                .post(registerApiEndPoint ?? "", {
                    username: email,
                    password: password,
                })
                .then(function (response) {
                    return {
                        success: true,
                        redirectTo: "/login",
                    };
                })
                .catch(function (error) {
                    return {
                        success: false,
                        error: {
                            name: "RegisterError",
                            message: "회원가입에 실패했습니다",
                        },
                    };
                });
            return await response;
        } catch (error) {
            return {
                success: false,
                error: {
                    name: "RegisterError",
                    message: "회원가입에 실패했습니다",
                },
            };
        }
    },
    forgotPassword: async ({ email, redirectPath }) => {
        const response = await axios
            .get(passwordApiEndPoint + "?username=" + email)
            .then(function (response) {
                return {
                    success: true,
                    redirectTo: "/login",
                    successNotification: {
                        message: "비밀번호 찾기성공",
                        description:
                            "계정의 메일에서 비밀번호 초기화를 진행해주세요.",
                    },
                };
            })
            .catch(function (error) {
                return {
                    success: false,
                    error: {
                        name: "비밀번호 찾기실패",
                        message: "계정이 올바르지 않습니다.",
                    },
                };
            });
        return await response;
    },
    updatePassword: async ({ password, confirmPassword }) => {
        const queryParameters = new URLSearchParams(window.location.search);
        const verificationCode = queryParameters.get("verificationCode");
        const response = await axios
            .post(passwordApiEndPoint ?? "", {
                password: password,
                verificationCode: verificationCode,
            })
            .then(function (response) {
                return {
                    success: true,
                    redirectTo: "/login",
                    successNotification: {
                        message: "비밀번호 변경성공",
                        description: "비밀번호 변경에 성공하였습니다.",
                    },
                };
            })
            .catch(function (error) {
                return {
                    success: false,
                    error: {
                        name: "비밀번호 찾기실패",
                        message: "계정이 올바르지 않습니다.",
                    },
                };
            });
        return await response;
    },
};
