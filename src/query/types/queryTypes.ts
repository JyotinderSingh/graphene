import { IGraph } from "../../types/primitives";

export type pipeTypeConstant = "vertex" | "in" | "out" | "property" | "unique"
  | "filter" | "take" | "as" | "back" | "except" | "merge";
  
export type stepType = [pipeTypeConstant, any[]];

export interface IQuery {
  graph: IGraph;
  state: any[];
  program: stepType[];
  add: (pipeType: pipeTypeConstant, args: any) => IQuery;
}