import { Query } from "../query/query";
import { TypeStepArguments } from "../query/types/queryTypes";
import {
  IGraph, verticesType, vertexType, edgesType, vertexIndexType, edgeType, vertexIdType, edgeBuilderType
} from "../types/primitives";
import { grapheneError } from "../utils/error";
import { objectFilter } from "../utils/helpers";

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

  addVertex = (vertex: vertexType): number | string | boolean => {
    if (!vertex._id) {
      // If there is no ID on the vertex, assign it.
      vertex._id = this.autoid++;
    } else if (this.traversal.findVertexById(vertex._id)) {
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

  addEdge = (edge: edgeBuilderType): void | boolean => {
    edge._in = this.traversal.findVertexById(edge._in as vertexIdType);
    edge._out = this.traversal.findVertexById(edge._out as vertexIdType);

    if (!(edge._in && edge._out)) {
      return grapheneError("That edge's " + (edge._in ? 'out' : 'in')
        + " vertex wasn't found")
    }

    edge._out._out?.push(edge as edgeType);  // edge's out vertex's out edges
    edge._in._in?.push(edge as edgeType);    // edge's in vertex's in edges

    this.edges.push(edge as edgeType);
  }


  /**
   * Convenience methods for traversing the graph.
   */
  traversal = {
    /**
     * Find a vertex by its ID.
     * @param vertex_id The ID of the vertex to find.
     * @returns The vertex with the given ID, or undefined if it wasn't found.
     */
    findVertexById: (vertex_id: vertexIdType): vertexType | undefined => {
      if (vertex_id) {
        return this.vertexIndex[vertex_id];
      } else {
        return undefined;
      }
    },
    /**
     * Find all the edges that have the given vertex as their in vertex.
     * @param vertex The vertex to find the in edges for.
     * @returns An array of edges that have the given vertex as their in vertex.
     */
    findInEdges: (vertex: vertexType): edgesType => {
      return vertex._in as edgesType;
    },
    /**
     * Find all the edges that have the given vertex as their out vertex.
     * @param vertex The vertex to find the out edges for.
     * @returns An array of edges that have the given vertex as their out 
     * vertex.
     */
    findOutEdges: (vertex: vertexType): edgesType => {
      return vertex._out as edgesType;
    },

    /**
     * Vertex finder helper function.
     */
    findVertices: (args: any[]): verticesType => {
      if (typeof args[0] == "object") {
        return this.traversal.searchVertices(args[0]);
      } else if (args.length == 0) {
        return this.vertices.slice(); // Note: slice is costly.
      } else {
        return this.traversal.findVerticesByIds(args);
      }
    },

    findVerticesByIds: (ids: number[]): verticesType => {
      if (ids.length == 1) {
        // maybe its a vertex.
        const maybe_vertex = this.traversal.findVertexById(ids[0]);
        // maybe its not.
        return maybe_vertex ? [maybe_vertex] : [];
      }

      return ids.map((id) => this.traversal.findVertexById(id) as vertexType)
        .filter(Boolean);
    },

    /**
     * Return vertices matching the filter.
     * @param filter The filter to use.
     * @returns 
     */
    searchVertices: (filter: any) => {
      return this.vertices.filter((vertex) => {
        return objectFilter(vertex, filter);
      })
    }
  }

  /**
   * Builds a new query, then uses the vertex pipeType.
   * NOTE: Check if this works properly, otherwise convert to non arrow 
   * function.
   * @param args 
   * @returns 
   */
  v = (...args: any[]) => {
    // Initialize a new query.
    const query = new Query(this);
    query.add("vertex", [...args as TypeStepArguments]);
    return query;
  }
}
