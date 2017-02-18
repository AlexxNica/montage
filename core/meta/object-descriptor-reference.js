
/**
 * @module montage/core/meta/blueprint-reference
 * @requires core/exception
 * @requires core/promise
 * @requires core/logger
 */
var Promise = require("../promise").Promise;
var ObjectDescriptorModule = require("./object-descriptor");
var ObjectModelModule = require("./object-model");
var RemoteReference = require("./remote-reference").RemoteReference;
var ObjectModelReference = require("./object-model-reference").ObjectModelReference;

var logger = require("../logger").logger("blueprint");

exports.ObjectDescriptorReference = RemoteReference.specialize( {

    constructor: {
        value: function ObjectDescriptorReference() {
            this.superForValue("constructor")();
        }
    },

    /**
     * The identifier is the name of the binder and is used to make the
     * serialization of binders more readable.
     * @type {string}
     * @default this.name
     */
    identifier: {
        get: function () {
            if (!this._reference) {
                this._reference = this.referenceFromValue(this._value);
            }
            return [
                "blueprint",
                (this._reference.blueprintName || "unnamed").toLowerCase(),
                "reference"
            ].join("_");
        }
    },

    valueFromReference: {
        value: function (references) {
            var objectDescriptorModule = references.objectDescriptorModule,
                objectModelReference = references.objectModelReference,
                objectModelPromise = Promise.resolve(ObjectModelModule.ObjectModel.manager.defaultBinder);
            if (objectModelReference) {
                objectModelPromise = ObjectModelReference.prototype.valueFromReference(objectModelReference, require);
            }

            return objectModelPromise.then(function (objectModel) {
                if (objectModel) {
                    var ModuleObjectDescriptorModule = require("./module-object-descriptor");
                    return ModuleObjectDescriptorModule.ModuleObjectDescriptor.getObjectDescriptorWithModuleId(objectDescriptorModule.id, objectDescriptorModule.require)
                        .then(function (objectDescriptor) {
                        if (objectDescriptor) {
                            objectModel.addObjectDescriptor(objectDescriptor);
                            return objectDescriptor;
                        } else {
                            throw new Error("Error cannot find Object Descriptor " + objectDescriptorModule);
                        }
                    });
                } else {
                    return ObjectDescriptorModule.ObjectDescriptor.getObjectDescriptorWithModuleId(objectDescriptorModule, require);
                }
            });
        }
    },

    referenceFromValue: {
        value: function (value) {
            // the value is an object descriptor we need to serialize the object model and the object descriptor reference
            var references = {};
            references.objectDescriptorName = value.name;
            references.objectDescriptorModule = value.objectDescriptorInstanceModule;
            if (value.binder && !value.model.isDefault) {
                references.objectModelReference = ObjectModelReference.prototype.referenceFromValue(value.model);
            }
            return references;
        }
    }

});
