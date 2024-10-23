// 型定義を拡張
declare module 'cytoscape' {
  interface Core {
    htmlLabel: (labels: {
      query: string;
      halign: string;
      valign: string;
      halignBox: string;
      valignBox: string;
      cssClass: string;
      tpl: (data: any) => string;
    }[]) => void;
  }
}