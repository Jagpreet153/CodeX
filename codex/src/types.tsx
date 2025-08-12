export type TreeItem = string | [string, ...TreeItem[]];

interface TreeItem {
    name: string;
    children?: TreeItem[];
   
}
