import {shallow} from 'enzyme';
import app from './App'
import {createSampleConfig, initialState} from 'rescape-sample-data'
import {eMap} from 'rescape-helpers-component';
import {mapStateToProps} from './AppContainer';
onst [App] = eMap([app]);

describe('The current application', () => {
  const sampleConfig = createSampleConfig
  const state = initialState(sampleConfig);

  const props = {
    // Style proportional to the browser size
    style: {
      width: 0.5,
      height: 0.5
    }
  };

  test('Current can mount', () => {
    const wrapper = shallow(
      App(mapStateToProps(state, props))
    );
    expect(wrapper).toMatchSnapshot();
  });
});
