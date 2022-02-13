import { Graph } from "../graph/graph";
import { IGraphState, IGremlin } from "../types/primitives";

export type TypePipeMethodResult = false | "pull" | "done" | IGremlin;

export type TypePipeMethod = (
  graph: Graph,
  args: any[],
  gremlin: IGremlin,
  state: IGraphState
) => TypePipeMethodResult;
