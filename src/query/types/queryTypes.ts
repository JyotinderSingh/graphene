import { Graph } from "../../graph/graph";
import { IGremlin, IGraphState } from "../../types/primitives";
import { Query } from "../query";

export type pipeTypeConstant = "vertex" | "in" | "out" | "property" | "unique"
  | "filter" | "take" | "as" | "back" | "except" | "merge" | string;

export type TypeStepArguments = [Graph, any[], IGremlin, IGraphState]
export type stepType = [pipeTypeConstant, TypeStepArguments];

// Query Method associated with a pipeType.
export type pipetypeQueryMethod = (...args: any[]) => Query;

export interface IQuery {
  graph: Graph;
  state: any[];
  program: stepType[];
  add: (pipeType: pipeTypeConstant, args: TypeStepArguments) => Query;
  pipe: {
    [key in pipeTypeConstant]?: pipetypeQueryMethod;
  };
  run: () => any;
}