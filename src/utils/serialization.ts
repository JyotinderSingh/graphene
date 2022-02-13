/* eslint-disable quotes */
import { Graph } from "../graph/graph";

export const jsonifyGraph = (graph: Graph): string => {
  return (
    '{"V":' +
    JSON.stringify(graph.vertices, cleanVertex) +
    ',"E":' +
    JSON.stringify(graph.edges, cleanEdge) +
    "}"
  );
};

const cleanVertex = (key: any, value: any) => {
  return key == "_in" || key == "_out" ? undefined : value;
};

const cleanEdge = (key: any, value: any) => {
  return key == "_in" || key == "_out" ? value._id : value;
};

export const graphFromJSON = (str: string): Graph => {
  const obj = JSON.parse(str); // this can throw an exception
  // another graph constructor
  return new Graph(obj.V, obj.E);
};

export const persist = (graph: Graph | string, name: string) => {
  if (typeof graph != "string") {
    graph = jsonifyGraph(graph as Graph);
  }
  name = name || "graph";

  if (typeof localStorage == "undefined" || localStorage == null) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const LocalStorage = require("node-localstorage").LocalStorage;
    // eslint-disable-next-line no-global-assign
    // eslint-disable-next-line no-var
    var localStorage = new LocalStorage("./scratch");
  }

  localStorage.setItem("GRAPHENE::" + name, graph);
};

export const depersist = (name: string): Graph => {
  name = "GRAPHENE::" + (name || "graph");

  if (typeof localStorage == "undefined" || localStorage == null) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const LocalStorage = require("node-localstorage").LocalStorage;
    // eslint-disable-next-line no-global-assign
    // eslint-disable-next-line no-var
    var localStorage = new LocalStorage("./scratch");
  }

  const flatgraph = localStorage.getItem(name);
  return graphFromJSON(flatgraph as string);
};
