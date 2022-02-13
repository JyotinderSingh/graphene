export type vertexIdType = number | string;

export type vertexType = {
  _id?: vertexIdType;
  _out?: edgesType;
  _in?: edgesType;
  [x: string | number | symbol]: unknown;
};

export type verticesType = vertexType[];

export type edgeType = {
  _in: vertexType | undefined;
  _out: vertexType | undefined;
  _label?: string;
  [x: string | number | symbol]: unknown;
};

// Edge like object to for builder method
export type edgeBuilderType = {
  _in: vertexType | vertexIdType | undefined;
  _out: vertexType | vertexIdType | undefined;
  _label?: string;
  [x: string | number | symbol]: unknown;
};
export type edgesType = edgeType[];

export type vertexIndexType = {
  [x: vertexIdType]: vertexType;
};

export interface IGraph {
  edges: edgesType;
  vertices: verticesType;
  vertexIndex: vertexIndexType;
  autoid: number;
  addVertices: (vertices: verticesType) => void;
  addEdges: (edges: edgesType) => void;
  addVertex: (vertex: vertexType) => number | string | boolean;
  addEdge: (edge: edgeType) => void | boolean;

  findVertexById: (id: number | number) => vertexType | undefined;
  findInEdges: (vertex: vertexType) => edgesType;
  findOutEdges: (vertex: vertexType) => edgesType;

  // [x: string]: unknown;
}

export interface IGremlin {
  state: { [x: string | number | symbol]: any };
  vertex: vertexType;
  result?: unknown;
}

export interface IGraphState {
  gremlin?: IGremlin;
  edges?: edgesType;
  vertices?: verticesType;
  taken?: number;
  [x: number]: boolean;
}
