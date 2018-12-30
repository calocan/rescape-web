export const environmentConfig = {
  settings: {
    mapbox: {
      // This is the SoP API token for Mapbox
      mapboxApiAccessToken: 'pk.eyJ1IjoiY2Fsb2NhbiIsImEiOiJjaXl1aXkxZjkwMG15MndxbmkxMHczNG50In0.07Zu3XXYijL6GJMuxFtvQg'
    },
    // This server must be running in order for integration tests to pass
    api: {
      protocol: 'http',
      host: 'localhost',
      port: '8000',
      path: '/api/graphql'
    },
    // This user must be set up on the server in order for integration tests to pass
    // This is only in the testConfig. Normally the user would authenticate
    apiAuthorization: {
      username: 'test',
      password: 'testpass'
    }
  }
};
