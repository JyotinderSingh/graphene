import { stepType, TypeStepArguments } from "../query/types/queryTypes";
import { grapheneError } from "../utils/error";
import { TypeTransformer } from "./types";

export const T: TypeTransformer[] = []; // Transformers

export const addTransformer = (
  fun: Function,
  priority: number
): void | false => {
  if (typeof fun != "function") {
    return grapheneError("Invalid transformer function encountered.");
  }

  // Higher priority transformers are placed closer to the front of the list.
  // Assuming that lists will be short, so linear search should suffice.
  // Replacing with binary search should be trivial in case above assumption is
  // false.
  let i = 0;
  for (i = 0; i < T.length; ++i) {
    if (priority > T[i].priority) {
      break;
    }
  }

  T.splice(i, 0, { priority: priority, fun: fun });
};

export const transform = (program: stepType[]): stepType[] => {
  // pass the program through each transformer in turn.
  return T.reduce((prev, transformer) => {
    return transformer.fun(prev);
  }, program);
};

export const extend = (list: TypeStepArguments, defaults: any[]) => {
  return Object.keys(defaults).reduce((acc, key) => {
    if (typeof list[parseInt(key)] != "undefined") return acc;
    acc[parseInt(key)] = defaults[parseInt(key)];
    return acc;
  }, list);
};
