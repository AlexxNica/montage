
/**
 * @module montage/core/meta/binder-manager
 * @requires montage/core/core
 * @requires montage/core/meta/object-property
 * @requires montage/core/meta/binder
 * @requires montage/core/logger
 */
var Montage = require("../core").Montage,
    ModelGroup = require("./model-group").ModelGroup,
    ObjectProperty = require("./object-property").ObjectProperty,
    BinderModule = require("./binder"),
    logger = require("../logger").logger("blueprint");

// var BinderManager = function () {
//     return ModelGroup.apply(this, arguments);
// };
// BinderManager.prototype = ModelGroup.prototype;
// BinderManager.prototype.constructor = BinderManager;
// BinderManager.prototype.binders = ModelGroup.prototype.models;
// BinderManager.prototype.addBinder = ModelGroup.prototype.addModel;
// BinderManager.prototype.removeBinder = ModelGroup.prototype.removeModel;
// BinderManager.prototype.binderForName = ModelGroup.prototype.modelForName;
// BinderManager.prototype.blueprintForPrototype = ModelGroup.prototype.objectDescriptorForPrototype;
// BinderManager.prototype.defaultBlueprintObjectProperty = ModelGroup.prototype.defaultObjectDescriptorObjectProperty;
// BinderManager.prototype.defaultBinder = ModelGroup.prototype.defaultModel;
// debugger;
// exports.BinderManager = BinderManager;

/**
 * @class BinderManager
 * @classdesc A blueprint binder manager is a singleton that is responsible for
 * loading and dispaching binders and blueprints.
 *
 * @extends Montage
 */
var BinderManager = exports.BinderManager = ModelGroup.specialize( /** @lends BinderManager.prototype # */ {
    /**
     * @constructs BinderManager
     */
    constructor: {
        value: function BinderManager() {
            // this._binders = [];
            // this._binderTable = {};
            ModelGroup.apply(this, arguments);
        }
    },

    /**
     * @private
     * @property {Array} value
     */
    // _binders: {
    //     value: null
    // },


    /**
     * @private
     */
    // _binderTable: {
    //     value: null
    // },

    /**
     * Return the list of binder registered on the manager.
     *
     * @readonly
     * @returns {Array.<Binder>}
     */
    binders: {
        get: function () {
            debugger;
            // return this._binders;
            return this.models;
        }
    },

    /**
     * Add a new blueprint binder
     *
     * @function
     * @param {Binder} binder
     */
    addBinder: {
        value: function (binder) {
            // if (binder !== null) {
            //     if (this._binderTable[binder.name]) {
            //         this.removeBinder(this._binderTable[binder.name]);
            //     }
            //     var index = this._binders.indexOf(binder);
            //     if (index >= 0) {
            //         this._binders.splice(index, 1);
            //     }
            //     this._binders.push(binder);
            //     this._binderTable[binder.name] = binder;
            // }
            this.addModel(binder);
        }
    },

    /**
     * @function
     * @param {Binder} binder
     */
    removeBinder: {
        value: function (binder) {
            // if (binder !== null) {
            //     var index = this._binders.indexOf(binder);
            //     if (index >= 0) {
            //         this._binders.splice(index, 1);
            //     }
            //     if (this._binderTable[binder.name]) {
            //         delete this._binderTable[binder.name];
            //     }
            // }
            return this.removeModel(binder);
        }
    },

    /**
     * Gets the blueprint binder associated with the name.
     * @param {string} name
     */
    binderForName: {
        value: function (name) {
            // return this._binderTable[name];
            return this.modelForName(name);
        }
    },

    /**
     * Search through the binders for a blueprint that extends that prototype.
     * @function
     * @param {string} prototypeName
     * @param {string} moduleId
     * @returns The requested blueprint or null if this prototype is not
     * managed.
     */
    blueprintForPrototype: {
        value: function (prototypeName, moduleId) {
            // var binder, blueprint, index;
            // for (index = 0; typeof (binder = this.binders[index]) !== "undefined"; index++) {
            //     blueprint = binder.blueprintForPrototype(prototypeName, moduleId);
            //     if (blueprint !== null) {
            //         return blueprint;
            //     }
            // }
            // return null;
            return this.objectDescriptorForPrototype(prototypeName);
        }
    },

    /**
     * @private
     */
    _defaultBlueprintObjectProperty: {
        serializable: true,
        value: null
    },

    /**
     * Return the default blueprint object property.
     * This is the last resort property declaration object.
     *
     * @readonly
     * @returns {ObjectProperty} default blueprint object property
     */
    defaultBlueprintObjectProperty: {
        get: function () {
            // if (!this._defaultBlueprintObjectProperty) {
            //     this._defaultBlueprintObjectProperty = new ObjectProperty().init();
            // }
            // return this._defaultBlueprintObjectProperty;
            return this.defaultObjectDescriptorObjectProperty;
        }
    },

    // _defaultBinder: {
    //     serializable: true,
    //     value: null
    // },

    /**
     * Return the default blueprint object property.
     * This is the last resort property declaration object.
     *
     * @readonly
     * @returns {ObjectProperty} default blueprint object property
     */
    defaultBinder: {
        get: function () {
            // if (!this._defaultBinder) {
            //     this._defaultBinder = new BinderModule.Binder().initWithNameAndRequire("default", self.mr);
            //     this._defaultBinder.isDefault = true;
            //     this.addBinder(this._defaultBinder);
            // }
            // return this._defaultBinder;
            return this.defaultModel;
        }
    }

});

