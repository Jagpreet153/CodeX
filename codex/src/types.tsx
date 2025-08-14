interface TreeNode {
  [key: string]: TreeNode | null; // null = file
}

export type TreeItem = [string, ...TreeItem[]] | string;