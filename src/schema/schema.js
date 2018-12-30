/**
 * Created by Andy Likuski on 2017.11.29
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @file TODO There is no longer reason for this to exist. Use rescape-sample-data's schema for testing.
 * For production get the remote schema from the server
 */

import * as R from 'ramda';
import geojson from 'graphql-geojson';
import {
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLNonNull
} from 'graphql';

const {PointObject} = geojson;


/**
 * Requires an id field
 * @type {{id: {type}}}
 */
const idFieldObj = {
  id: {
    type: new GraphQLNonNull(GraphQLString)
  }
};
/**
 * An optional list of ids as a query argument
 * @type {{ids: {type}}}
 */
const idsFieldObj = {
  ids: {
    type: new GraphQLList(GraphQLInt)
  }
};

/**
 * Required parentId of an object being queried
 * This would only be needed for a child that is expensive to load and
 * thus queried separately from the parent
 * @type {{ids: {type}}}
 */
const parentIdFieldObj = {
  parentId: {
    type: new GraphQLNonNull(GraphQLString)
  }
};

/**
 * An optional userId to limit a query. There must
 * be some way of resolving which queried objects are associated with the user
 * @type {{userId: {type}}}
 */
const userIdFieldObj = {
  userId: {
    type: new GraphQLList(GraphQLInt)
  }
};

const Json = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON value',
  serialize: x => {
    return R.ifElse(R.is(String), x => JSON.parse(x), R.identity)(x);
  },
  parseValue: R.ifElse(R.is(String), x => JSON.parse(x), R.identity),
  parseLiteral: R.identity
});

// Copy of graphql-geojson FeatureObject but expects the propertis to be an object, not a json string
const FeatureObjectWithPropertiesAsObject = new GraphQLObjectType({
  name: 'geojsonFeature',
  description: 'An object that links a geometry to properties in order to provide context.',
  interfaces: () => [geojson.GeoJSONInterface],
  fields: () => ({
    type: {type: new GraphQLNonNull(geojson.TypeEnum)},
    crs: {type: new GraphQLNonNull(geojson.CoordinateReferenceSystemObject)},
    bbox: {type: new GraphQLList(GraphQLFloat)},
    geometry: {type: geojson.GeometryInterface},
    // Here is the only change
    properties: {type: Json},
    id: {type: GraphQLString}
  })
});

/**
 * The TypeDefs that define the structure of our data store on the client
 * These are resolved using resolvers, either in a test data environment or against running database
 */

const OpenStreetMapType = new GraphQLObjectType({
  name: 'OpenStreetMap',
  fields: {
    type: {type: GraphQLString},
    generator: {type: GraphQLString},
    copyright: {type: GraphQLString},
    timestamp: {type: GraphQLString},
    features: {type: new GraphQLList(FeatureObjectWithPropertiesAsObject)}
  }
});

// TODO this isn't correctly defined
const LocationType = new GraphQLObjectType({
  name: 'Location',
  fields: {
    type: {type: GraphQLString},
    generator: {type: GraphQLString},
    copyright: {type: GraphQLString},
    timestamp: {type: GraphQLString},
    features: {type: new GraphQLList(FeatureObjectWithPropertiesAsObject)}
  }
});

const SankeyNodeType = new GraphQLObjectType({
  name: 'SankeyNode',
  fields: {
    siteName: {type: GraphQLString},
    location: {type: GraphQLString},
    coordinates: {type: GraphQLString},
    isGeneralized: {type: GraphQLBoolean},
    junctionStage: {type: GraphQLString},
    annualTonnage: {type: GraphQLString},
    value: {type: GraphQLFloat},
    name: {type: GraphQLString},
    index: {type: GraphQLInt},
    material: {type: GraphQLString},
    type: {type: GraphQLString},
    geometry: {type: geojson.GeometryInterface}
  }
});

const SankeyLinkType = new GraphQLObjectType({
  name: 'SankeyLink',
  fields: {
    source: {type: GraphQLInt},
    target: {type: GraphQLInt},
    value: {type: GraphQLFloat}
  }
});

const SankeyGraphType = new GraphQLObjectType({
  name: 'SankeyGraph',
  fields: {
    nodes: {type: new GraphQLList(SankeyNodeType)},
    links: {type: new GraphQLList(SankeyLinkType)}
  }
});

const SankeyStageType = new GraphQLObjectType({
  name: "SankeyStage",
  fields: {
    key: {type: GraphQLString},
    name: {type: GraphQLString},
    target: {type: new GraphQLList((GraphQLString))}
  }
});

const SankeyType = new GraphQLObjectType({
  name: 'Sankey',
  fields: {
    graph: {type: SankeyGraphType},
    stages: {type: new GraphQLList(SankeyStageType)},
    stageKey: {type: GraphQLString},
    valueKey: {type: GraphQLString}
  }
});

