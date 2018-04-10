/**
 * Created by Andy Likuski on 2017.12.06
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {mergeDeepAll, reqPathThrowing, reqStrPathThrowing} from 'rescape-ramda';
import {createSelector} from 'reselect';
import * as R from 'ramda';
import {mapboxSettingsSelector} from 'selectors/settingsSelectors';
import {fromImmutable} from 'rescape-helpers';
import {v} from 'rescape-validate'
import PropTypes from 'prop-types'

/**
 * @typedef {Object} Viewport The Mapbox viewport
 */

/**
 * @typedef {Object} Mapbox Properties pertaining to a Mapbox map
 * @property {Object} settings The Mapbox settings
 * @property {Viewport} viewport The mapbox viewport
 */

/**
 * Creates a Mapbox object by combining state.settings.mapbox with region.mapbox
 * @param {Object} state Redux state
 * @param {Object} region Region containing mapbox
 * @return {Mapbox} A complete Mapbox object
 */
export const mapboxSelector = v((state, {region}) => {
  const mapbox = reqStrPathThrowing('mapbox', region)
  return createSelector(
    [
      mapboxSettingsSelector,
      () => viewportSelector(state, {mapbox})
    ],
    (mapboxSettings, viewport) => R.merge(
      // state.settings.mapbox is lowest priority, it might be overriden with region.mapbox.settings
      R.defaultTo({}, mapboxSettings),
      // Set the viewport with the results of the viewportSelector, which merges viewport settings and resolves an immutable
      R.set(
        R.lensProp('viewport'),
        viewport,
        mapbox)
      )
  )(state, {region});
}, [
  ['state', PropTypes.shape().isRequired],
  ['props', PropTypes.shape({
    region: PropTypes.shape()
  }).isRequired],
], 'mapboxSelector');

/**
 * Creates a Viewport object by combining state.settings.mapbox.viewport with mapbox.viewport
 * @param {Object} state The redux State
 * @param {Object} mapbox The Mapbox object
 * @returns {Object} The selector function expecting state and props
 */
export const viewportSelector = v((state, {mapbox}) => {
  const viewport = reqStrPathThrowing('viewport', mapbox)
  return createSelector(
    [mapboxSettingsSelector],
    // Viewport is stored as an immutable, since react-map-gl's createViewportReducer expects it
    // If we don't need the reducer we should be able to get rid of the immutable
    mapboxSettings => mergeDeepAll([
      // state.mapbox.settings gets lowest priority
      R.defaultTo({}, mapboxSettings.viewport),
      // Get mutable form from mapbox
      fromImmutable(viewport)
      // Temporarily merge the updated viewport from the state, since we are updating it via redux
      // Should not be needed, refetch in the container should update regions.[id].mapbox.viewport
      // to the reduced version
      /*
      fromImmutable(
          reqPathThrowing(['regions', region.id, 'mapbox', 'viewport'], state)
      )
      */
    ])
  )(state, {mapbox});
}, [
  ['state', PropTypes.shape().isRequired],
  ['props', PropTypes.shape({
    mapbox: PropTypes.shape()
  }).isRequired],
], 'viewportSelector');

