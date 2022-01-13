import {
  IGraph, verticesType, vertexType, edgesType, vertexIndexType, edgeType
} from "../types/primitives";
import { grapheneError } from "../utils/error";

export class Graph implements IGraph {
  edges: edgesType = [];
  vertices: verticesType = [];
  vertexIndex: vertexIndexType = {}; // lookup optimization
  autoid = 1; // auto-incrementing ID counter

  constructor(V: any, E: any) {
    if (Array.isArray(V)) {
      this.addVertices(V);
    }
    if (Array.isArray(E)) {
      this.addEdges(E);
    }
  }

  addVertices = (vs: verticesType) => {
    vs.forEach(this.addVertex);
  }

  addEdges = (es: edgesType) => {
    es.forEach(this.addEdge);
  };

  addVertex = (vertex: vertexType): number | boolean => {
    if (!vertex._id) {
      // If there is no ID on the vertex, assign it.
      vertex._id = this.autoid++;
    } else if (this.findVertexById(vertex._id)) {
      // If there is an ID on the vertex, check if it's already in the graph.
      // If so, return an error.
      return grapheneError("A vertex with that ID already exists.");
    }

    // Add the vertex to the graph.
    this.vertices.push(vertex);
    // Add the vertex to the index.
    this.vertexIndex[vertex._id] = vertex;

    // placeholders for edge pointers
    vertex._out = [];
    vertex._in = [];

    return vertex._id;
  }

  addEdge = (edge: edgeType): void | boolean => {
    edge._in = this.findVertexById(edge._in?._id);
    edge._out = this.findVertexById(edge._out?._id);

    if (!(edge._in && edge._out)) {
      return grapheneError("That edge's " + (edge._in ? 'out' : 'in')
        + " vertex wasn't found")
    }

    edge._out._out.push(edge);  // edge's out vertex's out edges
    edge._in._in.push(edge);    // edge's in vertex's in edges

    this.edges.push(edge);
  }

  findVertexById = (vertex_id: number | undefined): vertexType | undefined => {
    if (vertex_id) {
      return this.vertexIndex[vertex_id];
    } else {
      return undefined;
    }
  }
}