import { Graph } from "../../graph/graph";
import { Query } from "../query";

export type pipeTypeConstant = "vertex" | "in" | "out" | "property" | "unique"
  | "filter" | "take" | "as" | "back" | "except" | "merge";

export type stepType = [pipeTypeConstant, any[]];

// Query Method associated with a pipeType.
export type pipetypeQueryMethod = (...args: any[]) => Query;

export interface IQuery {
  graph: Graph;
  state: any[];
  program: stepType[];
  add: (pipeType: pipeTypeConstant, args: any[]) => Query;
  pipetypeQuery: Map<pipeTypeConstant, pipetypeQueryMethod>;
}