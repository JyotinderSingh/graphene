# Graphene

## A lightweight in-memory graph database.

Graphene is a plug-n-play in-memory graph database supporting a myriad of operations across its simple to use graph API. You can use Graphene to model simple social networks, knowledge webs, and anything else consisting of connected data points.

Graphene presents an idiomatic and intuitive API to build and query graphs, some examples are given below.

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
out = g.query.v("Thor").in().out().run();

// Gathering ancestors upto three generations back.
out = g.query
  .v("Thor")
  .out()
  .as("parent") // label as parent.
  .out()
  .as("grandparent") // label as grandparent.
  .out()
  .as("great-grandparent") // label as great-grandparent.
  .merge("parent", "grandparent", "great-grandparent")
  .run();
```
