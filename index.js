var MIDDLEWARE_FUNCTION_NAME = '__reactRouterPrerenderMiddleware__'

function spaces (n) {
  var val = ''
  for (var i = 0; i <= n; i++) {
    val += ' '
  }
  return val
}

function log (routes, lastRoute) {
  for (var i = 0; i <= (lastRoute || (routes.length - 1)); i++) {
    var route = routes[i];
    var logRoute = '[ route: ' + (route.name || 'anonymous') + ' ]';
    var component = route.component;
    var logRouteComponent = component
      ? ' -> [ component: ' + (component.displayName || 'anonymous') + ' ]'
      : '';
    var logRouteComponentHasMiddleware = (component[MIDDLEWARE_FUNCTION_NAME] ? '\u2713' : '\u2717') + ' '
    console.log('[RRPM] ' + logRouteComponentHasMiddleware + logRoute + logRouteComponent);
  }
}

function findDeepestMiddleware (routes, logging) {
  if (process.env.NODE_ENV !== 'production') {
    if (logging) {
      console.log('\n[RRPM] >> searching for middleware');
    }
  }

  var numRoutesInStack = routes.length
  for (var i = numRoutesInStack - 1; i > -1; i--) {
    var route = routes[i];
    var component = route.component;
    var middleware = component && component[MIDDLEWARE_FUNCTION_NAME];

    if (middleware) {
      if (process.env.NODE_ENV !== 'production') {
        if (logging) {
          log(routes, i);
          console.log('[RRPM] >> middleware found\n\n');
        }
      }

      return middleware;
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    if (logging) {
      log(routes);
      console.log('[RRPM] >> middleware NOT found\n\n');
    }
  }

  return false
}

module.exports = {
  reactRouterPrerenderMiddleware: function (props, options) {
    options = options || {};
    var middleware = findDeepestMiddleware(props.routes, options.logging);

    if (middleware) {
      return middleware(props, options.extraArgs) || Promise.resolve({ middlewareReturnedNothing: true });
    }

    return Promise.resolve({ noMiddlewareFound: true });
  },
  connectReactRouterPrerenderMiddleware: function (middleware, displayName) {
    return function (Component) {
      Component[MIDDLEWARE_FUNCTION_NAME] = middleware;

      if (displayName) {
        Component.displayName = displayName;
      }

      return Component;
    }
  },
  MIDDLEWARE_FUNCTION_NAME: MIDDLEWARE_FUNCTION_NAME
}
