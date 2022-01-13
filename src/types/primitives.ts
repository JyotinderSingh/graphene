export type vertexType = {
  _id?: number, _out: edgesType, _in: edgesType,
  [x: string | number | symbol]: unknown,
};
export type verticesType = vertexType[];
export type edgeType = {
  _in: vertexType | undefined,
  _out: vertexType | undefined,
};
export type edgesType = edgeType[];

export type vertexIndexType = {
  [x: number]: vertexType
}

export interface IGraph {
  edges: edgesType,
  vertices: verticesType,
  vertexIndex: vertexIndexType,
  autoid: number,
  addVertices: (vertices: verticesType) => void,
  addEdges: (edges: edgesType) => void,
  addVertex: (vertex: vertexType) => number | boolean,
  addEdge: (edge: edgeType) => void | boolean,
  findVertexById: (id: number) => vertexType | void,
  // [x: string | number | symbol]: unknown;
}