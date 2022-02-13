import { Graph } from "../graph/graph";
import { IGremlin, IGraphState, vertexType } from "../types/primitives";
import { grapheneError } from "../utils/error";
import { filterEdges, gotoVertex, makeGremlin, objectFilter } from "../utils/helpers";
import { TypePipeMethod } from "./types";

/**
 * Given a vertex ID, returns a single new gremlin.
 * Given a query it will find all matching vertices, and yield one new 
 * gremlin at a time until it has worked its way through all of them.
 * 
 * We first check to see if we've already gathered matching vertices,
 * otherwise we try to find some. If there are any vertices, we'll pop one
 * off and return a new gremlin sitting on that vertex. Each gremlin can
 * carry around its own state, like a journal of where it has been and what
 * interesting things it has seen on its journey through the graph.
 * If we receive a gremlin as input to this step, we'll copy its journal
 * for the exiting gremlin to use.
 * @param graph graph to query
 * @param args arguments to the pipeType
 * @param gremlin gremlin to use as input
 * @param state state to use for the new gremlin
 * @returns 
 */
export const vertexPipeTypeMethod: TypePipeMethod = (graph: Graph, args: any[],
  gremlin: IGremlin, state: IGraphState) => {
  if (!state.vertices) {
    // state initialization
    state.vertices = graph.findVertices(args);
  }

  if (!state?.vertices?.length) {
    return "done";
  }

  // get a clone of the vertex.
  const vertex = state.vertices?.pop() as vertexType;

  // gremlins from as/back queries.
  return makeGremlin(vertex, gremlin.state);
};


/**
 * Traverses the graph in the direction specified by the pipeType.
 * The first couple of lines handle the differences between the "in" version and
 * the "out" version. Then we're ready to return our pipeType function.
 * @param direction
 * @returns
 */
export const simpleTraversal = (direction: "out" | "in") => {
  const find_method = direction === "out" ? "findOutEdges" : "findInEdges";
  const edge_list = direction === "out" ? "_in" : "_out";

  return (graph: Graph, args: any[], gremlin: IGremlin, state: IGraphState) => {
    // If there's no gremlin and we're out of available edges, then we pull.
    if (!gremlin && (!state.edges || !state.edges.length)) {
      // query initialization.
      return "pull";
    }

    // If we have a gremlin but haven't yet set the state then we find any edges
    //  going the appropriate direction and add them to our state.
    if (!state.edges || !state.edges.length) {
      // state initialization.
      state.gremlin = gremlin;
      // Get matching edges.
      state.edges = graph[find_method](gremlin.vertex)
        .filter(filterEdges(args[0]));
    }

    // if we have a gremlin but it's current vertex has no appropriate edges,
    // then we're done and we pull.
    if (!state?.edges?.length) {
      // nothing more to do.
      return "pull";
    }

    // finally, we pop off an edge and return a freshly cloned gremlin on the
    // vertex to which it points.
    const vertex = (state.edges as any).pop()[edge_list]; // use up an edge.
    return gotoVertex(state.gremlin!, vertex);
  };
};

export const propertyPipeTypeMethod: TypePipeMethod = (_graph: Graph, args: any[],
  gremlin: IGremlin, _state: IGraphState) => {
  // no gremlin, so we need to pull (query initialization).
  if (!gremlin) return "pull";

  // If there is a gremlin, we'll set its result to the property's value.
  gremlin.result = gremlin.vertex[args[0]];

  return gremlin.result == null ? false : gremlin;  // false for bad props.
};

/**
 * A unique pipeType is purely a filter: it either passes the germlin 
 * through unchanged or tries to pull a new gremlin through the previous
 * pipe.
 * @param _graph graph to query
 * @param args arguments to the pipeType
 * @param gremlin gremlin to use as input
 * @param state state to use for the new gremlin
 * @returns
 */
export const uniquePipeTypeMethod: TypePipeMethod = (_graph: Graph, _args: any[],
  gremlin: IGremlin, state: IGraphState) => {
  // we initialize by trying to collect a gremlin
  if (!gremlin) {
    return "pull";
  }

  // if the gremlin's vertex is in our cache, then we've seen it before -
  // so we try to collect a new one.
  if (state[gremlin.vertex._id as number]) {
    return "pull";
  }

  // if we've gotten here, then we've seen it for the first time. We add
  // this gremlin's current vertex to our cache and pass it through.
  state[gremlin.vertex._id as number] = true;

  return gremlin;
};

