# Graphene

## A lightweight in-memory graph database.

Graphene is a plug-n-play in-memory graph database supporting a myriad of operations across its simple to use graph API. You can use Graphene to model simple social networks, knowledge webs, and anything else consisting of connected data points.

```javascript
import { Graphene } from "@jyotinder/graphene";

const V = [
  { name: "alice" }, // alice gets auto-_id
  { _id: 10, name: "bob", hobbies: ["asdf", { x: 3 }] },
];
const E = [{ _out: 1, _in: 10, _label: "knows" }];

const g = new Graphene(V, E);

g.graph.addVertex({ name: "charlie", _id: "charlie" });
g.graph.addVertex({ name: "delta", _id: "30" }); // in fact they're all strings
g.graph.addEdge({ _out: 10, _in: 30, _label: "parent" });
```
