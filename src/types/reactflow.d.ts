declare module 'reactflow' {
  export const addEdge: any;
  export const Background: any;
  export const Controls: any;
  export const MiniMap: any;
  export const ReactFlowProvider: any;
  export const useEdgesState: any;
  export const useNodesState: any;
  export default function ReactFlow(props: any): JSX.Element;

  // EdgeとConnectionの型を追加
  export type Edge = {
    id: string;
    source: string;
    target: string;
    type?: string;
    animated?: boolean;
    label?: string;
  };

  export type Connection = {
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  };

  // Nodeの型を追加
  export type Node = {
    id: string;
    data: {
      label: string;
      category: string;
      products?: string[]; // オプショナルにする
      categories?: string[]; // ここにcategoriesを追加
    };
    position: {
      x: number;
      y: number;
    };
  };

  // NodePropsの型を追加
  export type NodeProps = {
    data: {
      label: string;
      category: string;
      products?: string[]; // オプショナルにする
      categories?: string[]; // ここにcategoriesを追加
    };
  };

  // Handleの型を追加
  export type HandleProps = {
    type: 'source' | 'target';
    position: 'left' | 'right' | 'top' | 'bottom';
  };

  export const Handle: React.FC<HandleProps>;
}