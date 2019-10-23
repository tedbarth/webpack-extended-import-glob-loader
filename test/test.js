const chai = require('chai')
  , sinon = require('sinon')
  , path = require('path');

const loader = require('../');

const expect = chai.expect
  , assert = chai.assert;

let context = {};

describe('loader', function () {
  this.beforeEach(() => {
    context = {
      resourcePath: path.resolve(__dirname, 'mock', 'test.js'),
      emitWarning: sinon.stub(),
      emitError: sinon.stub(),
    };
  });

  describe('from files', () => {

    describe('import "*.js"', () => {
      it('should expand glob import files', () => {
        // double quote
        let generatedCode = loader.call(context, 'import "./modules/*.js";');
        expect(generatedCode).to.equal(
          'import "./modules/a.js"; import "./modules/b.js"; import "./modules/c.js";'
        );

        generatedCode = loader.call(context, 'import "./modules/*.js"; import "z.js";');
        expect(generatedCode).to.equal(
          'import "./modules/a.js"; import "./modules/b.js"; import "./modules/c.js"; import "z.js";'
        );

        // single quote
        generatedCode = loader.call(context, 'import \'./modules/*.js\';');
        expect(generatedCode).to.equal(
          'import \'./modules/a.js\'; import \'./modules/b.js\'; import \'./modules/c.js\';'
        );
      });

      it('should honor comment after expanding glob import files', () => {
        let generatedCode = loader.call(context, '//import "./modules/*.js";');
        expect(generatedCode).to.equal(
          '//import "./modules/a.js"; import "./modules/b.js"; import "./modules/c.js";'
        );

        generatedCode = loader.call(context, '// import "./modules/*.js";');
        expect(generatedCode).to.equal(
          '// import "./modules/a.js"; import "./modules/b.js"; import "./modules/c.js";'
        );
      });

      it('should emit warning when import nothing', () => {
        const generatedCode = loader.call(context, 'import "./unknown/*.js";');
        assert.equal(context.emitWarning.called, true);
      });
    });

    describe('import modules from "*.js"', () => {
      it('should expand glob import files', () => {
        const generatedCode = loader.call(context, 'import modules from "./modules/*.js";');
        expect(generatedCode).to.equal(
          'import * as modules0 from "./modules/a.js"; import * as modules1 from "./modules/b.js"; import * as modules2 from "./modules/c.js"; var modules = [{fileName: "./modules/a.js", module: modules0}, {fileName: "./modules/b.js", module: modules1}, {fileName: "./modules/c.js", module: modules2}];'
        );
      });
    });

    describe('import from *.scss', () => {
      it('should import glob scss files', () => {
        const generatedCode = loader.call(context, '@import "./modules/*.scss";');
        expect(generatedCode).to.equal(
          '@import "./modules/e.scss"; @import "./modules/f.scss";'
        );
      });

      it('should honor comment after expanding glob import files', () => {
        let generatedCode = loader.call(context, '//@import "./modules/*.scss";');
        expect(generatedCode).to.equal(
          '//@import "./modules/e.scss"; @import "./modules/f.scss";'
        );

        generatedCode = loader.call(context, '// @import "./modules/*.scss";');
        expect(generatedCode).to.equal(
          '// @import "./modules/e.scss"; @import "./modules/f.scss";'
        );
      });
    })
  });

  describe('from node_modules', () => {
    it('should load node_modules files', () => {
      const generatedCode = loader.call(context, 'import "fake_module/js/*.js";');
      expect(generatedCode).to.equal(
        'import "fake_module/js/a.js"; import "fake_module/js/b.js"; import "fake_module/js/c.js";'
      );
    });

    it('should honor comment after expanding glob import files', () => {
      const generatedCode = loader.call(context, '// import "fake_module/js/*.js";');
      expect(generatedCode).to.equal(
        '// import "fake_module/js/a.js"; import "fake_module/js/b.js"; import "fake_module/js/c.js";'
      );
    });

    it('should emit error when node_modules is not found', () => {
      context.resourcePath = path.resolve('/tmp', 'test.js');
      const generatedCode = loader.call(context, 'import "unknown/*.js";');
      assert.equal(context.emitError.called, true);
    });
  });
});
