import ReactDOM from 'react-dom';
import './styles/index.css';
import App from 'components/app';
import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter} from 'react-router-dom';
import {ApolloProvider} from 'react-apollo';
import {Provider} from 'react-redux';
import {eMap} from 'rescape-helpers-component';
import createClient from 'rescape-apollo';
import rootReducer from 'reducers';
import {createReduxStore} from 'rescape-helpers'
import {currentConfig} from 'helpers/testHelpers'

import {calculateResponsiveState} from 'redux-responsive';
import createInitialState from 'initialState';

const [browserRouter, apolloProvider, provider, app] = eMap(
  [BrowserRouter, ApolloProvider, Provider, App]
);

// Create a store based on the configured environment (development, production, test)
const initialState = createInitialState(currentConfig);

const store = createReduxStore(initialState, rootReducer);
window.addEventListener('resize', () => store.dispatch(calculateResponsiveState(window)));
// Initialize
store.dispatch(calculateResponsiveState(window));


// Render the React components
ReactDOM.render(
  // BrowserRouter routes anything defined in a child component Switch
  browserRouter({basename: '/'},
    // The Redux provider. This will probably be removed
    provider({store},
      // ApolloProvider wraps our components with the ApolloClient so we can access GraphQL data from anywhere
      apolloProvider({client: createClient({store})},
        app()
      )
    )
  ),
  // 'root' is the id of the <div> defined in index.html
  document.getElementById('root')
);
registerServiceWorker();