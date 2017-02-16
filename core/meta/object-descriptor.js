
/**
 * @module montage/core/meta/blueprint
 * @requires montage/core/core
 * @requires core/exception
 * @requires core/promise
 */
var Montage = require("../core").Montage;
var Promise = require("../promise").Promise;
var ObjectModelModule = require("./object-model");
var BlueprintReference = require("./blueprint-reference").BlueprintReference;
var PropertyBlueprint = require("./property-blueprint").PropertyBlueprint;
var AssociationBlueprint = require("./association-blueprint").AssociationBlueprint;
var DerivedPropertyBlueprint = require("./derived-property-blueprint").DerivedPropertyBlueprint;
var EventBlueprint = require("./event-blueprint").EventBlueprint;
var PropertyValidationRule = require("./validation-rule").PropertyValidationRule;

var Defaults = {
    name: "default",
    customPrototype: false
};

/**
 * @class ObjectDescriptor
 * @extends Montage
 */
var ObjectDescriptor = exports.ObjectDescriptor = Montage.specialize( /** @lends ObjectDescriptor.prototype # */ {

    FileExtension: {
        value: ".meta"
    },

    constructor: {
        value: function ObjectDescriptor() {
            this._eventPropertyDescriptors = [];
            this._propertyDescriptors = [];
            this._propertyDescriptorsGroups = {};
            Object.defineProperty(this,"_propertyDescriptorsTable",{ value:{}, writable: false});
            Object.defineProperty(this,"_eventPropertyDescriptorsTable",{ value:{}, writable: false});
            this.defineBinding("eventObjectDescriptors", {"<-": "_eventPropertyDescriptors.concat(parent.eventObjectDescriptors)"});
        }
    },

    /**
     * @function
     * @param {string} name The name of the blueprint
     * @returns itself
     */
    initWithName: {
        value: function (name) {
            this._name = (name !== null ? name : "default");
            this.customPrototype = false;

            return this;
        }
    },

    serializeSelf: {
        value:function (serializer) {
            serializer.setProperty("name", this.name);
            if ((this._model) && (!this.model.isDefault)) {
                serializer.setProperty("model", this._model, "reference");
            }

            if (this.objectDescriptorInstanceModule) {
                serializer.setProperty("objectDescriptorModule", this.objectDescriptorInstanceModule);
            }
            if (this._parentReference) {
                serializer.setProperty("parent", this._parentReference);
            }

            this._setPropertyWithDefaults(serializer, "customPrototype", this.customPrototype);
            //
            if (this._propertyDescriptors.length > 0) {
                serializer.setProperty("propertyDescriptors", this._propertyDescriptors);
            }
            if (Object.getOwnPropertyNames(this._propertyDescriptorsGroups).length > 0) {
                serializer.setProperty("propertyDescriptorsGroups", this._propertyDescriptorsGroups);
            }
            if (this._eventPropertyDescriptors.length > 0) {
                serializer.setProperty("eventObjectDescriptors", this._eventPropertyDescriptors);
            }
            if (this._propertyValidationRules.length > 0) {
                serializer.setProperty("propertyValidationRules", this._propertyValidationRules);
            }
        }
    },

    deserializeSelf: {
        value:function (deserializer) {
            this._name = deserializer.getProperty("name");
            var model = deserializer.getProperty("model");
            if (model) {
                this._binder = model;
            }
            this.objectDescriptorInstanceModule = deserializer.getProperty("objectDescriptorModule");
            this._parentReference = deserializer.getProperty("parent");

            this.customPrototype = this._getPropertyWithDefaults(deserializer, "customPrototype");
            //
            var value;
            value = deserializer.getProperty("propertyObjectDescriptors");
            if (value) {
                this._propertyDescriptors = value;
            }
            value = deserializer.getProperty("propertyObjectDescriptorGroups");
            if (value) {
                this._propertyDescriptorsGroups = value;
            }
            value = deserializer.getProperty("eventPropertyDescriptors");
            if (value) {
                this._eventPropertyDescriptors = value;
            }
            value = deserializer.getProperty("propertyValidationRules");
            if (value) {
                this._propertyValidationRules = value;
            }
        }
    },

    _setPropertyWithDefaults: {
        value:function (serializer, propertyName, value) {
            if (value != Defaults[propertyName]) {
                serializer.setProperty(propertyName, value);
            }
        }
    },

    _getPropertyWithDefaults: {
        value:function (deserializer, propertyName) {
            var value = deserializer.getProperty(propertyName);
            return value ? value : Defaults[propertyName];
        }
    },

    _name: {
        value: null
    },

    /**
     * Name of the object. The name is used to define the property on the object.
     *
     * This is an accessor. It is not writable or observable.
     *
     * @returns {string} this._name
     */
    name: {
        get: function () {
            return this._name;
        }
    },

    /**
     * This is the canonical way of creating managed objects prototypes.
     *
     * Newly created prototype will be blessed with all the required properties
     * to be well behaved.
     *
     * @function
     * @param {Object} prototype
     * @param {Object} propertyDescriptor
     * @returns newPrototype
     */
    create: {
        value: function (aPrototype, propertyDescriptor, constructorDescriptor) {
            if ((typeof aPrototype === "undefined") || (ObjectDescriptor.prototype.isPrototypeOf(aPrototype))) {
                var parentCreate = Object.getPrototypeOf(ObjectDescriptor).create;

                return parentCreate.call(this, (typeof aPrototype === "undefined" ? this : aPrototype), propertyDescriptor, constructorDescriptor);
            }

            var newConstructor;

            if (typeof aPrototype.specialize !== "function" && !propertyDescriptor) {
                newConstructor = new aPrototype();

            } else {
                newConstructor = aPrototype.specialize(propertyDescriptor, constructorDescriptor);
            }
            // TODO: refactor after working on ObjectProperty
            this.ObjectProperty.applyWithBlueprint(newConstructor.prototype, this);
            // We have just created a custom prototype lets use it.
            this.customPrototype = true;

            return newConstructor;
        }
    },

    /**
     * Create a new instance of the target prototype for the blueprint.
     * @function
     * @returns new instance
     */
    newInstance: {
        value: function () {
            var prototype = this.newInstancePrototype();
            return (prototype ? new prototype() : null);
        }
    },

    /**
     * Returns the target prototype for this blueprint.
     *
     * **Note:** This method uses the `customPrototype` property to determine
     * if it needs to require a custom prototype or create a default prototype.
     *
     * @function
     * @returns new prototype
     */
    newInstancePrototype: {
        value: function () {
            // FIXME this function is no missing all the data it needs
            var self = this;
            if (this.customPrototype) {
                throw new Error("FIXME");
                var resultsPromise = new Promise(function(resolve, reject) {
                    require.async(self.moduleId,
                        function(exports) {
                            resolve(exports);
                        });
                });
                return resultsPromise.then(function(exports) {
                        var prototype = exports[self.prototypeName];
                        return (prototype ? prototype : null);
                    }
                );
            } else {
                var parentInstancePrototype = (this.parent ? this.parent.newInstancePrototype() : Montage );
                var newConstructor = parentInstancePrototype.specialize({
                    // Token class
                    init: {
                        value: function () {
                            return this;
                        }
                    }
                });
                // TODO refactor after working on ObjectProperty
                this.ObjectProperty.applyWithBlueprint(newConstructor.prototype, this);

                return (newConstructor ? newConstructor : null);
            }
        }
    },

    /**
     * Return the blueprint object property for this blueprint.
     *
     * This will return the default if none is declared.
     *
     * @returns {ObjectProperty}
     */
    ObjectProperty: {
        serializable: false,
        enumerable: true,
        get: function () {
            if (this.model) {
                return this.model.ObjectProperty;
            }
            return ObjectModelModule.ObjectModel.group.defaultObjectDescriptorObjectProperty;
        }
    },

    /**
     * This is used for references only so that we can reload referenced
     * blueprints.
     */
    objectDescriptorInstanceModule: {
        serializable: false,
        value: null
    },

    /**
     * The identifier is the same as the name and is used to make the
     * serialization of a blueprint humane.
     * @returns {string}
     * @default `this.name`
     */
    identifier: {
        get: function () {
            // TODO convert UpperCase to lower-case instead of lowercase
            return [
                "objectDescriptor",
                (this.name || "unnamed").toLowerCase()
            ].join("_");
        }
    },

    _model: {
        value: null
    },

    /**
     * @returns {Property}
     * @default null
     */
    model: {
        serializable: false,
        get: function () {
            if (! this._model) {
                this._model = ObjectModelModule.ObjectModel.group.defaultModel;
                this._model.addObjectDescriptor(this);
            }
            return this._model;
        },
        set: function (value) {
            this._model = value;
        }
    },

    _parentReference: {
        value: null
    },

    _parent: {
        value: null
    },

    /**
     * Blueprint parent
     * @returns {?BlueprintReference}
     */
    parent: {
        serializable: false,
        get: function () {
            return this._parent;
        },
        set: function (blueprint) {
            if (blueprint) {
                // TODO: Refactor after working on BlueprintReference
                this._parentReference = new BlueprintReference().initWithValue(blueprint);
                this._parent = blueprint;
            } else {
                this._parentReference = null;
                this._parent = null;
            }
        }
    },

    /**
     * Defines whether the blueprint should use custom prototype for new
     * instances.
     *
     * Is `true` if the blueprint needs to require a custom prototype for
     * creating new instances, `false` if new instance are generic prototypes.
     *
     * @property {boolean} value
     * @default false
     */
    customPrototype: {
        value: false
    },

    _propertyDescriptors: {
        value: null
    },

    /**
     * @returns {Array.<PropertyBlueprint>}
     */
    propertyDescriptors: {
        get: function () {
            var propertyDescriptors = [];
            propertyDescriptors = propertyDescriptors.concat(this._propertyDescriptors);
            if (this.parent) {
                propertyDescriptors = propertyDescriptors.concat(this.parent.propertyDescriptors);
            }
            return propertyDescriptors;
        }
    },

    _propertyDescriptorsTable: {
        value: null
    },

    /**
     * Adds a new property descriptor to this object descriptor.
     *
     * If that property descriptor was associated with another object descriptor it will
     * be removed first.
     *
     * @function
     * @param {PropertyDescriptor} property blueprint to be added.
     * @returns the property descriptor
     */
    addPropertyDescriptor: {
        value: function (propertyDescriptor) {
            if (propertyDescriptor !== null && propertyDescriptor.name !== null) {
                var index = this._propertyDescriptors.indexOf(propertyDescriptor);
                if (index < 0) {
                    if ((propertyDescriptor.owner !== null) && (propertyDescriptor.owner !== this)) {
                        propertyDescriptor.owner.removePropertyDescriptor(propertyDescriptor);
                    }
                    this._propertyDescriptors.push(propertyDescriptor);
                    this._propertyDescriptorsTable[propertyDescriptor.name] = propertyDescriptor;
                    propertyDescriptor._owner = this;
                }
            }
            return propertyDescriptor;
        }
    },

    /**
     * Removes a property descriptor from the property descriptor list of this
     * object descriptor.
     *
     * @function
     * @param {PropertyDescriptor} The property descriptor to be removed.
     * @returns the same property descriptor
     */
    removePropertyDescriptor: {
        value: function (propertyDescriptor) {
            if (propertyDescriptor !== null && propertyDescriptor.name !== null) {
                var index = this._propertyDescriptors.indexOf(propertyDescriptor);
                if (index >= 0) {
                    this._propertyDescriptors.splice(index, 1);
                    delete this._propertyDescriptorsTable[propertyDescriptor.name];
                    propertyDescriptor._owner = null;
                }
            }
            return propertyDescriptor;
        }
    },

    /**
     * Return a new property blueprint.
     *
     * **Note:** This is the canonical way of creating new property blueprint
     * in order to enable subclassing.
     * @param {string} name name of the property blueprint to create
     * @param {number} cardinality name of the property blueprint to create
     * @returns {PropertyBlueprint}
     */
    newPropertyDescriptor: {
        value: function (name, cardinality) {
            // TODO: refactor after converting PropertyBlueprint to PropertyDescriptor
            return new PropertyBlueprint().initWithNameBlueprintAndCardinality(name, this, cardinality);
        }
    },

    /**
     * Return a new association blueprint.
     * **Note:** This is the canonical way of creating new association
     * blueprint in order to enable subclassing.
     * @param {string} name name of the association blueprint to create
     * @param {number} cardinality name of the association blueprint to create
     * @returns {AssociationBlueprint}
     */
    newAssociationBlueprint: {
        value: function (name, cardinality) {
            return new AssociationBlueprint().initWithNameBlueprintAndCardinality(name, this, cardinality);
        }
    },

    /**
     * Return a new derived property blueprint.
     * **Note:** This is the canonical way of creating new derived property
     * blueprint in order to enable subclassing.
     * @param {string} name name of the derived property blueprint to create
     * @param {number} cardinality name of the derived property blueprint to create
     * @returns {DerivedPropertyBlueprint}
     */
    newDerivedPropertyBlueprint: {
        value: function (name, cardinality) {
            return new DerivedPropertyBlueprint().initWithNameBlueprintAndCardinality(name, this, cardinality);
        }
    },

    /**
     * Convenience to add one property blueprint.
     * @function
     * @param {string} name Add to one property blueprint
     * @returns {PropertyBlueprint}
     */
    addToOnePropertyBlueprintNamed: {
        value: function (name) {
            return this.addPropertyBlueprint(this.newPropertyBlueprint(name, 1));
        }
    },

    /**
     * Convenience to add many property blueprints.
     * @function
     * @param {string} name Add to many property blueprints
     * @returns {PropertyBlueprint}
     */
    addToManyPropertyBlueprintNamed: {
        value: function (name) {
            return this.addPropertyBlueprint(this.newPropertyBlueprint(name, Infinity));
        }
    },

    /**
     * Convenience to add an property blueprint to one relationship.
     * @function
     * @param {string} name
     * @param {string} inverse
     * @returns {AssociationBlueprint}
     */
    addToOneAssociationBlueprintNamed: {
        value: function (name, inverse) {
            var relationship = this.addPropertyBlueprint(this.newAssociationBlueprint(name, 1));
            if (inverse) {
                relationship.targetBlueprint = inverse.owner;
                inverse.targetBlueprint = this;
            }
            return relationship;
        }
    },

    /**
     * Convenience to add an property blueprint to many relationships.
     * @function
     * @param {string} name TODO
     * @param {string} inverse TODO
     * @returns {AssociationBlueprint}
     */
    addToManyAssociationBlueprintNamed: {
        value: function (name, inverse) {
            var relationship = this.addPropertyBlueprint(this.newAssociationBlueprint(name, Infinity));
            if (inverse) {
                relationship.targetBlueprint = inverse.owner;
                inverse.targetBlueprint = this;
            }
            return relationship;
        }
    },

    /**
     * @function
     * @param {string} name
     * @returns {PropertyBlueprint}
     */
    propertyDescriptorForName: {
        value: function (name) {
            var propertyDescriptor = this._propertyDescriptorsTable[name];
            if (typeof propertyDescriptor === "undefined") {
                propertyDescriptor = UnknownPropertyBlueprint;
                var anPropertyBlueprint, index;
                for (index = 0; typeof (anPropertyBlueprint = this._propertyDescriptors[index]) !== "undefined"; index++) {
                    if (anPropertyBlueprint.name === name) {
                        propertyDescriptor = anPropertyBlueprint;
                        break;
                    }
                }
                this._propertyDescriptorsTable[name] = propertyDescriptor;
            }
            if (propertyDescriptor === UnknownPropertyBlueprint) {
                propertyDescriptor = null;
            }
            if ((! propertyDescriptor) && (this.parent)) {
                propertyDescriptor = this.parent.propertyDescriptorForName(name);
            }
            return propertyDescriptor;
        }

    },

    _propertyDescriptorsGroups: {
        value: null
    },

    /**
     * List of properties blueprint groups names
     * @returns {Array.<PropertyBlueprint>}
     */
    propertyDescriptorsGroups: {
        get: function () {
            var groups = [];
            for (var name in this._propertyDescriptorsGroups) {
                groups.push(name);
            }
            if (this.parent) {
                groups = groups.concat(this.parent.propertyDescriptorsGroups);
            }
            return groups;
        }
    },

    /**
     * Returns the group associated with that name
     * @param {string} name of the group
     * @returns {Array.<PropertyBlueprint>} property blueprint group
     */
    propertyBlueprintGroupForName: {
        value: function (groupName) {
            var group = this._propertyDescriptorsGroups[groupName];
            if ((! group) && (this.parent)) {
                group = this.parent.propertyBlueprintGroupForName(groupName);
            }
            return group;
        }
    },

    /**
     * Add a new property descriptor group.
     * @function
     * @param {string} name of the group
     * @returns {Array.<PropertyDescriptor>} new property descriptor group
     */
    addPropertyDescriptorGroupNamed: {
        value: function (groupName) {
            var group = this._propertyDescriptorsGroups[groupName];
            if (group == null) {
                group = [];
                this._propertyDescriptorsGroups[groupName] = group;
            }
            return group;
        }
    },

    /**
     * Remove the property descriptor group.
     * @function
     * @param {string} name of the group to remove
     * @returns {Array.<PropertyDescriptor>} removed property blueprint group
     */
    removePropertyDescriptorGroupNamed: {
        value: function (groupName) {
            var group = this._propertyDescriptorsGroups[groupName];
            if (group != null) {
                delete this._propertyDescriptorsGroups[groupName];
            }
            return group;
        }
    },

    /**
     * Adds a property descriptor to the group name.
     * if the group does not exist creates it.
     * @function
     * @param {string} property to add
     * @param {string} name of the group
     * @returns {Array.<PropertyBlueprint>} property blueprint group
     */
    addPropertyDescriptorToGroupNamed: {
        value: function (propertyDescriptor, groupName) {
            var group = this._propertyDescriptorsGroups[groupName];
            if (group == null) {
                group = this.addPropertyDescriptorGroupNamed(groupName);
            }
            var index = group.indexOf(propertyDescriptor);
            if (index < 0) {
                group.push(propertyDescriptor);
            }
            return group;
        }
    },

    /**
     * Removes a property blueprint from the group name.
     * @function
     * @param {string} name of the property
     * @param {string} name of the group
     * @returns {Array.<PropertyBlueprint>} property blueprint group
     */
    removePropertyDescriptorFromGroupNamed: {
        value: function (propertyDescriptor, groupName) {
            var group = this._propertyDescriptorsGroups[groupName];
            if ((group != null) && (propertyDescriptor != null)) {
                var index = group.indexOf(propertyDescriptor);
                if (index >= 0) {
                    group.splice(index, 1);
                }
            }
            return (group != null ? group : []);
        }
    },

    _eventPropertyDescriptors: {
        value: null
    },

    /**
     * @property {Array.<EventBlueprint>} value
     */
    eventPropertyDescriptors: {
        value: null
    },

    _eventPropertyDescriptorsTable: {
        value: null
    },


    /**
     * Adds a new event property descriptor to this object descriptor.
     *
     * If that event property descriptor was associated with another object descriptor it will
     * be removed first.
     *
     * @function
     * @param {string} event property descriptor to be added.
     * @returns {EventPropertyDescriptor}
     */
    addEventPropertyDescriptor: {
        value: function (eventPropertyDescriptor) {
            if (eventPropertyDescriptor !== null && eventPropertyDescriptor.name !== null) {
                var index = this._eventPropertyDescriptors.indexOf(eventPropertyDescriptor);
                if (index < 0) {
                    if (eventPropertyDescriptor.owner && eventPropertyDescriptor.owner !== this) {
                        eventPropertyDescriptor.owner.removeEventObjectDescriptor(eventPropertyDescriptor);
                    }
                    this._eventPropertyDescriptors.push(eventPropertyDescriptor);
                    this._eventPropertyDescriptorsTable[eventPropertyDescriptor.name] = eventPropertyDescriptor;
                    eventPropertyDescriptor._owner = this;
                }
            }
            return eventPropertyDescriptor;
        }
    },

    /**
     * Removes an property blueprint from the property blueprint list of this
     * blueprint.
     * @function
     * @param {Object} property blueprint The property blueprint to be removed.
     * @returns {PropertyBlueprint}
     */
    removeEventPropertyDescriptor: {
        value: function (eventPropertyDescriptor) {
            if (eventPropertyDescriptor !== null && eventPropertyDescriptor.name !== null) {
                var index = this._eventPropertyDescriptors.indexOf(eventPropertyDescriptor);
                if (index >= 0) {
                    this._eventPropertyDescriptors.splice(index, 1);
                    delete this._eventPropertyDescriptorsTable[eventPropertyDescriptor.name];
                    eventPropertyDescriptor._owner = null;
                }
            }
            return eventPropertyDescriptor;
        }
    },

    /**
     * Return a new event property descriptor.
     * **Note:** This is the canonical way of creating new event property descriptors in
     * order to enable subclassing.
     * @param {string} name name of the event property descriptor to create
     */
    newEventPropertyDescriptor: {
        value: function (name) {
            return new EventBlueprint().initWithNameAndBlueprint(name, this);
        }
    },


    /**
     * Convenience to add an event blueprint.
     * @function
     * @param {string} name
     * @returns {EventBlueprint}
     */
    addEventPropertyDescriptorNamed: {
        value: function (name, inverse) {
            return this.addEventPropertyDescriptor(this.newEventPropertyDescriptor(name));
        }
    },

    /**
     * @function
     * @param {string} name
     * @returns {EventBlueprint}
     */
    eventPropertyDescriptorForName: {
        value: function (name) {
            var eventPropertyDescriptor = this._eventPropertyDescriptorsTable[name];
            if (typeof eventPropertyDescriptor === "undefined") {
                eventPropertyDescriptor = UnknownEventBlueprint;
                var anEventPropertyDescriptor, index;
                for (index = 0; typeof (anEventPropertyDescriptor = this._eventPropertyDescriptors[index]) !== "undefined"; index++) {
                    if (anEventPropertyDescriptor.name === name) {
                        eventPropertyDescriptor = anEventPropertyDescriptor;
                        break;
                    }
                }
                this._eventPropertyDescriptorsTable[name] = eventPropertyDescriptor;
            }
            // TODO: Come back after creating event property descriptor
            if (eventPropertyDescriptor === UnknownEventBlueprint) {
                eventPropertyDescriptor = null;
            }
            if ((! eventPropertyDescriptor) && (this.parent)) {
                eventPropertyDescriptor = this.parent.eventPropertyDescriptorForName(name);
            }
            return eventPropertyDescriptor;
        }

    },


    _propertyValidationRules: {
        value: {}
    },

    /**
     * Gets the list of properties validation rules.
     * @returns {Array.<PropertyValidationRule>} copy of the list of properties
     * validation rules.
     */
    propertyValidationRules: {
        get: function () {
            var propertyValidationRules = [];
            for (var name in this._propertyValidationRules) {
                propertyValidationRules.push(this._propertyValidationRules[name]);
            }
            if (this.parent) {
                propertyValidationRules = propertyValidationRules.concat(this.parent.propertyValidationRules);
            }
            return propertyValidationRules;
        }
    },

    /**
     * Returns the properties validation rule for that name
     * @param {string} name of the rule
     * @returns {PropertyDescription} property description
     */
    propertyValidationRuleForName: {
        value: function (name) {
            var propertyValidationRule = this._propertyValidationRules[name];
            if ((! propertyValidationRule) && (this.parent)) {
                propertyValidationRule = this.parent.propertyValidationRuleForName(name);
            }
            return propertyValidationRule;
        }
    },

    /**
     * Add a new properties validation rule .
     * @function
     * @param {string} name of the rule
     * @returns {PropertyDescription} new properties validation rule
     */
    addPropertyValidationRule: {
        value: function (name) {
            var propertyValidationRule = this._propertyValidationRules[name];
            if (propertyValidationRule == null) {
                propertyValidationRule = new PropertyValidationRule().initWithNameAndBlueprint(name, this);
                this._propertyValidationRules[name] = propertyValidationRule;
            }
            return propertyValidationRule;
        }
    },

    /**
     * Remove the properties validation rule  for the name.
     * @function
     * @param {string} name of the rule
     * @returns {PropertyDescription} removed properties validation rule
     */
    removePropertyValidationRule: {
        value: function (name) {
            var propertyValidationRule = this._propertyValidationRules[name];
            if (propertyValidationRule != null) {
                delete this._propertyValidationRules[name];
            }
            return propertyValidationRule;
        }
    },

    /**
     * Evaluates the rules based on the object and the properties.
     * @param {Object} object instance to evaluate the rule for
     * @returns {Array.<string>} list of message key for rule that fired. Empty
     * array otherwise.
     */
    evaluateRules: {
        value: function (objectInstance) {
            var messages = [];
            for (var name in this._propertyValidationRules) {
                var rule = this._propertyValidationRules[name];
                if (rule.evaluateRule(objectInstance)) {
                    messages.push(rule.messageKey);
                }
            }
            return messages;
        }
    },

    objectDescriptorModuleId:require("../core")._objectDescriptorModuleIdDescriptor,

    objectDescriptor:require("../core")._objectDescriptor


}, {

    /**
     * Creates a default blueprint with all enumerable properties.
     *
     * **Note:** Value type are set to the string default.
     */
    createDefaultObjectDescriptorForObject: {
        value:function (object) {
            if (object) {
                var target = Montage.getInfoForObject(object).isInstance ? Object.getPrototypeOf(object) : object.prototype;
                var info = Montage.getInfoForObject(target);

                // Create `new this()` so that subclassing works
                var newObjectDescriptor = new this();

                for (var name in target) {
                    if ((name[0] !== "_") && (target.hasOwnProperty(name))) {
                        // We don't want to list private properties
                        var value = target[name];
                        var propertyBlueprint;
                        if (Array.isArray(value)) {
                            propertyBlueprint = newObjectDescriptor.addToManyPropertyBlueprintNamed(name);
                        } else {
                            propertyBlueprint = newObjectDescriptor.addToOnePropertyBlueprintNamed(name);
                        }
                        newObjectDescriptor.addPropertyDescriptorGroupNamed(propertyBlueprint, info.objectName);
                    }
                }
                var parentObject = Object.getPrototypeOf(target);
                if (parentObject && "objectDescriptor" in parentObject) {
                    return parentObject.objectDescriptor.then(function (objectDescriptor) {
                        newObjectDescriptor.parent = objectDescriptor;
                        return newObjectDescriptor;
                    });
                } else {
                    return Promise.resolve(newObjectDescriptor);
                }
            } else {
                return Promise.resolve(UnknownObjectDescriptor);
            }
        }
    }
});

var UnknownObjectDescriptor = Object.freeze(new ObjectDescriptor().initWithName("Unknown"));

// TODO: Come back after creating PropertyDescriptor and EventPropertyDescriptor
var UnknownPropertyBlueprint = Object.freeze(new PropertyBlueprint().initWithNameBlueprintAndCardinality("Unknown", null, 1));
var UnknownEventBlueprint = Object.freeze(new EventBlueprint().initWithNameAndBlueprint("Unknown", null));
