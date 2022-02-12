import { Graphene } from "../src/graphene"
export const aesir = [['Auðumbla', 'F'], ['Ymir', 'M'], ['Þrúðgelmir', 'M'],
['Bergelmir', 'M'], ['Búri', 'M'], ['Borr', 'M'], ['Bölþorn', 'M'],
['Bestla', 'F'], ['Odin', 'M'], ['Vili', 'M'], ['Vé', 'M'], ['Hœnir', 'M'],
['Fjörgynn', 'M'], ['Frigg', 'F'], ['Annar', 'M'], ['Jörð', 'F'],
['Nepr', 'M'], ['Gríðr', 'F'], ['Forseti', 'M'], ['Rindr', 'F'],
['Dellingr', 'M'], ['Nótt', 'F'], ['Nanna', 'F'], ['Baldr', 'M'],
['Höðr', 'M'], ['Hermóðr', 'M'], ['Bragi', 'M'], ['Iðunn', 'F'],
['Víðarr', 'M'], ['Váli', 'M'], ['Gefjon', 'F'], ['Ullr', 'M'], ['Týr', 'M'],
['Dagr', 'M'], ['Thor', 'M'], ['Sif', 'F'], ['Járnsaxa', 'F'], ['Nörfi', 'M'],
['Móði', 'M'], ['Þrúðr', 'F'], ['Magni', 'M'], ['Ægir', 'M'], ['Rán', 'F'],
['Nine sisters', 'F'], ['Heimdallr', 'M']
]

export const vanir = ['Alvaldi', 'Þjazi', 'Iði', 'Gangr', 'Fárbauti', 'Nál', 'Gymir',
  'Aurboða', 'Njörðr', 'Skaði', 'Sigyn', 'Loki', 'Angrboða', 'Býleistr',
  'Helblindi', 'Beli', 'Gerðr', 'Freyr', 'Freyja'
  , 'Óðr', 'Vali', 'Narfi', 'Hyrrokkin', 'Fenrir', 'Jörmungandr', 'Hel',
  'Fjölnir', 'Hnoss', 'Gersemi', 'Hati Hróðvitnisson', 'Sköll', 'Mánagarmr'
]

export const relationships =
  [['Ymir', 'Þrúðgelmir']
    , ['Þrúðgelmir', 'Bergelmir']
    , ['Bergelmir', 'Bölþorn']
    , ['Bölþorn', 'Bestla']
    , ['Bestla', 'Odin']
    , ['Bestla', 'Vili']
    , ['Bestla', 'Vé']

    , ['Auðumbla', 'Búri']
    , ['Búri', 'Borr']
    , ['Borr', 'Odin']
    , ['Borr', 'Vili']
    , ['Borr', 'Vé']

    , ['Ægir', 'Nine sisters']
    , ['Rán', 'Nine sisters']
    , ['Nine sisters', 'Heimdallr']

    , ['Fjörgynn', 'Frigg']
    , ['Frigg', 'Baldr']
    , ['Odin', 'Baldr']
    , ['Nepr', 'Nanna']
    , ['Nanna', 'Forseti']
    , ['Baldr', 'Forseti']

    , ['Nörfi', 'Nótt']
    , ['Nótt', 'Dagr']
    , ['Nótt', 'Jörð']
    , ['Annar', 'Jörð']

    , ['Jörð', 'Thor']
    , ['Odin', 'Thor']
    , ['Thor', 'Móði']
    , ['Thor', 'Þrúðr']
    , ['Sif', 'Móði']
    , ['Sif', 'Þrúðr']
    , ['Thor', 'Magni']
    , ['Járnsaxa', 'Magni']

  ];

export const loadAesir = (g: Graphene) => {
  aesir.forEach(function (pair) {
    g.graph.addVertex({
      _id: pair[0]
      , species: 'Aesir'
      , gender: pair[1] == 'M' ? 'male' : 'female'
    })
  })
}

export const loadVanir = (g: Graphene) => {
  vanir.forEach((name) => {
    g.graph.addVertex({ _id: name, species: 'Vanir' })
  })
}

export const loadRelationships = (g: Graphene) => {
  relationships.forEach(function (pair) {
    g.graph.addEdge({ _in: pair[0], _out: pair[1], _label: 'parent' })
  })
}