import { Graph } from "../graph/graph";
import { IQuery, pipeTypeConstant, pipetypeQueryMethod, stepType } from "./types/queryTypes";

export class Query implements IQuery {
  graph: Graph;  // the graph itself
  pipetypeQuery: Map<pipeTypeConstant, pipetypeQueryMethod>;

  /** each step in our program can have state.
   * This state is a list of per-step states that the index correlates with a
   * list of steps in this.program.
   */
  state: any[] = [];

  /**
   * A program is a series of steps.
   */
  program: stepType[] = [];

  /**
   * A cute little creature that traverses the graph. It remembers where
   * it has been and allows us to find answers to interesting questions.
   */
  gremlins = [];  // gremlins for each step

  constructor(graph: Graph) {
    this.graph = graph;
    this.pipetypeQuery = new Map<pipeTypeConstant, pipetypeQueryMethod>();
  }

  add = (pipeType: pipeTypeConstant, args: any[]): Query => {
    // A step is pair of a pipeType function and its arguments.
    const step: stepType = [pipeType, args];
    // Add the step to the program.
    this.program.push(step);
    return this;
  }
}