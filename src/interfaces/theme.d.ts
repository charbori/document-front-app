import "@refinedev/mui";

export interface CustomTheme {
    // Add custom variables here like below:
    // status: {
    //   danger: string;
    // };
}

declare module "@refinedev/mui" {
    interface Theme extends import("@refinedev/mui").Theme, CustomTheme {}
    interface ThemeOptions
        extends import("@refinedev/mui").ThemeOptions,
            CustomTheme {}
}

export interface IVideoCategory {
    id: number;
    name: string;
    role: string;
}

export type IStatus = "published" | "draft" | "rejected";

export interface IPost {
    id: number;
    title: string;
    content: string;
    status: IStatus;
    category: ICategory;
}

export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

export type IVideo = {
    id: string;
    name: string;
    description: string;
    status: string;
    role: string;
    tag: string;
    videoPath: string;
    videoType: string;
    thumbnailPath: string;
    createdAt: string;
    updatedAt: string;
};
