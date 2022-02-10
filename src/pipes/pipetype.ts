import { Query } from "../query/query";
import { pipeTypeConstant } from "../query/types/queryTypes";
import { grapheneError } from "../utils/error";
import { TypePipeMethod } from "./types";

export const PipeTypes: any = {}

/**
 * Adds a chainable Query Method to the Query for a given pipeType.
 * Every pipeType must have a corresponding Query Method. That method adds a new
 * step to the query program, along with the given arguments.
 */
export const addPipeType = (query: Query, name: pipeTypeConstant, fun: Function) => {
  PipeTypes[name] = fun;
  query.pipe[name] = (...args: any[]) => {
    // capture pipeType and args.
    return query.add(name, [...args]);
  };
}

export const getPipeType = (name: pipeTypeConstant): TypePipeMethod => {
  const pipeType = PipeTypes[name];

  if (!pipeType) {
    grapheneError(`Unrecognized PipeType ${name}.`);
  }

  return pipeType || fauxPipeType;
}

export const fauxPipeType = (_: any, __: any, maybe_gremlin: any) => {
  // pass the result upstream or send a pull downstream.
  return maybe_gremlin || "pull";
}