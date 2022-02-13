import { expect } from "chai";
import { describe, it } from "mocha";
import { Graphene } from "../src/graphene";
import { vertexType } from "../src/types/primitives";
import {
  aesir,
  loadAesir,
  loadRelationships,
  loadVanir,
  relationships,
  vanir,
} from "./datasets";

describe("Integration Tests", () => {
  let aesir_count = 0;
  let vanir_count = 0;
  const g = new Graphene(null, null);
  describe("Construct a graph", () => {
    it("should build an empty graph", () => {
      expect(g).to.be.an("object");
      expect(g.graph.edges).to.have.lengthOf(0);
      expect(g.graph.vertices).to.have.lengthOf(0);
    });

    it("should add the Aesir dataset", () => {
      loadAesir(g);
      aesir_count = aesir.length;
      expect(g.graph.edges).to.have.lengthOf(0);
      expect(g.graph.vertices).to.have.lengthOf(aesir_count);
    });

    it("should add the Vanir dataset", () => {
      loadVanir(g);
      vanir_count = vanir.length;
      expect(g.graph.edges).to.have.lengthOf(0);
      expect(g.graph.vertices).to.have.lengthOf(aesir_count + vanir_count);
    });

    it("should add some edges", () => {
      loadRelationships(g);
      const edges_count = relationships.length;
      expect(g.graph.edges).to.have.lengthOf(edges_count);
      expect(g.graph.vertices).to.have.lengthOf(aesir_count + vanir_count);
    });
  });

  describe("Queries in the graph", () => {
    const getAesir = (name: string) => g.query.v(name).run()[0];

    it("g.query.v('Thor') should be Thor", () => {
      const out = g.query.v("Thor").run();
      const thor = out[0];
      expect(thor._id).to.equal("Thor");
      expect(thor.species).to.equal("Aesir");
    });

    it("g.query.v('Thor', 'Odin') should be Thor and Odin", () => {
      const out = g.query.v("Thor", "Odin").run();
      expect(out).to.have.lengthOf(2);
      expect(out).to.contain(getAesir("Odin"));
      expect(out).to.contain(getAesir("Thor"));
    });

    it("g.query.v({species: 'Aesir'}) should be all Aesir", () => {
      const out = g.query.v({ species: "Aesir" }).run();
      expect(out).to.have.lengthOf(aesir_count);
      out.forEach(node => {
        expect(node).to.have.property("species", "Aesir");
      });
    });

    it("g.query.v() should be all Aesir and Vanir", () => {
      const out = g.query.v().run();
      expect(out).to.have.lengthOf(aesir_count + vanir_count);
    });

    it("g.query.v('Thor').in().out() should contain several copies of Thor, and his wives", () => {
      const out = g.query.v("Thor").in().out().run();
      expect(out).to.contain(getAesir("Járnsaxa"));
      expect(out).to.contain(getAesir("Sif"));
      expect(out).to.contain(getAesir("Thor"));

      const out2 = g.query.v("Thor").out().in().unique().run();
      expect(out2).to.contain(getAesir("Thor"));

      const diff = out.length - out2.length;
      expect(diff).to.be.above(0);
    });

    it("g.query.v('Thor').in().in().out().out() should be the empty array, because we don't know Thor's grandchildren", () => {
      const out = g.query.v("Thor").in().in().out().out().run();
      expect(out).to.deep.equal([]);
    });

    it("g.query.v('Thor').out().in() should contain several copies of Thor, and his sibling", () => {
      const out = g.query.v("Thor").out().in().run();
      expect(out).to.contain(getAesir("Baldr"));
      expect(out).to.contain(getAesir("Thor"));

      const out2 = g.query.v("Thor").out().in().unique().run();
      expect(out2).to.contain(getAesir("Thor"));

      const diff = out.length - out2.length;
      expect(diff).to.be.above(0);
    });

    it("filter functions should filter", () => {
      const out = g.query
        .v("Thor")
        .out()
        .in()
        .unique()
        .filter((asgardian: vertexType) => {
          return asgardian._id != "Thor";
        })
        .run();
      expect(out).to.contain(getAesir("Baldr"));
      expect(out).to.not.contain(getAesir("Thor"));
      expect(out).to.have.lengthOf(1);
    });

    it("property works like a map", () => {
      const out1 = g.query
        .v("Thor")
        .out("parent")
        .out("parent")
        .run()
        .map((vertex: vertexType) => {
          return vertex._id;
        });
      const out2 = g.query
        .v("Thor")
        .out("parent")
        .out("parent")
        .property("_id")
        .run();
      expect(out1).to.deep.equal(out2);
    });

    it("g.query.v('Thor').out().in().unique().filter({survives: true}) should be the empty array, because we don't label survivors", () => {
      const out = g.query
        .v("Thor")
        .out()
        .in()
        .unique()
        .filter({ survives: true })
        .run();
      expect(out).to.deep.equal([]);
    });

    it("g.query.v('Thor').out().in().unique().filter({gender: 'male'}) should contain Thor and his sibling", () => {
      const out = g.query
        .v("Thor")
        .out()
        .in()
        .unique()
        .filter({ gender: "male" })
        .run();
      expect(out).to.contain(getAesir("Baldr"));
      expect(out).to.contain(getAesir("Thor"));
    });

    it("g.query.v('Thor').out().out().out().in().in().in() should contain Thor and his sibling", () => {
      const out = g.query.v("Thor").out().out().out().in().in().in().run();
      expect(out).to.contain(getAesir("Baldr"));
      expect(out).to.contain(getAesir("Thor"));
    });

    it("g.query.v('Thor').out().out().out().in().in().in().unique().take(10) should contain Thor and his sibling", () => {
      const out = g.query
        .v("Thor")
        .out()
        .out()
        .out()
        .in()
        .in()
        .in()
        .unique()
        .take(10)
        .run();
      expect(out).to.contain(getAesir("Baldr"));
      expect(out).to.contain(getAesir("Thor"));
    });

    it("g.query.v('Thor').out().out().out().out().in().in().in().in().unique().take(12) should contain Thor and his sibling", () => {
      const out = g.query
        .v("Thor")
        .out()
        .out()
        .out()
        .out()
        .in()
        .in()
        .in()
        .in()
        .unique()
        .take(12)
        .run();
      expect(out).to.contain(getAesir("Baldr"));
      expect(out).to.contain(getAesir("Thor"));
    });

    it("Asynchronous queries should work", () => {
      const q = g.query.v("Auðumbla").in().in().in().property("_id").take(1);

      expect(q.run()).to.deep.equal(["Vé"]);
      expect(q.run()).to.deep.equal(["Vili"]);
      expect(q.run()).to.deep.equal(["Odin"]);
      expect(q.run()).to.be.empty;
      expect(q.run()).to.be.empty;
    });

    it("Gathering ancestors up to three generations back", () => {
      const out = g.query
        .v("Thor")
        .out()
        .as("parent")
        .out()
        .as("grandparent")
        .out()
        .as("great-grandparent")
        .merge("parent", "grandparent", "great-grandparent")
        .run();

      expect(out).to.contain(getAesir("Odin"));
      expect(out).to.contain(getAesir("Borr"));
      expect(out).to.contain(getAesir("Búri"));
      expect(out).to.contain(getAesir("Jörð"));
      expect(out).to.contain(getAesir("Nótt"));
      expect(out).to.contain(getAesir("Nörfi"));
      expect(out).to.contain(getAesir("Bestla"));
      expect(out).to.contain(getAesir("Bölþorn"));
    });

    it("Get Thor's sibling Baldr", () => {
      const out = g.query
        .v("Thor")
        .as("me")
        .out()
        .in()
        .except("me")
        .unique()
        .run();
      expect(out).to.deep.equal([getAesir("Baldr")]);
    });

    it("Get Thor's uncles and aunts", () => {
      const out = g.query
        .v("Thor")
        .out()
        .as("parent")
        .out()
        .in()
        .except("parent")
        .unique()
        .run();
      expect(out).to.deep.equal([
        getAesir("Vé"),
        getAesir("Vili"),
        getAesir("Dagr"),
      ]);
    });

    /// ALIASES

    it("parents alias", () => {
      g.addAlias("parents", [["out", "parent"]]);
      const out1 = g.query.v("Thor").parents().property("_id").run();
      const out2 = g.query.v("Thor").out("parent").property("_id").run();
      expect(out1).to.deep.equal(out2);
    });

    it("children alias", () => {
      g.addAlias("children", [["in", "parent"]]);
      const out1 = g.query.v("Thor").children().run();
      expect(out1).to.deep.equal([
        getAesir("Magni"),
        getAesir("Þrúðr"),
        getAesir("Móði"),
      ]);
    });

    it("parents then children", () => {
      const out1 = g.query.v("Thor").parents().children().run();
      expect(out1).to.deep.equal([
        getAesir("Thor"),
        getAesir("Baldr"),
        getAesir("Thor"),
      ]);
    });

    it("children then parents", () => {
      const out1 = g.query.v("Thor").children().parents().run();
      expect(out1).to.deep.equal([
        getAesir("Járnsaxa"),
        getAesir("Thor"),
        getAesir("Sif"),
        getAesir("Thor"),
        getAesir("Sif"),
        getAesir("Thor"),
      ]);
    });

    it("siblings alias", () => {
      g.addAlias("siblings", [
        ["as", "me"],
        ["out", "parent"],
        ["in", "parent"],
        ["except", "me"],
      ]);
      const out1 = g.query.v("Magni").siblings().run();
      expect(out1).to.deep.equal([getAesir("Þrúðr"), getAesir("Móði")]);
    });

    it("grandparents alias", () => {
      g.addAlias("grandparents", [
        ["out", "parent"],
        ["out", "parent"],
      ]);
      const out1 = g.query.v("Magni").grandparents().run();
      expect(out1).to.deep.equal([getAesir("Odin"), getAesir("Jörð")]);
    });

    it("cousins alias", () => {
      g.addAlias("cousins", [
        ["out", "parent"],
        ["as", "folks"],
        ["out", "parent"],
        ["in", "parent"],
        ["except", "folks"],
        ["in", "parent"],
        ["unique"],
      ]);
      const out1 = g.query.v("Magni").cousins().run();
      expect(out1).to.deep.equal([getAesir("Forseti")]);
    });

    it("manual cousins", () => {
      const out1 = g.query
        .v("Magni")
        .parents()
        .as("parents")
        .parents()
        .children()
        .except("parents") // do not include Magni's parents
        .children()
        .unique()
        .run();
      expect(out1).to.deep.equal([getAesir("Forseti")]);
    });

    it("more cousins", () => {
      const out1 = g.query.v("Forseti").cousins().run();
      expect(out1).to.deep.equal([
        getAesir("Magni"),
        getAesir("Þrúðr"),
        getAesir("Móði"),
      ]);
    });

    it("Odin's grandkids", () => {
      const q = g.query.v("Odin").children().children().take(2);
      expect(q.run()).to.deep.equal([getAesir("Magni"), getAesir("Þrúðr")]);
    });

    it("sons alias", () => {
      g.addAlias("sons", [
        ["in", "parent"],
        ["filter", { gender: "male" }],
      ]);
      const out = g.query.v("Thor").sons().run();
      expect(out).to.deep.equal([getAesir("Magni"), getAesir("Móði")]);
    });

    it("daughters alias", () => {
      g.addAlias("daughters", [
        ["in", "parent"],
        ["filter", { gender: "female" }],
      ]);
      const out = g.query.v("Thor").daughters().run();
      expect(out).to.deep.equal([getAesir("Þrúðr")]);
    });

    it("Fjörgynn's daughters who have children with Bestla's sons", () => {
      // as it originally appeared, modified to work with our data model
      const out = g.query
        .v("Fjörgynn")
        .daughters()
        .as("me")
        .in()
        .out()
        .out()
        .filter({ _id: "Bestla" })
        .back("me")
        .unique()
        .run();

      expect(out).to.deep.equal([getAesir("Frigg")]);
    });

    it("Fjörgynn's daughters who have children with Bestla's sons", () => {
      // final book version
      const out = g.query
        .v("Fjörgynn")
        .in()
        .as("me") // first gremlin's state.as is Frigg
        .in() // first gremlin's vertex is now Baldr
        .out()
        .out() // make a clone of that gremlin for each grandparent
        .filter({ _id: "Bestla" }) // keep only the gremlin on grandparent Bestla
        .back("me")
        .unique()
        .run(); // jump the gremlin's vertex back to Frigg and exit

      expect(out).to.deep.equal([getAesir("Frigg")]);
    });

    it("no edge filter", () => {
      g.graph.addEdge({
        _label: "spouse",
        _out: "Frigg",
        _in: "Odin",
        order: 1,
      });
      g.graph.addEdge({
        _label: "spouse",
        _out: "Jörð",
        _in: "Odin",
        order: 2,
      });
      g.graph.addEdge({
        _label: "owner",
        _out: "Fenrir",
        _in: "Odin",
        order: 2,
      });
      const out = g.query.v("Odin").in().run();
      expect(out).to.deep.equal([
        getAesir("Fenrir"),
        getAesir("Jörð"),
        getAesir("Frigg"),
        getAesir("Thor"),
        getAesir("Baldr"),
      ]);
    });

    it("string edge filter", () => {
      const out = g.query.v("Odin").in("parent").run();
      expect(out).to.deep.equal([getAesir("Thor"), getAesir("Baldr")]);
    });

    it("array edge filter", () => {
      const out = g.query.v("Odin").in(["parent", "spouse"]).run();
      expect(out).to.deep.equal([
        getAesir("Jörð"),
        getAesir("Frigg"),
        getAesir("Thor"),
        getAesir("Baldr"),
      ]);
    });

    it("object edge filter", () => {
      const out = g.query.v("Odin").in({ _label: "spouse", order: 2 }).run();
      expect(out).to.deep.equal([getAesir("Jörð")]);
    });
  });
});
