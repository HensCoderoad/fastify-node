const _ = require("lodash");
class Schema {
    constructor(x, y) {
        this.scmemas = {};
        this.current = "";
    }
    
    item = (k, v) => {
        var key = this.current ? this.current + "." + k : k;
        _.set(this.scmemas, key, v);
        return this;
    }
    
    //类型处理
    title = (v) => {
        _.set(this.scmemas, "title", v);
        return this;
    }
    id    = (v) => {
        _.set(this.scmemas, "$id", v);
        return this;
    };
    
    type     = (k, v) => this.item("type", k, v);
    array    = () => this.item("type", "array");
    boolean  = () => this.item("type", "boolean");
    string   = () => this.item("type", "string");
    int      = () => this.item("type", "integer");
    reg      = (regexp) => {
        if(!_.isRegExp(regexp)) throw new Error("schema.reg is not RegExp")
        var type    = "regexp"
        var pattern = regexp.toString().replace(/((^\/)|(\/([ig]*))$)/ig, "");
        this.item("type", type);
        return this.item("pattern", pattern);
    }
    enum     = (...enums) => this.item("enum", enums);
    email    = () => this.reg(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/ig);
    alphanum = () => this.reg(/^[a-z0-9]+$/ig);
    
    //错误信息处理
    error    = (message) => this.item("message", message);
    required = (...items) => this.item("required", items);
    
    //增加对象
    add = (id) => {
        var reg = /^(([a-z]+)\.)?([^$]+)$/ig
        if(reg.test(id)) {
            var key      = (RegExp.$2 || "query") + "." + RegExp.$3
            this.current = key;
            _.set(this.scmemas, key, _.get(this.scmemas, key, {}));
        }
        return this;
    }
    
    //获取schema的值
    value = () => {
        var {current, ...options} = this.scmemas
        return this.scmemas;
    }
}

var schema = new Schema()
    .title("系统基本数据结构")
    .id("http://schema.f2i.cn/v1/common.json")
    .add("body.id").string().error("abc")
    .add("string").string().error("abc")
    .add("boolean").boolean().error("abc")
    .add("params.abc").int().error("abc")
    .add("headers.abc").int().error("abc")
    .add("headers.reg").reg(/^\d+$/ig).error("abc")
    .add("headers.enum").enum(1, 2, 3, 4, 5).error("abc")
    .add("headers.email").email().error("abc")
    .add("headers.alphanum").alphanum().error("abc")
    .required("abc", "bbc")
    .value()

console.log(schema)

module.exports = Schema;