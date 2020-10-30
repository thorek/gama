"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainDefinition = void 0;
var fs_1 = __importDefault(require("fs"));
var lodash_1 = __importDefault(require("lodash"));
var path_1 = __importDefault(require("path"));
var yaml_1 = __importDefault(require("yaml"));
var DomainDefinition = /** @class */ (function () {
    function DomainDefinition(configOrconfigFolder) {
        this.entities = [];
        this.enums = [];
        this.configuration = lodash_1.default.isUndefined(configOrconfigFolder) ? {} :
            lodash_1.default.isString(configOrconfigFolder) || lodash_1.default.isArray(configOrconfigFolder) ?
                new FileConfiguration(configOrconfigFolder).getConfiguration() :
                configOrconfigFolder;
    }
    DomainDefinition.prototype.add = function (configuration) {
        lodash_1.default.merge(this.configuration, configuration);
    };
    DomainDefinition.prototype.getConfiguration = function () {
        return this.configuration;
    };
    return DomainDefinition;
}());
exports.DomainDefinition = DomainDefinition;
var FileConfiguration = /** @class */ (function () {
    function FileConfiguration(configFolder) {
        this.configFolder = configFolder;
        if (lodash_1.default.isString(configFolder))
            this.configFolder = [configFolder];
    }
    /**
     *
     */
    FileConfiguration.prototype.getConfiguration = function () {
        var _this = this;
        var configuration = {};
        lodash_1.default.forEach(this.configFolder, function (folder) {
            var files = _this.getConfigFiles(folder);
            lodash_1.default.forEach(files, function (file) { return lodash_1.default.merge(configuration, _this.parseConfigFile(configuration, folder, file)); });
        });
        return configuration;
    };
    /**
     *
     */
    FileConfiguration.prototype.getConfigFiles = function (folder) {
        var _this = this;
        try {
            return lodash_1.default.filter(fs_1.default.readdirSync(folder), function (file) { return _this.isConfigFile(file); });
        }
        catch (error) {
            console.error("cannot read files from folder '" + folder + "'", error);
            return [];
        }
    };
    /**
     *
     */
    FileConfiguration.prototype.isConfigFile = function (file) {
        var extension = lodash_1.default.toLower(path_1.default.extname(file));
        return lodash_1.default.includes(['.yaml', '.yml'], extension);
    };
    /**
     *
     */
    FileConfiguration.prototype.parseConfigFile = function (configs, folder, file) {
        try {
            file = path_1.default.join(folder, file);
            var content = fs_1.default.readFileSync(file).toString();
            var config = yaml_1.default.parse(content);
            return config;
        }
        catch (error) {
            console.warn("Error parsing file [" + file + "]:", error);
        }
    };
    return FileConfiguration;
}());
