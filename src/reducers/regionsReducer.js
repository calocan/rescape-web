/**
 * Created by Andy Likuski on 2017.02.07
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {combineReducers} from 'redux';
//import geojsonReducer from './geojsonReducer'
import {createViewportReducer} from 'redux-map-gl';
import * as R from 'ramda';
//import {SET_STATE} from './fullStateReducer';
import {reqStrPathThrowing, hasStrPath} from 'rescape-ramda';

/**
 * Only allow the region reducer to be created once for each Region
 * @returns {Function}
 * once: () -> regionName -> () -> Reducer
 */
const once = () => {
  let done = {};
  return regionName => fn => done[regionName] || (done[regionName] = fn.apply(this, arguments));
};

/**
 * Creates a region reducer for the given region. The regionName is passed
 * so that a database specific to the region can be used
 * @param regionName
 * @returns A reducer expecting a state
 */
const regionReducerOnce = once();
const regionReducer = regionName => regionReducerOnce(regionName)(() =>
  combineReducers(R.merge(
    {
      //geojson: geojsonReducer,
      mapbox: createViewportReducer()
    },
    // Implement reducers for these as/if needed
    R.fromPairs(
      R.map(
        key => [key, (state = {}) => state],
        ['id', 'name', 'description', 'geojson', 'geospatial', 'travel', 'gtfs']
      )
    )
  ))
);

/**
 @typedef Geospatial
 @type {Object}
 @property {[Number]} bounds The bounds of the region [min lon, min lat, max lon, max lat]
 */

/**
 @typedef Travel
 @type {Object}
 @property {[Number]} bounds The bounds of the region [min lon, min lat, max lon, max lat]
 */

/**
 @typedef Mapbox
 @type {Object}
 @property {Object} viewport The current Mapbox viewport
 */

/**
 @typedef Region
 @type {Object}
 @property {Geospatial} geospatial Represents location information about the Region
 @property {Travel} User travel within the Region.
 @property {Object} All geojson pertaining to the region from sources such as OpenStreetMap
 @property {Object} Gtfs formatted data for the region
 @property {Mapbox} Required data for the map, suh as the viewport.
 */

/**
 * @param {Object<String, Region>} regionsState The regions reducer reduces an object keyed by Region id
 * @param {String} regionsState.regionId The id of the region

 * @param {Object} action The action
 * @return {Object} The reduced state
 */
export default (regionsState = {}, action = {}) => {
  //case SET_STATE:
  //  return R.merge(regionsState, action.state.regions || {});
  if (hasStrPath('payload.mapState.region', action)) {
    const region = reqStrPathThrowing('payload.mapState.region', action);
    // Delegate all other actionTypes to the current Region's reducer
    // This lens points to the state of the current Region
    const regionLens = R.lensProp(region.id);
    return R.set(
      regionLens,
      // Get or create the reducer for this region
      regionReducer(region.id)(
        // Only pass the region state keys that are handled by the regionReducer
        R.view(regionLens, regionsState),
        R.omit(['region'], action)
      ),
      // TODO we need to prevent R.set from overwriting the state object inner components
      regionsState
    );
  }
  else {
    return regionsState;
  }
};
