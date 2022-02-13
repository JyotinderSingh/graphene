import { expect } from "chai";
import Graphene from "../src/graphene";

describe("Basics", () => {
  describe("Build a simple graph", () => {
    let g: Graphene;
    const v1 = { _id: 1, name: "foo", type: "banana" };
    const v2 = { _id: 2, name: "bar", type: "orange" };
    const e1 = { _out: 1, _in: 2, _label: "fruitier" };

    it("should build an empty graph", () => {
      g = new Graphene(null, null);
      expect(g).to.be.an("object");
      expect(g.graph.edges).to.have.lengthOf(0);
      expect(g.graph.vertices).to.have.lengthOf(0);
    });

    it("should add a vertex v1", () => {
      g.graph.addVertex(v1);
      expect(g.graph.edges).to.have.lengthOf(0);
      expect(g.graph.vertices).to.have.lengthOf(1);
    });

    it("should add another vertex v2", () => {
      g.graph.addVertex(v2);
      expect(g.graph.edges).to.have.lengthOf(0);
      expect(g.graph.vertices).to.have.lengthOf(2);
    });

    it("should add an edge v1->v2", () => {
      g.graph.addEdge(e1);
      expect(g.graph.edges).to.have.lengthOf(1);
      expect(g.graph.vertices).to.have.lengthOf(2);
    });

    it("g.query.v(1) should return v1", () => {
      const out = g.query.v(1).run();
      expect(out).to.deep.equal([v1]);
    });

    it("g.query.v(1).out() should follow out edge v1->v2 and return v2", () => {
      const out = g.query.v(1).out().run();
      expect(out).to.deep.equal([v2]);
    });

    it("g.query.v(2).in() should follow in edge v2<-v1 and return v1", () => {
      const out = g.query.v(2).in().run();
      expect(out).to.deep.equal([v1]);
    });

    it("g.query.v(2).out() should follow no edge and return nothing", () => {
      const out = g.query.v(2).out().run();
      expect(out).to.be.empty;
    });
  });

  describe("Build a bigger graph", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let g: Graphene, V: any[], E: any[];

    it("should build the graph", () => {
      const vertices = [
        { _id: 1, name: "Fred" },
        { _id: 2, name: "Bob" },
        { _id: 3, name: "Tom" },
        { _id: 4, name: "Dick" },
        { _id: 5, name: "Harry" },
        { _id: 6, name: "Lucy" },
      ];

      const edges = [
        { _out: 1, _in: 2, _label: "son" },
        { _out: 2, _in: 3, _label: "son" },
        { _out: 2, _in: 4, _label: "son" },
        { _out: 2, _in: 5, _label: "son" },
        { _out: 2, _in: 6, _label: "daughter" },
        { _out: 3, _in: 4, _label: "brother" },
        { _out: 4, _in: 5, _label: "brother" },
        { _out: 5, _in: 3, _label: "brother" },
        { _out: 3, _in: 5, _label: "brother" },
        { _out: 4, _in: 3, _label: "brother" },
        { _out: 5, _in: 4, _label: "brother" },
        { _out: 3, _in: 6, _label: "sister" },
        { _out: 4, _in: 6, _label: "sister" },
        { _out: 5, _in: 6, _label: "sister" },
        { _out: 6, _in: 3, _label: "brother" },
        { _out: 6, _in: 4, _label: "brother" },
        { _out: 6, _in: 5, _label: "brother" },
      ];

      g = new Graphene(vertices, edges);

      expect(g.graph.vertices).to.have.lengthOf(6);
      expect(g.graph.edges).to.have.lengthOf(17);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (V = vertices), (E = edges);
      V.unshift("");
    });

    it("g.query.v(1).out().out() should get all grandkids", () => {
      const out = g.query.v(1).out().out().run();
      expect(out).to.deep.equal([V[6], V[5], V[4], V[3]]);
    });

    it("g.query.v(1).out().in().out() means 'fred is his son's father'", () => {
      const out = g.query.v(1).out().in().out().run();
      expect(out).to.deep.equal([V[2]]);
    });

    it("g.query.v(1).out().out('daughter') should get the granddaughters", () => {
      const out = g.query.v(1).out().out("daughter").run();
      expect(out).to.deep.equal([V[6]]);
    });

    it("g.query.v(3).out('sister') means 'who is tom's sister?'", () => {
      const out = g.query.v(3).out("sister").run();
      expect(out).to.deep.equal([V[6]]);
    });

    it("g.query.v(3).out().in('son').in('son') means 'who is tom's brother's grandfather?'", () => {
      const out = g.query.v(3).out().in("son").in("son").run();
      expect(out).to.deep.equal([V[1], V[1]]);
    });

    it("g.query.v(3).out().in('son').in('son').unique() should return the unique grandfather", () => {
      const out = g.query.v(3).out().in("son").in("son").unique().run();
      expect(out).to.deep.equal([V[1]]);
    });
  });
});
