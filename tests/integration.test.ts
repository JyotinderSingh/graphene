import { expect } from "chai";
import { describe, it } from "mocha";
import { Graphene } from "../src/graphene";
import {
  aesir,
  loadAesir,
  loadRelationships,
  loadVanir,
  relationships,
  vanir
} from "./datasets"

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

    it('should add the Vanir dataset', () => {
      loadVanir(g);
      vanir_count = vanir.length
      expect(g.graph.edges).to.have.lengthOf(0)
      expect(g.graph.vertices).to.have.lengthOf(aesir_count + vanir_count)
    });

    it('should add some edges', () => {
      loadRelationships(g);
      const edges_count = relationships.length
      expect(g.graph.edges).to.have.lengthOf(edges_count)
      expect(g.graph.vertices).to.have.lengthOf(aesir_count + vanir_count)
    })
  });

  describe("Queries in the graph", () => {
    const getAesir = (name: string) => g.query.v(name).run()[0]

    it("g.query.v('Thor') should be Thor", () => {
      var out = g.query.v('Thor').run()
      var thor = out[0]
      expect(thor._id).to.equal('Thor')
      expect(thor.species).to.equal('Aesir')
    })

    it("g.query.v('Thor', 'Odin') should be Thor and Odin", () => {
      const out = g.query.v('Thor', 'Odin').run()
      expect(out).to.have.lengthOf(2)
      expect(out).to.contain(getAesir('Odin'))
      expect(out).to.contain(getAesir('Thor'))
    })

    it("g.query.v({species: 'Aesir'}) should be all Aesir", () => {
      var out = g.query.v({ species: 'Aesir' }).run()
      expect(out).to.have.lengthOf(aesir_count)
      out.forEach(function (node) {
        expect(node).to.have.property('species', 'Aesir')
      })
    })

    it("parents alias", function () {
      g.addAlias('parents', [['out', 'parent']])
      const out1 = g.query.v('Thor').parents().property('_id').run()
      const out2 = g.query.v("Thor").out('parent').property('_id').run()
      expect(out1).to.deep.equal(out2)
    })
  })
});