import { Graph } from "../graph/graph";
import { getPipeType } from "../pipes/pipetype";
import { TypePipeMethod, TypePipeMethodResult } from "../pipes/types";
import { IGremlin } from "../types/primitives";
import { IQuery, pipeTypeConstant, pipetypeQueryMethod, stepType } from "./types/queryTypes";

export class Query implements IQuery {
  graph: Graph;  // the graph itself
  pipe: { [key in pipeTypeConstant]?: pipetypeQueryMethod };

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
    this.pipe = {};
  }

  add = (pipeType: pipeTypeConstant, args: any[]): Query => {
    // A step is pair of a pipeType function and its arguments.
    const step: stepType = [pipeType, args];
    // Add the step to the program.
    this.program.push(step);
    return this;
  }

  // A machine for query processing.
  run = () => {
    const max: number = this.program.length - 1;  // Index of the last step in the program.
    let maybe_gremlin: TypePipeMethodResult = false;  // A gremlin, a signal string, or false.
    let results: any[] = [];  // Results for this particular run.
    let done: number = -1;  // Pointer behind which things have finished.
    let pc: number = max; // Program Counter.

    // Cache of information about the current step.
    let step: stepType, state, pipetype: TypePipeMethod;

    // Loop through the program.
    while (done < max) {
      let ts = this.state;
      step = this.program[pc];  // A step is a pair of pipeType and args.
      state = (ts[pc] = ts[pc] || {}) // This step's state must be an object.
      pipetype = getPipeType(step[0]);  // A pipeType is just a function.

      maybe_gremlin = pipetype(this.graph, step[1], maybe_gremlin as IGremlin,
        state);

      // "pull" means the pipe wants more input.
      if (maybe_gremlin == "pull") {
        maybe_gremlin = false;
        // If the step before this isn't "done", we'll move the head backward
        // and try again. Otherwise, we mark ourselves as "done" and let the
        // head naturally move forward.
        if (pc - 1 > done) {
          pc--; // try the previous pipe.
          continue;
        } else {
          done = pc;  // previous pipe is done, so are we.
        }
      }

      // "done" tells us that the pipe has finished.
      if (maybe_gremlin == "done") {
        maybe_gremlin = false;
        // mark this step as "done".
        done = pc;
      }

      pc++;  // move the head forward to the next pipe.

      // We're done with the current step, and we've moved the head to the next
      // one. If we're at the end of the program and maybe_gremlin contains a 
      // a gremlin, we'll add it to the results, set maybe_gremlin to false and
      // move the head back to the last step in the program.
      // 
      // This is also the initialization state, since pc starts as max. So we
      // start here and work our way back, and end up here at least once for 
      // each final result the query returns.
      if (pc > max) {
        if (maybe_gremlin) {
          results.push(maybe_gremlin);  // A gremlin popped out of the pipeline.
        }
        maybe_gremlin = false;  // reset the gremlin.
        pc--; // take a step back.
      }
    }

    // return either results (like property("name")) or vertices.
    results = results.map((gremlin: IGremlin) => {
      return gremlin.result != null ? gremlin.result : gremlin.vertex;
    })

    return results;
  }
}