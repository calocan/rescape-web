/**
 * Created by Andy Likuski on 2018.12.28
 * Copyright (c) 2018 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Default region to merge into other regions created in the config or during use of the app
export const templateRegion = {
  // Geojson of the region. This is probably always the boundary
  geojson: {},
  // Search history
  searches: [],
  // Locations associated with the region. This can be used to limit the locations allowed in a project
  // Alternatively the geojson of the region could be used to limit the locations
  // Alternatively query params could be associated with the user's group to limit locations
  locations: [],
  mapbox: {
    viewport: {
      pitch: 0,
      bearing: 0,
      startDragLngLat: null,
      isDragging: false,

      latitude: 0,
      longitude: 0,
      zoom: 1
    }
  }
};