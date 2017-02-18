
/**
 * @module montage/core/meta/object-model
 * @requires montage/core/core
 * @requires montage/core/meta/object-property
 * @requires montage/core/meta/binder
 * @requires montage/core/logger
 */
var Montage = require("../core").Montage,
    ObjectProperty = require("./object-property").ObjectProperty,
    ObjectModel = require("./object-model").ObjectModel,
    logger = require("../logger").logger("blueprint");

/**
 * @class ModelGroup
 * @classdesc A model group is a singleton that is responsible for
 * loading and dispatching object models and descriptors.
 *
 * @extends Montage
 */
exports.ModelGroup = Montage.specialize( /** @lends ModelGroup.prototype # */ {

    /**
     * @constructs ModelGroup
     */
    constructor: {
        value: function ModelGroup() {
            this._models = [];
            this._modelTable = {};
        }
    },

    /**
     * @private
     * @property {Array} value
     */
    _models: {
        value: null
    },

    /**
     * @private
     */
    _modelTable: {
        value: null
    },

    /**
     * Return the list of binder registered on the manager.
     *
     * @readonly
     * @returns {Array.<Binder>}
     */
    models: {
        get: function () {
            return this._models;
        }
    },

    /**
     * Adds an object model to the model group.
     *
     * @function
     * @param {ObjectModel} model
     */
    addModel: {
        value: function (model) {
            var index;
            if (model !== null) {
                if (this._modelTable[model.name]) {
                    this.removeModel(this._modelTable[model.name]);
                }
                index = this._models.indexOf(model);
                if (index >= 0) {
                    this._models.splice(index, 1);
                }
                this._models.push(model);
                this._modelTable[model.name] = model;
            }
        }
    },

    /**
     * @function
     * @param {ObjectModel} model
     */
    removeModel: {
        value: function (model) {
            var index;
            if (model !== null) {
                index = this._models.indexOf(model);
                if (index >= 0) {
                    this._models.splice(index, 1);
                }
                if (this._modelTable[model.name]) {
                    delete this._modelTable[model.name];
                }
            }
        }
    },

    /**
     * Gets the object model associated with the name.
     * @param {string} name
     */
    modelForName: {
        value: function (name) {
            return this._modelTable[name];
        }
    },

    /**
     * Search through the models for an object descriptor that extends
     * the provided prototype.
     * @function
     * @param {string} prototypeName
     * @param {string} moduleId
     * @returns The requested object descriptor or null if this prototype is not
     * found.
     */
    objectDescriptorForPrototype: {
        value: function (prototypeName, moduleId /* unused */) {
            var objectDescriptor = null, model, index;
            for (index = 0; typeof (model = this.models[index]) !== "undefined" && !objectDescriptor; index++) {
                objectDescriptor = model.objectDescriptorForName(prototypeName);
            }
            return objectDescriptor;
        }
    },

    /**
     * @private
     */
    _defaultObjectDescriptorObjectProperty: {
        serializable: true,
        value: null
    },

    /**
     * Return the default object descriptor's object property.
     * This is the last resort property declaration object.
     *
     * @readonly
     * @returns {ObjectProperty} default object descriptor object property
     */
    defaultObjectDescriptorObjectProperty: {
        get: function () {
            if (!this._defaultObjectDescriptorObjectProperty) {
                this._defaultObjectDescriptorObjectProperty = new ObjectProperty().init();
            }
            return this._defaultObjectDescriptorObjectProperty;
        }
    },

    _defaultModel: {
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
    defaultModel: {
        get: function () {
            if (!this._defaultModel) {
                this._defaultModel = new ObjectModel().initWithNameAndRequire("default", self.mr);
                this._defaultModel.isDefault = true;
                this.addModel(this._defaultModel);
            }
            return this._defaultModel;
        }
    }

});