import { edgeType, IGremlin, vertexType } from "../types/primitives";

/**
 * Gremlins are simple creatures - they have a current vertex, and some local
 * state.
 * @param vertex the current vertex of the gremlin.
 * @param state the local state of the gremlin.
 * @returns 
 */
export const makeGremlin = (vertex: vertexType, state: any): IGremlin => {
  return { vertex: vertex, state: state || {} };
};

/**
 * Take an existing gremlin and send it to a new vertex.
 * This function returns a brand new gremlin: a clone of the old one, sent to
 * the desired destination. That means a gremlin can sit on a vertex while its
 * clones are sent out to explore other vertices on.
 * @param gremlin the gremlin to send. 
 * @param vertex destination vertex.
 * @returns 
 */
export const gotoVertex = (gremlin: IGremlin, vertex: vertexType): IGremlin => {
  // clone the gremlin.
  return makeGremlin(vertex, gremlin.state);
};

export const filterEdges = (filter: any) => {
  return (edge: edgeType): boolean => {
    // no filter, everything is valid.
    if (!filter) return true;

    // string filter: label must match.
    if (typeof filter == "string") {
      return edge._label == filter;
    }

    //  array filter: must contain label.
    if (Array.isArray(filter)) {
      return !!~filter.indexOf(edge._label);
    }

    // object filter: check edge keys.
    return objectFilter(edge, filter);
  };
};

export const objectFilter = (thing: any, filter: any): boolean => {
  for (const key in filter) {
    if (thing[key] !== filter[key]) return false;
  }
  return true;
};