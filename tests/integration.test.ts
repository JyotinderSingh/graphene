import { expect } from "chai";
import { describe, it } from "mocha";
import { Graphene } from "../src/graphene";
import { aesir, loadAesir, loadRelationships, loadVanir, relationships, vanir } from "./datasets"

describe("Integration Tests", () => {
  let aesir_count = 0
  let vanir_count = 0;
  let g = new Graphene(null, null);
  describe("Construct a graph", () => {
    it("should build an empty graph", () => {
      expect(g).to.be.an("object")
      expect(g.graph.edges).to.have.lengthOf(0);
      expect(g.graph.vertices).to.have.lengthOf(0);
    });

    it("should add the Aesir dataset", () => {
      loadAesir(g);
      aesir_count = aesir.length
      expect(g.graph.edges).to.have.lengthOf(0);
      expect(g.graph.vertices).to.have.lengthOf(aesir_count);
    });

    it('should add the Vanir dataset', function () {
      loadVanir(g);
      vanir_count = vanir.length
      expect(g.graph.edges).to.have.lengthOf(0)
      expect(g.graph.vertices).to.have.lengthOf(aesir_count + vanir_count)
    });

    it('should add some edges', function () {
      loadRelationships(g);
      const edges_count = relationships.length
      expect(g.graph.edges).to.have.lengthOf(edges_count)
      expect(g.graph.vertices).to.have.lengthOf(aesir_count + vanir_count)
    })
  });
});