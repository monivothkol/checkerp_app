export interface UAC02000I01Request {
    userId: string
}

export interface UAC02000I01Response {
    list: MenuInfo[];
}

export interface MenuInfo {
    menuId: string;
    menuName: string;
    menuLevel: string;
    screenId: string;
    screenName: string;
    upperMenuId: string;
    displayOrder: number;
    webPageUrl: string;
    priorityApplicationTypeCode: string;
}