/**
 * Can take in an object or a function to filter the gremlins.
 * If the filter's first argument is not an object or function, then we 
 * trigger an error, and pass the gremlin along.
 * @param graph graph to query
 * @param args arguments to the pipeType
 * @param gremlin gremlin to use as input
 * @param state state to use for the new gremlin
 * @returns 
 */
export const filterPipeTypeMethod: TypePipeMethod = (_graph: Graph, args: any[],
  gremlin: IGremlin, _state: IGraphState) => {
  if (!gremlin) {
    return "pull";  // query initialization.
  }

  // filter by object
  if (typeof args[0] == "object") {
    return objectFilter(gremlin.vertex, args[0]) ? gremlin : "pull";
  }

  if (typeof args[0] != "function") {
    grapheneError("Filter is not a function: " + args[0]);
    return gremlin; // keep things going.
  }

  // gremlin fails if the filter function returns false.
  if (!args[0](gremlin.vertex, gremlin)) return "pull";

  // gremlin passed.
  return gremlin;
};

/**
 * Used to return a handfull of results at a time. Returns a specified
 * number of results from the gremlin.
 * @param graph graph to query
 * @param args arguments to the pipeType
 * @param gremlin gremlin to use as input
 * @param state state to use for the new gremlin
 * @returns
 */
export const takePipeTypeMethod: TypePipeMethod = (_graph: Graph, args: any[],
  gremlin: IGremlin, state: IGraphState) => {
  // state initialization
  // we initialize state.taken to zero if it already doesn't exist.
  state.taken = state.taken || 0;

  // When state.taken reaches args[0] - we're done.
  // we return "done" - sealing off the pipes before this.
  // we also reset the state.taken counter to allow this query to repeat
  // later on.
  if (state.taken == args[0]) {
    state.taken = 0;
    return "done";
  }

  // query initialization.
  if (!gremlin) return "pull";
  state.taken++;

  return gremlin;
};

/**
 * Allows you to label the current vertex.
 * @param _graph graph to query
 * @param args arguments to the pipeType
 * @param gremlin gremlin to use as input
 * @param _state state to use for the new gremlin
 * @returns 
 */
export const asPipeTypeMethod: TypePipeMethod = (_graph: Graph, args: any[],
  gremlin: IGremlin, _state: IGraphState) => {
  // query initialization.
  if (!gremlin) return "pull";

  // init the 'as' state.
  gremlin.state.as = gremlin.state.as || {};
  // set label to vertex.
  gremlin.state.as[args[0]] = gremlin.vertex;
  return gremlin;
};

/**
 * Maps over each argument, looking for it in the gremlin's list of labeled
 * vertices. If we find it, we clone the gremlin to that vertex. Note that only
 * gremlins that make it to this pipe are included in the merge.
 * @param graph graph to query
 * @param args arguments to the pipeType
 * @param gremlin gremlin to use as input
 * @param state state to use for the new gremlin
 * @returns
 */
export const mergePipeTypeMethod: TypePipeMethod = (_graph: Graph, args: any[],
  gremlin: IGremlin, state: IGraphState) => {
  // query initialization.
  if (!state.vertices && !gremlin) return "pull";

  // state initialization.
  if (!state.vertices || !state.vertices.length) {
    const obj = (gremlin.state || {}).as || {};
    state.vertices = args.map((id) => obj[id]).filter(Boolean);
  }

  // done with this batch.
  if (!state.vertices.length) return "pull";

  const vertex = state.vertices.pop();
  return makeGremlin(vertex as vertexType, gremlin.state);
};

/**
 * Check whether the current vertex is equal to the one saved in the "as" label.
 * @param _graph graph to query
 * @param args arguments to the pipeType
 * @param gremlin gremlin to use as input
 * @param _state state to use for the new gremlin
 * @returns 
 */
export const exceptPipeTypeMethod: TypePipeMethod = (_graph: Graph, args: any[],
  gremlin: IGremlin, _state: IGraphState) => {
  // query initialization.
  if (!gremlin) return "pull";
  if (gremlin.vertex == gremlin.state.as[args[0]]) return "pull";
  return gremlin;
};

/**
 * 
 * @param _graph graph to query
 * @param args arguments to the pipeType
 * @param gremlin gremlin to use as input
 * @param _state state to use for the new gremlin
 * @returns 
 */
export const backPipeTypeMethod: TypePipeMethod = (_graph: Graph, args: any[],
  gremlin: IGremlin, _state: IGraphState) => {
  if (!gremlin) return "pull";

  // Go to the vertex stored in the "as" label.
  return gotoVertex(gremlin, gremlin.state.as[args[0]]);
};