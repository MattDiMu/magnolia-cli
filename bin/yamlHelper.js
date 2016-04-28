#! /usr/bin/env node

'use strict';
function create(yamlStream) {

    var yamlJs = require('yaml-js');

    this.rootYamlNode = yamlJs.compose(yamlStream);

    this.hasNode = function(path) {
        return this.getYamlNodeByPath(path) != null;
    };

    this.getYamlNodeByPath = function(path) {
        var nodeNames = resolveNodeNames(path);
        var length = nodeNames.length;
        var node = this.rootYamlNode;
        for (var i = 0; i < length && node != null; ++i) {
            node = this.getChildNode(node, nodeNames[i]);
        }
        return node;
    };

    this.getChildNode = function(parentNode, nodeName) {
        var value = parentNode.value;

        if (Array.isArray(value)) {
            var length = value.length;
            for (var i = 0; i < length; ++i) {
                var key = value[i][0];
                if (key.value == nodeName) {
                    return value[i][1];
                }
            }
        }

        return null;
    };

    this.getScalarValue = function (scalarPropertyPath) {
        var pathMatcher = /(.?)\/(.+?)/.exec(scalarPropertyPath);

        var scalarName = pathMatcher[1], parentPath = pathMatcher[0];
        var parentNode = this.getYamlNodeByPath(parentPath);

        if (parentNode != null) {
            return this.getChildNode(parentNode, scalarName).value;
        }

        return null;
    };

    this.dump = function() {
        return this.dumpYamlNode(this.rootYamlNode);
    };

    this.dumpYamlNode = function(node) {
        return yamlJs.serialize(node, null, null, {
            default_style: false,
            default_flow_style: false
        });
    };

    this.injectSnippetAt = function (data, path) {
        var nodeNames = resolveNodeNames(path);

        if (nodeNames.length == 0) {
            return injectYamlData(this.rootYamlNode, data)
        } else {
            var yamlNode, hostYamlNode = this.rootYamlNode;
            while ((yamlNode = this.getChildNode(hostYamlNode, nodeNames[0])) != null) {
                nodeNames = nodeNames.slice(1);
                hostYamlNode = yamlNode;
            }

            injectYamlData(hostYamlNode, constructMissingDataNodes(data, nodeNames));
        }
    };

    function resolveNodeNames(path) {
        if (path == undefined || path == null) {
            return [];
        }

        if (path.charAt(0) == '/') {
            path = path.substr(1);
        }

        return path.split('/');
    }

    function constructMissingDataNodes(data, nodeNames) {
        nodeNames.reverse().forEach(function (nodeName) {
            var wrapper = {};
            wrapper[nodeName] = data;
            data = wrapper;
        });

        return data;
    }

    function injectYamlData(hostNode, data) {
        var yamlDump = yamlJs.dump(data, null, null, {
            default_style: false,
            default_flow_style: false
        });

        var injectedNodeGraph = yamlJs.compose(yamlDump);

        hostNode.value.push(injectedNodeGraph.value[0]);
    }

    return this;
}

module.exports = {
    create
};