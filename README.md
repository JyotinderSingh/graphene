# Graphene

## A lightweight in-memory graph database.

Graphene is a plug-n-play in-memory graph database supporting a myriad of operations across its simple to use graph API. You can use Graphene to model simple social networks, knowledge webs, and anything else consisting of connected data points.

Graphene presents an idiomatic and intuitive API to build and query graphs, some examples are given below.

This project is heavily inspired by the content from the book [500 Lines](https://aosabook.org/en/500L/introduction.html).

| Table of Contents                             |
| --------------------------------------------- |
| [Installation](#installation)                 |
| [Basic API](#basic-api)                       |
| [Advanced Usage](#queries-and-advanced-usage) |
| [Serialization](#serialization)               |
| [Scripts](#scripts)                           |
| [Tests](./tests)                              |

## Installation
```bash
npm i @jyotinder/graphene
```

## Basic API

```typescript
import { Graphene } from "@jyotinder/graphene";

const V = [
  { name: "alice" }, // alice gets an auto-_id
  { _id: 10, name: "bob", hobbies: ["painting", { x: 3 }] },
];
const E = [{ _out: 1, _in: 10, _label: "knows" }];

const g = new Graphene(V, E);

g.graph.addVertex({ name: "charlie", _id: "charlie" });
g.graph.addVertex({ name: "delta", _id: "30" });
g.graph.addEdge({ _out: 10, _in: 30, _label: "parent" });
```

## Queries and Advanced Usage

Note: For more in depth and contextual examples, refer to the integration tests
present in `tests/integration.test.ts`.

```typescript
import { Graphene } from "@jyotinder/graphene";
// Import a dataset, this example is taken from the tests present in ./tests/
import { aesir, relationships, vanir } from "./datasets";

const g = new Graphene(null, null);

// Load the Aesir graph.
aesir.forEach(pair => {
  g.graph.addVertex({
    _id: pair[0],
    species: "Aesir",
    gender: pair[1] == "M" ? "male" : "female",
  });
});

// Load the Vanir graph.
vanir.forEach(name => {
  g.graph.addVertex({ _id: name, species: "Vanir" });
});

// Load the relationships
relationships.forEach(function (pair) {
  g.graph.addEdge({ _in: pair[0], _out: pair[1], _label: "parent" });
});

// Find all vertices.
g.query.v().run();

// Find all vertices belonging to Aesir bloodline.
let output = g.query.v({ species: "Aesir" }).run();

// Find all copies of thor and his wives.
output = g.query.v("Thor").in().out().run();

// Gathering ancestors upto three generations back.
output = g.query
  .v("Thor")
  .out()
  .as("parent") // label as parent.
  .out()
  .as("grandparent") // label as grandparent.
  .out()
  .as("great-grandparent") // label as great-grandparent.
  .merge("parent", "grandparent", "great-grandparent")
  .run();

/**
 * You can also add aliases for different operations,
 * to customize the API according to your usecase and add custom logic.
 * The first argument is the name of the alias.
 * The second argument is the custom logic - which is
 * the program that would be substituted in place of the
 * alias. This is a list of lists, each inner list is a step
 * in the program. The first element is the function to be called,
 * the second element is the argument to be passed to it (if any).
 *
 * A 'parents' call would equate to .out("parent") call.
 * this means finding all the out-vertices with the label "parent".
 **/
g.addAlias("parents", [["out", "parent"]]);

/**
 * A 'children' call would equate to .in("parent") call.
 * This means finding all the in-vertices with the label "parent".
 **/
g.addAlias("children", [["in", "parent"]]);

// parents then children.
output = g.query.v("Thor").parents().children().run();

// siblings alias
g.addAlias("siblings", [
  ["as", "me"],
  ["out", "parent"],
  ["in", "parent"],
  ["except", "me"],
]);

// Magni's siblings
output = g.query.v("Magni").siblings().run();
```

## Serialization

Graphene provides easy to use API for disk persistance and serialization tasks.

```typescript
import {
  Graphene,
  persist,
  depersist,
  graphFromJSON,
  jsonifyGraph,
} from "@jyotinder/graphene";

const g1 = new Graphene(V, E);
const graphName = "example_graph";

// persist the graph.
persist(g1.graph, graphName);

// create new graphene instance.
const g2 = new Graphene(null, null);

// load the persisted graph into the new graphene instance.
g2.setGraph(depersist(graphName));

// barebones serialization
const jsonGraph = jsonifyGraph(g1.graph);
const loadedGraph = graphFromJSON(jsonGraph);

```

## Scripts

Running the tests

```bash
# Runs linter + prettier formatting as well
npm test
```

ESLint

```bash
npm run lint
# in case you want to fix auto-fixable lint errors
npm run lint -- --fix
```

Prettier

```bash
npm run format
```

Building the package

```bash
npm run build
```
