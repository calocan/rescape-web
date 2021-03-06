import privateConfig from '../environments/testConfig';
import {mergeDeep} from 'rescape-ramda';

export const environmentConfig = mergeDeep(privateConfig, {
  settings: {
    mapbox: {
      mapboxApiAccessToken: 'pk.eyJ1IjoiY2Fsb2NhbiIsImEiOiJjaXl1aXkxZjkwMG15MndxbmkxMHczNG50In0.07Zu3XXYijL6GJMuxFtvQg',
      iconAtlas: 'data/location-icon-atlas.png',
      showCluster: 'true'
    },
    domain: 'localhost',
    api: {
      protocol: 'http',
      host: 'localhost',
      port: '3000',
      root: '/graphql/'
    }
  }
});
