"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganisationalUnit = void 0;
var graph_on_rails_1 = require("graph-on-rails");
var graphql_1 = require("graphql");
/**
 *
 */
var OrganisationalUnit = /** @class */ (function (_super) {
    __extends(OrganisationalUnit, _super);
    function OrganisationalUnit() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OrganisationalUnit.prototype.getName = function () { return 'OrganisationalUnit'; };
    OrganisationalUnit.prototype.getAttributes = function () {
        return {
            name: { graphqlType: graphql_1.GraphQLString, validation: {
                    presence: true,
                    length: { minimum: 2, maximum: 50 }
                } },
            email: { graphqlType: graphql_1.GraphQLString, validation: {
                    email: true
                } },
            additionalInfo: { graphqlType: graphql_1.GraphQLString, validation: {
                    length: { minimum: 10, maximum: 100 }
                } }
        };
    };
    OrganisationalUnit.prototype.getAssocTo = function () {
        return [
            { type: 'Organisation' }
        ];
    };
    OrganisationalUnit.prototype.getSeeds = function () {
        return {
            hr: { name: 'HR', additionalInfo: 'HR department incl. trainee office', Organisation: 'disphere' },
            it: { name: 'IT', additionalInfo: 'excluding our freelance Windows Admin', Organisation: 'disphere' },
            marketing: { name: 'Marketing', Organisation: 'disphere' },
            sales: { name: 'Sales', Organisation: 'disphere' },
            hrfs: { name: 'HR', additionalInfo: 'HR department incl. trainee office', Organisation: 'funstuff' },
            itfs: { name: 'IT', additionalInfo: 'excluding our freelance Windows Admin', Organisation: 'funstuff' },
            marketingfs: { name: 'Marketing', Organisation: 'funstuff' },
            gfBoring: { name: 'GF', Organisation: 'boring' },
            productionBoring: { name: 'Produktion', Organisation: 'boring' },
        };
    };
    return OrganisationalUnit;
}(graph_on_rails_1.Entity));
exports.OrganisationalUnit = OrganisationalUnit;
