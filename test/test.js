var polyfillPromise = require('es6-promise').polyfill;
var reactRoutePrerenderMiddleware = require('../index.js').reactRouterPrerenderMiddleware;
var expect = require('chai').expect

function generateMiddleware (checkString) {
  return function (props, extraArgs) {
    return Promise.resolve({
      checkString: checkString,
      props: props,
      extraArgs: extraArgs
    });
  };
}

var middlewares = [
  generateMiddleware('middleware-1'),
  generateMiddleware('middleware-2'),
  generateMiddleware('middleware-3'),
]

function generateTestRoute (n, setMiddleware) {
  return {
    name: 'route-' + n,
    component: {
      displayName: 'component-' + n,
      __reactRouterPrerenderMiddleware__: setMiddleware
        ? middlewares[n-1]
        : undefined
    }
  };
}

function generateTestProps (options) {
  return {
    routes: [
      generateTestRoute(1, options.setMiddlewareOnRoute1),
      generateTestRoute(2, options.setMiddlewareOnRoute2),
      generateTestRoute(3, options.setMiddlewareOnRoute3)
    ],
    prop1: 'a',
    prop2: false,
    prop3: [1,2,3],
    prop4: {
      some: 'deep object',
      with: [
        'different',
        { values: true }
      ]
    }
  };
}

describe('Tests', function () {

  before(function () {
    if (!global.Promise) {
      console.log('Promise api not available in this version of node - polyfilling for the test');
      polyfillPromise();
    }
  })

  describe('The middleware set on the deepest route should run', function () {

    it('Should run no middleware when none is found', function (done) {
      reactRoutePrerenderMiddleware(generateTestProps({
        setMiddlewareOnRoute1: false,
        setMiddlewareOnRoute2: false,
        setMiddlewareOnRoute3: false
      }))
      .then(function (result) {
        expect(result.noMiddlewareFound).to.be.true;
      })
      .then(done)
      .catch(done);
    })

    it('Should run middleware 1 when only middleware 1 is set', function (done) {
      reactRoutePrerenderMiddleware(generateTestProps({
        setMiddlewareOnRoute1: true,
        setMiddlewareOnRoute2: false,
        setMiddlewareOnRoute3: false
      }))
      .then(function (result) {
        expect(result.checkString).to.equal('middleware-1');
      })
      .then(done)
      .catch(done);
    })

    it('Should run middleware 2 when only middleware 1 and 2 are set', function (done) {
      reactRoutePrerenderMiddleware(generateTestProps({
        setMiddlewareOnRoute1: true,
        setMiddlewareOnRoute2: true,
        setMiddlewareOnRoute3: false
      }))
      .then(function (result) {
        expect(result.checkString).to.equal('middleware-2');
      })
      .then(done)
      .catch(done);
    })

    it('Should run middleware 2 when only middleware 2 is set', function (done) {
      reactRoutePrerenderMiddleware(generateTestProps({
        setMiddlewareOnRoute1: false,
        setMiddlewareOnRoute2: true,
        setMiddlewareOnRoute3: false
      }))
      .then(function (result) {
        expect(result.checkString).to.equal('middleware-2');
      })
      .then(done)
      .catch(done);
    })

    it('Should run middleware 3 when middleware 1 and 2 and 3 are set', function (done) {
      reactRoutePrerenderMiddleware(generateTestProps({
        setMiddlewareOnRoute1: true,
        setMiddlewareOnRoute2: true,
        setMiddlewareOnRoute3: true
      }))
      .then(function (result) {
        expect(result.checkString).to.equal('middleware-3');
      })
      .then(done)
      .catch(done);
    })

    it('Should run middleware 3 when only middleware 1 and 3 are set', function (done) {
      reactRoutePrerenderMiddleware(generateTestProps({
        setMiddlewareOnRoute1: true,
        setMiddlewareOnRoute2: false,
        setMiddlewareOnRoute3: true
      }))
      .then(function (result) {
        expect(result.checkString).to.equal('middleware-3');
      })
      .then(done)
      .catch(done);
    })

    it('Should run middleware 3 when only middleware 3 is set', function (done) {
      reactRoutePrerenderMiddleware(generateTestProps({
        setMiddlewareOnRoute1: false,
        setMiddlewareOnRoute2: false,
        setMiddlewareOnRoute3: true
      }))
      .then(function (result) {
        expect(result.checkString).to.equal('middleware-3');
      })
      .then(done)
      .catch(done);
    })

  })

  describe('The middleware should run with props and extraArgs passed', function () {

    it('Should pass render props and extraArgs through to the middleware', function (done) {
      var testProps = generateTestProps({
        setMiddlewareOnRoute1: true,
        setMiddlewareOnRoute2: true,
        setMiddlewareOnRoute3: true
      })

      var testOptions = {
        extraArgs: {
          extraArg1: 1,
          extraArg2: true,
          extraArg3: [1,2,3],
          extraArg4: {
            a: {
              deeply: {
                nested: ['o', 'b', 'j', 'e', 'c', 't']
              }
            }
          }
        }
      }

      reactRoutePrerenderMiddleware(
        testProps,
        testOptions
      )
      .then(function (result) {
        expect(result.checkString).to.equal('middleware-3');

        expect(result.props).to.deep.equal(generateTestProps({
          setMiddlewareOnRoute1: true,
          setMiddlewareOnRoute2: true,
          setMiddlewareOnRoute3: true
        }));

        expect(result.extraArgs).to.deep.equal({
          extraArg1: 1,
          extraArg2: true,
          extraArg3: [1,2,3],
          extraArg4: {
            a: {
              deeply: {
                nested: ['o', 'b', 'j', 'e', 'c', 't']
              }
            }
          }
        });
      })
      .then(done)
      .catch(done);
    })

  })

})