const GeojsonType = new GraphQLObjectType({
  name: 'Geojson',
  fields: {
    osm: {type: OpenStreetMapType},
    locations: {type: new GraphQLList(LocationType)},
    sankey: {type: SankeyType}
  }
});

const BoundsType = new GraphQLObjectType({
  name: 'Bounds',
  fields: {
    min: {type: PointObject},
    max: {type: PointObject}
  }
});

const GeospatialType = new GraphQLObjectType({
  name: 'Geospatial',
  fields: {
    bound: {type: BoundsType}
  }
});

// The Mapbox Viewport
const ViewportType = new GraphQLObjectType({
  name: 'Viewport',
  fields: {
    latitude: {type: GraphQLFloat},
    longitude: {type: GraphQLFloat},
    zoom: {type: GraphQLInt}
  }
});

// Mapbox state
const MapboxType = new GraphQLObjectType({
  name: 'Mapbox',
  fields: {
    viewport: {type: ViewportType}
  }
});

// A user defined geospatial region
const RegionType = new GraphQLObjectType({
  name: 'Region',
  fields: R.merge(idFieldObj, {
    name: {type: GraphQLString},
    description: {type: GraphQLString},
    geojson: {type: GeojsonType},
    geospatial: {type: GeospatialType},
    mapbox: {type: MapboxType}
  })
});

// This is a minimal version of Region in the context of the user.
// It should probably be refactored to use fragments or whatever.
const UserRegionType = new GraphQLObjectType({
  name: 'UserRegion',
  fields: R.merge(idFieldObj, {
    name: {type: GraphQLString},
    description: {type: GraphQLString},
    isSelected: {type: GraphQLBoolean}
  })
});


// Permission operation
const OperationType = new GraphQLObjectType({
  name: 'Operation',
  fields: R.merge(idFieldObj, {
    name: {type: GraphQLString},
    description: {type: GraphQLString}
  })
});

const PermissionType = new GraphQLObjectType({
  name: 'Permission',
  fields: R.merge(idFieldObj, {
    name: {type: GraphQLString},
    operations: {type: new GraphQLList(OperationType)}
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: R.merge(idFieldObj, {
    name: {type: GraphQLString},
    email: {type: GraphQLString},
    password: {type: GraphQLString},
    //permissions: {type: new GraphQLList(PermissionType)},
    regions: {type: new GraphQLList(UserRegionType)}
  })
});

// Settings for Mapbox
const MapboxSettingsType = new GraphQLObjectType({
  name: 'MapboxSettings',
  fields: {
    mapboxApiAccessToken: {type: GraphQLString},
    iconAtlas: {type: GraphQLString},
    showCluster: {type: GraphQLBoolean}
  }
});

// Api settings
const ApiSettingsType = new GraphQLObjectType({
  name: 'ApiSettings',
  fields: {
    protocol: {type: GraphQLString},
    host: {type: GraphQLString},
    port: {type: GraphQLString},
    root: {type: GraphQLString}
  }
});

// Overpass Api (OpenStreetMap) settings
const OverpassSettingsType = new GraphQLObjectType({
  name: 'OverpassSettings',
  fields: {
    cellSize: {type: GraphQLInt},
    sleepBetweenCalls: {type: GraphQLInt}
  }
});

// container for settings
const SettingsType = new GraphQLObjectType({
  name: 'Settings',
  fields: R.merge(idFieldObj, {
    mapbox: {type: MapboxSettingsType},
    api: {type: ApiSettingsType},
    overpass: {type: OverpassSettingsType}
  })
});


// Base Query type containing everything we can query
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: R.merge({
      regions: {
        type: new GraphQLList(RegionType),
        args: R.merge(idsFieldObj, userIdFieldObj)
      },
      region: {
        type: RegionType,
        args: idFieldObj
      },
      mapbox: {
        type: RegionType,
        args: parentIdFieldObj
      },
      users: {
        type: new GraphQLList(UserType),
        args: idFieldObj
      },
      user: {
        type: UserType,
        args: idFieldObj
      },
      settings: {type: new GraphQLList(SettingsType)}
    },
    // Worthless list all the geojson types here so the schema includes them. Feature type needs them as subclass
    // but they aren't explicitly listed
    R.mapObjIndexed(type => ({type}), geojson)
  )
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    filterSankeyNodesMutation: {
      type: SankeyNodeType,
      args: {
        filterNodeCategory: {type: new GraphQLNonNull(GraphQLString)},
        filterNodeValue: {type: new GraphQLNonNull(GraphQLBoolean)}
      }
    },
    /*
    TODO create SignupUserType and AuthenticateUserType
    signupUserMutations: {
      type: SignupUserType,
      args: {
        signupUserInputType: {type: new GraphQLNonNull(SignupUserInputType)}
      }
    },
    authenticateUserMutation: {
      type: AuthenticateUserType,
      args: {
        signupUserInputType: {type: new GraphQLNonNull(SignupUserInputType)}
      }
    }
    */
  }
});

/***
 * Returns a GraphQLSchema instance
 */
export default () => new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
})
