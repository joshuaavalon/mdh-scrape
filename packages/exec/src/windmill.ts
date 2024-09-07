/* eslint-disable @typescript-eslint/naming-convention */

export type RichDisplayRendering = Error | File | Gif | Html | Jpg | Markdown | Png | RenderAll | Svg | TableColumn | TableRow | TableRowObject;

export interface TableColumn {
  "table-col": { [key: string]: unknown[] };
}


export interface TableRow {
  "table-row": [string[], ...unknown[][]];
}

export interface TableRowObject<T extends Record<string, unknown> = Record<string, unknown>> {
  "table-row-object": T[];
}

export interface File {
  file: {
    filename: string;
    content: string;
  };
}

export type Markdown = { markdown: string } | { md: string };

export interface Html {
  html: string;
}

export interface Png {
  png: {
    content: string;
  };
}

export interface Jpg {
  jpeg: {
    content: string;
  };
}

export interface Gif {
  gif: {
    content: string;
  };
}

export interface Svg {
  gif: {
    content: string;
  };
}

export interface Error {
  error: {
    name: string;
    message: string;
  };
}

export interface RenderAll {
  render_all: Exclude<RichDisplayRendering, RenderAll> [];
}
