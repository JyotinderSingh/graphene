import { Graph } from "./graph/graph";
import { addPipeType } from "./pipes/pipetype";
import {
  filterPipeTypeMethod,
  propertyPipeTypeMethod,
  simpleTraversal,
  takePipeTypeMethod,
  uniquePipeTypeMethod,
  vertexPipeTypeMethod
} from "./pipes/pipetype-methods";
import { Query } from "./query/query";

export class Graphene {
  constructor(V: any, E: any) {
    this.graph = new Graph(V, E);
    this.query = new Query(this.graph);

    // Initialize the built-in pipeTypes.
    addPipeType(this.query, "vertex", vertexPipeTypeMethod);
    addPipeType(this.query, "out", simpleTraversal("out"));
    addPipeType(this.query, "in", simpleTraversal("in"));
    addPipeType(this.query, "property", propertyPipeTypeMethod)
    addPipeType(this.query, "unique", uniquePipeTypeMethod)
    addPipeType(this.query, "filter", filterPipeTypeMethod);
    addPipeType(this.query, "take", takePipeTypeMethod);

  }
  graph: Graph;
  query: Query;
}