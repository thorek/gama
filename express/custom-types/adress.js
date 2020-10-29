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
exports.AddressType = void 0;
var graph_on_rails_1 = require("graph-on-rails");
/**
 *
 */
var AddressType = /** @class */ (function (_super) {
    __extends(AddressType, _super);
    function AddressType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AddressType.prototype.getName = function () { return 'Address'; };
    AddressType.prototype.getAttributes = function () {
        return {
            street: { graphqlType: 'String' },
            zip: { graphqlType: 'String' },
            city: { graphqlType: 'String' },
            country: { graphqlType: 'String' }
        };
    };
    AddressType.prototype.getAssocTo = function () {
        return [
            { type: 'Person' }
        ];
    };
    AddressType.prototype.getParent = function () { return 'foo'; };
    AddressType.prototype.getSeeds = function () {
        return [
            { street: 'Lindenstraße', zip: '12345', city: 'Berlin', country: 'Germany' },
            { street: 'Meisenweg', zip: '98765', city: 'München', country: 'Germany' }
        ];
    };
    return AddressType;
}(graph_on_rails_1.Entity));
exports.AddressType = AddressType;
