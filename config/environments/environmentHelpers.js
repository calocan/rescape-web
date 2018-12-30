import {mapDefaultUsers, parseApiUrl} from 'rescape-helpers';
import {templateRegion} from '../default/templateRegion';
import {templateUsers} from '../default/templateUsers';

import {environmentConfig as testConfig} from '../../config/environments/testConfig';
import {environmentConfig as devConfig} from '../../config/environments/developmentConfig';
import {environmentConfig as prodConfig} from '../../config/environments/productionConfig';
import * as R from 'ramda';
import {applyDefaultRegion, mapDefaultUsers, parseApiUrl} from 'rescape-helpers';
import {findOneParamsThrowing} from 'rescape-ramda';
import {mergeDeepWithConcatArrays} from 'rescape-ramda';
import {templateRegion} from '../../config/default/templateRegion';
import {templateUsers} from '../../config/default/templateUsers';

/**
 * Created by Andy Likuski on 2018.12.29
 * Copyright (c) 2018 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const env = process.env.NODE_ENV;
/**
 * Depending on process.env.NODE_ENV, we create a different environment config.
 * The environment config is deep merged with the given config, which can contain
 * global settings and private settings such as api keys that don't need to be in source code.
 * config should also contain default values for users, regions, etc that need to be applied as templates
 * to anything created in the other configs.
 *
 * After the deep merge functional behavior is applied, such as merging defaults from config.
 * @param {Object} config Config matching the structure of the environment configs
 * @return {*}
 */
export const createEnvironmentConfig = config => {
  const envConfig = mergeDeepWithConcatArrays(
    R.cond([
      [R.equals('test'), R.always(testConfig)],
      [R.equals('dev'), R.always(devConfig)],
      [R.equals('prod'), R.always(prodConfig)]
    ])(env), config);

  return R.compose(
    // Apply default region to regions
    R.over(
      R.lensProp('regions'),
      applyDefaultRegion(templateRegion)
    ),
    // Map the default users to user then flatten the results
    R.over(
      R.lensProp('users'),
      R.compose(
        // Once we apply templateUsers remove the template keys and flatten
        R.flatten,
        R.values,
        mapDefaultUsers(templateUsers)
      )
    ),
    // Set up the api uri from the parts
    R.over(
      R.lensPath(['settings', 'api']),
      obj => R.merge(obj, {uri: parseApiUrl(obj)})
    )
  )(envConfig);
};