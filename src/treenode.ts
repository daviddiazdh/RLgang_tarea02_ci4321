export class TreeNode<T extends object = Record<string, any>> {
    public id: string;
    public type: string;
    public figure: string | null;
    public data: T;
    public parent: TreeNode<any> | null;
    public children: TreeNode<any>[];
    public disabled: boolean | null = false;

    constructor(
        id: string,
        type: string,
        data: T = {} as T,
        figure: string | null = "",
        parent: TreeNode<any> | null = null,
        disabled : boolean | null = false,
    ) {
        this.id = id;
        this.type = type;
        this.data = data;
        this.figure = figure;
        this.parent = parent;
        this.disabled = disabled;
        this.children = [];
    }

    public addChild<ChildData extends object = Record<string, any>>(
        id: string,
        type: string,
        data: ChildData = {} as ChildData,
        figure: string | null = "",
        disabled: boolean | null = false
    ): TreeNode<ChildData> {
        const childNode = new TreeNode<ChildData>(id, type, data, figure, this, disabled);
        this.children.push(childNode);
        return childNode;
    }

    public removeChild(id: string): void {
        this.children = this.children.filter((child) => child.id !== id);
    }

    public traverse(
        callback: (node: TreeNode<any>, depth: number, stack_scale: number[][], stack_rotation: number[][], stack_translation: number[][]) => void,
        depth: number = 0,
        stack_scale: number[][], 
        stack_rotation: number[][], 
        stack_translation: number[][]
    ): void {
        if(!this.disabled){
            callback(this, depth, stack_scale, stack_rotation, stack_translation);
            for (const child of this.children) {
                child.traverse(callback, depth + 1, stack_scale, stack_rotation, stack_translation);
            }
            stack_scale.pop();
            stack_rotation.pop();
            stack_translation.pop();
        }
    }

    public find(id: string): TreeNode<any> | null {
        if (this.id === id) return this;
        for (const child of this.children) {
            const found = child.find(id);
            if (found) return found;
        }
        return null;
    }

    public getPath(): string {
        const path: string[] = [];
        let current: TreeNode<any> | null = this;
        while (current) {
        path.unshift(current.id);
        current = current.parent;
        }
        return path.join(' -> ');
    }
}