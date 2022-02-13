import { Graph } from "./graph/graph";
import { addPipeType } from "./pipes/pipetype";
import {
  asPipeTypeMethod,
  backPipeTypeMethod,
  exceptPipeTypeMethod,
  filterPipeTypeMethod,
  mergePipeTypeMethod,
  propertyPipeTypeMethod,
  simpleTraversal,
  takePipeTypeMethod,
  uniquePipeTypeMethod,
  vertexPipeTypeMethod,
} from "./pipes/pipetype-methods";
import { Query } from "./query/query";
import { pipeTypeConstant, stepType } from "./query/types/queryTypes";
import { addTransformer, extend } from "./transformers/query-transformer";
import {
  persist,
  depersist,
  graphFromJSON,
  jsonifyGraph,
} from "./utils/serialization";

export class Graphene {
  graph: Graph;
  query: Query;

  constructor(V: any, E: any) {
    this.graph = new Graph(V, E);
    this.query = new Query(this.graph);

    // Initialize the built-in pipeTypes.
    addPipeType(this.query, "vertex", vertexPipeTypeMethod);
    addPipeType(this.query, "out", simpleTraversal("out"));
    addPipeType(this.query, "in", simpleTraversal("in"));
    addPipeType(this.query, "property", propertyPipeTypeMethod);
    addPipeType(this.query, "unique", uniquePipeTypeMethod);
    addPipeType(this.query, "filter", filterPipeTypeMethod);
    addPipeType(this.query, "take", takePipeTypeMethod);
    addPipeType(this.query, "as", asPipeTypeMethod);
    addPipeType(this.query, "merge", mergePipeTypeMethod);
    addPipeType(this.query, "except", exceptPipeTypeMethod);
    addPipeType(this.query, "back", backPipeTypeMethod);
  }

  setGraph = (graph: Graph) => {
    this.graph = graph;
    this.query = new Query(this.graph);
  };

  addAlias = (newname: pipeTypeConstant, newprogram: any[]) => {
    addPipeType(this.query, newname, function () {});
    newprogram = newprogram.map(step => {
      return [step[0], step.slice(1)]; // [['out', 'parent']] => [['out', ['parent']]]
    });

    addTransformer((program: stepType[]) => {
      return program.reduce(function (acc: stepType[], step: stepType) {
        if (step[0] != newname) return acc.concat([step]);
        return acc.concat(newprogram);
      }, []);
    }, 100); // these need to run early, so they get a high priority
  };

  _legacy_addAlias = (
    newName: string,
    oldName: string,
    defaults: any[] | null | undefined
  ) => {
    defaults = defaults || [];
    addPipeType(this.query, newName, () => {});
    addTransformer((program: stepType[]) => {
      return program.map((step: stepType) => {
        // If the name of this step is not the new name, return it as it is.
        if (step[0] != newName) return step;
        // otherwise, return a step with the equivalent old name, with the args.
        return [oldName, extend(step[1], defaults as any[])];
      });
    }, 100); // priority: 100, because aliases run early.
  };
}

export { Graph, Query, persist, depersist, graphFromJSON, jsonifyGraph };

export default Graphene;
