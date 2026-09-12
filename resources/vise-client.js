(function(){
    "use strict";
    var ρσ_iterator_symbol = (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") ? Symbol.iterator : "iterator-Symbol-5d0927e5554349048cf0e3762a228256";
    var ρσ_kwargs_symbol = (typeof Symbol === "function") ? Symbol("kwargs-object") : "kwargs-object-Symbol-5d0927e5554349048cf0e3762a228256";
    var ρσ_cond_temp, ρσ_expr_temp, ρσ_last_exception;
    var ρσ_object_counter = 0;
    if( typeof HTMLCollection !== "undefined" && typeof Symbol === "function") NodeList.prototype[Symbol.iterator] = HTMLCollection.prototype[Symbol.iterator] = NamedNodeMap.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
var ρσ_len;
function ρσ_bool(val) {
    return !!val;
};
if (!ρσ_bool.__argnames__) Object.defineProperties(ρσ_bool, {
    __argnames__ : {value: ["val"]},
    __module__ : {value: "__main__"}
});

function ρσ_print() {
    var parts;
    if (typeof console === "object") {
        parts = [];
        for (var i = 0; i < arguments.length; i++) {
            parts.push(ρσ_str(arguments[i]));
        }
        console.log(parts.join(" "));
    }
};
if (!ρσ_print.__module__) Object.defineProperties(ρσ_print, {
    __module__ : {value: "__main__"}
});

function ρσ_int(val, base) {
    var ans;
    if (typeof val === "number") {
        ans = val | 0;
    } else {
        ans = parseInt(val, base || 10);
    }
    if (isNaN(ans)) {
        throw new ValueError("Invalid literal for int with base " + (base || 10) + ": " + val);
    }
    return ans;
};
if (!ρσ_int.__argnames__) Object.defineProperties(ρσ_int, {
    __argnames__ : {value: ["val", "base"]},
    __module__ : {value: "__main__"}
});

function ρσ_float(val) {
    var ans;
    if (typeof val === "number") {
        ans = val;
    } else {
        ans = parseFloat(val);
    }
    if (isNaN(ans)) {
        throw new ValueError("Could not convert string to float: " + arguments[0]);
    }
    return ans;
};
if (!ρσ_float.__argnames__) Object.defineProperties(ρσ_float, {
    __argnames__ : {value: ["val"]},
    __module__ : {value: "__main__"}
});

function ρσ_arraylike_creator() {
    var names;
    names = ("Int8Array Uint8Array Uint8ClampedArray Int16Array" + " Uint16Array Int32Array Uint32Array Float32Array" + " Float64Array").split(" ");
    if (typeof HTMLCollection === "function") {
        names = names.concat("HTMLCollection NodeList NamedNodeMap TouchList".split(" "));
    }
    return (function() {
        var ρσ_anonfunc = function (x) {
            if (Array.isArray(x) || typeof x === "string" || names.indexOf(Object.prototype.toString.call(x).slice(8, -1)) > -1) {
                return true;
            }
            return false;
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["x"]},
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
};
if (!ρσ_arraylike_creator.__module__) Object.defineProperties(ρσ_arraylike_creator, {
    __module__ : {value: "__main__"}
});

function options_object(f) {
    return (function() {
        var ρσ_anonfunc = function () {
            if (typeof arguments[arguments.length - 1] === "object") {
                arguments[ρσ_bound_index(arguments.length - 1, arguments)][ρσ_kwargs_symbol] = true;
            }
            return f.apply(this, arguments);
        };
        if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
};
if (!options_object.__argnames__) Object.defineProperties(options_object, {
    __argnames__ : {value: ["f"]},
    __module__ : {value: "__main__"}
});

function ρσ_id(x) {
    return x.ρσ_object_id;
};
if (!ρσ_id.__argnames__) Object.defineProperties(ρσ_id, {
    __argnames__ : {value: ["x"]},
    __module__ : {value: "__main__"}
});

function ρσ_dir(item) {
    var arr;
    arr = [];
    for (var i in item) {
        arr.push(i);
    }
    return arr;
};
if (!ρσ_dir.__argnames__) Object.defineProperties(ρσ_dir, {
    __argnames__ : {value: ["item"]},
    __module__ : {value: "__main__"}
});

function ρσ_ord(x) {
    var ans, second;
    ans = x.charCodeAt(0);
    if (55296 <= ans && ans <= 56319) {
        second = x.charCodeAt(1);
        if (56320 <= second && second <= 57343) {
            return (ans - 55296) * 1024 + second - 56320 + 65536;
        }
        throw new TypeError("string is missing the low surrogate char");
    }
    return ans;
};
if (!ρσ_ord.__argnames__) Object.defineProperties(ρσ_ord, {
    __argnames__ : {value: ["x"]},
    __module__ : {value: "__main__"}
});

function ρσ_chr(code) {
    if (code <= 65535) {
        return String.fromCharCode(code);
    }
    code -= 65536;
    return String.fromCharCode(55296 + (code >> 10), 56320 + (code & 1023));
};
if (!ρσ_chr.__argnames__) Object.defineProperties(ρσ_chr, {
    __argnames__ : {value: ["code"]},
    __module__ : {value: "__main__"}
});

function ρσ_callable(x) {
    return typeof x === "function";
};
if (!ρσ_callable.__argnames__) Object.defineProperties(ρσ_callable, {
    __argnames__ : {value: ["x"]},
    __module__ : {value: "__main__"}
});

function ρσ_bin(x) {
    var ans;
    if (typeof x !== "number" || x % 1 !== 0) {
        throw new TypeError("integer required");
    }
    ans = x.toString(2);
    if (ans[0] === "-") {
        ans = "-" + "0b" + ans.slice(1);
    } else {
        ans = "0b" + ans;
    }
    return ans;
};
if (!ρσ_bin.__argnames__) Object.defineProperties(ρσ_bin, {
    __argnames__ : {value: ["x"]},
    __module__ : {value: "__main__"}
});

function ρσ_hex(x) {
    var ans;
    if (typeof x !== "number" || x % 1 !== 0) {
        throw new TypeError("integer required");
    }
    ans = x.toString(16);
    if (ans[0] === "-") {
        ans = "-" + "0x" + ans.slice(1);
    } else {
        ans = "0x" + ans;
    }
    return ans;
};
if (!ρσ_hex.__argnames__) Object.defineProperties(ρσ_hex, {
    __argnames__ : {value: ["x"]},
    __module__ : {value: "__main__"}
});

function ρσ_enumerate(iterable) {
    var ans, iterator;
    ans = {"_i":-1};
    ans[ρσ_iterator_symbol] = (function() {
        var ρσ_anonfunc = function () {
            return this;
        };
        if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    if (ρσ_arraylike(iterable)) {
        ans["next"] = (function() {
            var ρσ_anonfunc = function () {
                this._i += 1;
                if (this._i < iterable.length) {
                    return {'done':false, 'value':[this._i, iterable[this._i]]};
                }
                return {'done':true};
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ans;
    }
    if (typeof iterable[ρσ_iterator_symbol] === "function") {
        iterator = (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
        ans["_iterator"] = iterator;
        ans["next"] = (function() {
            var ρσ_anonfunc = function () {
                var r;
                r = this._iterator.next();
                if (r.done) {
                    return {'done':true};
                }
                this._i += 1;
                return {'done':false, 'value':[this._i, r.value]};
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ans;
    }
    return ρσ_enumerate(Object.keys(iterable));
};
if (!ρσ_enumerate.__argnames__) Object.defineProperties(ρσ_enumerate, {
    __argnames__ : {value: ["iterable"]},
    __module__ : {value: "__main__"}
});

function ρσ_reversed(iterable) {
    var ans;
    if (ρσ_arraylike(iterable)) {
        ans = {"_i": iterable.length};
        ans["next"] = (function() {
            var ρσ_anonfunc = function () {
                this._i -= 1;
                if (this._i > -1) {
                    return {'done':false, 'value':iterable[this._i]};
                }
                return {'done':true};
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        ans[ρσ_iterator_symbol] = (function() {
            var ρσ_anonfunc = function () {
                return this;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ans;
    }
    throw new TypeError("reversed() can only be called on arrays or strings");
};
if (!ρσ_reversed.__argnames__) Object.defineProperties(ρσ_reversed, {
    __argnames__ : {value: ["iterable"]},
    __module__ : {value: "__main__"}
});

function ρσ_iter(iterable) {
    var ans;
    if (typeof iterable[ρσ_iterator_symbol] === "function") {
        return (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
    }
    if (ρσ_arraylike(iterable)) {
        ans = {"_i":-1};
        ans[ρσ_iterator_symbol] = (function() {
            var ρσ_anonfunc = function () {
                return this;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        ans["next"] = (function() {
            var ρσ_anonfunc = function () {
                this._i += 1;
                if (this._i < iterable.length) {
                    return {'done':false, 'value':iterable[this._i]};
                }
                return {'done':true};
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ans;
    }
    return ρσ_iter(Object.keys(iterable));
};
if (!ρσ_iter.__argnames__) Object.defineProperties(ρσ_iter, {
    __argnames__ : {value: ["iterable"]},
    __module__ : {value: "__main__"}
});

function ρσ_range_next(step, length) {
    var ρσ_unpack;
    this._i += step;
    this._idx += 1;
    if (this._idx >= length) {
        ρσ_unpack = [this.__i, -1];
        this._i = ρσ_unpack[0];
        this._idx = ρσ_unpack[1];
        return {'done':true};
    }
    return {'done':false, 'value':this._i};
};
if (!ρσ_range_next.__argnames__) Object.defineProperties(ρσ_range_next, {
    __argnames__ : {value: ["step", "length"]},
    __module__ : {value: "__main__"}
});

function ρσ_range(start, stop, step) {
    var length, ans;
    if (arguments.length <= 1) {
        stop = start || 0;
        start = 0;
    }
    step = arguments[2] || 1;
    length = Math.max(Math.ceil((stop - start) / step), 0);
    ans = {start:start, step:step, stop:stop};
    ans[ρσ_iterator_symbol] = (function() {
        var ρσ_anonfunc = function () {
            var it;
            it = {"_i": start - step, "_idx": -1};
            it.next = ρσ_range_next.bind(it, step, length);
            it[ρσ_iterator_symbol] = (function() {
                var ρσ_anonfunc = function () {
                    return this;
                };
                if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                    __module__ : {value: "__main__"}
                });
                return ρσ_anonfunc;
            })();
            return it;
        };
        if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    ans.count = (function() {
        var ρσ_anonfunc = function (val) {
            if (!this._cached) {
                this._cached = list(this);
            }
            return this._cached.count(val);
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["val"]},
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    ans.index = (function() {
        var ρσ_anonfunc = function (val) {
            if (!this._cached) {
                this._cached = list(this);
            }
            return this._cached.index(val);
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["val"]},
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    ans.__len__ = (function() {
        var ρσ_anonfunc = function () {
            return length;
        };
        if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    ans.__repr__ = (function() {
        var ρσ_anonfunc = function () {
            return "range(" + ρσ_str.format("{}", start) + ", " + ρσ_str.format("{}", stop) + ", " + ρσ_str.format("{}", step) + ")";
        };
        if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    ans.__str__ = ans.toString = ans.__repr__;
    if (typeof Proxy === "function") {
        ans = new Proxy(ans, (function(){
            var ρσ_d = {};
            ρσ_d["get"] = (function() {
                var ρσ_anonfunc = function (obj, prop) {
                    var iprop;
                    if (typeof prop === "string") {
                        iprop = parseInt(prop);
                        if (!isNaN(iprop)) {
                            prop = iprop;
                        }
                    }
                    if (typeof prop === "number") {
                        if (!obj._cached) {
                            obj._cached = list(obj);
                        }
                        return (ρσ_expr_temp = obj._cached)[(typeof prop === "number" && prop < 0) ? ρσ_expr_temp.length + prop : prop];
                    }
                    return obj[(typeof prop === "number" && prop < 0) ? obj.length + prop : prop];
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["obj", "prop"]},
                    __module__ : {value: "__main__"}
                });
                return ρσ_anonfunc;
            })();
            return ρσ_d;
        }).call(this));
    }
    return ans;
};
if (!ρσ_range.__argnames__) Object.defineProperties(ρσ_range, {
    __argnames__ : {value: ["start", "stop", "step"]},
    __module__ : {value: "__main__"}
});

function ρσ_getattr(obj, name, defval) {
    var ret;
    try {
        ret = obj[(typeof name === "number" && name < 0) ? obj.length + name : name];
    } catch (ρσ_Exception) {
        ρσ_last_exception = ρσ_Exception;
        if (ρσ_Exception instanceof TypeError) {
            if (defval === undefined) {
                throw new AttributeError("The attribute " + name + " is not present");
            }
            return defval;
        } else {
            throw ρσ_Exception;
        }
    }
    if (ret === undefined && !(name in obj)) {
        if (defval === undefined) {
            throw new AttributeError("The attribute " + name + " is not present");
        }
        ret = defval;
    }
    return ret;
};
if (!ρσ_getattr.__argnames__) Object.defineProperties(ρσ_getattr, {
    __argnames__ : {value: ["obj", "name", "defval"]},
    __module__ : {value: "__main__"}
});

function ρσ_setattr(obj, name, value) {
    obj[(typeof name === "number" && name < 0) ? obj.length + name : name] = value;
};
if (!ρσ_setattr.__argnames__) Object.defineProperties(ρσ_setattr, {
    __argnames__ : {value: ["obj", "name", "value"]},
    __module__ : {value: "__main__"}
});

function ρσ_hasattr(obj, name) {
    return name in obj;
};
if (!ρσ_hasattr.__argnames__) Object.defineProperties(ρσ_hasattr, {
    __argnames__ : {value: ["obj", "name"]},
    __module__ : {value: "__main__"}
});

ρσ_len = (function() {
    var ρσ_anonfunc = function () {
        function len(obj) {
            if (ρσ_arraylike(obj)) {
                return obj.length;
            }
            if (typeof obj.__len__ === "function") {
                return obj.__len__();
            }
            if (obj instanceof Set || obj instanceof Map) {
                return obj.size;
            }
            return Object.keys(obj).length;
        };
        if (!len.__argnames__) Object.defineProperties(len, {
            __argnames__ : {value: ["obj"]},
            __module__ : {value: "__main__"}
        });

        function len5(obj) {
            if (ρσ_arraylike(obj)) {
                return obj.length;
            }
            if (typeof obj.__len__ === "function") {
                return obj.__len__();
            }
            return Object.keys(obj).length;
        };
        if (!len5.__argnames__) Object.defineProperties(len5, {
            __argnames__ : {value: ["obj"]},
            __module__ : {value: "__main__"}
        });

        return (typeof Set === "function" && typeof Map === "function") ? len : len5;
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})()();
function ρσ_get_module(name) {
    return ρσ_modules[(typeof name === "number" && name < 0) ? ρσ_modules.length + name : name];
};
if (!ρσ_get_module.__argnames__) Object.defineProperties(ρσ_get_module, {
    __argnames__ : {value: ["name"]},
    __module__ : {value: "__main__"}
});

function ρσ_pow(x, y, z) {
    var ans;
    ans = Math.pow(x, y);
    if (z !== undefined) {
        ans %= z;
    }
    return ans;
};
if (!ρσ_pow.__argnames__) Object.defineProperties(ρσ_pow, {
    __argnames__ : {value: ["x", "y", "z"]},
    __module__ : {value: "__main__"}
});

function ρσ_type(x) {
    return x.constructor;
};
if (!ρσ_type.__argnames__) Object.defineProperties(ρσ_type, {
    __argnames__ : {value: ["x"]},
    __module__ : {value: "__main__"}
});

function ρσ_divmod(x, y) {
    var d;
    if (y === 0) {
        throw new ZeroDivisionError("integer division or modulo by zero");
    }
    d = Math.floor(x / y);
    return [d, x - d * y];
};
if (!ρσ_divmod.__argnames__) Object.defineProperties(ρσ_divmod, {
    __argnames__ : {value: ["x", "y"]},
    __module__ : {value: "__main__"}
});

function ρσ_max() {
    var kwargs = arguments[arguments.length-1];
    if (kwargs === null || typeof kwargs !== "object" || kwargs [ρσ_kwargs_symbol] !== true) kwargs = {};
    var args = Array.prototype.slice.call(arguments, 0);
    if (kwargs !== null && typeof kwargs === "object" && kwargs [ρσ_kwargs_symbol] === true) args.pop();
    var args, x;
    if (args.length === 0) {
        if (kwargs.defval !== undefined) {
            return kwargs.defval;
        }
        throw new TypeError("expected at least one argument");
    }
    if (args.length === 1) {
        args = args[0];
    }
    if (kwargs.key) {
        args = (function() {
            var ρσ_Iter = args, ρσ_Result = [], x;
            ρσ_Iter = ((typeof ρσ_Iter[Symbol.iterator] === "function") ? (ρσ_Iter instanceof Map ? ρσ_Iter.keys() : ρσ_Iter) : Object.keys(ρσ_Iter));
            for (var ρσ_Index of ρσ_Iter) {
                x = ρσ_Index;
                ρσ_Result.push(kwargs.key(x));
            }
            ρσ_Result = ρσ_list_constructor(ρσ_Result);
            return ρσ_Result;
        })();
    }
    if (!Array.isArray(args)) {
        args = list(args);
    }
    if (args.length) {
        return this.apply(null, args);
    }
    if (kwargs.defval !== undefined) {
        return kwargs.defval;
    }
    throw new TypeError("expected at least one argument");
};
if (!ρσ_max.__handles_kwarg_interpolation__) Object.defineProperties(ρσ_max, {
    __handles_kwarg_interpolation__ : {value: true},
    __module__ : {value: "__main__"}
});

var abs = Math.abs, max = ρσ_max.bind(Math.max);
var min = ρσ_max.bind(Math.min), bool = ρσ_bool, type = ρσ_type;
var float = ρσ_float, int = ρσ_int, arraylike = ρσ_arraylike_creator();
var ρσ_arraylike = arraylike;
var print = ρσ_print, id = ρσ_id, get_module = ρσ_get_module;
var pow = ρσ_pow, divmod = ρσ_divmod;
var dir = ρσ_dir, ord = ρσ_ord, chr = ρσ_chr, bin = ρσ_bin;
var hex = ρσ_hex, callable = ρσ_callable;
var enumerate = ρσ_enumerate, iter = ρσ_iter, reversed = ρσ_reversed;
var len = ρσ_len;
var range = ρσ_range, getattr = ρσ_getattr, setattr = ρσ_setattr;
var hasattr = ρσ_hasattr;function ρσ_equals(a, b) {
    var ρσ_unpack, akeys, bkeys, key;
    if (a === b) {
        return true;
    }
    if (a && typeof a.__eq__ === "function") {
        return a.__eq__(b);
    }
    if (b && typeof b.__eq__ === "function") {
        return b.__eq__(a);
    }
    if (ρσ_arraylike(a) && ρσ_arraylike(b)) {
        if ((a.length !== b.length && (typeof a.length !== "object" || ρσ_not_equals(a.length, b.length)))) {
            return false;
        }
        for (var i=0; i < a.length; i++) {
            if (!(((a[(typeof i === "number" && i < 0) ? a.length + i : i] === b[(typeof i === "number" && i < 0) ? b.length + i : i] || typeof a[(typeof i === "number" && i < 0) ? a.length + i : i] === "object" && ρσ_equals(a[(typeof i === "number" && i < 0) ? a.length + i : i], b[(typeof i === "number" && i < 0) ? b.length + i : i]))))) {
                return false;
            }
        }
        return true;
    }
    if (typeof a === "object" && typeof b === "object" && a !== null && b !== null && (a.constructor === Object && b.constructor === Object || Object.getPrototypeOf(a) === null && Object.getPrototypeOf(b) === null)) {
        ρσ_unpack = [Object.keys(a), Object.keys(b)];
        akeys = ρσ_unpack[0];
        bkeys = ρσ_unpack[1];
        if (akeys.length !== bkeys.length) {
            return false;
        }
        for (var j=0; j < akeys.length; j++) {
            key = akeys[(typeof j === "number" && j < 0) ? akeys.length + j : j];
            if (!(((a[(typeof key === "number" && key < 0) ? a.length + key : key] === b[(typeof key === "number" && key < 0) ? b.length + key : key] || typeof a[(typeof key === "number" && key < 0) ? a.length + key : key] === "object" && ρσ_equals(a[(typeof key === "number" && key < 0) ? a.length + key : key], b[(typeof key === "number" && key < 0) ? b.length + key : key]))))) {
                return false;
            }
        }
        return true;
    }
    return false;
};
if (!ρσ_equals.__argnames__) Object.defineProperties(ρσ_equals, {
    __argnames__ : {value: ["a", "b"]},
    __module__ : {value: "__main__"}
});

function ρσ_not_equals(a, b) {
    if (a === b) {
        return false;
    }
    if (a && typeof a.__ne__ === "function") {
        return a.__ne__(b);
    }
    if (b && typeof b.__ne__ === "function") {
        return b.__ne__(a);
    }
    return !ρσ_equals(a, b);
};
if (!ρσ_not_equals.__argnames__) Object.defineProperties(ρσ_not_equals, {
    __argnames__ : {value: ["a", "b"]},
    __module__ : {value: "__main__"}
});

var equals = ρσ_equals;
function ρσ_list_iterator(value) {
    var self;
    self = this;
    return (function(){
        var ρσ_d = {};
        ρσ_d["_i"] = -1;
        ρσ_d["_list"] = self;
        ρσ_d["next"] = (function() {
            var ρσ_anonfunc = function () {
                this._i += 1;
                if (this._i >= this._list.length) {
                    return (function(){
                        var ρσ_d = {};
                        ρσ_d["done"] = true;
                        return ρσ_d;
                    }).call(this);
                }
                return (function(){
                    var ρσ_d = {};
                    ρσ_d["done"] = false;
                    ρσ_d["value"] = (ρσ_expr_temp = this._list)[ρσ_bound_index(this._i, ρσ_expr_temp)];
                    return ρσ_d;
                }).call(this);
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this);
};
if (!ρσ_list_iterator.__argnames__) Object.defineProperties(ρσ_list_iterator, {
    __argnames__ : {value: ["value"]},
    __module__ : {value: "__main__"}
});

function ρσ_list_constructor(iterable) {
    var ans, iterator, result;
    if (iterable === undefined) {
        ans = [];
    } else if (ρσ_arraylike(iterable)) {
        ans = new Array(iterable.length);
        for (var i = 0; i < iterable.length; i++) {
            ans[(typeof i === "number" && i < 0) ? ans.length + i : i] = iterable[(typeof i === "number" && i < 0) ? iterable.length + i : i];
        }
    } else if (typeof iterable[ρσ_iterator_symbol] === "function") {
        iterator = (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
        ans = [];
        result = iterator.next();
        while (!result.done) {
            ans.push(result.value);
            result = iterator.next();
        }
    } else if (typeof iterable === "number") {
        ans = new Array(iterable);
    } else {
        ans = Object.keys(iterable);
    }
    return ans;
};
if (!ρσ_list_constructor.__argnames__) Object.defineProperties(ρσ_list_constructor, {
    __argnames__ : {value: ["iterable"]},
    __module__ : {value: "__main__"}
});

ρσ_list_constructor.__name__ = "list";
if (typeof Array.prototype.append !== "function") {
    Object.defineProperty(Array.prototype, "append", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = Array.prototype.push;
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "extend", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function (iterable) {
                var start, iterator, result;
                if (Array.isArray(iterable) || typeof iterable === "string") {
                    start = this.length;
                    this.length += iterable.length;
                    for (var i = 0; i < iterable.length; i++) {
                        (ρσ_expr_temp = this)[ρσ_bound_index(start + i, ρσ_expr_temp)] = iterable[(typeof i === "number" && i < 0) ? iterable.length + i : i];
                    }
                } else {
                    iterator = (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
                    result = iterator.next();
                    while (!result.done) {
                        this.push(result.value);
                        result = iterator.next();
                    }
                }
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["iterable"]},
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "index", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function (val, start, stop) {
                start = start || 0;
                if (start < 0) {
                    start = this.length + start;
                }
                if (start < 0) {
                    throw new ValueError(val + " is not in list");
                }
                if (stop === undefined) {
                    stop = this.length;
                }
                if (stop < 0) {
                    stop = this.length + stop;
                }
                for (var i = start; i < stop; i++) {
                    if (((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === val || typeof (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === "object" && ρσ_equals((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i], val))) {
                        return i;
                    }
                }
                throw new ValueError(val + " is not in list");
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["val", "start", "stop"]},
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "pypop", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function (index) {
                var ans;
                if (this.length === 0) {
                    throw new IndexError("list is empty");
                }
                if (index === undefined) {
                    index = -1;
                }
                ans = this.splice(index, 1);
                if (!ans.length) {
                    throw new IndexError("pop index out of range");
                }
                return ans[0];
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["index"]},
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "remove", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function (value) {
                for (var i = 0; i < this.length; i++) {
                    if (((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === value || typeof (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === "object" && ρσ_equals((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i], value))) {
                        this.splice(i, 1);
                        return;
                    }
                }
                throw new ValueError(value + " not in list");
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["value"]},
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "toString", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function () {
                return "[" + this.join(", ") + "]";
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "inspect", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function () {
                return "[" + this.join(", ") + "]";
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "insert", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function (index, val) {
                if (index < 0) {
                    index += this.length;
                }
                index = min(this.length, max(index, 0));
                if (index === 0) {
                    this.unshift(val);
                    return;
                }
                for (var i = this.length; i > index; i--) {
                    (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] = (ρσ_expr_temp = this)[ρσ_bound_index(i - 1, ρσ_expr_temp)];
                }
                (ρσ_expr_temp = this)[(typeof index === "number" && index < 0) ? ρσ_expr_temp.length + index : index] = val;
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["index", "val"]},
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "copy", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function () {
                return ρσ_list_constructor(this);
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "clear", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function () {
                this.length = 0;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "count", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function (value) {
                return this.reduce((function() {
                    var ρσ_anonfunc = function (n, val) {
                        return n + (val === value);
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["n", "val"]},
                        __module__ : {value: "__main__"}
                    });
                    return ρσ_anonfunc;
                })(), 0);
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["value"]},
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "pysort", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function () {
                var key = (arguments[0] === undefined || ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? ρσ_anonfunc.__defaults__.key : arguments[0];
                var reverse = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? ρσ_anonfunc.__defaults__.reverse : arguments[1];
                var ρσ_kwargs_obj = arguments[arguments.length-1];
                if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
                if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "key")){
                    key = ρσ_kwargs_obj.key;
                }
                if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "reverse")){
                    reverse = ρσ_kwargs_obj.reverse;
                }
                var _sort_key, _sort_cmp, mult, keymap, posmap, k;
                _sort_key = (function() {
                    var ρσ_anonfunc = function (value) {
                        var t;
                        t = typeof value;
                        if (t === "string" || t === "number") {
                            return value;
                        }
                        return value.toString();
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["value"]},
                        __module__ : {value: "__main__"}
                    });
                    return ρσ_anonfunc;
                })();
                _sort_cmp = (function() {
                    var ρσ_anonfunc = function (a, b, ap, bp) {
                        if (a < b) {
                            return -1;
                        }
                        if (a > b) {
                            return 1;
                        }
                        return ap - bp;
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["a", "b", "ap", "bp"]},
                        __module__ : {value: "__main__"}
                    });
                    return ρσ_anonfunc;
                })();
                key = key || _sort_key;
                mult = (reverse) ? -1 : 1;
                keymap = dict();
                posmap = dict();
                for (var i=0; i < this.length; i++) {
                    k = (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
                    keymap.set(k, key(k));
                    posmap.set(k, i);
                }
                this.sort((function() {
                    var ρσ_anonfunc = function (a, b) {
                        return mult * _sort_cmp(keymap.get(a), keymap.get(b), posmap.get(a), posmap.get(b));
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["a", "b"]},
                        __module__ : {value: "__main__"}
                    });
                    return ρσ_anonfunc;
                })());
            };
            if (!ρσ_anonfunc.__defaults__) Object.defineProperties(ρσ_anonfunc, {
                __defaults__ : {value: {key:null, reverse:false}},
                __handles_kwarg_interpolation__ : {value: true},
                __argnames__ : {value: ["key", "reverse"]},
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "as_array", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function () {
                return Array.from(this);
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "__len__", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function () {
                return this.length;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "__contains__", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function (val) {
                for (var i = 0; i < this.length; i++) {
                    if (((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === val || typeof (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === "object" && ρσ_equals((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i], val))) {
                        return true;
                    }
                }
                return false;
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["val"]},
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "__eq__", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = (function() {
            var ρσ_anonfunc = function (other) {
                if (!ρσ_arraylike(other)) {
                    return false;
                }
                if ((this.length !== other.length && (typeof this.length !== "object" || ρσ_not_equals(this.length, other.length)))) {
                    return false;
                }
                for (var i = 0; i < this.length; i++) {
                    if (!((((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === other[(typeof i === "number" && i < 0) ? other.length + i : i] || typeof (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] === "object" && ρσ_equals((ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i], other[(typeof i === "number" && i < 0) ? other.length + i : i]))))) {
                        return false;
                    }
                }
                return true;
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["other"]},
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this));
    Object.defineProperty(Array.prototype, "constructor", (function(){
        var ρσ_d = {};
        ρσ_d["writable"] = false;
        ρσ_d["configurable"] = false;
        ρσ_d["enumerable"] = false;
        ρσ_d["value"] = ρσ_list_constructor;
        return ρσ_d;
    }).call(this));
}
function ρσ_list_decorate(ans) {
    return ans;
};
if (!ρσ_list_decorate.__argnames__) Object.defineProperties(ρσ_list_decorate, {
    __argnames__ : {value: ["ans"]},
    __module__ : {value: "__main__"}
});

var list = ρσ_list_constructor, list_wrap = ρσ_list_decorate;
function sorted() {
    var iterable = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
    var key = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? sorted.__defaults__.key : arguments[1];
    var reverse = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? sorted.__defaults__.reverse : arguments[2];
    var ρσ_kwargs_obj = arguments[arguments.length-1];
    if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
    if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "key")){
        key = ρσ_kwargs_obj.key;
    }
    if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "reverse")){
        reverse = ρσ_kwargs_obj.reverse;
    }
    var ans;
    ans = ρσ_list_constructor(iterable);
    ans.pysort(key, reverse);
    return ans;
};
if (!sorted.__defaults__) Object.defineProperties(sorted, {
    __defaults__ : {value: {key:null, reverse:false}},
    __handles_kwarg_interpolation__ : {value: true},
    __argnames__ : {value: ["iterable", "key", "reverse"]},
    __module__ : {value: "__main__"}
});

var ρσ_global_object_id = 0, ρσ_set_implementation;
function ρσ_set_keyfor(x) {
    var t, ans;
    t = typeof x;
    if (t === "string" || t === "number" || t === "boolean") {
        return "_" + t[0] + x;
    }
    if (x === null) {
        return "__!@#$0";
    }
    ans = x.ρσ_hash_key_prop;
    if (ans === undefined) {
        ans = "_!@#$" + (++ρσ_global_object_id);
        Object.defineProperty(x, "ρσ_hash_key_prop", (function(){
            var ρσ_d = {};
            ρσ_d["value"] = ans;
            return ρσ_d;
        }).call(this));
    }
    return ans;
};
if (!ρσ_set_keyfor.__argnames__) Object.defineProperties(ρσ_set_keyfor, {
    __argnames__ : {value: ["x"]},
    __module__ : {value: "__main__"}
});

function ρσ_set_polyfill() {
    this._store = {};
    this.size = 0;
};
if (!ρσ_set_polyfill.__module__) Object.defineProperties(ρσ_set_polyfill, {
    __module__ : {value: "__main__"}
});

ρσ_set_polyfill.prototype.add = (function() {
    var ρσ_anonfunc = function (x) {
        var key;
        key = ρσ_set_keyfor(x);
        if (!Object.prototype.hasOwnProperty.call(this._store, key)) {
            this.size += 1;
            (ρσ_expr_temp = this._store)[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key] = x;
        }
        return this;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set_polyfill.prototype.clear = (function() {
    var ρσ_anonfunc = function (x) {
        this._store = {};
        this.size = 0;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set_polyfill.prototype.delete = (function() {
    var ρσ_anonfunc = function (x) {
        var key;
        key = ρσ_set_keyfor(x);
        if (Object.prototype.hasOwnProperty.call(this._store, key)) {
            this.size -= 1;
            delete this._store[key];
            return true;
        }
        return false;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set_polyfill.prototype.has = (function() {
    var ρσ_anonfunc = function (x) {
        return Object.prototype.hasOwnProperty.call(this._store, ρσ_set_keyfor(x));
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set_polyfill.prototype.values = (function() {
    var ρσ_anonfunc = function (x) {
        var ans;
        ans = {'_keys': Object.keys(this._store), '_i':-1, '_s':this._store};
        ans[ρσ_iterator_symbol] = (function() {
            var ρσ_anonfunc = function () {
                return this;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        ans["next"] = (function() {
            var ρσ_anonfunc = function () {
                this._i += 1;
                if (this._i >= this._keys.length) {
                    return {'done': true};
                }
                return {'done':false, 'value':this._s[this._keys[this._i]]};
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
if (typeof Set !== "function" || typeof Set.prototype.delete !== "function") {
    ρσ_set_implementation = ρσ_set_polyfill;
} else {
    ρσ_set_implementation = Set;
}
function ρσ_set(iterable) {
    var ans, s, iterator, result, keys;
    if (this instanceof ρσ_set) {
        this.jsset = new ρσ_set_implementation;
        ans = this;
        if (iterable === undefined) {
            return ans;
        }
        s = ans.jsset;
        if (ρσ_arraylike(iterable)) {
            for (var i = 0; i < iterable.length; i++) {
                s.add(iterable[(typeof i === "number" && i < 0) ? iterable.length + i : i]);
            }
        } else if (typeof iterable[ρσ_iterator_symbol] === "function") {
            iterator = (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
            result = iterator.next();
            while (!result.done) {
                s.add(result.value);
                result = iterator.next();
            }
        } else {
            keys = Object.keys(iterable);
            for (var j=0; j < keys.length; j++) {
                s.add(keys[(typeof j === "number" && j < 0) ? keys.length + j : j]);
            }
        }
        return ans;
    } else {
        return new ρσ_set(iterable);
    }
};
if (!ρσ_set.__argnames__) Object.defineProperties(ρσ_set, {
    __argnames__ : {value: ["iterable"]},
    __module__ : {value: "__main__"}
});

ρσ_set.prototype.__name__ = "set";
Object.defineProperties(ρσ_set.prototype, (function(){
    var ρσ_d = {};
    ρσ_d["length"] = (function(){
        var ρσ_d = {};
        ρσ_d["get"] = (function() {
            var ρσ_anonfunc = function () {
                return this.jsset.size;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this);
    ρσ_d["size"] = (function(){
        var ρσ_d = {};
        ρσ_d["get"] = (function() {
            var ρσ_anonfunc = function () {
                return this.jsset.size;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this);
    return ρσ_d;
}).call(this));
ρσ_set.prototype.__len__ = (function() {
    var ρσ_anonfunc = function () {
        return this.jsset.size;
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.has = ρσ_set.prototype.__contains__ = (function() {
    var ρσ_anonfunc = function (x) {
        return this.jsset.has(x);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.add = (function() {
    var ρσ_anonfunc = function (x) {
        this.jsset.add(x);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.clear = (function() {
    var ρσ_anonfunc = function () {
        this.jsset.clear();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.copy = (function() {
    var ρσ_anonfunc = function () {
        return ρσ_set(this);
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.discard = (function() {
    var ρσ_anonfunc = function (x) {
        this.jsset.delete(x);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype[ρσ_iterator_symbol] = (function() {
    var ρσ_anonfunc = function () {
        return this.jsset.values();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.difference = (function() {
    var ρσ_anonfunc = function () {
        var ans, s, iterator, r, x, has;
        ans = new ρσ_set;
        s = ans.jsset;
        iterator = this.jsset.values();
        r = iterator.next();
        while (!r.done) {
            x = r.value;
            has = false;
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i].has(x)) {
                    has = true;
                    break;
                }
            }
            if (!has) {
                s.add(x);
            }
            r = iterator.next();
        }
        return ans;
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.difference_update = (function() {
    var ρσ_anonfunc = function () {
        var s, remove, iterator, r, x;
        s = this.jsset;
        remove = [];
        iterator = s.values();
        r = iterator.next();
        while (!r.done) {
            x = r.value;
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i].has(x)) {
                    remove.push(x);
                    break;
                }
            }
            r = iterator.next();
        }
        for (var j = 0; j < remove.length; j++) {
            s.delete(remove[(typeof j === "number" && j < 0) ? remove.length + j : j]);
        }
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.intersection = (function() {
    var ρσ_anonfunc = function () {
        var ans, s, iterator, r, x, has;
        ans = new ρσ_set;
        s = ans.jsset;
        iterator = this.jsset.values();
        r = iterator.next();
        while (!r.done) {
            x = r.value;
            has = true;
            for (var i = 0; i < arguments.length; i++) {
                if (!arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i].has(x)) {
                    has = false;
                    break;
                }
            }
            if (has) {
                s.add(x);
            }
            r = iterator.next();
        }
        return ans;
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.intersection_update = (function() {
    var ρσ_anonfunc = function () {
        var s, remove, iterator, r, x;
        s = this.jsset;
        remove = [];
        iterator = s.values();
        r = iterator.next();
        while (!r.done) {
            x = r.value;
            for (var i = 0; i < arguments.length; i++) {
                if (!arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i].has(x)) {
                    remove.push(x);
                    break;
                }
            }
            r = iterator.next();
        }
        for (var j = 0; j < remove.length; j++) {
            s.delete(remove[(typeof j === "number" && j < 0) ? remove.length + j : j]);
        }
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.isdisjoint = (function() {
    var ρσ_anonfunc = function (other) {
        var iterator, r, x;
        iterator = this.jsset.values();
        r = iterator.next();
        while (!r.done) {
            x = r.value;
            if (other.has(x)) {
                return false;
            }
            r = iterator.next();
        }
        return true;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.issubset = (function() {
    var ρσ_anonfunc = function (other) {
        var iterator, r, x;
        iterator = this.jsset.values();
        r = iterator.next();
        while (!r.done) {
            x = r.value;
            if (!other.has(x)) {
                return false;
            }
            r = iterator.next();
        }
        return true;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.issuperset = (function() {
    var ρσ_anonfunc = function (other) {
        var s, iterator, r, x;
        s = this.jsset;
        iterator = other.jsset.values();
        r = iterator.next();
        while (!r.done) {
            x = r.value;
            if (!s.has(x)) {
                return false;
            }
            r = iterator.next();
        }
        return true;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.pop = (function() {
    var ρσ_anonfunc = function () {
        var iterator, r;
        iterator = this.jsset.values();
        r = iterator.next();
        if (r.done) {
            throw new KeyError("pop from an empty set");
        }
        this.jsset.delete(r.value);
        return r.value;
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.remove = (function() {
    var ρσ_anonfunc = function (x) {
        if (!this.jsset.delete(x)) {
            throw new KeyError(x.toString());
        }
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.symmetric_difference = (function() {
    var ρσ_anonfunc = function (other) {
        return this.union(other).difference(this.intersection(other));
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.symmetric_difference_update = (function() {
    var ρσ_anonfunc = function (other) {
        var common;
        common = this.intersection(other);
        this.update(other);
        this.difference_update(common);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.union = (function() {
    var ρσ_anonfunc = function () {
        var ans;
        ans = ρσ_set(this);
        ans.update.apply(ans, arguments);
        return ans;
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.update = (function() {
    var ρσ_anonfunc = function () {
        var s, iterator, r;
        s = this.jsset;
        for (var i=0; i < arguments.length; i++) {
            iterator = arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i][ρσ_iterator_symbol]();
            r = iterator.next();
            while (!r.done) {
                s.add(r.value);
                r = iterator.next();
            }
        }
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.toString = ρσ_set.prototype.__repr__ = ρσ_set.prototype.__str__ = ρσ_set.prototype.inspect = (function() {
    var ρσ_anonfunc = function () {
        return "{" + list(this).join(", ") + "}";
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_set.prototype.__eq__ = (function() {
    var ρσ_anonfunc = function (other) {
        var iterator, r;
        if (!other instanceof this.constructor) {
            return false;
        }
        if (other.size !== this.size) {
            return false;
        }
        if (other.size === 0) {
            return true;
        }
        iterator = other[ρσ_iterator_symbol]();
        r = iterator.next();
        while (!r.done) {
            if (!this.has(r.value)) {
                return false;
            }
            r = iterator.next();
        }
        return true;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
function ρσ_set_wrap(x) {
    var ans;
    ans = new ρσ_set;
    ans.jsset = x;
    return ans;
};
if (!ρσ_set_wrap.__argnames__) Object.defineProperties(ρσ_set_wrap, {
    __argnames__ : {value: ["x"]},
    __module__ : {value: "__main__"}
});

var set = ρσ_set, set_wrap = ρσ_set_wrap;
var ρσ_dict_implementation;
function ρσ_dict_polyfill() {
    this._store = {};
    this.size = 0;
};
if (!ρσ_dict_polyfill.__module__) Object.defineProperties(ρσ_dict_polyfill, {
    __module__ : {value: "__main__"}
});

ρσ_dict_polyfill.prototype.set = (function() {
    var ρσ_anonfunc = function (x, value) {
        var key;
        key = ρσ_set_keyfor(x);
        if (!Object.prototype.hasOwnProperty.call(this._store, key)) {
            this.size += 1;
        }
        (ρσ_expr_temp = this._store)[(typeof key === "number" && key < 0) ? ρσ_expr_temp.length + key : key] = [x, value];
        return this;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x", "value"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.clear = (function() {
    var ρσ_anonfunc = function (x) {
        this._store = {};
        this.size = 0;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.delete = (function() {
    var ρσ_anonfunc = function (x) {
        var key;
        key = ρσ_set_keyfor(x);
        if (Object.prototype.hasOwnProperty.call(this._store, key)) {
            this.size -= 1;
            delete this._store[key];
            return true;
        }
        return false;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.has = (function() {
    var ρσ_anonfunc = function (x) {
        return Object.prototype.hasOwnProperty.call(this._store, ρσ_set_keyfor(x));
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.get = (function() {
    var ρσ_anonfunc = function (x) {
        try {
            return (ρσ_expr_temp = this._store)[ρσ_bound_index(ρσ_set_keyfor(x), ρσ_expr_temp)][1];
        } catch (ρσ_Exception) {
            ρσ_last_exception = ρσ_Exception;
            if (ρσ_Exception instanceof TypeError) {
                return undefined;
            } else {
                throw ρσ_Exception;
            }
        }
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.values = (function() {
    var ρσ_anonfunc = function (x) {
        var ans;
        ans = {'_keys': Object.keys(this._store), '_i':-1, '_s':this._store};
        ans[ρσ_iterator_symbol] = (function() {
            var ρσ_anonfunc = function () {
                return this;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        ans["next"] = (function() {
            var ρσ_anonfunc = function () {
                this._i += 1;
                if (this._i >= this._keys.length) {
                    return {'done': true};
                }
                return {'done':false, 'value':this._s[this._keys[this._i]][1]};
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.keys = (function() {
    var ρσ_anonfunc = function (x) {
        var ans;
        ans = {'_keys': Object.keys(this._store), '_i':-1, '_s':this._store};
        ans[ρσ_iterator_symbol] = (function() {
            var ρσ_anonfunc = function () {
                return this;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        ans["next"] = (function() {
            var ρσ_anonfunc = function () {
                this._i += 1;
                if (this._i >= this._keys.length) {
                    return {'done': true};
                }
                return {'done':false, 'value':this._s[this._keys[this._i]][0]};
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict_polyfill.prototype.entries = (function() {
    var ρσ_anonfunc = function (x) {
        var ans;
        ans = {'_keys': Object.keys(this._store), '_i':-1, '_s':this._store};
        ans[ρσ_iterator_symbol] = (function() {
            var ρσ_anonfunc = function () {
                return this;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        ans["next"] = (function() {
            var ρσ_anonfunc = function () {
                this._i += 1;
                if (this._i >= this._keys.length) {
                    return {'done': true};
                }
                return {'done':false, 'value':this._s[this._keys[this._i]]};
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
if (typeof Map !== "function" || typeof Map.prototype.delete !== "function") {
    ρσ_dict_implementation = ρσ_dict_polyfill;
} else {
    ρσ_dict_implementation = Map;
}
function ρσ_dict() {
    var iterable = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
    var kw = arguments[arguments.length-1];
    if (kw === null || typeof kw !== "object" || kw [ρσ_kwargs_symbol] !== true) kw = {};
    if (this instanceof ρσ_dict) {
        this.jsmap = new ρσ_dict_implementation;
        if (iterable !== undefined) {
            this.update(iterable);
        }
        this.update(kw);
        return this;
    } else {
        return ρσ_interpolate_kwargs_constructor.call(Object.create(ρσ_dict.prototype), false, ρσ_dict, [iterable].concat([ρσ_desugar_kwargs(kw)]));
    }
};
if (!ρσ_dict.__handles_kwarg_interpolation__) Object.defineProperties(ρσ_dict, {
    __handles_kwarg_interpolation__ : {value: true},
    __argnames__ : {value: ["iterable"]},
    __module__ : {value: "__main__"}
});

ρσ_dict.prototype.__name__ = "dict";
Object.defineProperties(ρσ_dict.prototype, (function(){
    var ρσ_d = {};
    ρσ_d["length"] = (function(){
        var ρσ_d = {};
        ρσ_d["get"] = (function() {
            var ρσ_anonfunc = function () {
                return this.jsmap.size;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this);
    ρσ_d["size"] = (function(){
        var ρσ_d = {};
        ρσ_d["get"] = (function() {
            var ρσ_anonfunc = function () {
                return this.jsmap.size;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
        return ρσ_d;
    }).call(this);
    return ρσ_d;
}).call(this));
ρσ_dict.prototype.__len__ = (function() {
    var ρσ_anonfunc = function () {
        return this.jsmap.size;
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.has = ρσ_dict.prototype.__contains__ = (function() {
    var ρσ_anonfunc = function (x) {
        return this.jsmap.has(x);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["x"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.set = ρσ_dict.prototype.__setitem__ = (function() {
    var ρσ_anonfunc = function (key, value) {
        this.jsmap.set(key, value);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["key", "value"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.__delitem__ = (function() {
    var ρσ_anonfunc = function (key) {
        this.jsmap.delete(key);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["key"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.clear = (function() {
    var ρσ_anonfunc = function () {
        this.jsmap.clear();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.copy = (function() {
    var ρσ_anonfunc = function () {
        return ρσ_dict(this);
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.keys = (function() {
    var ρσ_anonfunc = function () {
        return this.jsmap.keys();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.values = (function() {
    var ρσ_anonfunc = function () {
        return this.jsmap.values();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.items = ρσ_dict.prototype.entries = (function() {
    var ρσ_anonfunc = function () {
        return this.jsmap.entries();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype[ρσ_iterator_symbol] = (function() {
    var ρσ_anonfunc = function () {
        return this.jsmap.keys();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.__getitem__ = (function() {
    var ρσ_anonfunc = function (key) {
        var ans;
        ans = this.jsmap.get(key);
        if (ans === undefined && !this.jsmap.has(key)) {
            throw new KeyError(key + "");
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["key"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.get = (function() {
    var ρσ_anonfunc = function (key, defval) {
        var ans;
        ans = this.jsmap.get(key);
        if (ans === undefined && !this.jsmap.has(key)) {
            return (defval === undefined) ? null : defval;
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["key", "defval"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.set_default = ρσ_dict.prototype.setdefault = (function() {
    var ρσ_anonfunc = function (key, defval) {
        var j;
        j = this.jsmap;
        if (!j.has(key)) {
            j.set(key, defval);
            return defval;
        }
        return j.get(key);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["key", "defval"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.fromkeys = ρσ_dict.prototype.fromkeys = (function() {
    var ρσ_anonfunc = function () {
        var iterable = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
        var value = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? ρσ_anonfunc.__defaults__.value : arguments[1];
        var ρσ_kwargs_obj = arguments[arguments.length-1];
        if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
        if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "value")){
            value = ρσ_kwargs_obj.value;
        }
        var ans, iterator, r;
        ans = ρσ_dict();
        iterator = iter(iterable);
        r = iterator.next();
        while (!r.done) {
            ans.set(r.value, value);
            r = iterator.next();
        }
        return ans;
    };
    if (!ρσ_anonfunc.__defaults__) Object.defineProperties(ρσ_anonfunc, {
        __defaults__ : {value: {value:null}},
        __handles_kwarg_interpolation__ : {value: true},
        __argnames__ : {value: ["iterable", "value"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.pop = (function() {
    var ρσ_anonfunc = function (key, defval) {
        var ans;
        ans = this.jsmap.get(key);
        if (ans === undefined && !this.jsmap.has(key)) {
            if (defval === undefined) {
                throw new KeyError(key);
            }
            return defval;
        }
        this.jsmap.delete(key);
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["key", "defval"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.popitem = (function() {
    var ρσ_anonfunc = function () {
        var last, e, r;
        last = null;
        e = this.jsmap.entries();
        while (true) {
            r = e.next();
            if (r.done) {
                if (last === null) {
                    throw new KeyError("dict is empty");
                }
                this.jsmap.delete(last.value[0]);
                return last.value;
            }
            last = r;
        }
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.update = (function() {
    var ρσ_anonfunc = function () {
        var m, iterable, iterator, result, keys;
        if (arguments.length === 0) {
            return;
        }
        m = this.jsmap;
        iterable = arguments[0];
        if (Array.isArray(iterable)) {
            for (var i = 0; i < iterable.length; i++) {
                m.set(iterable[(typeof i === "number" && i < 0) ? iterable.length + i : i][0], iterable[(typeof i === "number" && i < 0) ? iterable.length + i : i][1]);
            }
        } else if (iterable instanceof ρσ_dict) {
            iterator = iterable.items();
            result = iterator.next();
            while (!result.done) {
                m.set(result.value[0], result.value[1]);
                result = iterator.next();
            }
        } else if (typeof Map === "function" && iterable instanceof Map) {
            iterator = iterable.entries();
            result = iterator.next();
            while (!result.done) {
                m.set(result.value[0], result.value[1]);
                result = iterator.next();
            }
        } else if (typeof iterable[ρσ_iterator_symbol] === "function") {
            iterator = iterable[ρσ_iterator_symbol]();
            result = iterator.next();
            while (!result.done) {
                m.set(result.value[0], result.value[1]);
                result = iterator.next();
            }
        } else {
            keys = Object.keys(iterable);
            for (var j=0; j < keys.length; j++) {
                if (keys[(typeof j === "number" && j < 0) ? keys.length + j : j] !== ρσ_iterator_symbol) {
                    m.set(keys[(typeof j === "number" && j < 0) ? keys.length + j : j], iterable[ρσ_bound_index(keys[(typeof j === "number" && j < 0) ? keys.length + j : j], iterable)]);
                }
            }
        }
        if (arguments.length > 1) {
            ρσ_dict.prototype.update.call(this, arguments[1]);
        }
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.toString = ρσ_dict.prototype.inspect = ρσ_dict.prototype.__str__ = ρσ_dict.prototype.__repr__ = (function() {
    var ρσ_anonfunc = function () {
        var entries, iterator, r;
        entries = [];
        iterator = this.jsmap.entries();
        r = iterator.next();
        while (!r.done) {
            entries.push(ρσ_repr(r.value[0]) + ": " + ρσ_repr(r.value[1]));
            r = iterator.next();
        }
        return "{" + entries.join(", ") + "}";
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.__eq__ = (function() {
    var ρσ_anonfunc = function (other) {
        var iterator, r, x;
        if (!(other instanceof this.constructor)) {
            return false;
        }
        if (other.size !== this.size) {
            return false;
        }
        if (other.size === 0) {
            return true;
        }
        iterator = other.items();
        r = iterator.next();
        while (!r.done) {
            x = this.jsmap.get(r.value[0]);
            if (x === undefined && !this.jsmap.has(r.value[0]) || x !== r.value[1]) {
                return false;
            }
            r = iterator.next();
        }
        return true;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_dict.prototype.as_object = (function() {
    var ρσ_anonfunc = function (other) {
        var ans, iterator, r;
        ans = {};
        iterator = this.jsmap.entries();
        r = iterator.next();
        while (!r.done) {
            ans[ρσ_bound_index(r.value[0], ans)] = r.value[1];
            r = iterator.next();
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["other"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
function ρσ_dict_wrap(x) {
    var ans;
    ans = new ρσ_dict;
    ans.jsmap = x;
    return ans;
};
if (!ρσ_dict_wrap.__argnames__) Object.defineProperties(ρσ_dict_wrap, {
    __argnames__ : {value: ["x"]},
    __module__ : {value: "__main__"}
});

var dict = ρσ_dict, dict_wrap = ρσ_dict_wrap;// }}}
var NameError;
NameError = ReferenceError;
function Exception() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    Exception.prototype.__init__.apply(this, arguments);
}
ρσ_extends(Exception, Error);
Exception.prototype.__init__ = function __init__(message) {
    var self = this;
    self.message = message;
    self.stack = (new Error).stack;
    self.name = self.constructor.name;
};
if (!Exception.prototype.__init__.__argnames__) Object.defineProperties(Exception.prototype.__init__, {
    __argnames__ : {value: ["message"]},
    __module__ : {value: "__main__"}
});
Exception.__argnames__ = Exception.prototype.__init__.__argnames__;
Exception.__handles_kwarg_interpolation__ = Exception.prototype.__init__.__handles_kwarg_interpolation__;
Exception.prototype.__repr__ = function __repr__() {
    var self = this;
    return self.name + ": " + self.message;
};
if (!Exception.prototype.__repr__.__module__) Object.defineProperties(Exception.prototype.__repr__, {
    __module__ : {value: "__main__"}
});
Exception.prototype.__str__ = function __str__ () {
    if(Error.prototype.__str__) return Error.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(Exception.prototype, "__bases__", {value: [Error]});

function AttributeError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    AttributeError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(AttributeError, Exception);
AttributeError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
AttributeError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
AttributeError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(AttributeError.prototype, "__bases__", {value: [Exception]});


function IndexError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    IndexError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(IndexError, Exception);
IndexError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
IndexError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
IndexError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(IndexError.prototype, "__bases__", {value: [Exception]});


function KeyError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    KeyError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(KeyError, Exception);
KeyError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
KeyError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
KeyError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(KeyError.prototype, "__bases__", {value: [Exception]});


function ValueError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    ValueError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(ValueError, Exception);
ValueError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
ValueError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
ValueError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(ValueError.prototype, "__bases__", {value: [Exception]});


function UnicodeDecodeError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    UnicodeDecodeError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(UnicodeDecodeError, Exception);
UnicodeDecodeError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
UnicodeDecodeError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
UnicodeDecodeError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(UnicodeDecodeError.prototype, "__bases__", {value: [Exception]});


function AssertionError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    AssertionError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(AssertionError, Exception);
AssertionError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
AssertionError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
AssertionError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(AssertionError.prototype, "__bases__", {value: [Exception]});


function ZeroDivisionError() {
    if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
    ZeroDivisionError.prototype.__init__.apply(this, arguments);
}
ρσ_extends(ZeroDivisionError, Exception);
ZeroDivisionError.prototype.__init__ = function __init__ () {
    Exception.prototype.__init__ && Exception.prototype.__init__.apply(this, arguments);
};
ZeroDivisionError.prototype.__repr__ = function __repr__ () {
    if(Exception.prototype.__repr__) return Exception.prototype.__repr__.call(this);
    return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
};
ZeroDivisionError.prototype.__str__ = function __str__ () {
    if(Exception.prototype.__str__) return Exception.prototype.__str__.call(this);
return this.__repr__();
};
Object.defineProperty(ZeroDivisionError.prototype, "__bases__", {value: [Exception]});

var ρσ_in, ρσ_desugar_kwargs, ρσ_exists;
function ρσ_eslice(arr, step, start, end) {
    var is_string;
    if (typeof arr === "string" || arr instanceof String) {
        is_string = true;
        arr = arr.split("");
    }
    if (step < 0) {
        step = -step;
        arr = arr.slice().reverse();
        if (typeof start !== "undefined") {
            start = arr.length - start - 1;
        }
        if (typeof end !== "undefined") {
            end = arr.length - end - 1;
        }
    }
    if (typeof start === "undefined") {
        start = 0;
    }
    if (typeof end === "undefined") {
        end = arr.length;
    }
    arr = arr.slice(start, end).filter((function() {
        var ρσ_anonfunc = function (e, i) {
            return i % step === 0;
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["e", "i"]},
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })());
    if (is_string) {
        arr = arr.join("");
    }
    return arr;
};
if (!ρσ_eslice.__argnames__) Object.defineProperties(ρσ_eslice, {
    __argnames__ : {value: ["arr", "step", "start", "end"]},
    __module__ : {value: "__main__"}
});

function ρσ_delslice(arr, step, start, end) {
    var is_string, ρσ_unpack, indices;
    if (typeof arr === "string" || arr instanceof String) {
        is_string = true;
        arr = arr.split("");
    }
    if (step < 0) {
        if (typeof start === "undefined") {
            start = arr.length;
        }
        if (typeof end === "undefined") {
            end = 0;
        }
        ρσ_unpack = [end, start, -step];
        start = ρσ_unpack[0];
        end = ρσ_unpack[1];
        step = ρσ_unpack[2];
    }
    if (typeof start === "undefined") {
        start = 0;
    }
    if (typeof end === "undefined") {
        end = arr.length;
    }
    if (step === 1) {
        arr.splice(start, end - start);
    } else {
        if (end > start) {
            indices = [];
            for (var i = start; i < end; i += step) {
                indices.push(i);
            }
            for (var i = indices.length - 1; i >= 0; i--) {
                arr.splice(indices[(typeof i === "number" && i < 0) ? indices.length + i : i], 1);
            }
        }
    }
    if (is_string) {
        arr = arr.join("");
    }
    return arr;
};
if (!ρσ_delslice.__argnames__) Object.defineProperties(ρσ_delslice, {
    __argnames__ : {value: ["arr", "step", "start", "end"]},
    __module__ : {value: "__main__"}
});

function ρσ_flatten(arr) {
    var ans, value;
    ans = [];
    for (var i=0; i < arr.length; i++) {
        value = arr[(typeof i === "number" && i < 0) ? arr.length + i : i];
        if (Array.isArray(value)) {
            ans = ans.concat(ρσ_flatten(value));
        } else {
            ans.push(value);
        }
    }
    return ans;
};
if (!ρσ_flatten.__argnames__) Object.defineProperties(ρσ_flatten, {
    __argnames__ : {value: ["arr"]},
    __module__ : {value: "__main__"}
});

function ρσ_unpack_asarray(num, iterable) {
    var ans, iterator, result;
    if (ρσ_arraylike(iterable)) {
        return iterable;
    }
    ans = [];
    if (typeof iterable[ρσ_iterator_symbol] === "function") {
        iterator = (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
        result = iterator.next();
        while (!result.done && ans.length < num) {
            ans.push(result.value);
            result = iterator.next();
        }
    }
    return ans;
};
if (!ρσ_unpack_asarray.__argnames__) Object.defineProperties(ρσ_unpack_asarray, {
    __argnames__ : {value: ["num", "iterable"]},
    __module__ : {value: "__main__"}
});

function ρσ_extends(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};
if (!ρσ_extends.__argnames__) Object.defineProperties(ρσ_extends, {
    __argnames__ : {value: ["child", "parent"]},
    __module__ : {value: "__main__"}
});

ρσ_in = (function() {
    var ρσ_anonfunc = function () {
        if (typeof Map === "function" && typeof Set === "function") {
            return (function() {
                var ρσ_anonfunc = function (val, arr) {
                    if (typeof arr === "string") {
                        return arr.indexOf(val) !== -1;
                    }
                    if (typeof arr.__contains__ === "function") {
                        return arr.__contains__(val);
                    }
                    if (arr instanceof Map || arr instanceof Set) {
                        return arr.has(val);
                    }
                    if (ρσ_arraylike(arr)) {
                        return Array.prototype.__contains__.call(arr, val);
                    }
                    return Object.prototype.hasOwnProperty.call(arr, val);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["val", "arr"]},
                    __module__ : {value: "__main__"}
                });
                return ρσ_anonfunc;
            })();
        }
        return (function() {
            var ρσ_anonfunc = function (val, arr) {
                if (typeof arr === "string") {
                    return arr.indexOf(val) !== -1;
                }
                if (typeof arr.__contains__ === "function") {
                    return arr.__contains__(val);
                }
                if (ρσ_arraylike(arr)) {
                    return Array.prototype.__contains__.call(arr, val);
                }
                return Object.prototype.hasOwnProperty.call(arr, val);
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["val", "arr"]},
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})()();
function ρσ_Iterable(iterable) {
    var iterator, ans, result;
    if (ρσ_arraylike(iterable)) {
        return iterable;
    }
    if (typeof iterable[ρσ_iterator_symbol] === "function") {
        iterator = (typeof Map === "function" && iterable instanceof Map) ? iterable.keys() : iterable[ρσ_iterator_symbol]();
        ans = [];
        result = iterator.next();
        while (!result.done) {
            ans.push(result.value);
            result = iterator.next();
        }
        return ans;
    }
    return Object.keys(iterable);
};
if (!ρσ_Iterable.__argnames__) Object.defineProperties(ρσ_Iterable, {
    __argnames__ : {value: ["iterable"]},
    __module__ : {value: "__main__"}
});

ρσ_desugar_kwargs = (function() {
    var ρσ_anonfunc = function () {
        if (typeof Object.assign === "function") {
            return (function() {
                var ρσ_anonfunc = function () {
                    var ans;
                    ans = Object.create(null);
                    ans[ρσ_kwargs_symbol] = true;
                    for (var i = 0; i < arguments.length; i++) {
                        Object.assign(ans, arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i]);
                    }
                    return ans;
                };
                if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                    __module__ : {value: "__main__"}
                });
                return ρσ_anonfunc;
            })();
        }
        return (function() {
            var ρσ_anonfunc = function () {
                var ans, keys;
                ans = Object.create(null);
                ans[ρσ_kwargs_symbol] = true;
                for (var i = 0; i < arguments.length; i++) {
                    keys = Object.keys(arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i]);
                    for (var j = 0; j < keys.length; j++) {
                        ans[ρσ_bound_index(keys[(typeof j === "number" && j < 0) ? keys.length + j : j], ans)] = (ρσ_expr_temp = arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i])[ρσ_bound_index(keys[(typeof j === "number" && j < 0) ? keys.length + j : j], ρσ_expr_temp)];
                    }
                }
                return ans;
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})()();
function ρσ_interpolate_kwargs(f, supplied_args) {
    var has_prop, kwobj, args, prop;
    if (!f.__argnames__) {
        return f.apply(this, supplied_args);
    }
    has_prop = Object.prototype.hasOwnProperty;
    kwobj = supplied_args.pop();
    if (f.__handles_kwarg_interpolation__) {
        args = new Array(Math.max(supplied_args.length, f.__argnames__.length) + 1);
        args[args.length-1] = kwobj;
        for (var i = 0; i < args.length - 1; i++) {
            if (i < f.__argnames__.length) {
                prop = (ρσ_expr_temp = f.__argnames__)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
                if (has_prop.call(kwobj, prop)) {
                    args[(typeof i === "number" && i < 0) ? args.length + i : i] = kwobj[(typeof prop === "number" && prop < 0) ? kwobj.length + prop : prop];
                    delete kwobj[prop];
                } else if (i < supplied_args.length) {
                    args[(typeof i === "number" && i < 0) ? args.length + i : i] = supplied_args[(typeof i === "number" && i < 0) ? supplied_args.length + i : i];
                }
            } else {
                args[(typeof i === "number" && i < 0) ? args.length + i : i] = supplied_args[(typeof i === "number" && i < 0) ? supplied_args.length + i : i];
            }
        }
        return f.apply(this, args);
    }
    for (var i = 0; i < f.__argnames__.length; i++) {
        prop = (ρσ_expr_temp = f.__argnames__)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
        if (has_prop.call(kwobj, prop)) {
            supplied_args[(typeof i === "number" && i < 0) ? supplied_args.length + i : i] = kwobj[(typeof prop === "number" && prop < 0) ? kwobj.length + prop : prop];
        }
    }
    return f.apply(this, supplied_args);
};
if (!ρσ_interpolate_kwargs.__argnames__) Object.defineProperties(ρσ_interpolate_kwargs, {
    __argnames__ : {value: ["f", "supplied_args"]},
    __module__ : {value: "__main__"}
});

function ρσ_interpolate_kwargs_constructor(apply, f, supplied_args) {
    if (apply) {
        f.apply(this, supplied_args);
    } else {
        ρσ_interpolate_kwargs.call(this, f, supplied_args);
    }
    return this;
};
if (!ρσ_interpolate_kwargs_constructor.__argnames__) Object.defineProperties(ρσ_interpolate_kwargs_constructor, {
    __argnames__ : {value: ["apply", "f", "supplied_args"]},
    __module__ : {value: "__main__"}
});

function ρσ_getitem(obj, key) {
    if (obj.__getitem__) {
        return obj.__getitem__(key);
    }
    if (typeof key === "number" && key < 0) {
        key += obj.length;
    }
    return obj[(typeof key === "number" && key < 0) ? obj.length + key : key];
};
if (!ρσ_getitem.__argnames__) Object.defineProperties(ρσ_getitem, {
    __argnames__ : {value: ["obj", "key"]},
    __module__ : {value: "__main__"}
});

function ρσ_setitem(obj, key, val) {
    if (obj.__setitem__) {
        obj.__setitem__(key, val);
    } else {
        if (typeof key === "number" && key < 0) {
            key += obj.length;
        }
        obj[(typeof key === "number" && key < 0) ? obj.length + key : key] = val;
    }
    return val;
};
if (!ρσ_setitem.__argnames__) Object.defineProperties(ρσ_setitem, {
    __argnames__ : {value: ["obj", "key", "val"]},
    __module__ : {value: "__main__"}
});

function ρσ_delitem(obj, key) {
    if (obj.__delitem__) {
        obj.__delitem__(key);
    } else if (typeof obj.splice === "function") {
        obj.splice(key, 1);
    } else {
        if (typeof key === "number" && key < 0) {
            key += obj.length;
        }
        delete obj[key];
    }
};
if (!ρσ_delitem.__argnames__) Object.defineProperties(ρσ_delitem, {
    __argnames__ : {value: ["obj", "key"]},
    __module__ : {value: "__main__"}
});

function ρσ_bound_index(idx, arr) {
    if (typeof idx === "number" && idx < 0) {
        idx += arr.length;
    }
    return idx;
};
if (!ρσ_bound_index.__argnames__) Object.defineProperties(ρσ_bound_index, {
    __argnames__ : {value: ["idx", "arr"]},
    __module__ : {value: "__main__"}
});

function ρσ_splice(arr, val, start, end) {
    start = start || 0;
    if (start < 0) {
        start += arr.length;
    }
    if (end === undefined) {
        end = arr.length;
    }
    if (end < 0) {
        end += arr.length;
    }
    Array.prototype.splice.apply(arr, [start, end - start].concat(val));
};
if (!ρσ_splice.__argnames__) Object.defineProperties(ρσ_splice, {
    __argnames__ : {value: ["arr", "val", "start", "end"]},
    __module__ : {value: "__main__"}
});

ρσ_exists = (function(){
    var ρσ_d = {};
    ρσ_d["n"] = (function() {
        var ρσ_anonfunc = function (expr) {
            return expr !== undefined && expr !== null;
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["expr"]},
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    ρσ_d["d"] = (function() {
        var ρσ_anonfunc = function (expr) {
            if (expr === undefined || expr === null) {
                return Object.create(null);
            }
            return expr;
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["expr"]},
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    ρσ_d["c"] = (function() {
        var ρσ_anonfunc = function (expr) {
            if (typeof expr === "function") {
                return expr;
            }
            return (function() {
                var ρσ_anonfunc = function () {
                    return undefined;
                };
                if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                    __module__ : {value: "__main__"}
                });
                return ρσ_anonfunc;
            })();
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["expr"]},
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    ρσ_d["g"] = (function() {
        var ρσ_anonfunc = function (expr) {
            if (expr === undefined || expr === null || typeof expr.__getitem__ !== "function") {
                return (function(){
                    var ρσ_d = {};
                    ρσ_d["__getitem__"] = (function() {
                        var ρσ_anonfunc = function () {
                            return undefined;
                        };
                        if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                            __module__ : {value: "__main__"}
                        });
                        return ρσ_anonfunc;
                    })();
                    return ρσ_d;
                }).call(this);
            }
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["expr"]},
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    ρσ_d["e"] = (function() {
        var ρσ_anonfunc = function (expr, alt) {
            return (expr === undefined || expr === null) ? alt : expr;
        };
        if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
            __argnames__ : {value: ["expr", "alt"]},
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    return ρσ_d;
}).call(this);
function ρσ_mixin() {
    var seen, resolved_props, p, target, props, name;
    seen = Object.create(null);
    seen.__argnames__ = seen.__handles_kwarg_interpolation__ = seen.__init__ = seen.__annotations__ = seen.__doc__ = seen.__bind_methods__ = seen.__bases__ = seen.constructor = seen.__class__ = true;
    resolved_props = {};
    p = target = arguments[0].prototype;
    while (p && p !== Object.prototype) {
        props = Object.getOwnPropertyNames(p);
        for (var i = 0; i < props.length; i++) {
            seen[ρσ_bound_index(props[(typeof i === "number" && i < 0) ? props.length + i : i], seen)] = true;
        }
        p = Object.getPrototypeOf(p);
    }
    for (var c = 1; c < arguments.length; c++) {
        p = arguments[(typeof c === "number" && c < 0) ? arguments.length + c : c].prototype;
        while (p && p !== Object.prototype) {
            props = Object.getOwnPropertyNames(p);
            for (var i = 0; i < props.length; i++) {
                name = props[(typeof i === "number" && i < 0) ? props.length + i : i];
                if (seen[(typeof name === "number" && name < 0) ? seen.length + name : name]) {
                    continue;
                }
                seen[(typeof name === "number" && name < 0) ? seen.length + name : name] = true;
                resolved_props[(typeof name === "number" && name < 0) ? resolved_props.length + name : name] = Object.getOwnPropertyDescriptor(p, name);
            }
            p = Object.getPrototypeOf(p);
        }
    }
    Object.defineProperties(target, resolved_props);
};
if (!ρσ_mixin.__module__) Object.defineProperties(ρσ_mixin, {
    __module__ : {value: "__main__"}
});

function ρσ_instanceof() {
    var obj, bases, q, cls, p;
    obj = arguments[0];
    bases = "";
    if (obj && obj.constructor && obj.constructor.prototype) {
        bases = obj.constructor.prototype.__bases__ || "";
    }
    for (var i = 1; i < arguments.length; i++) {
        q = arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i];
        if (obj instanceof q) {
            return true;
        }
        if ((q === Array || q === ρσ_list_constructor) && Array.isArray(obj)) {
            return true;
        }
        if (q === ρσ_str && (typeof obj === "string" || obj instanceof String)) {
            return true;
        }
        if (q === ρσ_int && typeof obj === "number" && Number.isInteger(obj)) {
            return true;
        }
        if (q === ρσ_float && typeof obj === "number" && !Number.isInteger(obj)) {
            return true;
        }
        if (bases.length > 1) {
            for (var c = 1; c < bases.length; c++) {
                cls = bases[(typeof c === "number" && c < 0) ? bases.length + c : c];
                while (cls) {
                    if (q === cls) {
                        return true;
                    }
                    p = Object.getPrototypeOf(cls.prototype);
                    if (!p) {
                        break;
                    }
                    cls = p.constructor;
                }
            }
        }
    }
    return false;
};
if (!ρσ_instanceof.__module__) Object.defineProperties(ρσ_instanceof, {
    __module__ : {value: "__main__"}
});
function sum(iterable, start) {
    var ans, iterator, r;
    if (Array.isArray(iterable)) {
        return iterable.reduce((function() {
            var ρσ_anonfunc = function (prev, cur) {
                return prev + cur;
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["prev", "cur"]},
                __module__ : {value: "__main__"}
            });
            return ρσ_anonfunc;
        })(), start || 0);
    }
    ans = start || 0;
    iterator = iter(iterable);
    r = iterator.next();
    while (!r.done) {
        ans += r.value;
        r = iterator.next();
    }
    return ans;
};
if (!sum.__argnames__) Object.defineProperties(sum, {
    __argnames__ : {value: ["iterable", "start"]},
    __module__ : {value: "__main__"}
});

function map() {
    var iterators, func, args, ans;
    iterators = new Array(arguments.length - 1);
    func = arguments[0];
    args = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++) {
        iterators[ρσ_bound_index(i - 1, iterators)] = iter(arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i]);
    }
    ans = {'_func':func, '_iterators':iterators, '_args':args};
    ans[ρσ_iterator_symbol] = (function() {
        var ρσ_anonfunc = function () {
            return this;
        };
        if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    ans["next"] = (function() {
        var ρσ_anonfunc = function () {
            var r;
            for (var i = 0; i < this._iterators.length; i++) {
                r = (ρσ_expr_temp = this._iterators)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i].next();
                if (r.done) {
                    return {'done':true};
                }
                (ρσ_expr_temp = this._args)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] = r.value;
            }
            return {'done':false, 'value':this._func.apply(undefined, this._args)};
        };
        if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    return ans;
};
if (!map.__module__) Object.defineProperties(map, {
    __module__ : {value: "__main__"}
});

function filter(func_or_none, iterable) {
    var func, ans;
    func = (func_or_none === null) ? ρσ_bool : func_or_none;
    ans = {'_func':func, '_iterator':ρσ_iter(iterable)};
    ans[ρσ_iterator_symbol] = (function() {
        var ρσ_anonfunc = function () {
            return this;
        };
        if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    ans["next"] = (function() {
        var ρσ_anonfunc = function () {
            var r;
            r = this._iterator.next();
            while (!r.done) {
                if (this._func(r.value)) {
                    return r;
                }
                r = this._iterator.next();
            }
            return {'done':true};
        };
        if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    return ans;
};
if (!filter.__argnames__) Object.defineProperties(filter, {
    __argnames__ : {value: ["func_or_none", "iterable"]},
    __module__ : {value: "__main__"}
});

function zip() {
    var iterators, ans;
    iterators = new Array(arguments.length);
    for (var i = 0; i < arguments.length; i++) {
        iterators[(typeof i === "number" && i < 0) ? iterators.length + i : i] = iter(arguments[(typeof i === "number" && i < 0) ? arguments.length + i : i]);
    }
    ans = {'_iterators':iterators};
    ans[ρσ_iterator_symbol] = (function() {
        var ρσ_anonfunc = function () {
            return this;
        };
        if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    ans["next"] = (function() {
        var ρσ_anonfunc = function () {
            var args, r;
            args = new Array(this._iterators.length);
            for (var i = 0; i < this._iterators.length; i++) {
                r = (ρσ_expr_temp = this._iterators)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i].next();
                if (r.done) {
                    return {'done':true};
                }
                args[(typeof i === "number" && i < 0) ? args.length + i : i] = r.value;
            }
            return {'done':false, 'value':args};
        };
        if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
            __module__ : {value: "__main__"}
        });
        return ρσ_anonfunc;
    })();
    return ans;
};
if (!zip.__module__) Object.defineProperties(zip, {
    __module__ : {value: "__main__"}
});

function any(iterable) {
    var i;
    var ρσ_Iter0 = iterable;
    ρσ_Iter0 = ((typeof ρσ_Iter0[Symbol.iterator] === "function") ? (ρσ_Iter0 instanceof Map ? ρσ_Iter0.keys() : ρσ_Iter0) : Object.keys(ρσ_Iter0));
    for (var ρσ_Index0 of ρσ_Iter0) {
        i = ρσ_Index0;
        if (i) {
            return true;
        }
    }
    return false;
};
if (!any.__argnames__) Object.defineProperties(any, {
    __argnames__ : {value: ["iterable"]},
    __module__ : {value: "__main__"}
});

function all(iterable) {
    var i;
    var ρσ_Iter1 = iterable;
    ρσ_Iter1 = ((typeof ρσ_Iter1[Symbol.iterator] === "function") ? (ρσ_Iter1 instanceof Map ? ρσ_Iter1.keys() : ρσ_Iter1) : Object.keys(ρσ_Iter1));
    for (var ρσ_Index1 of ρσ_Iter1) {
        i = ρσ_Index1;
        if (!i) {
            return false;
        }
    }
    return true;
};
if (!all.__argnames__) Object.defineProperties(all, {
    __argnames__ : {value: ["iterable"]},
    __module__ : {value: "__main__"}
});
var decimal_sep, define_str_func, ρσ_orig_split, ρσ_orig_replace;
decimal_sep = 1.1.toLocaleString()[1];
function ρσ_repr_js_builtin(x, as_array) {
    var ans, b, keys, key;
    ans = [];
    b = "{}";
    if (as_array) {
        b = "[]";
        for (var i = 0; i < x.length; i++) {
            ans.push(ρσ_repr(x[(typeof i === "number" && i < 0) ? x.length + i : i]));
        }
    } else {
        keys = Object.keys(x);
        for (var k = 0; k < keys.length; k++) {
            key = keys[(typeof k === "number" && k < 0) ? keys.length + k : k];
            ans.push(JSON.stringify(key) + ":" + ρσ_repr(x[(typeof key === "number" && key < 0) ? x.length + key : key]));
        }
    }
    return b[0] + ans.join(", ") + b[1];
};
if (!ρσ_repr_js_builtin.__argnames__) Object.defineProperties(ρσ_repr_js_builtin, {
    __argnames__ : {value: ["x", "as_array"]},
    __module__ : {value: "__main__"}
});

function ρσ_html_element_to_string(elem) {
    var attrs, val, attr, ans;
    attrs = [];
    var ρσ_Iter0 = elem.attributes;
    ρσ_Iter0 = ((typeof ρσ_Iter0[Symbol.iterator] === "function") ? (ρσ_Iter0 instanceof Map ? ρσ_Iter0.keys() : ρσ_Iter0) : Object.keys(ρσ_Iter0));
    for (var ρσ_Index0 of ρσ_Iter0) {
        attr = ρσ_Index0;
        if (attr.specified) {
            val = attr.value;
            if (val.length > 10) {
                val = val.slice(0, 15) + "...";
            }
            val = JSON.stringify(val);
            attrs.push("" + ρσ_str.format("{}", attr.name) + "=" + ρσ_str.format("{}", val) + "");
        }
    }
    attrs = (attrs.length) ? " " + attrs.join(" ") : "";
    ans = "<" + ρσ_str.format("{}", elem.tagName) + "" + ρσ_str.format("{}", attrs) + ">";
    return ans;
};
if (!ρσ_html_element_to_string.__argnames__) Object.defineProperties(ρσ_html_element_to_string, {
    __argnames__ : {value: ["elem"]},
    __module__ : {value: "__main__"}
});

function ρσ_repr(x) {
    var ans, name, mapped;
    if (x === null) {
        return "None";
    }
    if (x === undefined) {
        return "undefined";
    }
    ans = x;
    if (typeof x.__repr__ === "function") {
        ans = x.__repr__();
    } else if (x === true || x === false) {
        ans = (x) ? "True" : "False";
    } else if (Array.isArray(x)) {
        ans = ρσ_repr_js_builtin(x, true);
    } else if (typeof x === "function") {
        ans = x.toString();
    } else if (typeof x === "object" && !x.toString) {
        ans = ρσ_repr_js_builtin(x);
    } else {
        name = Object.prototype.toString.call(x).slice(8, -1);
        if (ρσ_not_equals(("Int8Array Uint8Array Uint8ClampedArray Int16Array" + " Uint16Array Int32Array Uint32Array" + " Float32Array Float64Array").indexOf(name), -1)) {
            mapped = x.map((function() {
                var ρσ_anonfunc = function (i) {
                    return str.format("0x{:02x}", i);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["i"]},
                    __module__ : {value: "__main__"}
                });
                return ρσ_anonfunc;
            })());
            return name + "([" + mapped.join(", ") + "])";
        }
        if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
            ans = ρσ_html_element_to_string(x);
        } else {
            ans = (typeof x.toString === "function") ? x.toString() : x;
        }
        if (ans === "[object Object]") {
            return ρσ_repr_js_builtin(x);
        }
        try {
            ans = JSON.stringify(x);
        } catch (ρσ_Exception) {
            ρσ_last_exception = ρσ_Exception;
            {
            } 
        }
    }
    return ans + "";
};
if (!ρσ_repr.__argnames__) Object.defineProperties(ρσ_repr, {
    __argnames__ : {value: ["x"]},
    __module__ : {value: "__main__"}
});

function ρσ_str(x) {
    var ans, name, mapped;
    if (x === null) {
        return "None";
    }
    if (x === undefined) {
        return "undefined";
    }
    ans = x;
    if (typeof x.__str__ === "function") {
        ans = x.__str__();
    } else if (typeof x.__repr__ === "function") {
        ans = x.__repr__();
    } else if (x === true || x === false) {
        ans = (x) ? "True" : "False";
    } else if (Array.isArray(x)) {
        ans = ρσ_repr_js_builtin(x, true);
    } else if (typeof x.toString === "function") {
        name = Object.prototype.toString.call(x).slice(8, -1);
        if (ρσ_not_equals(("Int8Array Uint8Array Uint8ClampedArray Int16Array" + " Uint16Array Int32Array Uint32Array" + " Float32Array Float64Array").indexOf(name), -1)) {
            mapped = x.map((function() {
                var ρσ_anonfunc = function (i) {
                    return str.format("0x{:02x}", i);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["i"]},
                    __module__ : {value: "__main__"}
                });
                return ρσ_anonfunc;
            })());
            return name + "([" + mapped.join(", ") + "])";
        }
        if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
            ans = ρσ_html_element_to_string(x);
        } else {
            ans = x.toString();
        }
        if (ans === "[object Object]") {
            ans = ρσ_repr_js_builtin(x);
        }
    } else if (typeof x === "object" && !x.toString) {
        ans = ρσ_repr_js_builtin(x);
    }
    return ans + "";
};
if (!ρσ_str.__argnames__) Object.defineProperties(ρσ_str, {
    __argnames__ : {value: ["x"]},
    __module__ : {value: "__main__"}
});

define_str_func = (function() {
    var ρσ_anonfunc = function (name, func) {
        var f;
        (ρσ_expr_temp = ρσ_str.prototype)[(typeof name === "number" && name < 0) ? ρσ_expr_temp.length + name : name] = func;
        ρσ_str[(typeof name === "number" && name < 0) ? ρσ_str.length + name : name] = f = func.call.bind(func);
        if (func.__argnames__) {
            Object.defineProperty(f, "__argnames__", (function(){
                var ρσ_d = {};
                ρσ_d["value"] = ['string'].concat(func.__argnames__);
                return ρσ_d;
            }).call(this));
        }
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["name", "func"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_orig_split = String.prototype.split.call.bind(String.prototype.split);
ρσ_orig_replace = String.prototype.replace.call.bind(String.prototype.replace);
define_str_func("format", (function() {
    var ρσ_anonfunc = function () {
        var template, args, kwargs, explicit, implicit, idx, split, ans, pos, in_brace, markup, ch;
        template = this;
        if (template === undefined) {
            throw new TypeError("Template is required");
        }
        args = Array.from(arguments);
        kwargs = {};
        if (args[args.length-1] && args[args.length-1][ρσ_kwargs_symbol] !== undefined) {
            kwargs = args[args.length-1];
            args = args.slice(0, -1);
        }
        explicit = implicit = false;
        idx = 0;
        split = ρσ_orig_split;
        if (ρσ_str.format._template_resolve_pat === undefined) {
            ρσ_str.format._template_resolve_pat = /[.\[]/;
        }
        function resolve(arg, object) {
            var ρσ_unpack, first, key, rest, ans;
            if (!arg) {
                return object;
            }
            ρσ_unpack = [arg[0], arg.slice(1)];
            first = ρσ_unpack[0];
            arg = ρσ_unpack[1];
            key = split(arg, ρσ_str.format._template_resolve_pat, 1)[0];
            rest = arg.slice(key.length);
            ans = (first === "[") ? object[ρσ_bound_index(key.slice(0, -1), object)] : getattr(object, key);
            if (ans === undefined) {
                throw new KeyError((first === "[") ? key.slice(0, -1) : key);
            }
            return resolve(rest, ans);
        };
        if (!resolve.__argnames__) Object.defineProperties(resolve, {
            __argnames__ : {value: ["arg", "object"]},
            __module__ : {value: "__main__"}
        });

        function resolve_format_spec(format_spec) {
            var pat;
            if (ρσ_str.format._template_resolve_fs_pat === undefined) {
                ρσ_str.format._template_resolve_fs_pat = /[{]([a-zA-Z0-9_]+)[}]/g;
            }
            pat = ρσ_str.format._template_resolve_fs_pat;
            return format_spec.replace(pat, (function() {
                var ρσ_anonfunc = function (match, key) {
                    if (!Object.prototype.hasOwnProperty.call(kwargs, key)) {
                        return "";
                    }
                    return "" + kwargs[(typeof key === "number" && key < 0) ? kwargs.length + key : key];
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["match", "key"]},
                    __module__ : {value: "__main__"}
                });
                return ρσ_anonfunc;
            })());
        };
        if (!resolve_format_spec.__argnames__) Object.defineProperties(resolve_format_spec, {
            __argnames__ : {value: ["format_spec"]},
            __module__ : {value: "__main__"}
        });

        function set_comma(ans, comma) {
            var sep;
            if (comma !== ",") {
                sep = 1234;
                sep = sep.toLocaleString(undefined, {useGrouping: true})[1];
                ans = str.replace(ans, sep, comma);
            }
            return ans;
        };
        if (!set_comma.__argnames__) Object.defineProperties(set_comma, {
            __argnames__ : {value: ["ans", "comma"]},
            __module__ : {value: "__main__"}
        });

        function safe_comma(value, comma) {
            try {
                return set_comma(value.toLocaleString(undefined, {useGrouping: true}), comma);
            } catch (ρσ_Exception) {
                ρσ_last_exception = ρσ_Exception;
                {
                    return value.toString(10);
                } 
            }
        };
        if (!safe_comma.__argnames__) Object.defineProperties(safe_comma, {
            __argnames__ : {value: ["value", "comma"]},
            __module__ : {value: "__main__"}
        });

        function safe_fixed(value, precision, comma) {
            var ufmt;
            if (!comma) {
                return value.toFixed(precision);
            }
            try {
                ufmt = (function(){
                    var ρσ_d = {};
                    ρσ_d["useGrouping"] = true;
                    ρσ_d["minimumFractionDigits"] = precision;
                    ρσ_d["maximumFractionDigits"] = precision;
                    return ρσ_d;
                }).call(this);
                return set_comma(value.toLocaleString(undefined, ufmt), comma);
            } catch (ρσ_Exception) {
                ρσ_last_exception = ρσ_Exception;
                {
                    return value.toFixed(precision);
                } 
            }
        };
        if (!safe_fixed.__argnames__) Object.defineProperties(safe_fixed, {
            __argnames__ : {value: ["value", "precision", "comma"]},
            __module__ : {value: "__main__"}
        });

        function apply_formatting(value, format_spec) {
            var m, ρσ_unpack, fill, align, sign, fhash, zeropad, width, comma, precision, ftype, is_numeric, is_int, lftype, code, prec, exp, nval, is_positive, left, right;
            if (format_spec.indexOf("{") !== -1) {
                format_spec = resolve_format_spec(format_spec);
            }
            if (ρσ_str.format._template_format_pat === undefined) {
                ρσ_str.format._template_format_pat = /([^{}](?=[<>=^]))?([<>=^])?([-+\x20])?(\#)?(0)?(\d+)?([,_])?(?:\.(\d+))?([bcdeEfFgGnosxX%])?/;
            }
            try {
                m = format_spec.match(ρσ_str.format._template_format_pat);
                ρσ_unpack = [m[1], m[2], m[3], m[4], m[5]];
                fill = ρσ_unpack[0];
                align = ρσ_unpack[1];
                sign = ρσ_unpack[2];
                fhash = ρσ_unpack[3];
                zeropad = ρσ_unpack[4];
                ρσ_unpack = [m[6], m[7], m[8], m[9]];
                width = ρσ_unpack[0];
                comma = ρσ_unpack[1];
                precision = ρσ_unpack[2];
                ftype = ρσ_unpack[3];
            } catch (ρσ_Exception) {
                ρσ_last_exception = ρσ_Exception;
                if (ρσ_Exception instanceof TypeError) {
                    return value;
                } else {
                    throw ρσ_Exception;
                }
            }
            if (zeropad) {
                fill = fill || "0";
                align = align || "=";
            } else {
                fill = fill || " ";
                align = align || ">";
            }
            is_numeric = Number(value) === value;
            is_int = is_numeric && value % 1 === 0;
            precision = parseInt(precision, 10);
            lftype = (ftype || "").toLowerCase();
            if (ftype === "n") {
                is_numeric = true;
                if (is_int) {
                    if (comma) {
                        throw new ValueError("Cannot specify ',' with 'n'");
                    }
                    value = parseInt(value, 10).toLocaleString();
                } else {
                    value = parseFloat(value).toLocaleString();
                }
            } else if (['b', 'c', 'd', 'o', 'x'].indexOf(lftype) !== -1) {
                value = parseInt(value, 10);
                is_numeric = true;
                if (!isNaN(value)) {
                    if (ftype === "b") {
                        value = (value >>> 0).toString(2);
                        if (fhash) {
                            value = "0b" + value;
                        }
                    } else if (ftype === "c") {
                        if (value > 65535) {
                            code = value - 65536;
                            value = String.fromCharCode(55296 + (code >> 10), 56320 + (code & 1023));
                        } else {
                            value = String.fromCharCode(value);
                        }
                    } else if (ftype === "d") {
                        if (comma) {
                            value = safe_comma(value, comma);
                        } else {
                            value = value.toString(10);
                        }
                    } else if (ftype === "o") {
                        value = value.toString(8);
                        if (fhash) {
                            value = "0o" + value;
                        }
                    } else if (lftype === "x") {
                        value = value.toString(16);
                        value = (ftype === "x") ? value.toLowerCase() : value.toUpperCase();
                        if (fhash) {
                            value = "0x" + value;
                        }
                    }
                }
            } else if (['e','f','g','%'].indexOf(lftype) !== -1) {
                is_numeric = true;
                value = parseFloat(value);
                prec = (isNaN(precision)) ? 6 : precision;
                if (lftype === "e") {
                    value = value.toExponential(prec);
                    value = (ftype === "E") ? value.toUpperCase() : value.toLowerCase();
                } else if (lftype === "f") {
                    value = safe_fixed(value, prec, comma);
                    value = (ftype === "F") ? value.toUpperCase() : value.toLowerCase();
                } else if (lftype === "%") {
                    value *= 100;
                    value = safe_fixed(value, prec, comma) + "%";
                } else if (lftype === "g") {
                    prec = max(1, prec);
                    exp = parseInt(split(value.toExponential(prec - 1).toLowerCase(), "e")[1], 10);
                    if (-4 <= exp && exp < prec) {
                        value = safe_fixed(value, prec - 1 - exp, comma);
                    } else {
                        value = value.toExponential(prec - 1);
                    }
                    value = value.replace(/0+$/g, "");
                    if (value[value.length-1] === decimal_sep) {
                        value = value.slice(0, -1);
                    }
                    if (ftype === "G") {
                        value = value.toUpperCase();
                    }
                }
            } else {
                if (comma) {
                    value = parseInt(value, 10);
                    if (isNaN(value)) {
                        throw new ValueError("Must use numbers with , or _");
                    }
                    value = safe_comma(value, comma);
                }
                value += "";
                if (!isNaN(precision)) {
                    value = value.slice(0, precision);
                }
            }
            value += "";
            if (is_numeric && sign) {
                nval = Number(value);
                is_positive = !isNaN(nval) && nval >= 0;
                if (is_positive && (sign === " " || sign === "+")) {
                    value = sign + value;
                }
            }
            function repeat(char, num) {
                return (new Array(num+1)).join(char);
            };
            if (!repeat.__argnames__) Object.defineProperties(repeat, {
                __argnames__ : {value: ["char", "num"]},
                __module__ : {value: "__main__"}
            });

            if (is_numeric && width && width[0] === "0") {
                width = width.slice(1);
                ρσ_unpack = ["0", "="];
                fill = ρσ_unpack[0];
                align = ρσ_unpack[1];
            }
            width = parseInt(width || "-1", 10);
            if (isNaN(width)) {
                throw new ValueError("Invalid width specification: " + width);
            }
            if (fill && value.length < width) {
                if (align === "<") {
                    value = value + repeat(fill, width - value.length);
                } else if (align === ">") {
                    value = repeat(fill, width - value.length) + value;
                } else if (align === "^") {
                    left = Math.floor((width - value.length) / 2);
                    right = width - left - value.length;
                    value = repeat(fill, left) + value + repeat(fill, right);
                } else if (align === "=") {
                    if (ρσ_in(value[0], "+- ")) {
                        value = value[0] + repeat(fill, width - value.length) + value.slice(1);
                    } else {
                        value = repeat(fill, width - value.length) + value;
                    }
                } else {
                    throw new ValueError("Unrecognized alignment: " + align);
                }
            }
            return value;
        };
        if (!apply_formatting.__argnames__) Object.defineProperties(apply_formatting, {
            __argnames__ : {value: ["value", "format_spec"]},
            __module__ : {value: "__main__"}
        });

        function parse_markup(markup) {
            var key, transformer, format_spec, pos, state, ch;
            key = transformer = format_spec = "";
            pos = 0;
            state = 0;
            while (pos < markup.length) {
                ch = markup[(typeof pos === "number" && pos < 0) ? markup.length + pos : pos];
                if (state === 0) {
                    if (ch === "!") {
                        state = 1;
                    } else if (ch === ":") {
                        state = 2;
                    } else {
                        key += ch;
                    }
                } else if (state === 1) {
                    if (ch === ":") {
                        state = 2;
                    } else {
                        transformer += ch;
                    }
                } else {
                    format_spec += ch;
                }
                pos += 1;
            }
            return [key, transformer, format_spec];
        };
        if (!parse_markup.__argnames__) Object.defineProperties(parse_markup, {
            __argnames__ : {value: ["markup"]},
            __module__ : {value: "__main__"}
        });

        function render_markup(markup) {
            var ρσ_unpack, key, transformer, format_spec, ends_with_equal, lkey, nvalue, object, ans;
            ρσ_unpack = parse_markup(markup);
ρσ_unpack = ρσ_unpack_asarray(3, ρσ_unpack);
            key = ρσ_unpack[0];
            transformer = ρσ_unpack[1];
            format_spec = ρσ_unpack[2];
            if (transformer && ['a', 'r', 's'].indexOf(transformer) === -1) {
                throw new ValueError("Unknown conversion specifier: " + transformer);
            }
            ends_with_equal = key.endsWith("=");
            if (ends_with_equal) {
                key = key.slice(0, -1);
            }
            lkey = key.length && split(key, /[.\[]/, 1)[0];
            if (lkey) {
                explicit = true;
                if (implicit) {
                    throw new ValueError("cannot switch from automatic field numbering" + " to manual field specification");
                }
                nvalue = parseInt(lkey);
                object = (isNaN(nvalue)) ? kwargs[(typeof lkey === "number" && lkey < 0) ? kwargs.length + lkey : lkey] : args[(typeof nvalue === "number" && nvalue < 0) ? args.length + nvalue : nvalue];
                if (object === undefined) {
                    if (isNaN(nvalue)) {
                        throw new KeyError(lkey);
                    }
                    throw new IndexError(lkey);
                }
                object = resolve(key.slice(lkey.length), object);
            } else {
                implicit = true;
                if (explicit) {
                    throw new ValueError("cannot switch from manual field specification" + " to automatic field numbering");
                }
                if (idx >= args.length) {
                    throw new IndexError("Not enough arguments to match template: " + template);
                }
                object = args[(typeof idx === "number" && idx < 0) ? args.length + idx : idx];
                idx += 1;
            }
            if (typeof object === "function") {
                object = object();
            }
            ans = "" + object;
            if (format_spec) {
                ans = apply_formatting(ans, format_spec);
            }
            if (ends_with_equal) {
                ans = "" + ρσ_str.format("{}", key) + "=" + ρσ_str.format("{}", ans) + "";
            }
            return ans;
        };
        if (!render_markup.__argnames__) Object.defineProperties(render_markup, {
            __argnames__ : {value: ["markup"]},
            __module__ : {value: "__main__"}
        });

        ans = "";
        pos = 0;
        in_brace = 0;
        markup = "";
        while (pos < template.length) {
            ch = template[(typeof pos === "number" && pos < 0) ? template.length + pos : pos];
            if (in_brace) {
                if (ch === "{") {
                    in_brace += 1;
                    markup += "{";
                } else if (ch === "}") {
                    in_brace -= 1;
                    if (in_brace > 0) {
                        markup += "}";
                    } else {
                        ans += render_markup(markup);
                    }
                } else {
                    markup += ch;
                }
            } else {
                if (ch === "{") {
                    if (template[ρσ_bound_index(pos + 1, template)] === "{") {
                        pos += 1;
                        ans += "{";
                    } else {
                        in_brace = 1;
                        markup = "";
                    }
                } else {
                    ans += ch;
                    if (ch === "}" && template[ρσ_bound_index(pos + 1, template)] === "}") {
                        pos += 1;
                    }
                }
            }
            pos += 1;
        }
        if (in_brace) {
            throw new ValueError("expected '}' before end of string");
        }
        return ans;
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("capitalize", (function() {
    var ρσ_anonfunc = function () {
        var string;
        string = this;
        if (string) {
            string = string[0].toUpperCase() + string.slice(1).toLowerCase();
        }
        return string;
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("center", (function() {
    var ρσ_anonfunc = function (width, fill) {
        var left, right, left_pad, right_pad;
        left = Math.floor((width - this.length) / 2);
        right = width - left - this.length;
        fill = fill || " ";
        left_pad = new Array(left+1).join(fill);
        right_pad = new Array(right+1).join(fill);
        return left_pad + this + right_pad;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["width", "fill"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("count", (function() {
    var ρσ_anonfunc = function (needle, start, end) {
        var string, ρσ_unpack, pos, step, ans;
        string = this;
        start = start || 0;
        end = end || string.length;
        if (start < 0 || end < 0) {
            string = string.slice(start, end);
            ρσ_unpack = [0, string.length];
            start = ρσ_unpack[0];
            end = ρσ_unpack[1];
        }
        pos = start;
        step = needle.length;
        if (!step) {
            return 0;
        }
        ans = 0;
        while (pos !== -1) {
            pos = string.indexOf(needle, pos);
            if (pos !== -1) {
                ans += 1;
                pos += step;
            }
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["needle", "start", "end"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("endswith", (function() {
    var ρσ_anonfunc = function (suffixes, start, end) {
        var string, q;
        string = this;
        start = start || 0;
        if (typeof suffixes === "string") {
            suffixes = [suffixes];
        }
        if (end !== undefined) {
            string = string.slice(0, end);
        }
        for (var i = 0; i < suffixes.length; i++) {
            q = suffixes[(typeof i === "number" && i < 0) ? suffixes.length + i : i];
            if (string.indexOf(q, Math.max(start, string.length - q.length)) !== -1) {
                return true;
            }
        }
        return false;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["suffixes", "start", "end"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("startswith", (function() {
    var ρσ_anonfunc = function (prefixes, start, end) {
        var prefix;
        start = start || 0;
        if (typeof prefixes === "string") {
            prefixes = [prefixes];
        }
        for (var i = 0; i < prefixes.length; i++) {
            prefix = prefixes[(typeof i === "number" && i < 0) ? prefixes.length + i : i];
            end = (end === undefined) ? this.length : end;
            if (end - start >= prefix.length && prefix === this.slice(start, start + prefix.length)) {
                return true;
            }
        }
        return false;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["prefixes", "start", "end"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("find", (function() {
    var ρσ_anonfunc = function (needle, start, end) {
        var ans;
        while (start < 0) {
            start += this.length;
        }
        ans = this.indexOf(needle, start);
        if (end !== undefined && ans !== -1) {
            while (end < 0) {
                end += this.length;
            }
            if (ans >= end - needle.length) {
                return -1;
            }
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["needle", "start", "end"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("rfind", (function() {
    var ρσ_anonfunc = function (needle, start, end) {
        var ans;
        while (end < 0) {
            end += this.length;
        }
        ans = this.lastIndexOf(needle, end - 1);
        if (start !== undefined && ans !== -1) {
            while (start < 0) {
                start += this.length;
            }
            if (ans < start) {
                return -1;
            }
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["needle", "start", "end"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("index", (function() {
    var ρσ_anonfunc = function (needle, start, end) {
        var ans;
        ans = ρσ_str.prototype.find.apply(this, arguments);
        if (ans === -1) {
            throw new ValueError("substring not found");
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["needle", "start", "end"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("rindex", (function() {
    var ρσ_anonfunc = function (needle, start, end) {
        var ans;
        ans = ρσ_str.prototype.rfind.apply(this, arguments);
        if (ans === -1) {
            throw new ValueError("substring not found");
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["needle", "start", "end"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("islower", (function() {
    var ρσ_anonfunc = function () {
        return this.length > 0 && this.toLowerCase() === this.toString();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("isupper", (function() {
    var ρσ_anonfunc = function () {
        return this.length > 0 && this.toUpperCase() === this.toString();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("isspace", (function() {
    var ρσ_anonfunc = function () {
        return this.length > 0 && /^\s+$/.test(this);
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("join", (function() {
    var ρσ_anonfunc = function (iterable) {
        var ans, r;
        if (Array.isArray(iterable)) {
            return iterable.join(this);
        }
        ans = "";
        r = iterable.next();
        while (!r.done) {
            if (ans) {
                ans += this;
            }
            ans += r.value;
            r = iterable.next();
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["iterable"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("ljust", (function() {
    var ρσ_anonfunc = function (width, fill) {
        var string;
        string = this;
        if (width > string.length) {
            fill = fill || " ";
            string += new Array(width - string.length + 1).join(fill);
        }
        return string;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["width", "fill"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("rjust", (function() {
    var ρσ_anonfunc = function (width, fill) {
        var string;
        string = this;
        if (width > string.length) {
            fill = fill || " ";
            string = new Array(width - string.length + 1).join(fill) + string;
        }
        return string;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["width", "fill"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("lower", (function() {
    var ρσ_anonfunc = function () {
        return this.toLowerCase();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("upper", (function() {
    var ρσ_anonfunc = function () {
        return this.toUpperCase();
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("lstrip", (function() {
    var ρσ_anonfunc = function (chars) {
        var string, pos;
        string = this;
        pos = 0;
        chars = chars || ρσ_str.whitespace;
        while (chars.indexOf(string[(typeof pos === "number" && pos < 0) ? string.length + pos : pos]) !== -1) {
            pos += 1;
        }
        if (pos) {
            string = string.slice(pos);
        }
        return string;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["chars"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("rstrip", (function() {
    var ρσ_anonfunc = function (chars) {
        var string, pos;
        string = this;
        pos = string.length - 1;
        chars = chars || ρσ_str.whitespace;
        while (chars.indexOf(string[(typeof pos === "number" && pos < 0) ? string.length + pos : pos]) !== -1) {
            pos -= 1;
        }
        if (pos < string.length - 1) {
            string = string.slice(0, pos + 1);
        }
        return string;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["chars"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("strip", (function() {
    var ρσ_anonfunc = function (chars) {
        return ρσ_str.prototype.lstrip.call(ρσ_str.prototype.rstrip.call(this, chars), chars);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["chars"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("partition", (function() {
    var ρσ_anonfunc = function (sep) {
        var idx;
        idx = this.indexOf(sep);
        if (idx === -1) {
            return [this, "", ""];
        }
        return [this.slice(0, idx), sep, this.slice(idx + sep.length)];
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["sep"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("rpartition", (function() {
    var ρσ_anonfunc = function (sep) {
        var idx;
        idx = this.lastIndexOf(sep);
        if (idx === -1) {
            return ["", "", this];
        }
        return [this.slice(0, idx), sep, this.slice(idx + sep.length)];
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["sep"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("replace", (function() {
    var ρσ_anonfunc = function (old, repl, count) {
        var string, pos, idx;
        string = this;
        if (count === 1) {
            return ρσ_orig_replace(string, old, repl);
        }
        if (count < 1) {
            return string;
        }
        count = count || Number.MAX_VALUE;
        pos = 0;
        while (count > 0) {
            count -= 1;
            idx = string.indexOf(old, pos);
            if (idx === -1) {
                break;
            }
            pos = idx + repl.length;
            string = string.slice(0, idx) + repl + string.slice(idx + old.length);
        }
        return string;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["old", "repl", "count"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("split", (function() {
    var ρσ_anonfunc = function (sep, maxsplit) {
        var split, ans, extra, parts;
        if (maxsplit === 0) {
            return [ this ];
        }
        split = ρσ_orig_split;
        if (sep === undefined || sep === null) {
            if (maxsplit > 0) {
                ans = split(this, /(\s+)/);
                extra = "";
                parts = [];
                for (var i = 0; i < ans.length; i++) {
                    if (parts.length >= maxsplit + 1) {
                        extra += ans[(typeof i === "number" && i < 0) ? ans.length + i : i];
                    } else if (i % 2 === 0) {
                        parts.push(ans[(typeof i === "number" && i < 0) ? ans.length + i : i]);
                    }
                }
                parts[parts.length-1] += extra;
                ans = parts;
            } else {
                ans = split(this, /\s+/);
            }
        } else {
            if (sep === "") {
                throw new ValueError("empty separator");
            }
            ans = split(this, sep);
            if (maxsplit > 0 && ans.length > maxsplit) {
                extra = ans.slice(maxsplit).join(sep);
                ans = ans.slice(0, maxsplit);
                ans.push(extra);
            }
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["sep", "maxsplit"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("rsplit", (function() {
    var ρσ_anonfunc = function (sep, maxsplit) {
        var split, ans, is_space, pos, current, spc, ch, end, idx;
        if (!maxsplit) {
            return ρσ_str.prototype.split.call(this, sep);
        }
        split = ρσ_orig_split;
        if (sep === undefined || sep === null) {
            if (maxsplit > 0) {
                ans = [];
                is_space = /\s/;
                pos = this.length - 1;
                current = "";
                while (pos > -1 && maxsplit > 0) {
                    spc = false;
                    ch = (ρσ_expr_temp = this)[(typeof pos === "number" && pos < 0) ? ρσ_expr_temp.length + pos : pos];
                    while (pos > -1 && is_space.test(ch)) {
                        spc = true;
                        ch = this[--pos];
                    }
                    if (spc) {
                        if (current) {
                            ans.push(current);
                            maxsplit -= 1;
                        }
                        current = ch;
                    } else {
                        current += ch;
                    }
                    pos -= 1;
                }
                ans.push(this.slice(0, pos + 1) + current);
                ans.reverse();
            } else {
                ans = split(this, /\s+/);
            }
        } else {
            if (sep === "") {
                throw new ValueError("empty separator");
            }
            ans = [];
            pos = end = this.length;
            while (pos > -1 && maxsplit > 0) {
                maxsplit -= 1;
                idx = this.lastIndexOf(sep, pos);
                if (idx === -1) {
                    break;
                }
                ans.push(this.slice(idx + sep.length, end));
                pos = idx - 1;
                end = idx;
            }
            ans.push(this.slice(0, end));
            ans.reverse();
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["sep", "maxsplit"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("splitlines", (function() {
    var ρσ_anonfunc = function (keepends) {
        var split, parts, ans;
        split = ρσ_orig_split;
        if (keepends) {
            parts = split(this, /((?:\r?\n)|\r)/);
            ans = [];
            for (var i = 0; i < parts.length; i++) {
                if (i % 2 === 0) {
                    ans.push(parts[(typeof i === "number" && i < 0) ? parts.length + i : i]);
                } else {
                    ans[ans.length-1] += parts[(typeof i === "number" && i < 0) ? parts.length + i : i];
                }
            }
        } else {
            ans = split(this, /(?:\r?\n)|\r/);
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["keepends"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("swapcase", (function() {
    var ρσ_anonfunc = function () {
        var ans, a, b;
        ans = new Array(this.length);
        for (var i = 0; i < ans.length; i++) {
            a = (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
            b = a.toLowerCase();
            if (a === b) {
                b = a.toUpperCase();
            }
            ans[(typeof i === "number" && i < 0) ? ans.length + i : i] = b;
        }
        return ans.join("");
    };
    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
define_str_func("zfill", (function() {
    var ρσ_anonfunc = function (width) {
        var string;
        string = this;
        if (width > string.length) {
            string = new Array(width - string.length + 1).join("0") + string;
        }
        return string;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["width"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})());
ρσ_str.uchrs = (function() {
    var ρσ_anonfunc = function (string, with_positions) {
        return (function(){
            var ρσ_d = {};
            ρσ_d["_string"] = string;
            ρσ_d["_pos"] = 0;
            ρσ_d[ρσ_iterator_symbol] = (function() {
                var ρσ_anonfunc = function () {
                    return this;
                };
                if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                    __module__ : {value: "__main__"}
                });
                return ρσ_anonfunc;
            })();
            ρσ_d["next"] = (function() {
                var ρσ_anonfunc = function () {
                    var length, pos, value, ans, extra;
                    length = this._string.length;
                    if (this._pos >= length) {
                        return (function(){
                            var ρσ_d = {};
                            ρσ_d["done"] = true;
                            return ρσ_d;
                        }).call(this);
                    }
                    pos = this._pos;
                    value = this._string.charCodeAt(this._pos++);
                    ans = "\ufffd";
                    if (55296 <= value && value <= 56319) {
                        if (this._pos < length) {
                            extra = this._string.charCodeAt(this._pos++);
                            if ((extra & 56320) === 56320) {
                                ans = String.fromCharCode(value, extra);
                            }
                        }
                    } else if ((value & 56320) !== 56320) {
                        ans = String.fromCharCode(value);
                    }
                    if (with_positions) {
                        return (function(){
                            var ρσ_d = {};
                            ρσ_d["done"] = false;
                            ρσ_d["value"] = [ pos, ans ];
                            return ρσ_d;
                        }).call(this);
                    } else {
                        return (function(){
                            var ρσ_d = {};
                            ρσ_d["done"] = false;
                            ρσ_d["value"] = ans;
                            return ρσ_d;
                        }).call(this);
                    }
                };
                if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                    __module__ : {value: "__main__"}
                });
                return ρσ_anonfunc;
            })();
            return ρσ_d;
        }).call(this);
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["string", "with_positions"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_str.uslice = (function() {
    var ρσ_anonfunc = function (string, start, end) {
        var items, iterator, r;
        items = [];
        iterator = ρσ_str.uchrs(string);
        r = iterator.next();
        while (!r.done) {
            items.push(r.value);
            r = iterator.next();
        }
        return items.slice(start || 0, (end === undefined) ? items.length : end).join("");
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["string", "start", "end"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_str.ulen = (function() {
    var ρσ_anonfunc = function (string) {
        var iterator, r, ans;
        iterator = ρσ_str.uchrs(string);
        r = iterator.next();
        ans = 0;
        while (!r.done) {
            r = iterator.next();
            ans += 1;
        }
        return ans;
    };
    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
        __argnames__ : {value: ["string"]},
        __module__ : {value: "__main__"}
    });
    return ρσ_anonfunc;
})();
ρσ_str.ascii_lowercase = "abcdefghijklmnopqrstuvwxyz";
ρσ_str.ascii_uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
ρσ_str.ascii_letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
ρσ_str.digits = "0123456789";
ρσ_str.punctuation = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
ρσ_str.printable = "0123456789abcdefghijklmnopqrstuvwxyz" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~ \t\n\r\u000b\f";
ρσ_str.whitespace = " \t\n\r\u000b\f";
define_str_func = undefined;
var str = ρσ_str, repr = ρσ_repr;;
    var ρσ_modules = {};
    ρσ_modules.aes = {};
    ρσ_modules.crypto = {};
    ρσ_modules.frames = {};
    ρσ_modules.communicate = {};
    ρσ_modules.utils = {};
    ρσ_modules.focus = {};
    ρσ_modules.elementmaker = {};
    ρσ_modules.humanize = {};
    ρσ_modules.downloads = {};
    ρσ_modules.links = {};
    ρσ_modules.follow_next = {};
    ρσ_modules.passwd = {};
    ρσ_modules.hints = {};
    ρσ_modules.edit = {};

    (function(){
        var __name__ = "aes";
        var string_to_bytes, bytes_to_string, number_of_rounds, rcon, S, Si, T1, T2, T3, T4, T5, T6, T7, T8, U1, U2, U3, U4, random_bytes, noderandom;
        function string_to_bytes_encoder(string) {
            return new TextEncoder("utf-8").encode(string + "");
        };
        if (!string_to_bytes_encoder.__argnames__) Object.defineProperties(string_to_bytes_encoder, {
            __argnames__ : {value: ["string"]},
            __module__ : {value: "aes"}
        });

        function string_to_bytes_slow(string) {
            var escstr, binstr, ua, ρσ_unpack, i, ch;
            escstr = encodeURIComponent(string);
            binstr = escstr.replace(/%([0-9A-F]{2})/g, (function() {
                var ρσ_anonfunc = function (match, p1) {
                    return String.fromCharCode("0x" + p1);
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["match", "p1"]},
                    __module__ : {value: "aes"}
                });
                return ρσ_anonfunc;
            })());
            ua = new Uint8Array(binstr.length);
            var ρσ_Iter0 = enumerate(binstr);
            ρσ_Iter0 = ((typeof ρσ_Iter0[Symbol.iterator] === "function") ? (ρσ_Iter0 instanceof Map ? ρσ_Iter0.keys() : ρσ_Iter0) : Object.keys(ρσ_Iter0));
            for (var ρσ_Index0 of ρσ_Iter0) {
                ρσ_unpack = ρσ_Index0;
                i = ρσ_unpack[0];
                ch = ρσ_unpack[1];
                ua[(typeof i === "number" && i < 0) ? ua.length + i : i] = ch.charCodeAt(0);
            }
            return ua;
        };
        if (!string_to_bytes_slow.__argnames__) Object.defineProperties(string_to_bytes_slow, {
            __argnames__ : {value: ["string"]},
            __module__ : {value: "aes"}
        });

        function as_hex() {
            var array = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var sep = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? as_hex.__defaults__.sep : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "sep")){
                sep = ρσ_kwargs_obj.sep;
            }
            var num, fmt;
            num = array.BYTES_PER_ELEMENT || 1;
            fmt = "{:0" + num * 2 + "x}";
            return (function() {
                var ρσ_Iter = array, ρσ_Result = [], x;
                ρσ_Iter = ((typeof ρσ_Iter[Symbol.iterator] === "function") ? (ρσ_Iter instanceof Map ? ρσ_Iter.keys() : ρσ_Iter) : Object.keys(ρσ_Iter));
                for (var ρσ_Index of ρσ_Iter) {
                    x = ρσ_Index;
                    ρσ_Result.push(str.format(fmt, x));
                }
                ρσ_Result = ρσ_list_constructor(ρσ_Result);
                return ρσ_Result;
            })().join(sep);
        };
        if (!as_hex.__defaults__) Object.defineProperties(as_hex, {
            __defaults__ : {value: {sep:""}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["array", "sep"]},
            __module__ : {value: "aes"}
        });

        function bytes_to_string_decoder(bytes, offset) {
            offset = offset || 0;
            if (offset) {
                bytes = bytes.subarray(offset);
            }
            return new TextDecoder("utf-8").decode(bytes);
        };
        if (!bytes_to_string_decoder.__argnames__) Object.defineProperties(bytes_to_string_decoder, {
            __argnames__ : {value: ["bytes", "offset"]},
            __module__ : {value: "aes"}
        });

        function bytes_to_string_slow(bytes, offset) {
            var ans, i, c;
            ans = [];
            i = offset || 0;
            while (i < bytes.length) {
                c = bytes[(typeof i === "number" && i < 0) ? bytes.length + i : i];
                if (c < 128) {
                    ans.push(String.fromCharCode(c));
                    i += 1;
                } else if (191 < c && c < 224) {
                    ans.push(String.fromCharCode((c & 31) << 6 | bytes[ρσ_bound_index(i + 1, bytes)] & 63));
                    i += 2;
                } else {
                    ans.push(String.fromCharCode((c & 15) << 12 | (bytes[ρσ_bound_index(i + 1, bytes)] & 63) << 6 | bytes[ρσ_bound_index(i + 2, bytes)] & 63));
                    i += 3;
                }
            }
            return ans.join("");
        };
        if (!bytes_to_string_slow.__argnames__) Object.defineProperties(bytes_to_string_slow, {
            __argnames__ : {value: ["bytes", "offset"]},
            __module__ : {value: "aes"}
        });

        string_to_bytes = (typeof TextEncoder === "function") ? string_to_bytes_encoder : string_to_bytes_slow;
        bytes_to_string = (typeof TextDecoder === "function") ? bytes_to_string_decoder : bytes_to_string_slow;
        function increment_counter(c) {
            for (var i = 15; i >= 12; i--) {
                if (c[(typeof i === "number" && i < 0) ? c.length + i : i] === 255) {
                    c[(typeof i === "number" && i < 0) ? c.length + i : i] = 0;
                } else {
                    c[(typeof i === "number" && i < 0) ? c.length + i : i] += 1;
                    break;
                }
            }
        };
        if (!increment_counter.__argnames__) Object.defineProperties(increment_counter, {
            __argnames__ : {value: ["c"]},
            __module__ : {value: "aes"}
        });

        function convert_to_int32(bytes, output, offset, length) {
            offset = offset || 0;
            length = length || bytes.length;
            for (var i = offset, j = 0; i < offset + length; i += 4, j++) {
                output[(typeof j === "number" && j < 0) ? output.length + j : j] = bytes[(typeof i === "number" && i < 0) ? bytes.length + i : i] << 24 | bytes[ρσ_bound_index(i + 1, bytes)] << 16 | bytes[ρσ_bound_index(i + 2, bytes)] << 8 | bytes[ρσ_bound_index(i + 3, bytes)];
            }
        };
        if (!convert_to_int32.__argnames__) Object.defineProperties(convert_to_int32, {
            __argnames__ : {value: ["bytes", "output", "offset", "length"]},
            __module__ : {value: "aes"}
        });

        function convert_to_int32_pad(bytes) {
            var extra, t, ans;
            extra = bytes.length % 4;
            if (extra) {
                t = new Uint8Array(bytes.length + 4 - extra);
                t.set(bytes);
                bytes = t;
            }
            ans = new Uint32Array(bytes.length / 4);
            convert_to_int32(bytes, ans);
            return ans;
        };
        if (!convert_to_int32_pad.__argnames__) Object.defineProperties(convert_to_int32_pad, {
            __argnames__ : {value: ["bytes"]},
            __module__ : {value: "aes"}
        });

        if (!Uint8Array.prototype.fill) {
            Uint32Array.prototype.fill = (function() {
                var ρσ_anonfunc = function (val, start, end) {
                    start = start || 0;
                    if (end === undefined) {
                        end = this.length;
                    }
                    if (start < 0) {
                        start += this.length;
                    }
                    if (end < 0) {
                        end += this.length;
                    }
                    for (var i = start; i < end; i++) {
                        (ρσ_expr_temp = this)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i] = val;
                    }
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["val", "start", "end"]},
                    __module__ : {value: "aes"}
                });
                return ρσ_anonfunc;
            })();
            Uint8Array.prototype.fill = Uint32Array.prototype.fill;
        }
        function from_64_to_32(num) {
            var ans;
            ans = new Uint32Array(2);
            ans[0] = num / 4294967296 | 0;
            ans[1] = num & 4294967295;
            return ans;
        };
        if (!from_64_to_32.__argnames__) Object.defineProperties(from_64_to_32, {
            __argnames__ : {value: ["num"]},
            __module__ : {value: "aes"}
        });

        number_of_rounds = (function(){
            var ρσ_d = {};
            ρσ_d[16] = 10;
            ρσ_d[24] = 12;
            ρσ_d[32] = 14;
            return ρσ_d;
        }).call(this);
        rcon = new Uint32Array([ 1, 2, 4, 8, 16, 32, 64, 128, 27, 54, 108, 216, 171, 77, 154, 47, 94, 188, 99, 198, 151, 53, 106, 212, 179, 125, 250, 239, 197, 145 ]);
        S = new Uint32Array([ 99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22 ]);
        Si = new Uint32Array([ 82, 9, 106, 213, 48, 54, 165, 56, 191, 64, 163, 158, 129, 243, 215, 251, 124, 227, 57, 130, 155, 47, 255, 135, 52, 142, 67, 68, 196, 222, 233, 203, 84, 123, 148, 50, 166, 194, 35, 61, 238, 76, 149, 11, 66, 250, 195, 78, 8, 46, 161, 102, 40, 217, 36, 178, 118, 91, 162, 73, 109, 139, 209, 37, 114, 248, 246, 100, 134, 104, 152, 22, 212, 164, 92, 204, 93, 101, 182, 146, 108, 112, 72, 80, 253, 237, 185, 218, 94, 21, 70, 87, 167, 141, 157, 132, 144, 216, 171, 0, 140, 188, 211, 10, 247, 228, 88, 5, 184, 179, 69, 6, 208, 44, 30, 143, 202, 63, 15, 2, 193, 175, 189, 3, 1, 19, 138, 107, 58, 145, 17, 65, 79, 103, 220, 234, 151, 242, 207, 206, 240, 180, 230, 115, 150, 172, 116, 34, 231, 173, 53, 133, 226, 249, 55, 232, 28, 117, 223, 110, 71, 241, 26, 113, 29, 41, 197, 137, 111, 183, 98, 14, 170, 24, 190, 27, 252, 86, 62, 75, 198, 210, 121, 32, 154, 219, 192, 254, 120, 205, 90, 244, 31, 221, 168, 51, 136, 7, 199, 49, 177, 18, 16, 89, 39, 128, 236, 95, 96, 81, 127, 169, 25, 181, 74, 13, 45, 229, 122, 159, 147, 201, 156, 239, 160, 224, 59, 77, 174, 42, 245, 176, 200, 235, 187, 60, 131, 83, 153, 97, 23, 43, 4, 126, 186, 119, 214, 38, 225, 105, 20, 99, 85, 33, 12, 125 ]);
        T1 = new Uint32Array([ 3328402341, 4168907908, 4000806809, 4135287693, 4294111757, 3597364157, 3731845041, 2445657428, 1613770832, 33620227, 3462883241, 1445669757, 3892248089, 3050821474, 1303096294, 3967186586, 2412431941, 528646813, 2311702848, 4202528135, 4026202645, 2992200171, 2387036105, 4226871307, 1101901292, 3017069671, 1604494077, 1169141738, 597466303, 1403299063, 3832705686, 2613100635, 1974974402, 3791519004, 1033081774, 1277568618, 1815492186, 2118074177, 4126668546, 2211236943, 1748251740, 1369810420, 3521504564, 4193382664, 3799085459, 2883115123, 1647391059, 706024767, 134480908, 2512897874, 1176707941, 2646852446, 806885416, 932615841, 168101135, 798661301, 235341577, 605164086, 461406363, 3756188221, 3454790438, 1311188841, 2142417613, 3933566367, 302582043, 495158174, 1479289972, 874125870, 907746093, 3698224818, 3025820398, 1537253627, 2756858614, 1983593293, 3084310113, 2108928974, 1378429307, 3722699582, 1580150641, 327451799, 2790478837, 3117535592, 0, 3253595436, 1075847264, 3825007647, 2041688520, 3059440621, 3563743934, 2378943302, 1740553945, 1916352843, 2487896798, 2555137236, 2958579944, 2244988746, 3151024235, 3320835882, 1336584933, 3992714006, 2252555205, 2588757463, 1714631509, 293963156, 2319795663, 3925473552, 67240454, 4269768577, 2689618160, 2017213508, 631218106, 1269344483, 2723238387, 1571005438, 2151694528, 93294474, 1066570413, 563977660, 1882732616, 4059428100, 1673313503, 2008463041, 2950355573, 1109467491, 537923632, 3858759450, 4260623118, 3218264685, 2177748300, 403442708, 638784309, 3287084079, 3193921505, 899127202, 2286175436, 773265209, 2479146071, 1437050866, 4236148354, 2050833735, 3362022572, 3126681063, 840505643, 3866325909, 3227541664, 427917720, 2655997905, 2749160575, 1143087718, 1412049534, 999329963, 193497219, 2353415882, 3354324521, 1807268051, 672404540, 2816401017, 3160301282, 369822493, 2916866934, 3688947771, 1681011286, 1949973070, 336202270, 2454276571, 201721354, 1210328172, 3093060836, 2680341085, 3184776046, 1135389935, 3294782118, 965841320, 831886756, 3554993207, 4068047243, 3588745010, 2345191491, 1849112409, 3664604599, 26054028, 2983581028, 2622377682, 1235855840, 3630984372, 2891339514, 4092916743, 3488279077, 3395642799, 4101667470, 1202630377, 268961816, 1874508501, 4034427016, 1243948399, 1546530418, 941366308, 1470539505, 1941222599, 2546386513, 3421038627, 2715671932, 3899946140, 1042226977, 2521517021, 1639824860, 227249030, 260737669, 3765465232, 2084453954, 1907733956, 3429263018, 2420656344, 100860677, 4160157185, 470683154, 3261161891, 1781871967, 2924959737, 1773779408, 394692241, 2579611992, 974986535, 664706745, 3655459128, 3958962195, 731420851, 571543859, 3530123707, 2849626480, 126783113, 865375399, 765172662, 1008606754, 361203602, 3387549984, 2278477385, 2857719295, 1344809080, 2782912378, 59542671, 1503764984, 160008576, 437062935, 1707065306, 3622233649, 2218934982, 3496503480, 2185314755, 697932208, 1512910199, 504303377, 2075177163, 2824099068, 1841019862, 739644986 ]);
        T2 = new Uint32Array([ 2781242211, 2230877308, 2582542199, 2381740923, 234877682, 3184946027, 2984144751, 1418839493, 1348481072, 50462977, 2848876391, 2102799147, 434634494, 1656084439, 3863849899, 2599188086, 1167051466, 2636087938, 1082771913, 2281340285, 368048890, 3954334041, 3381544775, 201060592, 3963727277, 1739838676, 4250903202, 3930435503, 3206782108, 4149453988, 2531553906, 1536934080, 3262494647, 484572669, 2923271059, 1783375398, 1517041206, 1098792767, 49674231, 1334037708, 1550332980, 4098991525, 886171109, 150598129, 2481090929, 1940642008, 1398944049, 1059722517, 201851908, 1385547719, 1699095331, 1587397571, 674240536, 2704774806, 252314885, 3039795866, 151914247, 908333586, 2602270848, 1038082786, 651029483, 1766729511, 3447698098, 2682942837, 454166793, 2652734339, 1951935532, 775166490, 758520603, 3000790638, 4004797018, 4217086112, 4137964114, 1299594043, 1639438038, 3464344499, 2068982057, 1054729187, 1901997871, 2534638724, 4121318227, 1757008337, 0, 750906861, 1614815264, 535035132, 3363418545, 3988151131, 3201591914, 1183697867, 3647454910, 1265776953, 3734260298, 3566750796, 3903871064, 1250283471, 1807470800, 717615087, 3847203498, 384695291, 3313910595, 3617213773, 1432761139, 2484176261, 3481945413, 283769337, 100925954, 2180939647, 4037038160, 1148730428, 3123027871, 3813386408, 4087501137, 4267549603, 3229630528, 2315620239, 2906624658, 3156319645, 1215313976, 82966005, 3747855548, 3245848246, 1974459098, 1665278241, 807407632, 451280895, 251524083, 1841287890, 1283575245, 337120268, 891687699, 801369324, 3787349855, 2721421207, 3431482436, 959321879, 1469301956, 4065699751, 2197585534, 1199193405, 2898814052, 3887750493, 724703513, 2514908019, 2696962144, 2551808385, 3516813135, 2141445340, 1715741218, 2119445034, 2872807568, 2198571144, 3398190662, 700968686, 3547052216, 1009259540, 2041044702, 3803995742, 487983883, 1991105499, 1004265696, 1449407026, 1316239930, 504629770, 3683797321, 168560134, 1816667172, 3837287516, 1570751170, 1857934291, 4014189740, 2797888098, 2822345105, 2754712981, 936633572, 2347923833, 852879335, 1133234376, 1500395319, 3084545389, 2348912013, 1689376213, 3533459022, 3762923945, 3034082412, 4205598294, 133428468, 634383082, 2949277029, 2398386810, 3913789102, 403703816, 3580869306, 2297460856, 1867130149, 1918643758, 607656988, 4049053350, 3346248884, 1368901318, 600565992, 2090982877, 2632479860, 557719327, 3717614411, 3697393085, 2249034635, 2232388234, 2430627952, 1115438654, 3295786421, 2865522278, 3633334344, 84280067, 33027830, 303828494, 2747425121, 1600795957, 4188952407, 3496589753, 2434238086, 1486471617, 658119965, 3106381470, 953803233, 334231800, 3005978776, 857870609, 3151128937, 1890179545, 2298973838, 2805175444, 3056442267, 574365214, 2450884487, 550103529, 1233637070, 4289353045, 2018519080, 2057691103, 2399374476, 4166623649, 2148108681, 387583245, 3664101311, 836232934, 3330556482, 3100665960, 3280093505, 2955516313, 2002398509, 287182607, 3413881008, 4238890068, 3597515707, 975967766 ]);
        T3 = new Uint32Array([ 1671808611, 2089089148, 2006576759, 2072901243, 4061003762, 1807603307, 1873927791, 3310653893, 810573872, 16974337, 1739181671, 729634347, 4263110654, 3613570519, 2883997099, 1989864566, 3393556426, 2191335298, 3376449993, 2106063485, 4195741690, 1508618841, 1204391495, 4027317232, 2917941677, 3563566036, 2734514082, 2951366063, 2629772188, 2767672228, 1922491506, 3227229120, 3082974647, 4246528509, 2477669779, 644500518, 911895606, 1061256767, 4144166391, 3427763148, 878471220, 2784252325, 3845444069, 4043897329, 1905517169, 3631459288, 827548209, 356461077, 67897348, 3344078279, 593839651, 3277757891, 405286936, 2527147926, 84871685, 2595565466, 118033927, 305538066, 2157648768, 3795705826, 3945188843, 661212711, 2999812018, 1973414517, 152769033, 2208177539, 745822252, 439235610, 455947803, 1857215598, 1525593178, 2700827552, 1391895634, 994932283, 3596728278, 3016654259, 695947817, 3812548067, 795958831, 2224493444, 1408607827, 3513301457, 0, 3979133421, 543178784, 4229948412, 2982705585, 1542305371, 1790891114, 3410398667, 3201918910, 961245753, 1256100938, 1289001036, 1491644504, 3477767631, 3496721360, 4012557807, 2867154858, 4212583931, 1137018435, 1305975373, 861234739, 2241073541, 1171229253, 4178635257, 33948674, 2139225727, 1357946960, 1011120188, 2679776671, 2833468328, 1374921297, 2751356323, 1086357568, 2408187279, 2460827538, 2646352285, 944271416, 4110742005, 3168756668, 3066132406, 3665145818, 560153121, 271589392, 4279952895, 4077846003, 3530407890, 3444343245, 202643468, 322250259, 3962553324, 1608629855, 2543990167, 1154254916, 389623319, 3294073796, 2817676711, 2122513534, 1028094525, 1689045092, 1575467613, 422261273, 1939203699, 1621147744, 2174228865, 1339137615, 3699352540, 577127458, 712922154, 2427141008, 2290289544, 1187679302, 3995715566, 3100863416, 339486740, 3732514782, 1591917662, 186455563, 3681988059, 3762019296, 844522546, 978220090, 169743370, 1239126601, 101321734, 611076132, 1558493276, 3260915650, 3547250131, 2901361580, 1655096418, 2443721105, 2510565781, 3828863972, 2039214713, 3878868455, 3359869896, 928607799, 1840765549, 2374762893, 3580146133, 1322425422, 2850048425, 1823791212, 1459268694, 4094161908, 3928346602, 1706019429, 2056189050, 2934523822, 135794696, 3134549946, 2022240376, 628050469, 779246638, 472135708, 2800834470, 3032970164, 3327236038, 3894660072, 3715932637, 1956440180, 522272287, 1272813131, 3185336765, 2340818315, 2323976074, 1888542832, 1044544574, 3049550261, 1722469478, 1222152264, 50660867, 4127324150, 236067854, 1638122081, 895445557, 1475980887, 3117443513, 2257655686, 3243809217, 489110045, 2662934430, 3778599393, 4162055160, 2561878936, 288563729, 1773916777, 3648039385, 2391345038, 2493985684, 2612407707, 505560094, 2274497927, 3911240169, 3460925390, 1442818645, 678973480, 3749357023, 2358182796, 2717407649, 2306869641, 219617805, 3218761151, 3862026214, 1120306242, 1756942440, 1103331905, 2578459033, 762796589, 252780047, 2966125488, 1425844308, 3151392187, 372911126 ]);
        T4 = new Uint32Array([ 1667474886, 2088535288, 2004326894, 2071694838, 4075949567, 1802223062, 1869591006, 3318043793, 808472672, 16843522, 1734846926, 724270422, 4278065639, 3621216949, 2880169549, 1987484396, 3402253711, 2189597983, 3385409673, 2105378810, 4210693615, 1499065266, 1195886990, 4042263547, 2913856577, 3570689971, 2728590687, 2947541573, 2627518243, 2762274643, 1920112356, 3233831835, 3082273397, 4261223649, 2475929149, 640051788, 909531756, 1061110142, 4160160501, 3435941763, 875846760, 2779116625, 3857003729, 4059105529, 1903268834, 3638064043, 825316194, 353713962, 67374088, 3351728789, 589522246, 3284360861, 404236336, 2526454071, 84217610, 2593830191, 117901582, 303183396, 2155911963, 3806477791, 3958056653, 656894286, 2998062463, 1970642922, 151591698, 2206440989, 741110872, 437923380, 454765878, 1852748508, 1515908788, 2694904667, 1381168804, 993742198, 3604373943, 3014905469, 690584402, 3823320797, 791638366, 2223281939, 1398011302, 3520161977, 0, 3991743681, 538992704, 4244381667, 2981218425, 1532751286, 1785380564, 3419096717, 3200178535, 960056178, 1246420628, 1280103576, 1482221744, 3486468741, 3503319995, 4025428677, 2863326543, 4227536621, 1128514950, 1296947098, 859002214, 2240123921, 1162203018, 4193849577, 33687044, 2139062782, 1347481760, 1010582648, 2678045221, 2829640523, 1364325282, 2745433693, 1077985408, 2408548869, 2459086143, 2644360225, 943212656, 4126475505, 3166494563, 3065430391, 3671750063, 555836226, 269496352, 4294908645, 4092792573, 3537006015, 3452783745, 202118168, 320025894, 3974901699, 1600119230, 2543297077, 1145359496, 387397934, 3301201811, 2812801621, 2122220284, 1027426170, 1684319432, 1566435258, 421079858, 1936954854, 1616945344, 2172753945, 1330631070, 3705438115, 572679748, 707427924, 2425400123, 2290647819, 1179044492, 4008585671, 3099120491, 336870440, 3739122087, 1583276732, 185277718, 3688593069, 3772791771, 842159716, 976899700, 168435220, 1229577106, 101059084, 606366792, 1549591736, 3267517855, 3553849021, 2897014595, 1650632388, 2442242105, 2509612081, 3840161747, 2038008818, 3890688725, 3368567691, 926374254, 1835907034, 2374863873, 3587531953, 1313788572, 2846482505, 1819063512, 1448540844, 4109633523, 3941213647, 1701162954, 2054852340, 2930698567, 134748176, 3132806511, 2021165296, 623210314, 774795868, 471606328, 2795958615, 3031746419, 3334885783, 3907527627, 3722280097, 1953799400, 522133822, 1263263126, 3183336545, 2341176845, 2324333839, 1886425312, 1044267644, 3048588401, 1718004428, 1212733584, 50529542, 4143317495, 235803164, 1633788866, 892690282, 1465383342, 3115962473, 2256965911, 3250673817, 488449850, 2661202215, 3789633753, 4177007595, 2560144171, 286339874, 1768537042, 3654906025, 2391705863, 2492770099, 2610673197, 505291324, 2273808917, 3924369609, 3469625735, 1431699370, 673740880, 3755965093, 2358021891, 2711746649, 2307489801, 218961690, 3217021541, 3873845719, 1111672452, 1751693520, 1094828930, 2576986153, 757954394, 252645662, 2964376443, 1414855848, 3149649517, 370555436 ]);
        T5 = new Uint32Array([ 1374988112, 2118214995, 437757123, 975658646, 1001089995, 530400753, 2902087851, 1273168787, 540080725, 2910219766, 2295101073, 4110568485, 1340463100, 3307916247, 641025152, 3043140495, 3736164937, 632953703, 1172967064, 1576976609, 3274667266, 2169303058, 2370213795, 1809054150, 59727847, 361929877, 3211623147, 2505202138, 3569255213, 1484005843, 1239443753, 2395588676, 1975683434, 4102977912, 2572697195, 666464733, 3202437046, 4035489047, 3374361702, 2110667444, 1675577880, 3843699074, 2538681184, 1649639237, 2976151520, 3144396420, 4269907996, 4178062228, 1883793496, 2403728665, 2497604743, 1383856311, 2876494627, 1917518562, 3810496343, 1716890410, 3001755655, 800440835, 2261089178, 3543599269, 807962610, 599762354, 33778362, 3977675356, 2328828971, 2809771154, 4077384432, 1315562145, 1708848333, 101039829, 3509871135, 3299278474, 875451293, 2733856160, 92987698, 2767645557, 193195065, 1080094634, 1584504582, 3178106961, 1042385657, 2531067453, 3711829422, 1306967366, 2438237621, 1908694277, 67556463, 1615861247, 429456164, 3602770327, 2302690252, 1742315127, 2968011453, 126454664, 3877198648, 2043211483, 2709260871, 2084704233, 4169408201, 0, 159417987, 841739592, 504459436, 1817866830, 4245618683, 260388950, 1034867998, 908933415, 168810852, 1750902305, 2606453969, 607530554, 202008497, 2472011535, 3035535058, 463180190, 2160117071, 1641816226, 1517767529, 470948374, 3801332234, 3231722213, 1008918595, 303765277, 235474187, 4069246893, 766945465, 337553864, 1475418501, 2943682380, 4003061179, 2743034109, 4144047775, 1551037884, 1147550661, 1543208500, 2336434550, 3408119516, 3069049960, 3102011747, 3610369226, 1113818384, 328671808, 2227573024, 2236228733, 3535486456, 2935566865, 3341394285, 496906059, 3702665459, 226906860, 2009195472, 733156972, 2842737049, 294930682, 1206477858, 2835123396, 2700099354, 1451044056, 573804783, 2269728455, 3644379585, 2362090238, 2564033334, 2801107407, 2776292904, 3669462566, 1068351396, 742039012, 1350078989, 1784663195, 1417561698, 4136440770, 2430122216, 775550814, 2193862645, 2673705150, 1775276924, 1876241833, 3475313331, 3366754619, 270040487, 3902563182, 3678124923, 3441850377, 1851332852, 3969562369, 2203032232, 3868552805, 2868897406, 566021896, 4011190502, 3135740889, 1248802510, 3936291284, 699432150, 832877231, 708780849, 3332740144, 899835584, 1951317047, 4236429990, 3767586992, 866637845, 4043610186, 1106041591, 2144161806, 395441711, 1984812685, 1139781709, 3433712980, 3835036895, 2664543715, 1282050075, 3240894392, 1181045119, 2640243204, 25965917, 4203181171, 4211818798, 3009879386, 2463879762, 3910161971, 1842759443, 2597806476, 933301370, 1509430414, 3943906441, 3467192302, 3076639029, 3776767469, 2051518780, 2631065433, 1441952575, 404016761, 1942435775, 1408749034, 1610459739, 3745345300, 2017778566, 3400528769, 3110650942, 941896748, 3265478751, 371049330, 3168937228, 675039627, 4279080257, 967311729, 135050206, 3635733660, 1683407248, 2076935265, 3576870512, 1215061108, 3501741890 ]);
        T6 = new Uint32Array([ 1347548327, 1400783205, 3273267108, 2520393566, 3409685355, 4045380933, 2880240216, 2471224067, 1428173050, 4138563181, 2441661558, 636813900, 4233094615, 3620022987, 2149987652, 2411029155, 1239331162, 1730525723, 2554718734, 3781033664, 46346101, 310463728, 2743944855, 3328955385, 3875770207, 2501218972, 3955191162, 3667219033, 768917123, 3545789473, 692707433, 1150208456, 1786102409, 2029293177, 1805211710, 3710368113, 3065962831, 401639597, 1724457132, 3028143674, 409198410, 2196052529, 1620529459, 1164071807, 3769721975, 2226875310, 486441376, 2499348523, 1483753576, 428819965, 2274680428, 3075636216, 598438867, 3799141122, 1474502543, 711349675, 129166120, 53458370, 2592523643, 2782082824, 4063242375, 2988687269, 3120694122, 1559041666, 730517276, 2460449204, 4042459122, 2706270690, 3446004468, 3573941694, 533804130, 2328143614, 2637442643, 2695033685, 839224033, 1973745387, 957055980, 2856345839, 106852767, 1371368976, 4181598602, 1033297158, 2933734917, 1179510461, 3046200461, 91341917, 1862534868, 4284502037, 605657339, 2547432937, 3431546947, 2003294622, 3182487618, 2282195339, 954669403, 3682191598, 1201765386, 3917234703, 3388507166, 0, 2198438022, 1211247597, 2887651696, 1315723890, 4227665663, 1443857720, 507358933, 657861945, 1678381017, 560487590, 3516619604, 975451694, 2970356327, 261314535, 3535072918, 2652609425, 1333838021, 2724322336, 1767536459, 370938394, 182621114, 3854606378, 1128014560, 487725847, 185469197, 2918353863, 3106780840, 3356761769, 2237133081, 1286567175, 3152976349, 4255350624, 2683765030, 3160175349, 3309594171, 878443390, 1988838185, 3704300486, 1756818940, 1673061617, 3403100636, 272786309, 1075025698, 545572369, 2105887268, 4174560061, 296679730, 1841768865, 1260232239, 4091327024, 3960309330, 3497509347, 1814803222, 2578018489, 4195456072, 575138148, 3299409036, 446754879, 3629546796, 4011996048, 3347532110, 3252238545, 4270639778, 915985419, 3483825537, 681933534, 651868046, 2755636671, 3828103837, 223377554, 2607439820, 1649704518, 3270937875, 3901806776, 1580087799, 4118987695, 3198115200, 2087309459, 2842678573, 3016697106, 1003007129, 2802849917, 1860738147, 2077965243, 164439672, 4100872472, 32283319, 2827177882, 1709610350, 2125135846, 136428751, 3874428392, 3652904859, 3460984630, 3572145929, 3593056380, 2939266226, 824852259, 818324884, 3224740454, 930369212, 2801566410, 2967507152, 355706840, 1257309336, 4148292826, 243256656, 790073846, 2373340630, 1296297904, 1422699085, 3756299780, 3818836405, 457992840, 3099667487, 2135319889, 77422314, 1560382517, 1945798516, 788204353, 1521706781, 1385356242, 870912086, 325965383, 2358957921, 2050466060, 2388260884, 2313884476, 4006521127, 901210569, 3990953189, 1014646705, 1503449823, 1062597235, 2031621326, 3212035895, 3931371469, 1533017514, 350174575, 2256028891, 2177544179, 1052338372, 741876788, 1606591296, 1914052035, 213705253, 2334669897, 1107234197, 1899603969, 3725069491, 2631447780, 2422494913, 1635502980, 1893020342, 1950903388, 1120974935 ]);
        T7 = new Uint32Array([ 2807058932, 1699970625, 2764249623, 1586903591, 1808481195, 1173430173, 1487645946, 59984867, 4199882800, 1844882806, 1989249228, 1277555970, 3623636965, 3419915562, 1149249077, 2744104290, 1514790577, 459744698, 244860394, 3235995134, 1963115311, 4027744588, 2544078150, 4190530515, 1608975247, 2627016082, 2062270317, 1507497298, 2200818878, 567498868, 1764313568, 3359936201, 2305455554, 2037970062, 1047239e3, 1910319033, 1337376481, 2904027272, 2892417312, 984907214, 1243112415, 830661914, 861968209, 2135253587, 2011214180, 2927934315, 2686254721, 731183368, 1750626376, 4246310725, 1820824798, 4172763771, 3542330227, 48394827, 2404901663, 2871682645, 671593195, 3254988725, 2073724613, 145085239, 2280796200, 2779915199, 1790575107, 2187128086, 472615631, 3029510009, 4075877127, 3802222185, 4107101658, 3201631749, 1646252340, 4270507174, 1402811438, 1436590835, 3778151818, 3950355702, 3963161475, 4020912224, 2667994737, 273792366, 2331590177, 104699613, 95345982, 3175501286, 2377486676, 1560637892, 3564045318, 369057872, 4213447064, 3919042237, 1137477952, 2658625497, 1119727848, 2340947849, 1530455833, 4007360968, 172466556, 266959938, 516552836, 0, 2256734592, 3980931627, 1890328081, 1917742170, 4294704398, 945164165, 3575528878, 958871085, 3647212047, 2787207260, 1423022939, 775562294, 1739656202, 3876557655, 2530391278, 2443058075, 3310321856, 547512796, 1265195639, 437656594, 3121275539, 719700128, 3762502690, 387781147, 218828297, 3350065803, 2830708150, 2848461854, 428169201, 122466165, 3720081049, 1627235199, 648017665, 4122762354, 1002783846, 2117360635, 695634755, 3336358691, 4234721005, 4049844452, 3704280881, 2232435299, 574624663, 287343814, 612205898, 1039717051, 840019705, 2708326185, 793451934, 821288114, 1391201670, 3822090177, 376187827, 3113855344, 1224348052, 1679968233, 2361698556, 1058709744, 752375421, 2431590963, 1321699145, 3519142200, 2734591178, 188127444, 2177869557, 3727205754, 2384911031, 3215212461, 2648976442, 2450346104, 3432737375, 1180849278, 331544205, 3102249176, 4150144569, 2952102595, 2159976285, 2474404304, 766078933, 313773861, 2570832044, 2108100632, 1668212892, 3145456443, 2013908262, 418672217, 3070356634, 2594734927, 1852171925, 3867060991, 3473416636, 3907448597, 2614737639, 919489135, 164948639, 2094410160, 2997825956, 590424639, 2486224549, 1723872674, 3157750862, 3399941250, 3501252752, 3625268135, 2555048196, 3673637356, 1343127501, 4130281361, 3599595085, 2957853679, 1297403050, 81781910, 3051593425, 2283490410, 532201772, 1367295589, 3926170974, 895287692, 1953757831, 1093597963, 492483431, 3528626907, 1446242576, 1192455638, 1636604631, 209336225, 344873464, 1015671571, 669961897, 3375740769, 3857572124, 2973530695, 3747192018, 1933530610, 3464042516, 935293895, 3454686199, 2858115069, 1863638845, 3683022916, 4085369519, 3292445032, 875313188, 1080017571, 3279033885, 621591778, 1233856572, 2504130317, 24197544, 3017672716, 3835484340, 3247465558, 2220981195, 3060847922, 1551124588, 1463996600 ]);
        T8 = new Uint32Array([ 4104605777, 1097159550, 396673818, 660510266, 2875968315, 2638606623, 4200115116, 3808662347, 821712160, 1986918061, 3430322568, 38544885, 3856137295, 718002117, 893681702, 1654886325, 2975484382, 3122358053, 3926825029, 4274053469, 796197571, 1290801793, 1184342925, 3556361835, 2405426947, 2459735317, 1836772287, 1381620373, 3196267988, 1948373848, 3764988233, 3385345166, 3263785589, 2390325492, 1480485785, 3111247143, 3780097726, 2293045232, 548169417, 3459953789, 3746175075, 439452389, 1362321559, 1400849762, 1685577905, 1806599355, 2174754046, 137073913, 1214797936, 1174215055, 3731654548, 2079897426, 1943217067, 1258480242, 529487843, 1437280870, 3945269170, 3049390895, 3313212038, 923313619, 679998e3, 3215307299, 57326082, 377642221, 3474729866, 2041877159, 133361907, 1776460110, 3673476453, 96392454, 878845905, 2801699524, 777231668, 4082475170, 2330014213, 4142626212, 2213296395, 1626319424, 1906247262, 1846563261, 562755902, 3708173718, 1040559837, 3871163981, 1418573201, 3294430577, 114585348, 1343618912, 2566595609, 3186202582, 1078185097, 3651041127, 3896688048, 2307622919, 425408743, 3371096953, 2081048481, 1108339068, 2216610296, 0, 2156299017, 736970802, 292596766, 1517440620, 251657213, 2235061775, 2933202493, 758720310, 265905162, 1554391400, 1532285339, 908999204, 174567692, 1474760595, 4002861748, 2610011675, 3234156416, 3693126241, 2001430874, 303699484, 2478443234, 2687165888, 585122620, 454499602, 151849742, 2345119218, 3064510765, 514443284, 4044981591, 1963412655, 2581445614, 2137062819, 19308535, 1928707164, 1715193156, 4219352155, 1126790795, 600235211, 3992742070, 3841024952, 836553431, 1669664834, 2535604243, 3323011204, 1243905413, 3141400786, 4180808110, 698445255, 2653899549, 2989552604, 2253581325, 3252932727, 3004591147, 1891211689, 2487810577, 3915653703, 4237083816, 4030667424, 2100090966, 865136418, 1229899655, 953270745, 3399679628, 3557504664, 4118925222, 2061379749, 3079546586, 2915017791, 983426092, 2022837584, 1607244650, 2118541908, 2366882550, 3635996816, 972512814, 3283088770, 1568718495, 3499326569, 3576539503, 621982671, 2895723464, 410887952, 2623762152, 1002142683, 645401037, 1494807662, 2595684844, 1335535747, 2507040230, 4293295786, 3167684641, 367585007, 3885750714, 1865862730, 2668221674, 2960971305, 2763173681, 1059270954, 2777952454, 2724642869, 1320957812, 2194319100, 2429595872, 2815956275, 77089521, 3973773121, 3444575871, 2448830231, 1305906550, 4021308739, 2857194700, 2516901860, 3518358430, 1787304780, 740276417, 1699839814, 1592394909, 2352307457, 2272556026, 188821243, 1729977011, 3687994002, 274084841, 3594982253, 3613494426, 2701949495, 4162096729, 322734571, 2837966542, 1640576439, 484830689, 1202797690, 3537852828, 4067639125, 349075736, 3342319475, 4157467219, 4255800159, 1030690015, 1155237496, 2951971274, 1757691577, 607398968, 2738905026, 499347990, 3794078908, 1011452712, 227885567, 2818666809, 213114376, 3034881240, 1455525988, 3414450555, 850817237, 1817998408, 3092726480 ]);
        U1 = new Uint32Array([ 0, 235474187, 470948374, 303765277, 941896748, 908933415, 607530554, 708780849, 1883793496, 2118214995, 1817866830, 1649639237, 1215061108, 1181045119, 1417561698, 1517767529, 3767586992, 4003061179, 4236429990, 4069246893, 3635733660, 3602770327, 3299278474, 3400528769, 2430122216, 2664543715, 2362090238, 2193862645, 2835123396, 2801107407, 3035535058, 3135740889, 3678124923, 3576870512, 3341394285, 3374361702, 3810496343, 3977675356, 4279080257, 4043610186, 2876494627, 2776292904, 3076639029, 3110650942, 2472011535, 2640243204, 2403728665, 2169303058, 1001089995, 899835584, 666464733, 699432150, 59727847, 226906860, 530400753, 294930682, 1273168787, 1172967064, 1475418501, 1509430414, 1942435775, 2110667444, 1876241833, 1641816226, 2910219766, 2743034109, 2976151520, 3211623147, 2505202138, 2606453969, 2302690252, 2269728455, 3711829422, 3543599269, 3240894392, 3475313331, 3843699074, 3943906441, 4178062228, 4144047775, 1306967366, 1139781709, 1374988112, 1610459739, 1975683434, 2076935265, 1775276924, 1742315127, 1034867998, 866637845, 566021896, 800440835, 92987698, 193195065, 429456164, 395441711, 1984812685, 2017778566, 1784663195, 1683407248, 1315562145, 1080094634, 1383856311, 1551037884, 101039829, 135050206, 437757123, 337553864, 1042385657, 807962610, 573804783, 742039012, 2531067453, 2564033334, 2328828971, 2227573024, 2935566865, 2700099354, 3001755655, 3168937228, 3868552805, 3902563182, 4203181171, 4102977912, 3736164937, 3501741890, 3265478751, 3433712980, 1106041591, 1340463100, 1576976609, 1408749034, 2043211483, 2009195472, 1708848333, 1809054150, 832877231, 1068351396, 766945465, 599762354, 159417987, 126454664, 361929877, 463180190, 2709260871, 2943682380, 3178106961, 3009879386, 2572697195, 2538681184, 2236228733, 2336434550, 3509871135, 3745345300, 3441850377, 3274667266, 3910161971, 3877198648, 4110568485, 4211818798, 2597806476, 2497604743, 2261089178, 2295101073, 2733856160, 2902087851, 3202437046, 2968011453, 3936291284, 3835036895, 4136440770, 4169408201, 3535486456, 3702665459, 3467192302, 3231722213, 2051518780, 1951317047, 1716890410, 1750902305, 1113818384, 1282050075, 1584504582, 1350078989, 168810852, 67556463, 371049330, 404016761, 841739592, 1008918595, 775550814, 540080725, 3969562369, 3801332234, 4035489047, 4269907996, 3569255213, 3669462566, 3366754619, 3332740144, 2631065433, 2463879762, 2160117071, 2395588676, 2767645557, 2868897406, 3102011747, 3069049960, 202008497, 33778362, 270040487, 504459436, 875451293, 975658646, 675039627, 641025152, 2084704233, 1917518562, 1615861247, 1851332852, 1147550661, 1248802510, 1484005843, 1451044056, 933301370, 967311729, 733156972, 632953703, 260388950, 25965917, 328671808, 496906059, 1206477858, 1239443753, 1543208500, 1441952575, 2144161806, 1908694277, 1675577880, 1842759443, 3610369226, 3644379585, 3408119516, 3307916247, 4011190502, 3776767469, 4077384432, 4245618683, 2809771154, 2842737049, 3144396420, 3043140495, 2673705150, 2438237621, 2203032232, 2370213795 ]);
        U2 = new Uint32Array([ 0, 185469197, 370938394, 487725847, 741876788, 657861945, 975451694, 824852259, 1483753576, 1400783205, 1315723890, 1164071807, 1950903388, 2135319889, 1649704518, 1767536459, 2967507152, 3152976349, 2801566410, 2918353863, 2631447780, 2547432937, 2328143614, 2177544179, 3901806776, 3818836405, 4270639778, 4118987695, 3299409036, 3483825537, 3535072918, 3652904859, 2077965243, 1893020342, 1841768865, 1724457132, 1474502543, 1559041666, 1107234197, 1257309336, 598438867, 681933534, 901210569, 1052338372, 261314535, 77422314, 428819965, 310463728, 3409685355, 3224740454, 3710368113, 3593056380, 3875770207, 3960309330, 4045380933, 4195456072, 2471224067, 2554718734, 2237133081, 2388260884, 3212035895, 3028143674, 2842678573, 2724322336, 4138563181, 4255350624, 3769721975, 3955191162, 3667219033, 3516619604, 3431546947, 3347532110, 2933734917, 2782082824, 3099667487, 3016697106, 2196052529, 2313884476, 2499348523, 2683765030, 1179510461, 1296297904, 1347548327, 1533017514, 1786102409, 1635502980, 2087309459, 2003294622, 507358933, 355706840, 136428751, 53458370, 839224033, 957055980, 605657339, 790073846, 2373340630, 2256028891, 2607439820, 2422494913, 2706270690, 2856345839, 3075636216, 3160175349, 3573941694, 3725069491, 3273267108, 3356761769, 4181598602, 4063242375, 4011996048, 3828103837, 1033297158, 915985419, 730517276, 545572369, 296679730, 446754879, 129166120, 213705253, 1709610350, 1860738147, 1945798516, 2029293177, 1239331162, 1120974935, 1606591296, 1422699085, 4148292826, 4233094615, 3781033664, 3931371469, 3682191598, 3497509347, 3446004468, 3328955385, 2939266226, 2755636671, 3106780840, 2988687269, 2198438022, 2282195339, 2501218972, 2652609425, 1201765386, 1286567175, 1371368976, 1521706781, 1805211710, 1620529459, 2105887268, 1988838185, 533804130, 350174575, 164439672, 46346101, 870912086, 954669403, 636813900, 788204353, 2358957921, 2274680428, 2592523643, 2441661558, 2695033685, 2880240216, 3065962831, 3182487618, 3572145929, 3756299780, 3270937875, 3388507166, 4174560061, 4091327024, 4006521127, 3854606378, 1014646705, 930369212, 711349675, 560487590, 272786309, 457992840, 106852767, 223377554, 1678381017, 1862534868, 1914052035, 2031621326, 1211247597, 1128014560, 1580087799, 1428173050, 32283319, 182621114, 401639597, 486441376, 768917123, 651868046, 1003007129, 818324884, 1503449823, 1385356242, 1333838021, 1150208456, 1973745387, 2125135846, 1673061617, 1756818940, 2970356327, 3120694122, 2802849917, 2887651696, 2637442643, 2520393566, 2334669897, 2149987652, 3917234703, 3799141122, 4284502037, 4100872472, 3309594171, 3460984630, 3545789473, 3629546796, 2050466060, 1899603969, 1814803222, 1730525723, 1443857720, 1560382517, 1075025698, 1260232239, 575138148, 692707433, 878443390, 1062597235, 243256656, 91341917, 409198410, 325965383, 3403100636, 3252238545, 3704300486, 3620022987, 3874428392, 3990953189, 4042459122, 4227665663, 2460449204, 2578018489, 2226875310, 2411029155, 3198115200, 3046200461, 2827177882, 2743944855 ]);
        U3 = new Uint32Array([ 0, 218828297, 437656594, 387781147, 875313188, 958871085, 775562294, 590424639, 1750626376, 1699970625, 1917742170, 2135253587, 1551124588, 1367295589, 1180849278, 1265195639, 3501252752, 3720081049, 3399941250, 3350065803, 3835484340, 3919042237, 4270507174, 4085369519, 3102249176, 3051593425, 2734591178, 2952102595, 2361698556, 2177869557, 2530391278, 2614737639, 3145456443, 3060847922, 2708326185, 2892417312, 2404901663, 2187128086, 2504130317, 2555048196, 3542330227, 3727205754, 3375740769, 3292445032, 3876557655, 3926170974, 4246310725, 4027744588, 1808481195, 1723872674, 1910319033, 2094410160, 1608975247, 1391201670, 1173430173, 1224348052, 59984867, 244860394, 428169201, 344873464, 935293895, 984907214, 766078933, 547512796, 1844882806, 1627235199, 2011214180, 2062270317, 1507497298, 1423022939, 1137477952, 1321699145, 95345982, 145085239, 532201772, 313773861, 830661914, 1015671571, 731183368, 648017665, 3175501286, 2957853679, 2807058932, 2858115069, 2305455554, 2220981195, 2474404304, 2658625497, 3575528878, 3625268135, 3473416636, 3254988725, 3778151818, 3963161475, 4213447064, 4130281361, 3599595085, 3683022916, 3432737375, 3247465558, 3802222185, 4020912224, 4172763771, 4122762354, 3201631749, 3017672716, 2764249623, 2848461854, 2331590177, 2280796200, 2431590963, 2648976442, 104699613, 188127444, 472615631, 287343814, 840019705, 1058709744, 671593195, 621591778, 1852171925, 1668212892, 1953757831, 2037970062, 1514790577, 1463996600, 1080017571, 1297403050, 3673637356, 3623636965, 3235995134, 3454686199, 4007360968, 3822090177, 4107101658, 4190530515, 2997825956, 3215212461, 2830708150, 2779915199, 2256734592, 2340947849, 2627016082, 2443058075, 172466556, 122466165, 273792366, 492483431, 1047239e3, 861968209, 612205898, 695634755, 1646252340, 1863638845, 2013908262, 1963115311, 1446242576, 1530455833, 1277555970, 1093597963, 1636604631, 1820824798, 2073724613, 1989249228, 1436590835, 1487645946, 1337376481, 1119727848, 164948639, 81781910, 331544205, 516552836, 1039717051, 821288114, 669961897, 719700128, 2973530695, 3157750862, 2871682645, 2787207260, 2232435299, 2283490410, 2667994737, 2450346104, 3647212047, 3564045318, 3279033885, 3464042516, 3980931627, 3762502690, 4150144569, 4199882800, 3070356634, 3121275539, 2904027272, 2686254721, 2200818878, 2384911031, 2570832044, 2486224549, 3747192018, 3528626907, 3310321856, 3359936201, 3950355702, 3867060991, 4049844452, 4234721005, 1739656202, 1790575107, 2108100632, 1890328081, 1402811438, 1586903591, 1233856572, 1149249077, 266959938, 48394827, 369057872, 418672217, 1002783846, 919489135, 567498868, 752375421, 209336225, 24197544, 376187827, 459744698, 945164165, 895287692, 574624663, 793451934, 1679968233, 1764313568, 2117360635, 1933530610, 1343127501, 1560637892, 1243112415, 1192455638, 3704280881, 3519142200, 3336358691, 3419915562, 3907448597, 3857572124, 4075877127, 4294704398, 3029510009, 3113855344, 2927934315, 2744104290, 2159976285, 2377486676, 2594734927, 2544078150 ]);
        U4 = new Uint32Array([ 0, 151849742, 303699484, 454499602, 607398968, 758720310, 908999204, 1059270954, 1214797936, 1097159550, 1517440620, 1400849762, 1817998408, 1699839814, 2118541908, 2001430874, 2429595872, 2581445614, 2194319100, 2345119218, 3034881240, 3186202582, 2801699524, 2951971274, 3635996816, 3518358430, 3399679628, 3283088770, 4237083816, 4118925222, 4002861748, 3885750714, 1002142683, 850817237, 698445255, 548169417, 529487843, 377642221, 227885567, 77089521, 1943217067, 2061379749, 1640576439, 1757691577, 1474760595, 1592394909, 1174215055, 1290801793, 2875968315, 2724642869, 3111247143, 2960971305, 2405426947, 2253581325, 2638606623, 2487810577, 3808662347, 3926825029, 4044981591, 4162096729, 3342319475, 3459953789, 3576539503, 3693126241, 1986918061, 2137062819, 1685577905, 1836772287, 1381620373, 1532285339, 1078185097, 1229899655, 1040559837, 923313619, 740276417, 621982671, 439452389, 322734571, 137073913, 19308535, 3871163981, 4021308739, 4104605777, 4255800159, 3263785589, 3414450555, 3499326569, 3651041127, 2933202493, 2815956275, 3167684641, 3049390895, 2330014213, 2213296395, 2566595609, 2448830231, 1305906550, 1155237496, 1607244650, 1455525988, 1776460110, 1626319424, 2079897426, 1928707164, 96392454, 213114376, 396673818, 514443284, 562755902, 679998e3, 865136418, 983426092, 3708173718, 3557504664, 3474729866, 3323011204, 4180808110, 4030667424, 3945269170, 3794078908, 2507040230, 2623762152, 2272556026, 2390325492, 2975484382, 3092726480, 2738905026, 2857194700, 3973773121, 3856137295, 4274053469, 4157467219, 3371096953, 3252932727, 3673476453, 3556361835, 2763173681, 2915017791, 3064510765, 3215307299, 2156299017, 2307622919, 2459735317, 2610011675, 2081048481, 1963412655, 1846563261, 1729977011, 1480485785, 1362321559, 1243905413, 1126790795, 878845905, 1030690015, 645401037, 796197571, 274084841, 425408743, 38544885, 188821243, 3613494426, 3731654548, 3313212038, 3430322568, 4082475170, 4200115116, 3780097726, 3896688048, 2668221674, 2516901860, 2366882550, 2216610296, 3141400786, 2989552604, 2837966542, 2687165888, 1202797690, 1320957812, 1437280870, 1554391400, 1669664834, 1787304780, 1906247262, 2022837584, 265905162, 114585348, 499347990, 349075736, 736970802, 585122620, 972512814, 821712160, 2595684844, 2478443234, 2293045232, 2174754046, 3196267988, 3079546586, 2895723464, 2777952454, 3537852828, 3687994002, 3234156416, 3385345166, 4142626212, 4293295786, 3841024952, 3992742070, 174567692, 57326082, 410887952, 292596766, 777231668, 660510266, 1011452712, 893681702, 1108339068, 1258480242, 1343618912, 1494807662, 1715193156, 1865862730, 1948373848, 2100090966, 2701949495, 2818666809, 3004591147, 3122358053, 2235061775, 2352307457, 2535604243, 2653899549, 3915653703, 3764988233, 4219352155, 4067639125, 3444575871, 3294430577, 3746175075, 3594982253, 836553431, 953270745, 600235211, 718002117, 367585007, 484830689, 133361907, 251657213, 2041877159, 1891211689, 1806599355, 1654886325, 1568718495, 1418573201, 1335535747, 1184342925 ]);
        function AES() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            AES.prototype.__init__.apply(this, arguments);
        }
        AES.prototype.__init__ = function __init__(key) {
            var self = this;
            var rounds, round_key_count, KC, tk, index, rconpointer, t, tt, i, r, c;
            self.working_mem = [ new Uint32Array(4), new Uint32Array(4) ];
            rounds = number_of_rounds[ρσ_bound_index(key.length, number_of_rounds)];
            if (!rounds) {
                throw new ValueError("invalid key size (must be length 16, 24 or 32)");
            }
            self._Ke = [];
            self._Kd = [];
            for (var i = 0; i <= rounds; i++) {
                self._Ke.push(new Uint32Array(4));
                self._Kd.push(new Uint32Array(4));
            }
            round_key_count = (rounds + 1) * 4;
            KC = key.length / 4;
            tk = new Uint32Array(KC);
            convert_to_int32(key, tk);
            index = 0;
            for (var i = 0; i < KC; i++) {
                index = i >> 2;
                (ρσ_expr_temp = (ρσ_expr_temp = self._Ke)[(typeof index === "number" && index < 0) ? ρσ_expr_temp.length + index : index])[ρσ_bound_index(i % 4, ρσ_expr_temp)] = tk[(typeof i === "number" && i < 0) ? tk.length + i : i];
                (ρσ_expr_temp = (ρσ_expr_temp = self._Kd)[ρσ_bound_index(rounds - index, ρσ_expr_temp)])[ρσ_bound_index(i % 4, ρσ_expr_temp)] = tk[(typeof i === "number" && i < 0) ? tk.length + i : i];
            }
            rconpointer = 0;
            t = KC;
            while (t < round_key_count) {
                tt = tk[ρσ_bound_index(KC - 1, tk)];
                tk[0] ^= S[ρσ_bound_index(tt >> 16 & 255, S)] << 24 ^ S[ρσ_bound_index(tt >> 8 & 255, S)] << 16 ^ S[ρσ_bound_index(tt & 255, S)] << 8 ^ S[ρσ_bound_index(tt >> 24 & 255, S)] ^ rcon[(typeof rconpointer === "number" && rconpointer < 0) ? rcon.length + rconpointer : rconpointer] << 24;
                rconpointer += 1;
                if ((KC !== 8 && (typeof KC !== "object" || ρσ_not_equals(KC, 8)))) {
                    for (var i = 1; i < KC; i++) {
                        tk[(typeof i === "number" && i < 0) ? tk.length + i : i] ^= tk[ρσ_bound_index(i - 1, tk)];
                    }
                } else {
                    for (var i = 1; i < (KC / 2); i++) {
                        tk[(typeof i === "number" && i < 0) ? tk.length + i : i] ^= tk[ρσ_bound_index(i - 1, tk)];
                    }
                    tt = tk[ρσ_bound_index(KC / 2 - 1, tk)];
                    tk[ρσ_bound_index(KC / 2, tk)] ^= S[ρσ_bound_index(tt & 255, S)] ^ S[ρσ_bound_index(tt >> 8 & 255, S)] << 8 ^ S[ρσ_bound_index(tt >> 16 & 255, S)] << 16 ^ S[ρσ_bound_index(tt >> 24 & 255, S)] << 24;
                    for (var i = (KC / 2) + 1; i < KC; i++) {
                        tk[(typeof i === "number" && i < 0) ? tk.length + i : i] ^= tk[ρσ_bound_index(i - 1, tk)];
                    }
                }
                i = 0;
                while (i < KC && t < round_key_count) {
                    r = t >> 2;
                    c = t % 4;
                    (ρσ_expr_temp = (ρσ_expr_temp = self._Ke)[(typeof r === "number" && r < 0) ? ρσ_expr_temp.length + r : r])[(typeof c === "number" && c < 0) ? ρσ_expr_temp.length + c : c] = tk[(typeof i === "number" && i < 0) ? tk.length + i : i];
                    (ρσ_expr_temp = (ρσ_expr_temp = self._Kd)[ρσ_bound_index(rounds - r, ρσ_expr_temp)])[(typeof c === "number" && c < 0) ? ρσ_expr_temp.length + c : c] = tk[ρσ_bound_index(i++, tk)];
                    t += 1;
                }
            }
            for (var r = 1; r < rounds; r++) {
                for (var c = 0; c < 4; c++) {
                    tt = (ρσ_expr_temp = (ρσ_expr_temp = self._Kd)[(typeof r === "number" && r < 0) ? ρσ_expr_temp.length + r : r])[(typeof c === "number" && c < 0) ? ρσ_expr_temp.length + c : c];
                    (ρσ_expr_temp = (ρσ_expr_temp = self._Kd)[(typeof r === "number" && r < 0) ? ρσ_expr_temp.length + r : r])[(typeof c === "number" && c < 0) ? ρσ_expr_temp.length + c : c] = U1[ρσ_bound_index(tt >> 24 & 255, U1)] ^ U2[ρσ_bound_index(tt >> 16 & 255, U2)] ^ U3[ρσ_bound_index(tt >> 8 & 255, U3)] ^ U4[ρσ_bound_index(tt & 255, U4)];
                }
            }
        };
        if (!AES.prototype.__init__.__argnames__) Object.defineProperties(AES.prototype.__init__, {
            __argnames__ : {value: ["key"]},
            __module__ : {value: "aes"}
        });
        AES.__argnames__ = AES.prototype.__init__.__argnames__;
        AES.__handles_kwarg_interpolation__ = AES.prototype.__init__.__handles_kwarg_interpolation__;
        AES.prototype._crypt = function _crypt(ciphertext, offset, encrypt) {
            var self = this;
            var R1, R2, R3, R4, o1, o3, SB, K, rounds, a, t, tt;
            if (encrypt) {
                R1 = T1;
                R2 = T2;
                R3 = T3;
                R4 = T4;
                o1 = 1;
                o3 = 3;
                SB = S;
                K = self._Ke;
            } else {
                R1 = T5;
                R2 = T6;
                R3 = T7;
                R4 = T8;
                o1 = 3;
                o3 = 1;
                SB = Si;
                K = self._Kd;
            }
            rounds = K.length - 1;
            a = self.working_mem[0];
            t = self.working_mem[1];
            for (var i = 0; i < 4; i++) {
                t[(typeof i === "number" && i < 0) ? t.length + i : i] ^= (ρσ_expr_temp = K[0])[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
            }
            for (var r = 1; r < rounds; r++) {
                for (var i = 0; i < 4; i++) {
                    a[(typeof i === "number" && i < 0) ? a.length + i : i] = R1[ρσ_bound_index(t[(typeof i === "number" && i < 0) ? t.length + i : i] >> 24 & 255, R1)] ^ R2[ρσ_bound_index(t[ρσ_bound_index((i + o1) % 4, t)] >> 16 & 255, R2)] ^ R3[ρσ_bound_index(t[ρσ_bound_index((i + 2) % 4, t)] >> 8 & 255, R3)] ^ R4[ρσ_bound_index(t[ρσ_bound_index((i + o3) % 4, t)] & 255, R4)] ^ (ρσ_expr_temp = K[(typeof r === "number" && r < 0) ? K.length + r : r])[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
                }
                t.set(a);
            }
            for (var i = 0; i < 4; i++) {
                tt = (ρσ_expr_temp = K[(typeof rounds === "number" && rounds < 0) ? K.length + rounds : rounds])[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
                ciphertext[ρσ_bound_index(offset + 4 * i, ciphertext)] = (SB[ρσ_bound_index(t[(typeof i === "number" && i < 0) ? t.length + i : i] >> 24 & 255, SB)] ^ tt >> 24) & 255;
                ciphertext[ρσ_bound_index(offset + 4 * i + 1, ciphertext)] = (SB[ρσ_bound_index(t[ρσ_bound_index((i + o1) % 4, t)] >> 16 & 255, SB)] ^ tt >> 16) & 255;
                ciphertext[ρσ_bound_index(offset + 4 * i + 2, ciphertext)] = (SB[ρσ_bound_index(t[ρσ_bound_index((i + 2) % 4, t)] >> 8 & 255, SB)] ^ tt >> 8) & 255;
                ciphertext[ρσ_bound_index(offset + 4 * i + 3, ciphertext)] = (SB[ρσ_bound_index(t[ρσ_bound_index((i + o3) % 4, t)] & 255, SB)] ^ tt) & 255;
            }
        };
        if (!AES.prototype._crypt.__argnames__) Object.defineProperties(AES.prototype._crypt, {
            __argnames__ : {value: ["ciphertext", "offset", "encrypt"]},
            __module__ : {value: "aes"}
        });
        AES.prototype.encrypt = function encrypt(plaintext, ciphertext, offset) {
            var self = this;
            convert_to_int32(plaintext, self.working_mem[1], offset, 16);
            return self._crypt(ciphertext, offset, true);
        };
        if (!AES.prototype.encrypt.__argnames__) Object.defineProperties(AES.prototype.encrypt, {
            __argnames__ : {value: ["plaintext", "ciphertext", "offset"]},
            __module__ : {value: "aes"}
        });
        AES.prototype.encrypt32 = function encrypt32(plaintext, ciphertext, offset) {
            var self = this;
            self.working_mem[1].set(plaintext);
            return self._crypt(ciphertext, offset, true);
        };
        if (!AES.prototype.encrypt32.__argnames__) Object.defineProperties(AES.prototype.encrypt32, {
            __argnames__ : {value: ["plaintext", "ciphertext", "offset"]},
            __module__ : {value: "aes"}
        });
        AES.prototype.decrypt = function decrypt(ciphertext, plaintext, offset) {
            var self = this;
            convert_to_int32(ciphertext, self.working_mem[1], offset, 16);
            return self._crypt(plaintext, offset, false);
        };
        if (!AES.prototype.decrypt.__argnames__) Object.defineProperties(AES.prototype.decrypt, {
            __argnames__ : {value: ["ciphertext", "plaintext", "offset"]},
            __module__ : {value: "aes"}
        });
        AES.prototype.decrypt32 = function decrypt32(ciphertext, plaintext, offset) {
            var self = this;
            self.working_mem[1].set(ciphertext);
            return self._crypt(plaintext, offset, false);
        };
        if (!AES.prototype.decrypt32.__argnames__) Object.defineProperties(AES.prototype.decrypt32, {
            __argnames__ : {value: ["ciphertext", "plaintext", "offset"]},
            __module__ : {value: "aes"}
        });
        AES.prototype.__repr__ = function __repr__ () {
                        return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        AES.prototype.__str__ = function __str__ () {
            return this.__repr__();
        };
        Object.defineProperty(AES.prototype, "__bases__", {value: []});

        function random_bytes_insecure(sz) {
            var ans;
            ans = new Uint8Array(sz);
            for (var i = 0; i < sz; i++) {
                ans[(typeof i === "number" && i < 0) ? ans.length + i : i] = Math.floor(Math.random() * 256);
            }
            return ans;
        };
        if (!random_bytes_insecure.__argnames__) Object.defineProperties(random_bytes_insecure, {
            __argnames__ : {value: ["sz"]},
            __module__ : {value: "aes"}
        });

        function random_bytes_secure(sz) {
            var ans;
            ans = new Uint8Array(sz);
            crypto.getRandomValues(ans);
            return ans;
        };
        if (!random_bytes_secure.__argnames__) Object.defineProperties(random_bytes_secure, {
            __argnames__ : {value: ["sz"]},
            __module__ : {value: "aes"}
        });

        random_bytes = (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") ? random_bytes_secure : random_bytes_insecure;
        if (random_bytes === random_bytes_insecure) {
            try {
                noderandom = require("crypto").randomBytes;
                random_bytes = (function() {
                    var ρσ_anonfunc = function (sz) {
                        return new Uint8Array(noderandom(sz));
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["sz"]},
                        __module__ : {value: "aes"}
                    });
                    return ρσ_anonfunc;
                })();
            } catch (ρσ_Exception) {
                ρσ_last_exception = ρσ_Exception;
                {
                    print("WARNING: Using insecure RNG for AES");
                } 
            }
        }
        function ModeOfOperation() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            ModeOfOperation.prototype.__init__.apply(this, arguments);
        }
        Object.defineProperties(ModeOfOperation.prototype,  {
            "key_as_js": {
                "enumerable": true, 
                "get": function key_as_js() {
                    var self = this;
                    return typed_array_as_js(self.key);
                }, 
                "set": function () { throw new AttributeError("can't set attribute") }
            }, 
        });
        ModeOfOperation.prototype.__init__ = function __init__(key) {
            var self = this;
            self.key = key || generate_key(32);
            self.aes = new AES(self.key);
        };
        if (!ModeOfOperation.prototype.__init__.__argnames__) Object.defineProperties(ModeOfOperation.prototype.__init__, {
            __argnames__ : {value: ["key"]},
            __module__ : {value: "aes"}
        });
        ModeOfOperation.__argnames__ = ModeOfOperation.prototype.__init__.__argnames__;
        ModeOfOperation.__handles_kwarg_interpolation__ = ModeOfOperation.prototype.__init__.__handles_kwarg_interpolation__;
        ModeOfOperation.prototype.tag_as_bytes = function tag_as_bytes(tag) {
            var self = this;
            if (ρσ_instanceof(tag, Uint8Array)) {
                return tag;
            }
            if (!tag) {
                return new Uint8Array(0);
            }
            if (typeof tag === "string") {
                return string_to_bytes(tag);
            }
            throw new TypeError("Invalid tag, must be a string or a Uint8Array");
        };
        if (!ModeOfOperation.prototype.tag_as_bytes.__argnames__) Object.defineProperties(ModeOfOperation.prototype.tag_as_bytes, {
            __argnames__ : {value: ["tag"]},
            __module__ : {value: "aes"}
        });
        ModeOfOperation.prototype.__repr__ = function __repr__ () {
                        return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        ModeOfOperation.prototype.__str__ = function __str__ () {
            return this.__repr__();
        };
        Object.defineProperty(ModeOfOperation.prototype, "__bases__", {value: []});
        

        function GaloisField() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            GaloisField.prototype.__init__.apply(this, arguments);
        }
        GaloisField.prototype.__init__ = function __init__(sub_key) {
            var self = this;
            var k32;
            k32 = new Uint32Array(4);
            convert_to_int32(sub_key, k32, 0);
            self.m = self.generate_hash_table(k32);
            self.wmem = new Uint32Array(4);
        };
        if (!GaloisField.prototype.__init__.__argnames__) Object.defineProperties(GaloisField.prototype.__init__, {
            __argnames__ : {value: ["sub_key"]},
            __module__ : {value: "aes"}
        });
        GaloisField.__argnames__ = GaloisField.prototype.__init__.__argnames__;
        GaloisField.__handles_kwarg_interpolation__ = GaloisField.prototype.__init__.__handles_kwarg_interpolation__;
        GaloisField.prototype.power = function power(x, out) {
            var self = this;
            var lsb;
            lsb = x[3] & 1;
            for (var i = 3; i > 0; --i) {
                out[(typeof i === "number" && i < 0) ? out.length + i : i] = x[(typeof i === "number" && i < 0) ? x.length + i : i] >>> 1 | (x[ρσ_bound_index(i - 1, x)] & 1) << 31;
            }
            out[0] = x[0] >>> 1;
            if (lsb) {
                out[0] ^= 3774873600;
            }
        };
        if (!GaloisField.prototype.power.__argnames__) Object.defineProperties(GaloisField.prototype.power, {
            __argnames__ : {value: ["x", "out"]},
            __module__ : {value: "aes"}
        });
        GaloisField.prototype.multiply = function multiply(x, y) {
            var self = this;
            var z_i, v_i, x_i;
            z_i = new Uint32Array(4);
            v_i = new Uint32Array(y);
            for (var i = 0; i < 128; ++i) {
                x_i = x[ρσ_bound_index(i / 32 | 0, x)] & 1 << 31 - i % 32;
                if (x_i) {
                    z_i[0] ^= v_i[0];
                    z_i[1] ^= v_i[1];
                    z_i[2] ^= v_i[2];
                    z_i[3] ^= v_i[3];
                }
                self.power(v_i, v_i);
            }
            return z_i;
        };
        if (!GaloisField.prototype.multiply.__argnames__) Object.defineProperties(GaloisField.prototype.multiply, {
            __argnames__ : {value: ["x", "y"]},
            __module__ : {value: "aes"}
        });
        GaloisField.prototype.generate_sub_hash_table = function generate_sub_hash_table(mid) {
            var self = this;
            var bits, size, half, m, i, m_i, m_j, x, y;
            bits = mid.length;
            size = 1 << bits;
            half = size >>> 1;
            m = new Array(size);
            m[(typeof half === "number" && half < 0) ? m.length + half : half] = new Uint32Array(mid);
            i = half >>> 1;
            while (i > 0) {
                m[(typeof i === "number" && i < 0) ? m.length + i : i] = new Uint32Array(4);
                self.power(m[ρσ_bound_index(2 * i, m)], m[(typeof i === "number" && i < 0) ? m.length + i : i]);
                i >>= 1;
            }
            i = 2;
            while (i < half) {
                for (var j = 1; j < i; ++j) {
                    m_i = m[(typeof i === "number" && i < 0) ? m.length + i : i];
                    m_j = m[(typeof j === "number" && j < 0) ? m.length + j : j];
                    m[ρσ_bound_index(i + j, m)] = x = new Uint32Array(4);
                    for (var c = 0; c < 4; c++) {
                        x[(typeof c === "number" && c < 0) ? x.length + c : c] = m_i[(typeof c === "number" && c < 0) ? m_i.length + c : c] ^ m_j[(typeof c === "number" && c < 0) ? m_j.length + c : c];
                    }
                }
                i *= 2;
            }
            m[0] = new Uint32Array(4);
            for (i = half + 1; i < size; ++i) {
                x = m[ρσ_bound_index(i ^ half, m)];
                m[(typeof i === "number" && i < 0) ? m.length + i : i] = y = new Uint32Array(4);
                for (var c = 0; c < 4; c++) {
                    y[(typeof c === "number" && c < 0) ? y.length + c : c] = mid[(typeof c === "number" && c < 0) ? mid.length + c : c] ^ x[(typeof c === "number" && c < 0) ? x.length + c : c];
                }
            }
            return m;
        };
        if (!GaloisField.prototype.generate_sub_hash_table.__argnames__) Object.defineProperties(GaloisField.prototype.generate_sub_hash_table, {
            __argnames__ : {value: ["mid"]},
            __module__ : {value: "aes"}
        });
        GaloisField.prototype.generate_hash_table = function generate_hash_table(key_as_int32_array) {
            var self = this;
            var bits, multiplier, per_int, size, ans, tmp, idx, shft;
            bits = key_as_int32_array.length;
            multiplier = 8 / bits;
            per_int = 4 * multiplier;
            size = 16 * multiplier;
            ans = new Array(size);
            for (var i =0; i < size; ++i) {
                tmp = new Uint32Array(4);
                idx = i / per_int | 0;
                shft = (per_int - 1 - i % per_int) * bits;
                tmp[(typeof idx === "number" && idx < 0) ? tmp.length + idx : idx] = 1 << bits - 1 << shft;
                ans[(typeof i === "number" && i < 0) ? ans.length + i : i] = self.generate_sub_hash_table(self.multiply(tmp, key_as_int32_array));
            }
            return ans;
        };
        if (!GaloisField.prototype.generate_hash_table.__argnames__) Object.defineProperties(GaloisField.prototype.generate_hash_table, {
            __argnames__ : {value: ["key_as_int32_array"]},
            __module__ : {value: "aes"}
        });
        GaloisField.prototype.table_multiply = function table_multiply(x) {
            var self = this;
            var z, idx, x_i, ah;
            z = new Uint32Array(4);
            for (var i = 0; i < 32; ++i) {
                idx = i / 8 | 0;
                x_i = x[(typeof idx === "number" && idx < 0) ? x.length + idx : idx] >>> (7 - i % 8) * 4 & 15;
                ah = (ρσ_expr_temp = (ρσ_expr_temp = self.m)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i])[(typeof x_i === "number" && x_i < 0) ? ρσ_expr_temp.length + x_i : x_i];
                z[0] ^= ah[0];
                z[1] ^= ah[1];
                z[2] ^= ah[2];
                z[3] ^= ah[3];
            }
            return z;
        };
        if (!GaloisField.prototype.table_multiply.__argnames__) Object.defineProperties(GaloisField.prototype.table_multiply, {
            __argnames__ : {value: ["x"]},
            __module__ : {value: "aes"}
        });
        GaloisField.prototype.ghash = function ghash(x, y) {
            var self = this;
            var z;
            z = self.wmem;
            z[0] = y[0] ^ x[0];
            z[1] = y[1] ^ x[1];
            z[2] = y[2] ^ x[2];
            z[3] = y[3] ^ x[3];
            return self.table_multiply(z);
        };
        if (!GaloisField.prototype.ghash.__argnames__) Object.defineProperties(GaloisField.prototype.ghash, {
            __argnames__ : {value: ["x", "y"]},
            __module__ : {value: "aes"}
        });
        GaloisField.prototype.__repr__ = function __repr__ () {
                        return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        GaloisField.prototype.__str__ = function __str__ () {
            return this.__repr__();
        };
        Object.defineProperty(GaloisField.prototype, "__bases__", {value: []});

        function generate_key(sz) {
            if (!number_of_rounds[(typeof sz === "number" && sz < 0) ? number_of_rounds.length + sz : sz]) {
                throw new ValueError("Invalid key size, must be: 16, 24 or 32");
            }
            return random_bytes(sz);
        };
        if (!generate_key.__argnames__) Object.defineProperties(generate_key, {
            __argnames__ : {value: ["sz"]},
            __module__ : {value: "aes"}
        });

        function generate_tag(sz) {
            return random_bytes(sz || 32);
        };
        if (!generate_tag.__argnames__) Object.defineProperties(generate_tag, {
            __argnames__ : {value: ["sz"]},
            __module__ : {value: "aes"}
        });

        function typed_array_as_js(x) {
            var name;
            name = x.constructor.name || "Uint8Array";
            return "(new " + name + "(" + JSON.stringify(Array.from(x)) + "))";
        };
        if (!typed_array_as_js.__argnames__) Object.defineProperties(typed_array_as_js, {
            __argnames__ : {value: ["x"]},
            __module__ : {value: "aes"}
        });

        function CBC() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            CBC.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(CBC, ModeOfOperation);
        CBC.prototype.__init__ = function __init__ () {
            ModeOfOperation.prototype.__init__ && ModeOfOperation.prototype.__init__.apply(this, arguments);
        };
        CBC.prototype.encrypt_bytes = function encrypt_bytes(bytes, tag_bytes, iv) {
            var self = this;
            var first_iv, mlen, padsz, inputbytes, offset, outputbytes, ρσ_unpack;
            iv = first_iv = iv || random_bytes(16);
            mlen = bytes.length + tag_bytes.length;
            padsz = (16 - mlen % 16) % 16;
            inputbytes = new Uint8Array(mlen + padsz);
            if (tag_bytes.length) {
                inputbytes.set(tag_bytes);
            }
            inputbytes.set(bytes, tag_bytes.length);
            offset = 0;
            outputbytes = new Uint8Array(inputbytes.length);
            for (var block = 0; block < inputbytes.length; block += 16) {
                if (block > 0) {
                    ρσ_unpack = [outputbytes, block - 16];
                    iv = ρσ_unpack[0];
                    offset = ρσ_unpack[1];
                }
                for (var i = 0; i < 16; i++) {
                    inputbytes[ρσ_bound_index(block + i, inputbytes)] ^= iv[ρσ_bound_index(offset + i, iv)];
                }
                self.aes.encrypt(inputbytes, outputbytes, block);
            }
            return (function(){
                var ρσ_d = {};
                ρσ_d["iv"] = first_iv;
                ρσ_d["cipherbytes"] = outputbytes;
                return ρσ_d;
            }).call(this);
        };
        if (!CBC.prototype.encrypt_bytes.__argnames__) Object.defineProperties(CBC.prototype.encrypt_bytes, {
            __argnames__ : {value: ["bytes", "tag_bytes", "iv"]},
            __module__ : {value: "aes"}
        });
        CBC.prototype.encrypt = function encrypt(plaintext, tag) {
            var self = this;
            return self.encrypt_bytes(string_to_bytes(plaintext), self.tag_as_bytes(tag));
        };
        if (!CBC.prototype.encrypt.__argnames__) Object.defineProperties(CBC.prototype.encrypt, {
            __argnames__ : {value: ["plaintext", "tag"]},
            __module__ : {value: "aes"}
        });
        CBC.prototype.decrypt_bytes = function decrypt_bytes(inputbytes, tag_bytes, iv) {
            var self = this;
            var offset, outputbytes, ρσ_unpack;
            offset = 0;
            outputbytes = new Uint8Array(inputbytes.length);
            for (var block = 0; block < inputbytes.length; block += 16) {
                self.aes.decrypt(inputbytes, outputbytes, block);
                if (block > 0) {
                    ρσ_unpack = [inputbytes, block - 16];
                    iv = ρσ_unpack[0];
                    offset = ρσ_unpack[1];
                }
                for (var i = 0; i < 16; i++) {
                    outputbytes[ρσ_bound_index(block + i, outputbytes)] ^= iv[ρσ_bound_index(offset + i, iv)];
                }
            }
            for (var i = 0; i < tag_bytes.length; i++) {
                if ((tag_bytes[(typeof i === "number" && i < 0) ? tag_bytes.length + i : i] !== outputbytes[(typeof i === "number" && i < 0) ? outputbytes.length + i : i] && (typeof tag_bytes[(typeof i === "number" && i < 0) ? tag_bytes.length + i : i] !== "object" || ρσ_not_equals(tag_bytes[(typeof i === "number" && i < 0) ? tag_bytes.length + i : i], outputbytes[(typeof i === "number" && i < 0) ? outputbytes.length + i : i])))) {
                    throw new ValueError("Corrupt message");
                }
            }
            outputbytes = outputbytes.subarray(tag_bytes.length);
            return outputbytes;
        };
        if (!CBC.prototype.decrypt_bytes.__argnames__) Object.defineProperties(CBC.prototype.decrypt_bytes, {
            __argnames__ : {value: ["inputbytes", "tag_bytes", "iv"]},
            __module__ : {value: "aes"}
        });
        CBC.prototype.decrypt = function decrypt(output_from_encrypt, tag) {
            var self = this;
            var ans;
            ans = self.decrypt_bytes(output_from_encrypt.cipherbytes, self.tag_as_bytes(tag), output_from_encrypt.iv);
            return str.rstrip(bytes_to_string(ans), "\u0000");
        };
        if (!CBC.prototype.decrypt.__argnames__) Object.defineProperties(CBC.prototype.decrypt, {
            __argnames__ : {value: ["output_from_encrypt", "tag"]},
            __module__ : {value: "aes"}
        });
        CBC.prototype.__repr__ = function __repr__ () {
            if(ModeOfOperation.prototype.__repr__) return ModeOfOperation.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        CBC.prototype.__str__ = function __str__ () {
            if(ModeOfOperation.prototype.__str__) return ModeOfOperation.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(CBC.prototype, "__bases__", {value: [ModeOfOperation]});

        function CTR() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            CTR.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(CTR, ModeOfOperation);
        CTR.prototype.__init__ = function __init__(key, iv) {
            var self = this;
            ModeOfOperation.prototype.__init__.call(self, key);
            self.wmem = new Uint8Array(16);
            self.counter_block = new Uint8Array(iv || 16);
            if ((self.counter_block.length !== 16 && (typeof self.counter_block.length !== "object" || ρσ_not_equals(self.counter_block.length, 16)))) {
                throw new ValueError("iv must be 16 bytes long");
            }
            self.counter_index = 16;
        };
        if (!CTR.prototype.__init__.__argnames__) Object.defineProperties(CTR.prototype.__init__, {
            __argnames__ : {value: ["key", "iv"]},
            __module__ : {value: "aes"}
        });
        CTR.__argnames__ = CTR.prototype.__init__.__argnames__;
        CTR.__handles_kwarg_interpolation__ = CTR.prototype.__init__.__handles_kwarg_interpolation__;
        CTR.prototype._crypt = function _crypt(bytes) {
            var self = this;
            for (var i = 0; i < bytes.length; i++, self.counter_index++) {
                if (self.counter_index === 16) {
                    self.counter_index = 0;
                    self.aes.encrypt(self.counter_block, self.wmem, 0);
                    increment_counter(self.counter_block);
                }
                bytes[(typeof i === "number" && i < 0) ? bytes.length + i : i] ^= (ρσ_expr_temp = self.wmem)[ρσ_bound_index(self.counter_index, ρσ_expr_temp)];
            }
            self.counter_index = 16;
        };
        if (!CTR.prototype._crypt.__argnames__) Object.defineProperties(CTR.prototype._crypt, {
            __argnames__ : {value: ["bytes"]},
            __module__ : {value: "aes"}
        });
        CTR.prototype.encrypt = function encrypt(plaintext, tag) {
            var self = this;
            var outbytes, counterbytes, tag_bytes, t;
            outbytes = string_to_bytes(plaintext);
            counterbytes = new Uint8Array(self.counter_block);
            if (tag) {
                tag_bytes = self.tag_as_bytes(tag);
                t = new Uint8Array(outbytes.length + tag_bytes.length);
                t.set(tag_bytes);
                t.set(outbytes, tag_bytes.length);
                outbytes = t;
            }
            self._crypt(outbytes);
            return (function(){
                var ρσ_d = {};
                ρσ_d["cipherbytes"] = outbytes;
                ρσ_d["counterbytes"] = counterbytes;
                return ρσ_d;
            }).call(this);
        };
        if (!CTR.prototype.encrypt.__argnames__) Object.defineProperties(CTR.prototype.encrypt, {
            __argnames__ : {value: ["plaintext", "tag"]},
            __module__ : {value: "aes"}
        });
        CTR.prototype.__enter__ = function __enter__() {
            var self = this;
            self.before_index = self.counter_index;
            self.before_counter = new Uint8Array(self.counter_block);
        };
        if (!CTR.prototype.__enter__.__module__) Object.defineProperties(CTR.prototype.__enter__, {
            __module__ : {value: "aes"}
        });
        CTR.prototype.__exit__ = function __exit__() {
            var self = this;
            self.counter_index = self.before_index;
            self.counter_block = self.before_counter;
        };
        if (!CTR.prototype.__exit__.__module__) Object.defineProperties(CTR.prototype.__exit__, {
            __module__ : {value: "aes"}
        });
        CTR.prototype.decrypt = function decrypt(output_from_encrypt, tag) {
            var self = this;
            var b, ρσ_with_exception, ρσ_with_suppress, offset, tag_bytes;
            b = new Uint8Array(output_from_encrypt.cipherbytes);
            ρσ_with_exception = undefined;
            var ρσ_with_clause_1 = self;
            ρσ_with_clause_1.__enter__();
            try {
                {
                    self.counter_block = output_from_encrypt.counterbytes;
                    self.counter_index = 16;
                    self._crypt(b);
                }
            } catch(e){
                ρσ_with_exception = e;
            }
            if (ρσ_with_exception === undefined){
                ρσ_with_clause_1.__exit__();
            } else {
                ρσ_with_suppress = false;
                ρσ_with_suppress |= ρσ_bool(ρσ_with_clause_1.__exit__(ρσ_with_exception.constructor, ρσ_with_exception, ρσ_with_exception.stack));
                if (!ρσ_with_suppress) throw ρσ_with_exception;
            }
            offset = 0;
            if (tag) {
                tag_bytes = self.tag_as_bytes(tag);
                for (var i = 0; i < tag_bytes.length; i++) {
                    if ((tag_bytes[(typeof i === "number" && i < 0) ? tag_bytes.length + i : i] !== b[(typeof i === "number" && i < 0) ? b.length + i : i] && (typeof tag_bytes[(typeof i === "number" && i < 0) ? tag_bytes.length + i : i] !== "object" || ρσ_not_equals(tag_bytes[(typeof i === "number" && i < 0) ? tag_bytes.length + i : i], b[(typeof i === "number" && i < 0) ? b.length + i : i])))) {
                        throw new ValueError("Corrupted message");
                    }
                }
                offset = tag_bytes.length;
            }
            return bytes_to_string(b, offset);
        };
        if (!CTR.prototype.decrypt.__argnames__) Object.defineProperties(CTR.prototype.decrypt, {
            __argnames__ : {value: ["output_from_encrypt", "tag"]},
            __module__ : {value: "aes"}
        });
        CTR.prototype.__repr__ = function __repr__ () {
            if(ModeOfOperation.prototype.__repr__) return ModeOfOperation.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        CTR.prototype.__str__ = function __str__ () {
            if(ModeOfOperation.prototype.__str__) return ModeOfOperation.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(CTR.prototype, "__bases__", {value: [ModeOfOperation]});

        function GCM() {
            if (this.ρσ_object_id === undefined) Object.defineProperty(this, "ρσ_object_id", {"value":++ρσ_object_counter});
            GCM.prototype.__init__.apply(this, arguments);
        }
        ρσ_extends(GCM, ModeOfOperation);
        GCM.prototype.__init__ = function __init__() {
            var self = this;
            var key = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var random_iv = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? __init__.__defaults__.random_iv : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "random_iv")){
                random_iv = ρσ_kwargs_obj.random_iv;
            }
            var H;
            ModeOfOperation.prototype.__init__.call(self, key);
            self.random_iv = random_iv;
            if (!random_iv) {
                self.current_iv = new Uint8Array(12);
            }
            H = new Uint8Array(16);
            self.aes.encrypt(new Uint8Array(16), H, 0);
            self.galois = new GaloisField(H);
            self.J0 = new Uint32Array(4);
            self.wmem = new Uint32Array(4);
            self.byte_block = new Uint8Array(16);
        };
        if (!GCM.prototype.__init__.__defaults__) Object.defineProperties(GCM.prototype.__init__, {
            __defaults__ : {value: {random_iv:false}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["key", "random_iv"]},
            __module__ : {value: "aes"}
        });
        GCM.__argnames__ = GCM.prototype.__init__.__argnames__;
        GCM.__handles_kwarg_interpolation__ = GCM.prototype.__init__.__handles_kwarg_interpolation__;
        GCM.prototype.increment_iv = function increment_iv() {
            var self = this;
            var c;
            c = self.current_iv;
            for (var i = 11; i >=0; i--) {
                if (c[(typeof i === "number" && i < 0) ? c.length + i : i] === 255) {
                    if (i === 0) {
                        throw new ValueError("The GCM IV space is exhausted, cannot" + " encrypt anymore messages with this key" + " as doing so would cause the IV to repeat");
                    }
                    c[(typeof i === "number" && i < 0) ? c.length + i : i] = 0;
                } else {
                    c[(typeof i === "number" && i < 0) ? c.length + i : i] += 1;
                    break;
                }
            }
        };
        if (!GCM.prototype.increment_iv.__module__) Object.defineProperties(GCM.prototype.increment_iv, {
            __module__ : {value: "aes"}
        });
        GCM.prototype._create_j0 = function _create_j0(iv) {
            var self = this;
            var J0, tmp;
            J0 = self.J0;
            if (iv.length === 12) {
                convert_to_int32(iv, J0);
                J0[3] = 1;
            } else {
                J0.fill(0);
                tmp = convert_to_int32_pad(iv);
                while (tmp.length) {
                    J0 = self.galois.ghash(J0, tmp);
                    tmp = tmp.subarray(4);
                }
                tmp = new Uint32Array(4);
                tmp.set(from_64_to_32(iv.length * 8), 2);
                J0 = self.galois.ghash(J0, tmp);
            }
            return J0;
        };
        if (!GCM.prototype._create_j0.__argnames__) Object.defineProperties(GCM.prototype._create_j0, {
            __argnames__ : {value: ["iv"]},
            __module__ : {value: "aes"}
        });
        GCM.prototype._start = function _start(iv, additional_data) {
            var self = this;
            var J0, in_block, S, overflow;
            J0 = self._create_j0(iv);
            in_block = new Uint32Array(J0);
            in_block[3] = in_block[3] + 1 & 4294967295;
            S = new Uint32Array(4);
            overflow = additional_data.length % 16;
            for (var i = 0; i < additional_data.length - overflow; i += 16) {
                convert_to_int32(additional_data, self.wmem, i, 16);
                S = self.galois.ghash(S, self.wmem);
            }
            if (overflow) {
                self.byte_block.fill(0);
                self.byte_block.set(additional_data.subarray(additional_data.length - overflow));
                convert_to_int32(self.byte_block, self.wmem);
                S = self.galois.ghash(S, self.wmem);
            }
            return [J0, in_block, S];
        };
        if (!GCM.prototype._start.__argnames__) Object.defineProperties(GCM.prototype._start, {
            __argnames__ : {value: ["iv", "additional_data"]},
            __module__ : {value: "aes"}
        });
        GCM.prototype._finish = function _finish(iv, J0, adata_len, S, outbytes) {
            var self = this;
            var lengths, tag;
            lengths = new Uint32Array(4);
            lengths.set(from_64_to_32(adata_len * 8));
            lengths.set(from_64_to_32(outbytes.length * 8), 2);
            S = self.galois.ghash(S, lengths);
            self.aes.encrypt32(J0, self.byte_block, 0);
            convert_to_int32(self.byte_block, self.wmem);
            tag = new Uint32Array(4);
            for (var i = 0; i < S.length; i++) {
                tag[(typeof i === "number" && i < 0) ? tag.length + i : i] = S[(typeof i === "number" && i < 0) ? S.length + i : i] ^ (ρσ_expr_temp = self.wmem)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
            }
            return (function(){
                var ρσ_d = {};
                ρσ_d["iv"] = iv;
                ρσ_d["cipherbytes"] = outbytes;
                ρσ_d["tag"] = tag;
                return ρσ_d;
            }).call(this);
        };
        if (!GCM.prototype._finish.__argnames__) Object.defineProperties(GCM.prototype._finish, {
            __argnames__ : {value: ["iv", "J0", "adata_len", "S", "outbytes"]},
            __module__ : {value: "aes"}
        });
        GCM.prototype._crypt = function _crypt(iv, bytes, additional_data, decrypt) {
            var self = this;
            var ghash, outbytes, ρσ_unpack, J0, in_block, S, bb, enc, hash_bytes, counter_index, overflow;
            ghash = self.galois.ghash.bind(self.galois);
            outbytes = new Uint8Array(bytes.length);
            ρσ_unpack = self._start(iv, additional_data);
ρσ_unpack = ρσ_unpack_asarray(3, ρσ_unpack);
            J0 = ρσ_unpack[0];
            in_block = ρσ_unpack[1];
            S = ρσ_unpack[2];
            bb = self.byte_block;
            enc = self.aes.encrypt32.bind(self.aes);
            hash_bytes = (decrypt) ? bytes : outbytes;
            counter_index = 16;
            for (var i = 0; i < bytes.length; i++, counter_index++) {
                if (counter_index === 16) {
                    enc(in_block, bb, 0);
                    in_block[3] = in_block[3] + 1 & 4294967295;
                    counter_index = 0;
                }
                outbytes[(typeof i === "number" && i < 0) ? outbytes.length + i : i] = bytes[(typeof i === "number" && i < 0) ? bytes.length + i : i] ^ bb[(typeof counter_index === "number" && counter_index < 0) ? bb.length + counter_index : counter_index];
                if (counter_index === 15) {
                    convert_to_int32(hash_bytes, self.wmem, i - 15, 16);
                    S = ghash(S, self.wmem);
                }
            }
            overflow = outbytes.length % 16;
            if (overflow) {
                bb.fill(0);
                bb.set(hash_bytes.subarray(hash_bytes.length - overflow));
                convert_to_int32(bb, self.wmem);
                S = ghash(S, self.wmem);
            }
            return self._finish(iv, J0, additional_data.length, S, outbytes);
        };
        if (!GCM.prototype._crypt.__argnames__) Object.defineProperties(GCM.prototype._crypt, {
            __argnames__ : {value: ["iv", "bytes", "additional_data", "decrypt"]},
            __module__ : {value: "aes"}
        });
        GCM.prototype.encrypt = function encrypt(plaintext, tag) {
            var self = this;
            var iv;
            if (self.random_iv) {
                iv = random_bytes(12);
            } else {
                self.increment_iv();
                iv = self.current_iv;
            }
            return self._crypt(iv, string_to_bytes(plaintext), self.tag_as_bytes(tag), false);
        };
        if (!GCM.prototype.encrypt.__argnames__) Object.defineProperties(GCM.prototype.encrypt, {
            __argnames__ : {value: ["plaintext", "tag"]},
            __module__ : {value: "aes"}
        });
        GCM.prototype.decrypt = function decrypt(output_from_encrypt, tag) {
            var self = this;
            var ans;
            if ((output_from_encrypt.tag.length !== 4 && (typeof output_from_encrypt.tag.length !== "object" || ρσ_not_equals(output_from_encrypt.tag.length, 4)))) {
                throw new ValueError("Corrupted message");
            }
            ans = self._crypt(output_from_encrypt.iv, output_from_encrypt.cipherbytes, self.tag_as_bytes(tag), true);
            if ((ans.tag !== output_from_encrypt.tag && (typeof ans.tag !== "object" || ρσ_not_equals(ans.tag, output_from_encrypt.tag)))) {
                throw new ValueError("Corrupted message");
            }
            return bytes_to_string(ans.cipherbytes);
        };
        if (!GCM.prototype.decrypt.__argnames__) Object.defineProperties(GCM.prototype.decrypt, {
            __argnames__ : {value: ["output_from_encrypt", "tag"]},
            __module__ : {value: "aes"}
        });
        GCM.prototype.__repr__ = function __repr__ () {
            if(ModeOfOperation.prototype.__repr__) return ModeOfOperation.prototype.__repr__.call(this);
            return "<" + __name__ + "." + this.constructor.name + " #" + this.ρσ_object_id + ">";
        };
        GCM.prototype.__str__ = function __str__ () {
            if(ModeOfOperation.prototype.__str__) return ModeOfOperation.prototype.__str__.call(this);
return this.__repr__();
        };
        Object.defineProperty(GCM.prototype, "__bases__", {value: [ModeOfOperation]});

        ρσ_modules.aes.string_to_bytes = string_to_bytes;
        ρσ_modules.aes.bytes_to_string = bytes_to_string;
        ρσ_modules.aes.number_of_rounds = number_of_rounds;
        ρσ_modules.aes.rcon = rcon;
        ρσ_modules.aes.S = S;
        ρσ_modules.aes.Si = Si;
        ρσ_modules.aes.T1 = T1;
        ρσ_modules.aes.T2 = T2;
        ρσ_modules.aes.T3 = T3;
        ρσ_modules.aes.T4 = T4;
        ρσ_modules.aes.T5 = T5;
        ρσ_modules.aes.T6 = T6;
        ρσ_modules.aes.T7 = T7;
        ρσ_modules.aes.T8 = T8;
        ρσ_modules.aes.U1 = U1;
        ρσ_modules.aes.U2 = U2;
        ρσ_modules.aes.U3 = U3;
        ρσ_modules.aes.U4 = U4;
        ρσ_modules.aes.random_bytes = random_bytes;
        ρσ_modules.aes.noderandom = noderandom;
        ρσ_modules.aes.string_to_bytes_encoder = string_to_bytes_encoder;
        ρσ_modules.aes.string_to_bytes_slow = string_to_bytes_slow;
        ρσ_modules.aes.as_hex = as_hex;
        ρσ_modules.aes.bytes_to_string_decoder = bytes_to_string_decoder;
        ρσ_modules.aes.bytes_to_string_slow = bytes_to_string_slow;
        ρσ_modules.aes.increment_counter = increment_counter;
        ρσ_modules.aes.convert_to_int32 = convert_to_int32;
        ρσ_modules.aes.convert_to_int32_pad = convert_to_int32_pad;
        ρσ_modules.aes.from_64_to_32 = from_64_to_32;
        ρσ_modules.aes.AES = AES;
        ρσ_modules.aes.random_bytes_insecure = random_bytes_insecure;
        ρσ_modules.aes.random_bytes_secure = random_bytes_secure;
        ρσ_modules.aes.ModeOfOperation = ModeOfOperation;
        ρσ_modules.aes.GaloisField = GaloisField;
        ρσ_modules.aes.generate_key = generate_key;
        ρσ_modules.aes.generate_tag = generate_tag;
        ρσ_modules.aes.typed_array_as_js = typed_array_as_js;
        ρσ_modules.aes.CBC = CBC;
        ρσ_modules.aes.CTR = CTR;
        ρσ_modules.aes.GCM = GCM;
    })();

    (function(){
        var __name__ = "crypto";
        var secret_key, gcm;
        var GCM = ρσ_modules.aes.GCM;

        secret_key = "__SECRET_KEY__";
        gcm = null;
        function initialize(after) {
            var decoded;
            if (ρσ_in("_", secret_key)) {
                throw new Exception("secret key was not generated");
            }
            decoded = new Uint8Array(Math.floor(len(secret_key) / 2));
            for (var i = 0, j = 0; i < secret_key.length; i += 2, j++) {
                decoded[(typeof j === "number" && j < 0) ? decoded.length + j : j] = parseInt(secret_key[(typeof i === "number" && i < 0) ? secret_key.length + i : i] + secret_key[ρσ_bound_index(i + 1, secret_key)], 16);
            }
            gcm = ρσ_interpolate_kwargs_constructor.call(Object.create(GCM.prototype), false, GCM, [decoded].concat([ρσ_desugar_kwargs({random_iv: true})]));
            after();
        };
        if (!initialize.__argnames__) Object.defineProperties(initialize, {
            __argnames__ : {value: ["after"]},
            __module__ : {value: "crypto"}
        });

        function encrypt(text) {
            return gcm.encrypt(text);
        };
        if (!encrypt.__argnames__) Object.defineProperties(encrypt, {
            __argnames__ : {value: ["text"]},
            __module__ : {value: "crypto"}
        });

        function decrypt(output_from_encrypt) {
            return gcm.decrypt(output_from_encrypt);
        };
        if (!decrypt.__argnames__) Object.defineProperties(decrypt, {
            __argnames__ : {value: ["output_from_encrypt"]},
            __module__ : {value: "crypto"}
        });

        ρσ_modules.crypto.secret_key = secret_key;
        ρσ_modules.crypto.gcm = gcm;
        ρσ_modules.crypto.initialize = initialize;
        ρσ_modules.crypto.encrypt = encrypt;
        ρσ_modules.crypto.decrypt = decrypt;
    })();

    (function(){
        var __name__ = "frames";
        var frame_count, frame_id, registered, frame_map, handlers;
        var encrypt = ρσ_modules.crypto.encrypt;
        var decrypt = ρσ_modules.crypto.decrypt;

        frame_count = frame_id = 0;
        registered = false;
        frame_map = new WeakMap;
        function prepare_message(payload, cont) {
            var c;
            payload = JSON.stringify(payload);
            c = encrypt(payload);
            cont((function(){
                var ρσ_d = {};
                ρσ_d["type"] = "ͻvise_frame_message";
                ρσ_d["encrypted_payload"] = c;
                ρσ_d["source_frame_id"] = frame_id;
                return ρσ_d;
            }).call(this));
        };
        if (!prepare_message.__argnames__) Object.defineProperties(prepare_message, {
            __argnames__ : {value: ["payload", "cont"]},
            __module__ : {value: "frames"}
        });

        function post_message(win, payload) {
            prepare_message(payload, (function() {
                var ρσ_anonfunc = function (msg) {
                    win.postMessage(msg, "*");
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["msg"]},
                    __module__ : {value: "frames"}
                });
                return ρσ_anonfunc;
            })());
        };
        if (!post_message.__argnames__) Object.defineProperties(post_message, {
            __argnames__ : {value: ["win", "payload"]},
            __module__ : {value: "frames"}
        });

        function broadcast_message(windows, payload) {
            prepare_message(payload, (function() {
                var ρσ_anonfunc = function (msg) {
                    var win;
                    var ρσ_Iter1 = windows;
                    ρσ_Iter1 = ((typeof ρσ_Iter1[Symbol.iterator] === "function") ? (ρσ_Iter1 instanceof Map ? ρσ_Iter1.keys() : ρσ_Iter1) : Object.keys(ρσ_Iter1));
                    for (var ρσ_Index1 of ρσ_Iter1) {
                        win = ρσ_Index1;
                        win.postMessage(msg, "*");
                    }
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["msg"]},
                    __module__ : {value: "frames"}
                });
                return ρσ_anonfunc;
            })());
        };
        if (!broadcast_message.__argnames__) Object.defineProperties(broadcast_message, {
            __argnames__ : {value: ["windows", "payload"]},
            __module__ : {value: "frames"}
        });

        handlers = {};
        function handle_message_from_frame(source, source_id, data) {
            var action, f, args, kw;
            action = data.action;
            if (action === "*register") {
                if (source !== undefined) {
                    frame_count += 1;
                    frame_map.set(source, frame_count);
                    post_message(source, (function(){
                        var ρσ_d = {};
                        ρσ_d["action"] = "*set_id";
                        ρσ_d["value"] = frame_count;
                        return ρσ_d;
                    }).call(this));
                }
            } else if (action === "*set_id") {
                frame_id = data.value;
            } else {
                f = handlers[(typeof action === "number" && action < 0) ? handlers.length + action : action];
                if (f) {
                    args = data.args || [];
                    kw = data.kwargs || {};
                    ρσ_interpolate_kwargs.call(this, f, [frame_id, source_id, source].concat(args).concat([ρσ_desugar_kwargs(kw)]));
                }
            }
        };
        if (!handle_message_from_frame.__argnames__) Object.defineProperties(handle_message_from_frame, {
            __argnames__ : {value: ["source", "source_id", "data"]},
            __module__ : {value: "frames"}
        });

        function decode_message(event) {
            var raw, payload;
            if (!event.data || event.data.type !== "ͻvise_frame_message") {
                return;
            }
            try {
                raw = decrypt(event.data.encrypted_payload);
            } catch (ρσ_Exception) {
                ρσ_last_exception = ρσ_Exception;
                if (ρσ_Exception instanceof Error) {
                    var err = ρσ_Exception;
                    console.error(err.stack);
                    console.error("Failed to decrypt frame message: " + err.message);
                    return;
                } else {
                    throw ρσ_Exception;
                }
            }
            payload = JSON.parse(raw);
            handle_message_from_frame(event.source, event.data.source_frame_id, payload);
        };
        if (!decode_message.__argnames__) Object.defineProperties(decode_message, {
            __argnames__ : {value: ["event"]},
            __module__ : {value: "frames"}
        });

        function frame_iter() {
            function* js_generator() {
                var win = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
                var filter_func = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? frame_iter.__defaults__.filter_func : arguments[1];
                var ρσ_kwargs_obj = arguments[arguments.length-1];
                if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
                if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "filter_func")){
                    filter_func = ρσ_kwargs_obj.filter_func;
                }
                var frame, fe, i;
                win = win || window.top;
                for (var ρσ_Index2 = 0; ρσ_Index2 < win.frames.length; ρσ_Index2++) {
                    i = ρσ_Index2;
                    frame = (ρσ_expr_temp = win.frames)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
                    try {
                        fe = frame.frameElement;
                    } catch (ρσ_Exception) {
                        ρσ_last_exception = ρσ_Exception;
                        {
                            fe = null;
                        } 
                    }
                    if (filter_func === null || fe === null || filter_func(fe)) {
                        yield frame;
                    }
                    yield* ρσ_interpolate_kwargs.call(this, frame_iter, [frame].concat([ρσ_desugar_kwargs({filter_func: filter_func})]));
                }
            }
            var result = js_generator.apply(this, arguments);
            result.send = result.next;
            return result;
        };
        if (!frame_iter.__defaults__) Object.defineProperties(frame_iter, {
            __defaults__ : {value: {filter_func:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["win", "filter_func"]},
            __module__ : {value: "frames"}
        });

        function frame_for_id(frame_id) {
            var ans, frame;
            if (frame_id === 0) {
                return window.top;
            }
            var ρσ_Iter3 = frame_iter();
            ρσ_Iter3 = ((typeof ρσ_Iter3[Symbol.iterator] === "function") ? (ρσ_Iter3 instanceof Map ? ρσ_Iter3.keys() : ρσ_Iter3) : Object.keys(ρσ_Iter3));
            for (var ρσ_Index3 of ρσ_Iter3) {
                frame = ρσ_Index3;
                ans = frame_map.get(frame);
                if (ans !== undefined && ans === frame_id) {
                    return frame;
                }
            }
        };
        if (!frame_for_id.__argnames__) Object.defineProperties(frame_for_id, {
            __argnames__ : {value: ["frame_id"]},
            __module__ : {value: "frames"}
        });

        function register_frames() {
            if (window.self !== window.top && window.location.href === "about:blank") {
                return;
            }
            if (!registered) {
                registered = true;
                window.addEventListener("message", decode_message, false);
                if (window.self !== window.top) {
                    post_message(window.top, (function(){
                        var ρσ_d = {};
                        ρσ_d["action"] = "*register";
                        return ρσ_d;
                    }).call(this));
                }
            }
        };
        if (!register_frames.__module__) Object.defineProperties(register_frames, {
            __module__ : {value: "frames"}
        });

        function register_handler(name, func) {
            handlers[(typeof name === "number" && name < 0) ? handlers.length + name : name] = func;
        };
        if (!register_handler.__argnames__) Object.defineProperties(register_handler, {
            __argnames__ : {value: ["name", "func"]},
            __module__ : {value: "frames"}
        });

        function register_subframe_handler(func) {
            if (window.self !== window.top) {
                register_handler(func.name, func);
            }
        };
        if (!register_subframe_handler.__argnames__) Object.defineProperties(register_subframe_handler, {
            __argnames__ : {value: ["func"]},
            __module__ : {value: "frames"}
        });

        function register_top_handler(func) {
            if (window.self === window.top) {
                register_handler(func.name, func);
            }
        };
        if (!register_top_handler.__argnames__) Object.defineProperties(register_top_handler, {
            __argnames__ : {value: ["func"]},
            __module__ : {value: "frames"}
        });

        function prepare_action(name, args, kwargs) {
            return (function(){
                var ρσ_d = {};
                ρσ_d["action"] = name;
                ρσ_d["args"] = args;
                ρσ_d["kwargs"] = kwargs;
                return ρσ_d;
            }).call(this);
        };
        if (!prepare_action.__argnames__) Object.defineProperties(prepare_action, {
            __argnames__ : {value: ["name", "args", "kwargs"]},
            __module__ : {value: "frames"}
        });

        function send_action() {
            var win = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var name = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
            var kwargs = arguments[arguments.length-1];
            if (kwargs === null || typeof kwargs !== "object" || kwargs [ρσ_kwargs_symbol] !== true) kwargs = {};
            var args = Array.prototype.slice.call(arguments, 2);
            if (kwargs !== null && typeof kwargs === "object" && kwargs [ρσ_kwargs_symbol] === true) args.pop();
            if (typeof win === "number") {
                win = frame_for_id(win);
            }
            post_message(win, prepare_action(name, args, kwargs));
        };
        if (!send_action.__handles_kwarg_interpolation__) Object.defineProperties(send_action, {
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["win", "name"]},
            __module__ : {value: "frames"}
        });

        function broadcast_action() {
            var windows = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var name = ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[1];
            var kwargs = arguments[arguments.length-1];
            if (kwargs === null || typeof kwargs !== "object" || kwargs [ρσ_kwargs_symbol] !== true) kwargs = {};
            var args = Array.prototype.slice.call(arguments, 2);
            if (kwargs !== null && typeof kwargs === "object" && kwargs [ρσ_kwargs_symbol] === true) args.pop();
            broadcast_message(windows, prepare_action(name, args, kwargs));
        };
        if (!broadcast_action.__handles_kwarg_interpolation__) Object.defineProperties(broadcast_action, {
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["windows", "name"]},
            __module__ : {value: "frames"}
        });

        ρσ_modules.frames.frame_count = frame_count;
        ρσ_modules.frames.frame_id = frame_id;
        ρσ_modules.frames.registered = registered;
        ρσ_modules.frames.frame_map = frame_map;
        ρσ_modules.frames.handlers = handlers;
        ρσ_modules.frames.prepare_message = prepare_message;
        ρσ_modules.frames.post_message = post_message;
        ρσ_modules.frames.broadcast_message = broadcast_message;
        ρσ_modules.frames.handle_message_from_frame = handle_message_from_frame;
        ρσ_modules.frames.decode_message = decode_message;
        ρσ_modules.frames.frame_iter = frame_iter;
        ρσ_modules.frames.frame_for_id = frame_for_id;
        ρσ_modules.frames.register_frames = register_frames;
        ρσ_modules.frames.register_handler = register_handler;
        ρσ_modules.frames.register_subframe_handler = register_subframe_handler;
        ρσ_modules.frames.register_top_handler = register_top_handler;
        ρσ_modules.frames.prepare_action = prepare_action;
        ρσ_modules.frames.send_action = send_action;
        ρσ_modules.frames.broadcast_action = broadcast_action;
    })();

    (function(){
        var __name__ = "communicate";
        var TITLE_TOKEN, to_python, from_python;
        TITLE_TOKEN = "__TITLE_TOKEN__";
        to_python = [];
        from_python = {};
        function notify_python() {
            var ρσ_unpack, t;
            ρσ_unpack = [document.title, TITLE_TOKEN];
            t = ρσ_unpack[0];
            document.title = ρσ_unpack[1];
            document.title = t;
        };
        if (!notify_python.__module__) Object.defineProperties(notify_python, {
            __module__ : {value: "communicate"}
        });

        function callback(name, data, console_err) {
            to_python.push((function(){
                var ρσ_d = {};
                ρσ_d["type"] = "callback";
                ρσ_d["name"] = name;
                ρσ_d["data"] = data;
                return ρσ_d;
            }).call(this));
            notify_python();
        };
        if (!callback.__argnames__) Object.defineProperties(callback, {
            __argnames__ : {value: ["name", "data", "console_err"]},
            __module__ : {value: "communicate"}
        });

        function js_to_python() {
            var name = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);
            if (arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) args.pop();
            to_python.push((function(){
                var ρσ_d = {};
                ρσ_d["type"] = "js_to_python";
                ρσ_d["name"] = name;
                ρσ_d["args"] = args;
                return ρσ_d;
            }).call(this));
            notify_python();
        };
        if (!js_to_python.__handles_kwarg_interpolation__) Object.defineProperties(js_to_python, {
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["name"]},
            __module__ : {value: "communicate"}
        });

        function connect_signal(name, func) {
            if (ρσ_in(name, from_python)) {
                throw new KeyError(str.format("The signal {} has already been connected", name));
            }
            from_python[(typeof name === "number" && name < 0) ? from_python.length + name : name] = func;
        };
        if (!connect_signal.__argnames__) Object.defineProperties(connect_signal, {
            __argnames__ : {value: ["name", "func"]},
            __module__ : {value: "communicate"}
        });

        window.get_messages_from_javascript = (function() {
            var ρσ_anonfunc = function get_messages_from_javascript() {
                var ρσ_unpack, t;
                ρσ_unpack = [to_python, []];
                t = ρσ_unpack[0];
                to_python = ρσ_unpack[1];
                return JSON.stringify(t);
            };
            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                __module__ : {value: "communicate"}
            });
            return ρσ_anonfunc;
        })();
        window.send_message_to_javascript = (function() {
            var ρσ_anonfunc = function send_message_to_javascript(name, args) {
                from_python[(typeof name === "number" && name < 0) ? from_python.length + name : name].apply(from_python[(typeof name === "number" && name < 0) ? from_python.length + name : name], args);
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["name", "args"]},
                __module__ : {value: "communicate"}
            });
            return ρσ_anonfunc;
        })();
        ρσ_modules.communicate.TITLE_TOKEN = TITLE_TOKEN;
        ρσ_modules.communicate.to_python = to_python;
        ρσ_modules.communicate.from_python = from_python;
        ρσ_modules.communicate.notify_python = notify_python;
        ρσ_modules.communicate.callback = callback;
        ρσ_modules.communicate.js_to_python = js_to_python;
        ρσ_modules.communicate.connect_signal = connect_signal;
    })();

    (function(){
        var __name__ = "utils";
        function all_frames() {
            function* js_generator(doc) {
                var stack, document, win, frame, i;
                stack = [doc || window.document];
                while (stack.length > 0) {
                    document = stack.pop();
                    win = document.defaultView;
                    yield win;
                    for (var ρσ_Index4 = 0; ρσ_Index4 < win.frames.length; ρσ_Index4++) {
                        i = ρσ_Index4;
                        try {
                            frame = (ρσ_expr_temp = win.frames)[(typeof i === "number" && i < 0) ? ρσ_expr_temp.length + i : i];
                            if (frame.document !== document) {
                                stack.push(frame.document);
                            }
                        } catch (ρσ_Exception) {
                            ρσ_last_exception = ρσ_Exception;
                            if (ρσ_Exception instanceof DOMException) {
                                var e = ρσ_Exception;
                            } else {
                                throw ρσ_Exception;
                            }
                        }
                    }
                }
            }
            var result = js_generator.apply(this, arguments);
            result.send = result.next;
            return result;
        };
        if (!all_frames.__argnames__) Object.defineProperties(all_frames, {
            __argnames__ : {value: ["doc"]},
            __module__ : {value: "utils"}
        });

        function is_visible(elem) {
            var win, rect, child, s;
            if (!elem || !elem.ownerDocument) {
                return false;
            }
            win = elem.ownerDocument.defaultView;
            rect = elem.getBoundingClientRect();
            if (!rect || rect.bottom < 0 || rect.top > win.innerHeight || rect.left > win.innerWidth || rect.right < 0) {
                return false;
            }
            if (!rect.width || !rect.height) {
                var ρσ_Iter5 = elem.childNodes;
                ρσ_Iter5 = ((typeof ρσ_Iter5[Symbol.iterator] === "function") ? (ρσ_Iter5 instanceof Map ? ρσ_Iter5.keys() : ρσ_Iter5) : Object.keys(ρσ_Iter5));
                for (var ρσ_Index5 of ρσ_Iter5) {
                    child = ρσ_Index5;
                    if (child.nodeType === child.ELEMENT_NODE && win.getComputedStyle(child).float !== "none" && is_visible(child)) {
                        return true;
                    }
                }
                return false;
            }
            s = win.getComputedStyle(elem);
            if (!s || s.visibility !== "visible" || s.display === "none") {
                return false;
            }
            return true;
        };
        if (!is_visible.__argnames__) Object.defineProperties(is_visible, {
            __argnames__ : {value: ["elem"]},
            __module__ : {value: "utils"}
        });

        function follow_link() {
            var elem = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var mouse_button = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? follow_link.__defaults__.mouse_button : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "mouse_button")){
                mouse_button = ρσ_kwargs_obj.mouse_button;
            }
            var rect, left, top, ρσ_unpack, ev;
            elem.focus();
            rect = elem.getBoundingClientRect();
            left = top = 0;
            if (rect) {
                ρσ_unpack = [rect.left, rect.top];
                left = ρσ_unpack[0];
                top = ρσ_unpack[1];
            }
            ev = new MouseEvent("click", (function(){
                var ρσ_d = {};
                ρσ_d["view"] = elem.ownerDocument.defaultView || window;
                ρσ_d["button"] = mouse_button;
                ρσ_d["screenX"] = left;
                ρσ_d["screenY"] = top;
                ρσ_d["bubbles"] = true;
                ρσ_d["cancelable"] = true;
                return ρσ_d;
            }).call(this));
            elem.dispatchEvent(ev);
        };
        if (!follow_link.__defaults__) Object.defineProperties(follow_link, {
            __defaults__ : {value: {mouse_button:0}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["elem", "mouse_button"]},
            __module__ : {value: "utils"}
        });

        function text_editing_allowed(node) {
            return !node.hasAttribute("readonly") && !node.hasAttribute("disabled");
        };
        if (!text_editing_allowed.__argnames__) Object.defineProperties(text_editing_allowed, {
            __argnames__ : {value: ["node"]},
            __module__ : {value: "utils"}
        });

        function is_content_editable(node) {
            var current, attr;
            current = node;
            while (current) {
                attr = current.getAttribute("contenteditable");
                if (attr !== null) {
                    return ρσ_equals(attr.toLowerCase(), "true");
                }
                current = current.parentElement;
            }
            return false;
        };
        if (!is_content_editable.__argnames__) Object.defineProperties(is_content_editable, {
            __argnames__ : {value: ["node"]},
            __module__ : {value: "utils"}
        });

        function is_text_input_node(node) {
            var name, itype;
            if (node && node.nodeType === Node.ELEMENT_NODE) {
                name = node.nodeName.toUpperCase();
                if (name === "TEXTAREA") {
                    return text_editing_allowed(node);
                }
                if (name === "INPUT") {
                    itype = (node.getAttribute("type") || "").toLowerCase();
                    if (!ρσ_in(itype, (function(){
                        var s = ρσ_set();
                        s.jsset.add("hidden");
                        s.jsset.add("image");
                        s.jsset.add("button");
                        s.jsset.add("reset");
                        s.jsset.add("file");
                        s.jsset.add("reset");
                        s.jsset.add("radio");
                        s.jsset.add("submit");
                        return s;
                    })())) {
                        return text_editing_allowed(node);
                    }
                }
                if (is_content_editable(node)) {
                    return true;
                }
            }
            return false;
        };
        if (!is_text_input_node.__argnames__) Object.defineProperties(is_text_input_node, {
            __argnames__ : {value: ["node"]},
            __module__ : {value: "utils"}
        });

        ρσ_modules.utils.all_frames = all_frames;
        ρσ_modules.utils.is_visible = is_visible;
        ρσ_modules.utils.follow_link = follow_link;
        ρσ_modules.utils.text_editing_allowed = text_editing_allowed;
        ρσ_modules.utils.is_content_editable = is_content_editable;
        ρσ_modules.utils.is_text_input_node = is_text_input_node;
    })();

    (function(){
        var __name__ = "focus";
        var js_to_python = ρσ_modules.communicate.js_to_python;
        var connect_signal = ρσ_modules.communicate.connect_signal;

        var send_action = ρσ_modules.frames.send_action;
        var register_handler = ρσ_modules.frames.register_handler;
        var broadcast_action = ρσ_modules.frames.broadcast_action;
        var frame_iter = ρσ_modules.frames.frame_iter;
        var register_subframe_handler = ρσ_modules.frames.register_subframe_handler;

        var is_text_input_node = ρσ_modules.utils.is_text_input_node;

        function focus_event_received(current_frame_id, source_frame_id, source_frame, is_text_input) {
            js_to_python("element_focused", is_text_input);
        };
        if (!focus_event_received.__argnames__) Object.defineProperties(focus_event_received, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "is_text_input"]},
            __module__ : {value: "focus"}
        });

        function handle_focus_in(ev) {
            send_action(window.top, "focus_event_received", is_text_input_node(document.activeElement));
        };
        if (!handle_focus_in.__argnames__) Object.defineProperties(handle_focus_in, {
            __argnames__ : {value: ["ev"]},
            __module__ : {value: "focus"}
        });

        function handle_focus_out(ev) {
            send_action(window.top, "focus_event_received", false);
        };
        if (!handle_focus_out.__argnames__) Object.defineProperties(handle_focus_out, {
            __argnames__ : {value: ["ev"]},
            __module__ : {value: "focus"}
        });

        function do_exit_text_input() {
            var elem;
            elem = document.activeElement;
            if (elem && is_text_input_node(elem)) {
                elem.blur();
                return true;
            }
            return false;
        };
        if (!do_exit_text_input.__module__) Object.defineProperties(do_exit_text_input, {
            __module__ : {value: "focus"}
        });

        function exit_text_input() {
            if (!do_exit_text_input()) {
                broadcast_action(frame_iter(window.self), "exit_text_input_subframe");
            }
        };
        if (!exit_text_input.__module__) Object.defineProperties(exit_text_input, {
            __module__ : {value: "focus"}
        });

        register_subframe_handler((function() {
            var ρσ_anonfunc = function exit_text_input_subframe(current_frame_id, source_frame_id, source_frame, action, request_id) {
                do_exit_text_input();
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "action", "request_id"]},
                __module__ : {value: "focus"}
            });
            return ρσ_anonfunc;
        })());
        function onload() {
            document.addEventListener("focusin", handle_focus_in, true);
            document.addEventListener("focusout", handle_focus_out, true);
            if (window.self === window.top) {
                register_handler("focus_event_received", focus_event_received);
                connect_signal("exit_text_input", exit_text_input);
            }
            if (is_text_input_node(document.activeElement)) {
                handle_focus_in();
            }
        };
        if (!onload.__module__) Object.defineProperties(onload, {
            __module__ : {value: "focus"}
        });

        ρσ_modules.focus.focus_event_received = focus_event_received;
        ρσ_modules.focus.handle_focus_in = handle_focus_in;
        ρσ_modules.focus.handle_focus_out = handle_focus_out;
        ρσ_modules.focus.do_exit_text_input = do_exit_text_input;
        ρσ_modules.focus.exit_text_input = exit_text_input;
        ρσ_modules.focus.onload = onload;
    })();

    (function(){
        var __name__ = "elementmaker";
        var html_elements, mathml_elements, svg_elements, html5_tags, E;
        html_elements = (function(){
            var s = ρσ_set();
            s.jsset.add("a");
            s.jsset.add("abbr");
            s.jsset.add("acronym");
            s.jsset.add("address");
            s.jsset.add("area");
            s.jsset.add("article");
            s.jsset.add("aside");
            s.jsset.add("audio");
            s.jsset.add("b");
            s.jsset.add("base");
            s.jsset.add("big");
            s.jsset.add("body");
            s.jsset.add("blockquote");
            s.jsset.add("br");
            s.jsset.add("button");
            s.jsset.add("canvas");
            s.jsset.add("caption");
            s.jsset.add("center");
            s.jsset.add("cite");
            s.jsset.add("code");
            s.jsset.add("col");
            s.jsset.add("colgroup");
            s.jsset.add("command");
            s.jsset.add("datagrid");
            s.jsset.add("datalist");
            s.jsset.add("dd");
            s.jsset.add("del");
            s.jsset.add("details");
            s.jsset.add("dfn");
            s.jsset.add("dialog");
            s.jsset.add("dir");
            s.jsset.add("div");
            s.jsset.add("dl");
            s.jsset.add("dt");
            s.jsset.add("em");
            s.jsset.add("event-source");
            s.jsset.add("fieldset");
            s.jsset.add("figcaption");
            s.jsset.add("figure");
            s.jsset.add("footer");
            s.jsset.add("font");
            s.jsset.add("form");
            s.jsset.add("header");
            s.jsset.add("h1");
            s.jsset.add("h2");
            s.jsset.add("h3");
            s.jsset.add("h4");
            s.jsset.add("h5");
            s.jsset.add("h6");
            s.jsset.add("hr");
            s.jsset.add("head");
            s.jsset.add("i");
            s.jsset.add("iframe");
            s.jsset.add("img");
            s.jsset.add("input");
            s.jsset.add("ins");
            s.jsset.add("keygen");
            s.jsset.add("kbd");
            s.jsset.add("label");
            s.jsset.add("legend");
            s.jsset.add("li");
            s.jsset.add("m");
            s.jsset.add("map");
            s.jsset.add("menu");
            s.jsset.add("meter");
            s.jsset.add("multicol");
            s.jsset.add("nav");
            s.jsset.add("nextid");
            s.jsset.add("ol");
            s.jsset.add("output");
            s.jsset.add("optgroup");
            s.jsset.add("option");
            s.jsset.add("p");
            s.jsset.add("pre");
            s.jsset.add("progress");
            s.jsset.add("q");
            s.jsset.add("s");
            s.jsset.add("samp");
            s.jsset.add("script");
            s.jsset.add("section");
            s.jsset.add("select");
            s.jsset.add("small");
            s.jsset.add("sound");
            s.jsset.add("source");
            s.jsset.add("spacer");
            s.jsset.add("span");
            s.jsset.add("strike");
            s.jsset.add("strong");
            s.jsset.add("style");
            s.jsset.add("sub");
            s.jsset.add("sup");
            s.jsset.add("table");
            s.jsset.add("tbody");
            s.jsset.add("td");
            s.jsset.add("textarea");
            s.jsset.add("time");
            s.jsset.add("tfoot");
            s.jsset.add("th");
            s.jsset.add("thead");
            s.jsset.add("tr");
            s.jsset.add("tt");
            s.jsset.add("u");
            s.jsset.add("ul");
            s.jsset.add("var");
            s.jsset.add("video");
            return s;
        })();
        mathml_elements = (function(){
            var s = ρσ_set();
            s.jsset.add("maction");
            s.jsset.add("math");
            s.jsset.add("merror");
            s.jsset.add("mfrac");
            s.jsset.add("mi");
            s.jsset.add("mmultiscripts");
            s.jsset.add("mn");
            s.jsset.add("mo");
            s.jsset.add("mover");
            s.jsset.add("mpadded");
            s.jsset.add("mphantom");
            s.jsset.add("mprescripts");
            s.jsset.add("mroot");
            s.jsset.add("mrow");
            s.jsset.add("mspace");
            s.jsset.add("msqrt");
            s.jsset.add("mstyle");
            s.jsset.add("msub");
            s.jsset.add("msubsup");
            s.jsset.add("msup");
            s.jsset.add("mtable");
            s.jsset.add("mtd");
            s.jsset.add("mtext");
            s.jsset.add("mtr");
            s.jsset.add("munder");
            s.jsset.add("munderover");
            s.jsset.add("none");
            return s;
        })();
        svg_elements = (function(){
            var s = ρσ_set();
            s.jsset.add("a");
            s.jsset.add("animate");
            s.jsset.add("animateColor");
            s.jsset.add("animateMotion");
            s.jsset.add("animateTransform");
            s.jsset.add("clipPath");
            s.jsset.add("circle");
            s.jsset.add("defs");
            s.jsset.add("desc");
            s.jsset.add("ellipse");
            s.jsset.add("font-face");
            s.jsset.add("font-face-name");
            s.jsset.add("font-face-src");
            s.jsset.add("g");
            s.jsset.add("glyph");
            s.jsset.add("hkern");
            s.jsset.add("linearGradient");
            s.jsset.add("line");
            s.jsset.add("marker");
            s.jsset.add("metadata");
            s.jsset.add("missing-glyph");
            s.jsset.add("mpath");
            s.jsset.add("path");
            s.jsset.add("polygon");
            s.jsset.add("polyline");
            s.jsset.add("radialGradient");
            s.jsset.add("rect");
            s.jsset.add("set");
            s.jsset.add("stop");
            s.jsset.add("svg");
            s.jsset.add("switch");
            s.jsset.add("text");
            s.jsset.add("title");
            s.jsset.add("tspan");
            s.jsset.add("use");
            return s;
        })();
        html5_tags = html_elements.union(mathml_elements).union(svg_elements);
        function _makeelement() {
            var tag = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var kwargs = arguments[arguments.length-1];
            if (kwargs === null || typeof kwargs !== "object" || kwargs [ρσ_kwargs_symbol] !== true) kwargs = {};
            var args = Array.prototype.slice.call(arguments, 1);
            if (kwargs !== null && typeof kwargs === "object" && kwargs [ρσ_kwargs_symbol] === true) args.pop();
            var ans, vattr, val, attr, arg;
            ans = this.createElement(tag);
            var ρσ_Iter6 = kwargs;
            ρσ_Iter6 = ((typeof ρσ_Iter6[Symbol.iterator] === "function") ? (ρσ_Iter6 instanceof Map ? ρσ_Iter6.keys() : ρσ_Iter6) : Object.keys(ρσ_Iter6));
            for (var ρσ_Index6 of ρσ_Iter6) {
                attr = ρσ_Index6;
                vattr = str.replace(str.rstrip(attr, "_"), "_", "-");
                val = kwargs[(typeof attr === "number" && attr < 0) ? kwargs.length + attr : attr];
                if (callable(val)) {
                    if (str.startswith(attr, "on")) {
                        attr = attr.slice(2);
                    }
                    ans.addEventListener(attr, val);
                } else if (val === true) {
                    ans.setAttribute(vattr, vattr);
                } else if (typeof val === "string") {
                    ans.setAttribute(vattr, val);
                }
            }
            var ρσ_Iter7 = args;
            ρσ_Iter7 = ((typeof ρσ_Iter7[Symbol.iterator] === "function") ? (ρσ_Iter7 instanceof Map ? ρσ_Iter7.keys() : ρσ_Iter7) : Object.keys(ρσ_Iter7));
            for (var ρσ_Index7 of ρσ_Iter7) {
                arg = ρσ_Index7;
                if (typeof arg === "string") {
                    arg = this.createTextNode(arg);
                }
                ans.appendChild(arg);
            }
            return ans;
        };
        if (!_makeelement.__handles_kwarg_interpolation__) Object.defineProperties(_makeelement, {
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["tag"]},
            __module__ : {value: "elementmaker"}
        });

        function maker_for_document(document) {
            var E;
            E = _makeelement.bind(document);
            Object.defineProperties(E, (function() {
                var ρσ_Iter = html5_tags, ρσ_Result = {}, tag;
                ρσ_Iter = ((typeof ρσ_Iter[Symbol.iterator] === "function") ? (ρσ_Iter instanceof Map ? ρσ_Iter.keys() : ρσ_Iter) : Object.keys(ρσ_Iter));
                for (var ρσ_Index of ρσ_Iter) {
                    tag = ρσ_Index;
                    ρσ_Result[tag] = ((function(){
                        var ρσ_d = {};
                        ρσ_d["value"] = _makeelement.bind(document, tag);
                        return ρσ_d;
                    }).call(this));
                }
                return ρσ_Result;
            })());
            return E;
        };
        if (!maker_for_document.__argnames__) Object.defineProperties(maker_for_document, {
            __argnames__ : {value: ["document"]},
            __module__ : {value: "elementmaker"}
        });

        if (typeof document === "undefined") {
            E = maker_for_document((function(){
                var ρσ_d = {};
                ρσ_d["createTextNode"] = (function() {
                    var ρσ_anonfunc = function (value) {
                        return value;
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["value"]},
                        __module__ : {value: "elementmaker"}
                    });
                    return ρσ_anonfunc;
                })();
                ρσ_d["createElement"] = (function() {
                    var ρσ_anonfunc = function (name) {
                        return (function(){
                            var ρσ_d = {};
                            ρσ_d["name"] = name;
                            ρσ_d["children"] = [];
                            ρσ_d["attributes"] = {};
                            ρσ_d["setAttribute"] = (function() {
                                var ρσ_anonfunc = function (name, val) {
                                    (ρσ_expr_temp = this.attributes)[(typeof name === "number" && name < 0) ? ρσ_expr_temp.length + name : name] = val;
                                };
                                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                                    __argnames__ : {value: ["name", "val"]},
                                    __module__ : {value: "elementmaker"}
                                });
                                return ρσ_anonfunc;
                            })();
                            ρσ_d["appendChild"] = (function() {
                                var ρσ_anonfunc = function (child) {
                                    this.children.push(child);
                                };
                                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                                    __argnames__ : {value: ["child"]},
                                    __module__ : {value: "elementmaker"}
                                });
                                return ρσ_anonfunc;
                            })();
                            return ρσ_d;
                        }).call(this);
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["name"]},
                        __module__ : {value: "elementmaker"}
                    });
                    return ρσ_anonfunc;
                })();
                return ρσ_d;
            }).call(this));
        } else {
            E = maker_for_document(document);
        }
        ρσ_modules.elementmaker.html_elements = html_elements;
        ρσ_modules.elementmaker.mathml_elements = mathml_elements;
        ρσ_modules.elementmaker.svg_elements = svg_elements;
        ρσ_modules.elementmaker.html5_tags = html5_tags;
        ρσ_modules.elementmaker.E = E;
        ρσ_modules.elementmaker._makeelement = _makeelement;
        ρσ_modules.elementmaker.maker_for_document = maker_for_document;
    })();

    (function(){
        var __name__ = "humanize";
        var LABELS;
        function normalize_precision(value, base) {
            value = Math.round(Math.abs(value));
            return (isNaN(value)) ? base : value;
        };
        if (!normalize_precision.__argnames__) Object.defineProperties(normalize_precision, {
            __argnames__ : {value: ["value", "base"]},
            __module__ : {value: "humanize"}
        });

        function to_fixed(value, precision) {
            var power;
            precision = precision || normalize_precision(precision, 0);
            power = Math.pow(10, precision);
            return (Math.round(value * power) / power).toFixed(precision);
        };
        if (!to_fixed.__argnames__) Object.defineProperties(to_fixed, {
            __argnames__ : {value: ["value", "precision"]},
            __module__ : {value: "humanize"}
        });

        function humanize_number(number, precision, thousand, decimal) {
            var use_precision, negative, base, mod;
            precision = precision || 0;
            thousand = thousand || ",";
            decimal = decimal || ".";
            function first_comma(number, position) {
                return (position) ? number.substr(0, position) + thousand : "";
            };
            if (!first_comma.__argnames__) Object.defineProperties(first_comma, {
                __argnames__ : {value: ["number", "position"]},
                __module__ : {value: "humanize"}
            });

            function commas(number, position) {
                return number.substr(position).replace(/(\d{3})(?=\d)/g, "$1" + thousand);
            };
            if (!commas.__argnames__) Object.defineProperties(commas, {
                __argnames__ : {value: ["number", "position"]},
                __module__ : {value: "humanize"}
            });

            function decimals(number, use_precision) {
                return (use_precision) ? decimal + to_fixed(Math.abs(number), use_precision).split(".")[1] : "";
            };
            if (!decimals.__argnames__) Object.defineProperties(decimals, {
                __argnames__ : {value: ["number", "use_precision"]},
                __module__ : {value: "humanize"}
            });

            use_precision = normalize_precision(precision);
            negative = (number < 0) ? "-" : "";
            base = parseInt(to_fixed(Math.abs(number || 0), use_precision), 10) + "";
            mod = (base.length > 3) ? base.length % 3 : 0;
            return negative + first_comma(base, mod) + commas(base, mod) + decimals(number, use_precision);
        };
        if (!humanize_number.__argnames__) Object.defineProperties(humanize_number, {
            __argnames__ : {value: ["number", "precision", "thousand", "decimal"]},
            __module__ : {value: "humanize"}
        });

        LABELS = [ [ "P", Math.pow(2, 50) ], [ "T", Math.pow(2, 40) ], [ "G", 1 << 30 ], [ "M", 1 << 20 ] ];
        function humanize_size(size) {
            var ρσ_unpack, label, minnum;
            var ρσ_Iter8 = LABELS;
            ρσ_Iter8 = ((typeof ρσ_Iter8[Symbol.iterator] === "function") ? (ρσ_Iter8 instanceof Map ? ρσ_Iter8.keys() : ρσ_Iter8) : Object.keys(ρσ_Iter8));
            for (var ρσ_Index8 of ρσ_Iter8) {
                ρσ_unpack = ρσ_Index8;
                label = ρσ_unpack[0];
                minnum = ρσ_unpack[1];
                if (size >= minnum) {
                    return humanize_number(size / minnum, 2, "") + " " + label + "B";
                }
            }
            if (size >= 1024) {
                return humanize_number(size / 1024, 0) + " KB";
            }
            return humanize_number(size, 0) + " B";
        };
        if (!humanize_size.__argnames__) Object.defineProperties(humanize_size, {
            __argnames__ : {value: ["size"]},
            __module__ : {value: "humanize"}
        });

        function relative_time(timestamp) {
            var current_time, time_diff, days2, days29, days60, cur_years, ts_years, cur_months, ts_months, month_diff, year_diff;
            timestamp = timestamp || Date.now();
            current_time = Date.now() / 1e3;
            time_diff = current_time - timestamp / 1e3;
            if (time_diff < 2 && time_diff > -2) {
                return ((time_diff >= 0) ? "just" : "") + "now";
            }
            if (time_diff < 60 && time_diff > -60) {
                return (time_diff >= 0) ? Math.floor(time_diff) + " seconds ago" : "in " + Math.floor(-time_diff) + " seconds";
            }
            if (time_diff < 120 && time_diff > -120) {
                return (time_diff >= 0) ? "about a minute ago" : "in about a minute";
            }
            if (time_diff < 3600 && time_diff > -3600) {
                return (time_diff >= 0) ? Math.floor(time_diff / 60) + " minutes ago" : "in " + Math.floor(-time_diff / 60) + " minutes";
            }
            if (time_diff < 7200 && time_diff > -7200) {
                return (time_diff >= 0) ? "about an hour ago" : "in about an hour";
            }
            if (time_diff < 86400 && time_diff > -86400) {
                return (time_diff >= 0) ? Math.floor(time_diff / 3600) + " hours ago" : "in " + Math.floor(-time_diff / 3600) + " hours";
            }
            days2 = 2 * 86400;
            if (time_diff < days2 && time_diff > -days2) {
                return (time_diff >= 0) ? "1 day ago" : "in 1 day";
            }
            days29 = 29 * 86400;
            if (time_diff < days29 && time_diff > -days29) {
                return (time_diff >= 0) ? Math.floor(time_diff / 86400) + " days ago" : "in " + Math.floor(-time_diff / 86400) + " days";
            }
            days60 = 60 * 86400;
            if (time_diff < days60 && time_diff > -days60) {
                return (time_diff >= 0) ? "about a month ago" : "in about a month";
            }
            cur_years = new Date(current_time * 1e3).getFullYear();
            ts_years = new Date(timestamp).getFullYear();
            cur_months = new Date(current_time * 1e3).getMonth() + 1 + 12 * cur_years;
            ts_months = new Date(timestamp).getMonth() + 1 + 12 * cur_years;
            month_diff = cur_months - ts_months;
            if (month_diff < 12 && month_diff > -12) {
                return (month_diff >= 0) ? month_diff + " months ago" : "in " + -(month_diff) + " months";
            }
            year_diff = cur_years - ts_years;
            if (year_diff < 2 && year_diff > -2) {
                return (year_diff >= 0) ? "a year ago" : "in a year";
            }
            return (year_diff >= 0) ? year_diff + " years ago" : "in " + -(year_diff) + " years";
        };
        if (!relative_time.__argnames__) Object.defineProperties(relative_time, {
            __argnames__ : {value: ["timestamp"]},
            __module__ : {value: "humanize"}
        });

        ρσ_modules.humanize.LABELS = LABELS;
        ρσ_modules.humanize.normalize_precision = normalize_precision;
        ρσ_modules.humanize.to_fixed = to_fixed;
        ρσ_modules.humanize.humanize_number = humanize_number;
        ρσ_modules.humanize.humanize_size = humanize_size;
        ρσ_modules.humanize.relative_time = relative_time;
    })();

    (function(){
        var __name__ = "downloads";
        var CALLBACK_NAME;
        var E = ρσ_modules.elementmaker.E;

        var humanize_size = ρσ_modules.humanize.humanize_size;

        var callback = ρσ_modules.communicate.callback;

        CALLBACK_NAME = "vise_downloads_page";
        function cancel_download(dl_id) {
            callback(CALLBACK_NAME, (function(){
                var ρσ_d = {};
                ρσ_d["id"] = int(dl_id);
                ρσ_d["cmd"] = "cancel";
                return ρσ_d;
            }).call(this));
        };
        if (!cancel_download.__argnames__) Object.defineProperties(cancel_download, {
            __argnames__ : {value: ["dl_id"]},
            __module__ : {value: "downloads"}
        });

        function open_download(dl_id) {
            callback(CALLBACK_NAME, (function(){
                var ρσ_d = {};
                ρσ_d["id"] = int(dl_id);
                ρσ_d["cmd"] = "open";
                return ρσ_d;
            }).call(this));
        };
        if (!open_download.__argnames__) Object.defineProperties(open_download, {
            __argnames__ : {value: ["dl_id"]},
            __module__ : {value: "downloads"}
        });

        function create_download(dl_id, fname, mime_type, icon_url, hostname) {
            var div, stop;
            document.getElementById("init").style.display = "none";
            div = ρσ_interpolate_kwargs.call(E, E.div, [ρσ_interpolate_kwargs.call(E, E.img, [ρσ_desugar_kwargs({src: icon_url, alt: fname, style: "width: 64px; height: 64px; margin-right: 1em; float:left; display:table-cell"})]), ρσ_interpolate_kwargs.call(E, E.div, [E.p(ρσ_interpolate_kwargs.call(E, E.b, [fname].concat([ρσ_desugar_kwargs({id: "fname" + dl_id})])), E.br(), ρσ_interpolate_kwargs.call(E, E.span, ["..."].concat([ρσ_desugar_kwargs({id: "status" + dl_id, style: "color:gray", data_hostname: hostname, data_created: Date.now() + ""})])))].concat([ρσ_desugar_kwargs({style: "float:left; display:table-cell"})])), ρσ_interpolate_kwargs.call(E, E.div, [E.br(), ρσ_interpolate_kwargs.call(E, E.span, ["✖ "].concat([ρσ_desugar_kwargs({class_: "stop", style: "font-size: x-large; cursor:pointer", title: "Stop download"})]))].concat([ρσ_desugar_kwargs({id: "stop" + dl_id, style: "float:right;"})]))].concat([ρσ_desugar_kwargs({style: "padding: 3ex; display: table; width: 90%; border-bottom: solid 1px currentColor"})]));
            document.body.insertBefore(div, document.body.firstChild);
            update_download(dl_id, "running", -1, -1, 0, 0);
            stop = document.getElementById("stop" + dl_id);
            stop.addEventListener("click", (function() {
                var ρσ_anonfunc = function () {
                    cancel_download(dl_id);
                };
                if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                    __module__ : {value: "downloads"}
                });
                return ρσ_anonfunc;
            })());
        };
        if (!create_download.__argnames__) Object.defineProperties(create_download, {
            __argnames__ : {value: ["dl_id", "fname", "mime_type", "icon_url", "hostname"]},
            __module__ : {value: "downloads"}
        });

        function format_time_left(seconds) {
            var secs, mins, hours;
            if (seconds < 60) {
                secs = Math.round(seconds);
                return (secs === 1) ? "in 1 second" : "in " + secs + " seconds";
            }
            mins = Math.floor(seconds / 60);
            secs = Math.round(seconds % 60);
            if (mins < 60) {
                if (secs > 0) {
                    return "in " + mins + ((mins === 1) ? " minute" : " minutes") + " " + secs + ((secs === 1) ? " second" : " seconds");
                }
                return (mins === 1) ? "in 1 minute" : "in " + mins + " minutes";
            }
            hours = Math.floor(seconds / 3600);
            mins = Math.round(seconds % 3600 / 60);
            if (mins > 0) {
                return "in " + hours + ((hours === 1) ? " hour" : " hours") + " " + mins + ((mins === 1) ? " minute" : " minutes");
            }
            return (hours === 1) ? "in 1 hour" : "in " + hours + " hours";
        };
        if (!format_time_left.__argnames__) Object.defineProperties(format_time_left, {
            __argnames__ : {value: ["seconds"]},
            __module__ : {value: "downloads"}
        });

        function update_download(dl_id, state, received, total, rate, avg_rate) {
            var status, h, left, fname, text, stop;
            status = document.getElementById("status" + dl_id);
            h = humanize_size;
            if (state === "running") {
                if (received > -1 && total > -1) {
                    if (rate > 0) {
                        if (total > 0) {
                            left = format_time_left((total - received) / avg_rate);
                            status.innerText = ρσ_interpolate_kwargs.call(str, str.format, ["{recv} of {total} at {rate}/s — Will finish {left}"].concat([ρσ_desugar_kwargs({recv: h(received), total: h(total), rate: h(rate), left: left})]));
                        } else {
                            status.innerText = ρσ_interpolate_kwargs.call(str, str.format, ["{recv} at {rate}/s"].concat([ρσ_desugar_kwargs({recv: h(received), rate: h(rate)})]));
                        }
                    } else {
                        if (total > 0) {
                            left = "Estimating time remaining";
                            status.innerText = ρσ_interpolate_kwargs.call(str, str.format, ["{recv} of {total} — {left}"].concat([ρσ_desugar_kwargs({recv: h(received), total: h(total), left: left})]));
                        } else {
                            status.innerText = h(received);
                        }
                    }
                } else {
                    status.innerText = "Downloading, please wait...";
                }
            } else if (state === "completed") {
                fname = document.getElementById("fname" + dl_id);
                if (fname) {
                    if (!fname.getAttribute("class")) {
                        fname.addEventListener("click", (function() {
                            var ρσ_anonfunc = function () {
                                open_download(dl_id);
                            };
                            if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                                __module__ : {value: "downloads"}
                            });
                            return ρσ_anonfunc;
                        })());
                    }
                    fname.setAttribute("class", "fname");
                    fname.setAttribute("title", "Click to open");
                }
                text = "";
                if (total === 0) {
                    total = received;
                }
                if (total > -1) {
                    text += h(total) + " — ";
                }
                text += status.getAttribute("data-hostname") + " — ";
                text += "Completed";
                if (total > -1) {
                    rate = 1e3 * total / (Date.now() - int(status.getAttribute("data-created")));
                    text += " at " + h(rate) + "/s";
                }
                status.innerText = text;
            } else {
                text = (state === "canceled") ? "Canceled" : "Interrupted";
                text += " — " + status.getAttribute("data-hostname");
                status.innerText = text;
            }
            stop = document.getElementById("stop" + dl_id);
            stop.style.display = (state === "running") ? "block" : "none";
        };
        if (!update_download.__argnames__) Object.defineProperties(update_download, {
            __argnames__ : {value: ["dl_id", "state", "received", "total", "rate", "avg_rate"]},
            __module__ : {value: "downloads"}
        });

        function main() {
            window.create_download = create_download;
            window.update_download = update_download;
            document.getElementsByTagName("style")[0].innerText += "\n    .stop:hover { color: red }\n    .fname { cursor: pointer }\n    .fname:hover { color: red; font-style: italic }\n    ";
            callback(CALLBACK_NAME, (function(){
                var ρσ_d = {};
                ρσ_d["cmd"] = "inited";
                return ρσ_d;
            }).call(this));
        };
        if (!main.__module__) Object.defineProperties(main, {
            __module__ : {value: "downloads"}
        });

        ρσ_modules.downloads.CALLBACK_NAME = CALLBACK_NAME;
        ρσ_modules.downloads.cancel_download = cancel_download;
        ρσ_modules.downloads.open_download = open_download;
        ρσ_modules.downloads.create_download = create_download;
        ρσ_modules.downloads.format_time_left = format_time_left;
        ρσ_modules.downloads.update_download = update_download;
        ρσ_modules.downloads.main = main;
    })();

    (function(){
        var __name__ = "links";
        var is_visible = ρσ_modules.utils.is_visible;

        function iter_links() {
            function* js_generator() {
                var win = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
                var regexps = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? iter_links.__defaults__.regexps : arguments[1];
                var rel = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? iter_links.__defaults__.rel : arguments[2];
                var selector = (arguments[3] === undefined || ( 3 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? iter_links.__defaults__.selector : arguments[3];
                var filter_func = (arguments[4] === undefined || ( 4 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? iter_links.__defaults__.filter_func : arguments[4];
                var ρσ_kwargs_obj = arguments[arguments.length-1];
                if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
                if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "regexps")){
                    regexps = ρσ_kwargs_obj.regexps;
                }
                if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "rel")){
                    rel = ρσ_kwargs_obj.rel;
                }
                if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "selector")){
                    selector = ρσ_kwargs_obj.selector;
                }
                if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "filter_func")){
                    filter_func = ρσ_kwargs_obj.filter_func;
                }
                var pat, matches, child, regexp, elem;
                selector = selector || ":-webkit-any-link, area, button, iframe, input:not([type=hidden]):not([disabled]), label[for], select, textarea, [onclick], [onmouseover], [onmousedown], [onmouseup], [oncommand], [tabindex], [role=link], [role=button], [contenteditable=true]";
                win = win || window;
                if (regexps !== null) {
                    regexps = (function() {
                        var ρσ_Iter = regexps, ρσ_Result = [], pat;
                        ρσ_Iter = ((typeof ρσ_Iter[Symbol.iterator] === "function") ? (ρσ_Iter instanceof Map ? ρσ_Iter.keys() : ρσ_Iter) : Object.keys(ρσ_Iter));
                        for (var ρσ_Index of ρσ_Iter) {
                            pat = ρσ_Index;
                            ρσ_Result.push((typeof pat === "string") ? new RegExp(pat, "i") : pat);
                        }
                        ρσ_Result = ρσ_list_constructor(ρσ_Result);
                        return ρσ_Result;
                    })();
                }
                var ρσ_Iter9 = win.document.querySelectorAll(selector);
                ρσ_Iter9 = ((typeof ρσ_Iter9[Symbol.iterator] === "function") ? (ρσ_Iter9 instanceof Map ? ρσ_Iter9.keys() : ρσ_Iter9) : Object.keys(ρσ_Iter9));
                for (var ρσ_Index9 of ρσ_Iter9) {
                    elem = ρσ_Index9;
                    if (filter_func !== null && !filter_func(elem)) {
                        continue;
                    }
                    matches = false;
                    if (rel !== null && elem.getAttribute("rel") === rel) {
                        matches = true;
                    } else {
                        if (regexps === null) {
                            matches = true;
                        } else {
                            var ρσ_Iter10 = regexps;
                            ρσ_Iter10 = ((typeof ρσ_Iter10[Symbol.iterator] === "function") ? (ρσ_Iter10 instanceof Map ? ρσ_Iter10.keys() : ρσ_Iter10) : Object.keys(ρσ_Iter10));
                            for (var ρσ_Index10 of ρσ_Iter10) {
                                regexp = ρσ_Index10;
                                if (regexp.test(elem.textContent)) {
                                    matches = true;
                                    break;
                                }
                                var ρσ_Iter11 = elem.childNodes;
                                ρσ_Iter11 = ((typeof ρσ_Iter11[Symbol.iterator] === "function") ? (ρσ_Iter11 instanceof Map ? ρσ_Iter11.keys() : ρσ_Iter11) : Object.keys(ρσ_Iter11));
                                for (var ρσ_Index11 of ρσ_Iter11) {
                                    child = ρσ_Index11;
                                    if (regexp.test(child.alt)) {
                                        matches = true;
                                        break;
                                    }
                                }
                                if (matches) {
                                    break;
                                }
                            }
                            if (!matches) {
                                var ρσ_Iter12 = regexps;
                                ρσ_Iter12 = ((typeof ρσ_Iter12[Symbol.iterator] === "function") ? (ρσ_Iter12 instanceof Map ? ρσ_Iter12.keys() : ρσ_Iter12) : Object.keys(ρσ_Iter12));
                                for (var ρσ_Index12 of ρσ_Iter12) {
                                    regexp = ρσ_Index12;
                                    if (regexp.test(elem.title)) {
                                        matches = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (matches) {
                        yield elem;
                    }
                }
            }
            var result = js_generator.apply(this, arguments);
            result.send = result.next;
            return result;
        };
        if (!iter_links.__defaults__) Object.defineProperties(iter_links, {
            __defaults__ : {value: {regexps:null, rel:null, selector:null, filter_func:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["win", "regexps", "rel", "selector", "filter_func"]},
            __module__ : {value: "links"}
        });

        function iter_visible_links() {
            function* js_generator() {
                var win = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
                var regexps = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? iter_visible_links.__defaults__.regexps : arguments[1];
                var rel = (arguments[2] === undefined || ( 2 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? iter_visible_links.__defaults__.rel : arguments[2];
                var selector = (arguments[3] === undefined || ( 3 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? iter_visible_links.__defaults__.selector : arguments[3];
                var ρσ_kwargs_obj = arguments[arguments.length-1];
                if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
                if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "regexps")){
                    regexps = ρσ_kwargs_obj.regexps;
                }
                if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "rel")){
                    rel = ρσ_kwargs_obj.rel;
                }
                if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "selector")){
                    selector = ρσ_kwargs_obj.selector;
                }
                yield* ρσ_interpolate_kwargs.call(this, iter_links, [win].concat([ρσ_desugar_kwargs({regexps: regexps, selector: selector, rel: rel, filter_func: is_visible})]));
            }
            var result = js_generator.apply(this, arguments);
            result.send = result.next;
            return result;
        };
        if (!iter_visible_links.__defaults__) Object.defineProperties(iter_visible_links, {
            __defaults__ : {value: {regexps:null, rel:null, selector:null}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["win", "regexps", "rel", "selector"]},
            __module__ : {value: "links"}
        });

        ρσ_modules.links.iter_links = iter_links;
        ρσ_modules.links.iter_visible_links = iter_visible_links;
    })();

    (function(){
        var __name__ = "follow_next";
        var next_regexps, prev_regexps, request_id, request_serviced, current_follow_next_candidate;
        var connect_signal = ρσ_modules.communicate.connect_signal;

        var frame_iter = ρσ_modules.frames.frame_iter;
        var broadcast_action = ρσ_modules.frames.broadcast_action;
        var send_action = ρσ_modules.frames.send_action;
        var register_handler = ρσ_modules.frames.register_handler;

        var iter_visible_links = ρσ_modules.links.iter_visible_links;

        var follow_link = ρσ_modules.utils.follow_link;
        var is_visible = ρσ_modules.utils.is_visible;

        next_regexps = [ /^\s*Next Page\s*$/i, /^\s*Next [>»]/i, /\bNext\b/i, /^>$/, /^(>>|»)$/, /^(>|»)/, /(>|»)$/, /\bMore\b/i ];
        prev_regexps = [ /^\s*Prev(ious)? Page\s*$/i, /[<«] Prev\s*$/i, /\bprev(ious)?\b/i, /^<$/, /^(<<|«)$/, /^(<|«)/, /(<|«)$/ ];
        request_id = 0;
        request_serviced = false;
        function find_link_in_win(win, forward) {
            var regexps, rel, elem;
            regexps = (forward) ? next_regexps : prev_regexps;
            rel = (forward) ? "next" : "prev";
            var ρσ_Iter13 = iter_visible_links(win, regexps, rel);
            ρσ_Iter13 = ((typeof ρσ_Iter13[Symbol.iterator] === "function") ? (ρσ_Iter13 instanceof Map ? ρσ_Iter13.keys() : ρσ_Iter13) : Object.keys(ρσ_Iter13));
            for (var ρσ_Index13 of ρσ_Iter13) {
                elem = ρσ_Index13;
                return elem;
            }
        };
        if (!find_link_in_win.__argnames__) Object.defineProperties(find_link_in_win, {
            __argnames__ : {value: ["win", "forward"]},
            __module__ : {value: "follow_next"}
        });

        function follow_next(forward) {
            var elem;
            elem = find_link_in_win(window.self, forward);
            if (elem) {
                follow_link(elem);
            } else {
                request_id += 1;
                request_serviced = false;
                broadcast_action(frame_iter(window.self, is_visible), "follow_next_search", request_id, forward);
            }
        };
        if (!follow_next.__argnames__) Object.defineProperties(follow_next, {
            __argnames__ : {value: ["forward"]},
            __module__ : {value: "follow_next"}
        });

        function follow_next_found(current_frame_id, source_frame_id, source_frame, remote_request_id, was_found) {
            var do_it;
            if (!was_found) {
                return;
            }
            do_it = remote_request_id === request_id && !request_serviced;
            send_action(source_frame, "follow_next_execute", remote_request_id, do_it);
            if (do_it) {
                request_serviced = true;
            }
        };
        if (!follow_next_found.__argnames__) Object.defineProperties(follow_next_found, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "remote_request_id", "was_found"]},
            __module__ : {value: "follow_next"}
        });

        current_follow_next_candidate = null;
        function follow_next_search(current_frame_id, source_frame_id, source_frame, request_id, forward) {
            var elem;
            elem = find_link_in_win(window.self, forward);
            if (elem) {
                current_follow_next_candidate = [elem, request_id];
            }
            send_action(source_frame, "follow_next_found", request_id, bool(elem));
        };
        if (!follow_next_search.__argnames__) Object.defineProperties(follow_next_search, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "request_id", "forward"]},
            __module__ : {value: "follow_next"}
        });

        function follow_next_execute(current_frame_id, source_frame_id, source_frame, request_id, do_it) {
            var ρσ_unpack, elem, rid;
            if (current_follow_next_candidate) {
                ρσ_unpack = current_follow_next_candidate;
ρσ_unpack = ρσ_unpack_asarray(2, ρσ_unpack);
                elem = ρσ_unpack[0];
                rid = ρσ_unpack[1];
                current_follow_next_candidate = null;
                if (do_it && rid === request_id) {
                    follow_link(elem);
                }
            }
        };
        if (!follow_next_execute.__argnames__) Object.defineProperties(follow_next_execute, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "request_id", "do_it"]},
            __module__ : {value: "follow_next"}
        });

        function onload() {
            if (window.self === window.top) {
                connect_signal("follow_next", follow_next);
                register_handler("follow_next_found", follow_next_found);
            } else {
                register_handler("follow_next_search", follow_next_search);
                register_handler("follow_next_execute", follow_next_execute);
            }
        };
        if (!onload.__module__) Object.defineProperties(onload, {
            __module__ : {value: "follow_next"}
        });

        ρσ_modules.follow_next.next_regexps = next_regexps;
        ρσ_modules.follow_next.prev_regexps = prev_regexps;
        ρσ_modules.follow_next.request_id = request_id;
        ρσ_modules.follow_next.request_serviced = request_serviced;
        ρσ_modules.follow_next.current_follow_next_candidate = current_follow_next_candidate;
        ρσ_modules.follow_next.find_link_in_win = find_link_in_win;
        ρσ_modules.follow_next.follow_next = follow_next;
        ρσ_modules.follow_next.follow_next_found = follow_next_found;
        ρσ_modules.follow_next.follow_next_search = follow_next_search;
        ρσ_modules.follow_next.follow_next_execute = follow_next_execute;
        ρσ_modules.follow_next.onload = onload;
    })();

    (function(){
        var __name__ = "passwd";
        var input_types, username_names, current_login_form_request_id;
        var send_action = ρσ_modules.frames.send_action;
        var register_handler = ρσ_modules.frames.register_handler;
        var broadcast_action = ρσ_modules.frames.broadcast_action;
        var frame_iter = ρσ_modules.frames.frame_iter;

        var js_to_python = ρσ_modules.communicate.js_to_python;
        var connect_signal = ρσ_modules.communicate.connect_signal;

        input_types = (function(){
            var s = ρσ_set();
            s.jsset.add("text");
            s.jsset.add("email");
            s.jsset.add("tel");
            return s;
        })();
        username_names = (function(){
            var s = ρσ_set();
            s.jsset.add("login");
            s.jsset.add("user");
            s.jsset.add("mail");
            s.jsset.add("email");
            s.jsset.add("username");
            s.jsset.add("id");
            s.jsset.add("identification");
            s.jsset.add("login_email");
            s.jsset.add("login_id");
            s.jsset.add("login_username");
            s.jsset.add("txtUsrName");
            s.jsset.add("acct");
            return s;
        })();
        function password_changed(ev) {
            var pw, pwd;
            pw = ev.currentTarget;
            pwd = pw.value;
            if (pwd) {
                pw.dataset.viseLastPasswordValue = pwd;
            }
        };
        if (!password_changed.__argnames__) Object.defineProperties(password_changed, {
            __argnames__ : {value: ["ev"]},
            __module__ : {value: "passwd"}
        });

        function form_submitted(ev) {
            var form, ρσ_unpack, u, p, username, password;
            form = ev.target;
            ρσ_unpack = get_login_inputs(form);
ρσ_unpack = ρσ_unpack_asarray(2, ρσ_unpack);
            u = ρσ_unpack[0];
            p = ρσ_unpack[1];
            if (u) {
                username = u.value;
            }
            if (p) {
                password = p.dataset.viseLastPasswordValue;
            }
            send_action(window.top, "login_form_submitted", document.location.href, username, password);
        };
        if (!form_submitted.__argnames__) Object.defineProperties(form_submitted, {
            __argnames__ : {value: ["ev"]},
            __module__ : {value: "passwd"}
        });

        function get_login_inputs(form) {
            var username, password, itype, name, inp;
            username = password = null;
            if (form.querySelectorAll) {
                var ρσ_Iter14 = form.querySelectorAll("input");
                ρσ_Iter14 = ((typeof ρσ_Iter14[Symbol.iterator] === "function") ? (ρσ_Iter14 instanceof Map ? ρσ_Iter14.keys() : ρσ_Iter14) : Object.keys(ρσ_Iter14));
                for (var ρσ_Index14 of ρσ_Iter14) {
                    inp = ρσ_Index14;
                    if (username !== null && password !== null) {
                        break;
                    }
                    itype = str.lower(inp.getAttribute("type") || "");
                    if (itype === "password") {
                        password = inp;
                    } else if (ρσ_in(itype, input_types)) {
                        name = str.lower(inp.name || inp.id || "");
                        if (ρσ_in(name, username_names) || str.endswith(name, "_username")) {
                            username = inp;
                        }
                    }
                }
            }
            return [username, password];
        };
        if (!get_login_inputs.__argnames__) Object.defineProperties(get_login_inputs, {
            __argnames__ : {value: ["form"]},
            __module__ : {value: "passwd"}
        });

        function submit_form(form) {
            var buttons, inputs;
            buttons = list(form.querySelectorAll("button[type=submit]"));
            inputs = list(form.querySelectorAll("input[type=submit]"));
            if (buttons.length) {
                buttons[buttons.length-1].click();
            } else if (inputs.length) {
                inputs[inputs.length-1].click();
            } else {
                form.submit();
            }
        };
        if (!submit_form.__argnames__) Object.defineProperties(submit_form, {
            __argnames__ : {value: ["form"]},
            __module__ : {value: "passwd"}
        });

        function is_login_form(form) {
            var ρσ_unpack, un, pw;
            ρσ_unpack = get_login_inputs(form);
ρσ_unpack = ρσ_unpack_asarray(2, ρσ_unpack);
            un = ρσ_unpack[0];
            pw = ρσ_unpack[1];
            return un !== null || pw !== null;
        };
        if (!is_login_form.__argnames__) Object.defineProperties(is_login_form, {
            __argnames__ : {value: ["form"]},
            __module__ : {value: "passwd"}
        });

        function login_form_found(current_frame_id, source_frame_id, source_frame, url) {
            js_to_python("login_form_found_in_page", url);
        };
        if (!login_form_found.__argnames__) Object.defineProperties(login_form_found, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "url"]},
            __module__ : {value: "passwd"}
        });

        function login_form_submitted(current_frame_id, source_frame_id, source_frame, url, username, password) {
            js_to_python("login_form_submitted_in_page", url, username, password);
        };
        if (!login_form_submitted.__argnames__) Object.defineProperties(login_form_submitted, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "url", "username", "password"]},
            __module__ : {value: "passwd"}
        });

        function on_autofill_login_form(url, autosubmit, is_current_form) {
            if (!do_autofill(url, autosubmit, is_current_form)) {
                broadcast_action(frame_iter(window.self), "autofill_login_form", url, autosubmit, is_current_form);
            }
        };
        if (!on_autofill_login_form.__argnames__) Object.defineProperties(on_autofill_login_form, {
            __argnames__ : {value: ["url", "autosubmit", "is_current_form"]},
            __module__ : {value: "passwd"}
        });

        function on_form_field_filled(url, which) {
            if (!do_form_field_filled(url, which)) {
                broadcast_action(frame_iter(window.self), "form_field_filled", url, which);
            }
        };
        if (!on_form_field_filled.__argnames__) Object.defineProperties(on_form_field_filled, {
            __argnames__ : {value: ["url", "which"]},
            __module__ : {value: "passwd"}
        });

        function form_field_filled(current_frame_id, source_frame_id, source_frame, url, which) {
            do_form_field_filled(url, which);
        };
        if (!form_field_filled.__argnames__) Object.defineProperties(form_field_filled, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "url", "which"]},
            __module__ : {value: "passwd"}
        });

        function autofill_login_form(current_frame_id, source_frame_id, source_frame, url, autosubmit, is_current_form) {
            do_autofill(url, autosubmit, is_current_form);
        };
        if (!autofill_login_form.__argnames__) Object.defineProperties(autofill_login_form, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "url", "autosubmit", "is_current_form"]},
            __module__ : {value: "passwd"}
        });

        function request_form_field_fill(which, element, url) {
            var br;
            element.focus();
            element.value = "";
            br = element.getBoundingClientRect();
            send_action(window.top, "request_form_field_fill", url, which, br.left, br.top, br.right, br.bottom);
        };
        if (!request_form_field_fill.__argnames__) Object.defineProperties(request_form_field_fill, {
            __argnames__ : {value: ["which", "element", "url"]},
            __module__ : {value: "passwd"}
        });

        function do_request_form_field_fill(current_frame_id, source_frame_id, source_frame, url, which, left, top, right, bottom) {
            js_to_python("fill_form_field_for", url, which, left, top, right, bottom);
        };
        if (!do_request_form_field_fill.__argnames__) Object.defineProperties(do_request_form_field_fill, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "url", "which", "left", "top", "right", "bottom"]},
            __module__ : {value: "passwd"}
        });

        function do_autofill(url, autosubmit, is_current_form) {
            var candidates, c, form, found_form, ρσ_unpack, un, pw;
            if (url !== document.location.href) {
                return false;
            }
            candidates = [];
            if (is_current_form && document.activeElement && document.activeElement.tagName.toLowerCase() === "input") {
                c = document.activeElement;
                if (c && str.lower(c.tagName) === "input") {
                    while (c.parentNode) {
                        c = c.parentNode;
                        if (str.lower(c.tagName) === "form") {
                            candidates.push(c);
                            break;
                        }
                    }
                }
            } else {
                var ρσ_Iter15 = document.querySelectorAll("form");
                ρσ_Iter15 = ((typeof ρσ_Iter15[Symbol.iterator] === "function") ? (ρσ_Iter15 instanceof Map ? ρσ_Iter15.keys() : ρσ_Iter15) : Object.keys(ρσ_Iter15));
                for (var ρσ_Index15 of ρσ_Iter15) {
                    form = ρσ_Index15;
                    if (is_login_form(form)) {
                        candidates.push(form);
                    }
                }
            }
            if (candidates.length > 0) {
                candidates.sort((function() {
                    var ρσ_anonfunc = function (f1, f2) {
                        return f1.getBoundingClientRect().width - f2.getBoundingClientRect().width;
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["f1", "f2"]},
                        __module__ : {value: "passwd"}
                    });
                    return ρσ_anonfunc;
                })());
                found_form = candidates[candidates.length-1];
                found_form.dataset.viseAutosubmit = (autosubmit) ? "1" : "0";
                ρσ_unpack = get_login_inputs(found_form);
ρσ_unpack = ρσ_unpack_asarray(2, ρσ_unpack);
                un = ρσ_unpack[0];
                pw = ρσ_unpack[1];
                if (un !== null && un.dataset.viseFilled !== "1") {
                    un.dataset.viseFilled = "1";
                    request_form_field_fill("username", un, url);
                } else if (pw) {
                    request_form_field_fill("password", pw, url);
                }
                return true;
            }
            return false;
        };
        if (!do_autofill.__argnames__) Object.defineProperties(do_autofill, {
            __argnames__ : {value: ["url", "autosubmit", "is_current_form"]},
            __module__ : {value: "passwd"}
        });

        function do_form_field_filled(url, which) {
            var form, c, pw;
            form = null;
            c = document.activeElement;
            if (c && str.lower(c.tagName) === "input") {
                while (c.parentNode) {
                    c = c.parentNode;
                    if (str.lower(c.tagName) === "form") {
                        form = c;
                        break;
                    }
                }
            }
            if (!form) {
                return;
            }
            if (which === "username") {
                pw = get_login_inputs(form)[1];
                if (pw !== null && !pw.dataset.viseFilled) {
                    pw.dataset.viseFilled = "1";
                    request_form_field_fill("password", pw, url);
                } else {
                    do_form_field_filled(url, "password");
                }
            } else if (which === "password") {
                if (form.dataset.viseAutosubmit === "1" && form.getBoundingClientRect().width > 0) {
                    submit_form(form);
                }
            }
        };
        if (!do_form_field_filled.__argnames__) Object.defineProperties(do_form_field_filled, {
            __argnames__ : {value: ["url", "which"]},
            __module__ : {value: "passwd"}
        });

        current_login_form_request_id = 0;
        function on_get_url_for_current_login_form() {
            current_login_form_request_id += 1;
            if (document.activeElement && str.lower(document.activeElement.tagName) === "input") {
                send_action(window.top, "send_url_for_current_login_form", current_login_form_request_id, document.location.href);
            } else {
                broadcast_action(frame_iter(window.self), "get_url_for_current_login_form_in_subframe", current_login_form_request_id);
            }
        };
        if (!on_get_url_for_current_login_form.__module__) Object.defineProperties(on_get_url_for_current_login_form, {
            __module__ : {value: "passwd"}
        });

        function get_url_for_current_login_form_in_subframe(current_frame_id, source_frame_id, source_frame, request_id) {
            if (document.activeElement && document.activeElement.tagName.toLowerCase() === "input") {
                send_action(window.top, "send_url_for_current_login_form", request_id, document.location.href);
            }
        };
        if (!get_url_for_current_login_form_in_subframe.__argnames__) Object.defineProperties(get_url_for_current_login_form_in_subframe, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "request_id"]},
            __module__ : {value: "passwd"}
        });

        function send_url_for_current_login_form(current_frame_id, source_frame_id, source_frame, request_id, url) {
            if (request_id === current_login_form_request_id) {
                current_login_form_request_id += 1;
                js_to_python("url_for_current_login_form", url);
            }
        };
        if (!send_url_for_current_login_form.__argnames__) Object.defineProperties(send_url_for_current_login_form, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "request_id", "url"]},
            __module__ : {value: "passwd"}
        });

        function form_focused(evt) {
            if (evt.target.dataset.viseFormAutofilled === "1") {
                return;
            }
            evt.target.dataset.viseFormAutofilled = "1";
            window.setTimeout(send_action.bind(null, window.top, "login_form_found", document.location.href), 10);
        };
        if (!form_focused.__argnames__) Object.defineProperties(form_focused, {
            __argnames__ : {value: ["evt"]},
            __module__ : {value: "passwd"}
        });

        function setup_login_forms() {
            var pw, form;
            var ρσ_Iter16 = document.querySelectorAll("form");
            ρσ_Iter16 = ((typeof ρσ_Iter16[Symbol.iterator] === "function") ? (ρσ_Iter16 instanceof Map ? ρσ_Iter16.keys() : ρσ_Iter16) : Object.keys(ρσ_Iter16));
            for (var ρσ_Index16 of ρσ_Iter16) {
                form = ρσ_Index16;
                if (is_login_form(form)) {
                    pw = get_login_inputs(form)[1];
                    if (pw) {
                        pw.addEventListener("input", password_changed, true);
                    }
                    form.addEventListener("submit", form_submitted, true);
                    form.addEventListener("focus", form_focused, true);
                }
            }
        };
        if (!setup_login_forms.__module__) Object.defineProperties(setup_login_forms, {
            __module__ : {value: "passwd"}
        });

        function onload() {
            if (window === window.top) {
                register_handler("login_form_found", login_form_found);
                register_handler("login_form_submitted", login_form_submitted);
                register_handler("send_url_for_current_login_form", send_url_for_current_login_form);
                register_handler("request_form_field_fill", do_request_form_field_fill);
                connect_signal("autofill_login_form", on_autofill_login_form);
                connect_signal("form_field_filled", on_form_field_filled);
                connect_signal("get_url_for_current_login_form", on_get_url_for_current_login_form);
            } else {
                register_handler("autofill_login_form", autofill_login_form);
                register_handler("form_field_filled", form_field_filled);
                register_handler("get_url_for_current_login_form_in_subframe", get_url_for_current_login_form_in_subframe);
            }
            setup_login_forms();
        };
        if (!onload.__module__) Object.defineProperties(onload, {
            __module__ : {value: "passwd"}
        });

        ρσ_modules.passwd.input_types = input_types;
        ρσ_modules.passwd.username_names = username_names;
        ρσ_modules.passwd.current_login_form_request_id = current_login_form_request_id;
        ρσ_modules.passwd.password_changed = password_changed;
        ρσ_modules.passwd.form_submitted = form_submitted;
        ρσ_modules.passwd.get_login_inputs = get_login_inputs;
        ρσ_modules.passwd.submit_form = submit_form;
        ρσ_modules.passwd.is_login_form = is_login_form;
        ρσ_modules.passwd.login_form_found = login_form_found;
        ρσ_modules.passwd.login_form_submitted = login_form_submitted;
        ρσ_modules.passwd.on_autofill_login_form = on_autofill_login_form;
        ρσ_modules.passwd.on_form_field_filled = on_form_field_filled;
        ρσ_modules.passwd.form_field_filled = form_field_filled;
        ρσ_modules.passwd.autofill_login_form = autofill_login_form;
        ρσ_modules.passwd.request_form_field_fill = request_form_field_fill;
        ρσ_modules.passwd.do_request_form_field_fill = do_request_form_field_fill;
        ρσ_modules.passwd.do_autofill = do_autofill;
        ρσ_modules.passwd.do_form_field_filled = do_form_field_filled;
        ρσ_modules.passwd.on_get_url_for_current_login_form = on_get_url_for_current_login_form;
        ρσ_modules.passwd.get_url_for_current_login_form_in_subframe = get_url_for_current_login_form_in_subframe;
        ρσ_modules.passwd.send_url_for_current_login_form = send_url_for_current_login_form;
        ρσ_modules.passwd.form_focused = form_focused;
        ρσ_modules.passwd.setup_login_forms = setup_login_forms;
        ρσ_modules.passwd.onload = onload;
    })();

    (function(){
        var __name__ = "hints";
        var REPLACED_ELEM_TAG, ATTR, current_request;
        var connect_signal = ρσ_modules.communicate.connect_signal;
        var js_to_python = ρσ_modules.communicate.js_to_python;

        var E = ρσ_modules.elementmaker.E;

        var is_visible = ρσ_modules.utils.is_visible;

        var broadcast_action = ρσ_modules.frames.broadcast_action;
        var send_action = ρσ_modules.frames.send_action;
        var register_subframe_handler = ρσ_modules.frames.register_subframe_handler;
        var register_top_handler = ρσ_modules.frames.register_top_handler;
        var frame_iter = ρσ_modules.frames.frame_iter;

        REPLACED_ELEM_TAG = "vise-replaced-elem-hint";
        ATTR = "data-vise-hint";
        current_request = (function(){
            var ρσ_d = Object.create(null);
            ρσ_d["id"] = 0;
            ρσ_d["accumulated_keypresses"] = [];
            return ρσ_d;
        }).call(this);
        function start_follow_link(action) {
            var frames, has_frames;
            frames = list(frame_iter(window.top, is_visible));
            current_request.num_left = frames.length;
            current_request.action = action;
            current_request.id += 1;
            current_request.hint_groups = [];
            current_request.accumulated_keypresses = [];
            current_request.marking_done = false;
            has_frames = current_request.num_left > 0;
            if (has_frames) {
                broadcast_action(frames, "find_hints", current_request.action, current_request.id);
            }
            current_request.hint_groups.push(mark_visible_hints(current_request.action));
            if (!has_frames) {
                assign_hints();
            }
        };
        if (!start_follow_link.__argnames__) Object.defineProperties(start_follow_link, {
            __argnames__ : {value: ["action"]},
            __module__ : {value: "hints"}
        });

        register_subframe_handler((function() {
            var ρσ_anonfunc = function find_hints(current_frame_id, source_frame_id, source_frame, action, request_id) {
                var hints;
                hints = mark_visible_hints(action, current_frame_id);
                send_action(source_frame, "report_marked_hints", request_id, hints);
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "action", "request_id"]},
                __module__ : {value: "hints"}
            });
            return ρσ_anonfunc;
        })());
        register_top_handler((function() {
            var ρσ_anonfunc = function report_marked_hints(current_frame_id, source_frame_id, source_frame, request_id, hints) {
                if (request_id !== current_request.id) {
                    return;
                }
                current_request.num_left -= 1;
                current_request.hint_groups.push(hints);
                if (current_request.num_left < 1) {
                    assign_hints();
                }
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "request_id", "hints"]},
                __module__ : {value: "hints"}
            });
            return ρσ_anonfunc;
        })());
        function add_hint_markup(elem, i) {
            var tname, e;
            tname = elem.tagName.toLowerCase();
            if (tname === "input" || tname === "textarea") {
                e = document.createElement(REPLACED_ELEM_TAG);
                elem.parentNode.insertBefore(e, elem);
                elem = e;
            }
            elem.setAttribute(ATTR, i);
        };
        if (!add_hint_markup.__argnames__) Object.defineProperties(add_hint_markup, {
            __argnames__ : {value: ["elem", "i"]},
            __module__ : {value: "hints"}
        });

        function remove_hint_markup(elem) {
            var tname, ps;
            tname = elem.tagName.toLowerCase();
            if (tname === "input" || tname === "textarea") {
                ps = ρσ_exists.d(elem.previousSibling).tagName;
                if (ps && ps.toLowerCase() === REPLACED_ELEM_TAG) {
                    elem.previousSibling.parentNode.removeChild(elem.previousSibling);
                }
            } else {
                elem.removeAttribute(ATTR);
                if (elem.tagName.toLowerCase() === REPLACED_ELEM_TAG) {
                    elem.parentNode.removeChild(elem);
                }
            }
        };
        if (!remove_hint_markup.__argnames__) Object.defineProperties(remove_hint_markup, {
            __argnames__ : {value: ["elem"]},
            __module__ : {value: "hints"}
        });

        function mark_visible_hints() {
            var action = ( 0 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true) ? undefined : arguments[0];
            var frame_id = (arguments[1] === undefined || ( 1 === arguments.length-1 && arguments[arguments.length-1] !== null && typeof arguments[arguments.length-1] === "object" && arguments[arguments.length-1] [ρσ_kwargs_symbol] === true)) ? mark_visible_hints.__defaults__.frame_id : arguments[1];
            var ρσ_kwargs_obj = arguments[arguments.length-1];
            if (ρσ_kwargs_obj === null || typeof ρσ_kwargs_obj !== "object" || ρσ_kwargs_obj [ρσ_kwargs_symbol] !== true) ρσ_kwargs_obj = {};
            if (Object.prototype.hasOwnProperty.call(ρσ_kwargs_obj, "frame_id")){
                frame_id = ρσ_kwargs_obj.frame_id;
            }
            var hints, sel, all_elems, br, vis, ρσ_unpack, i, elem;
            hints = [];
            sel = "a[href], button, input:not([type=hidden]):not([disabled]), select, textarea, [onclick], [onmousedown], [onmouseup], [oncommand], [tabindex], [role=button], [role=link], [role=menuitem], [role=menuitemradio], [role=menuitemcheckbox], [role=tab], [role=treeitem], [role=checkbox], [role=radio], [contenteditable=true]";
            if (action === "copy") {
                sel = "a[href]";
            }
            all_elems = document.querySelectorAll(sel);
            var ρσ_Iter17 = enumerate(all_elems);
            ρσ_Iter17 = ((typeof ρσ_Iter17[Symbol.iterator] === "function") ? (ρσ_Iter17 instanceof Map ? ρσ_Iter17.keys() : ρσ_Iter17) : Object.keys(ρσ_Iter17));
            for (var ρσ_Index17 of ρσ_Iter17) {
                ρσ_unpack = ρσ_Index17;
                i = ρσ_unpack[0];
                elem = ρσ_unpack[1];
                br = elem.getBoundingClientRect();
                vis = is_visible(elem);
                if (vis) {
                    add_hint_markup(elem, i);
                    hints.push((function(){
                        var ρσ_d = Object.create(null);
                        ρσ_d["frame_id"] = frame_id;
                        ρσ_d["num"] = i;
                        ρσ_d["left"] = br.left;
                        ρσ_d["top"] = br.top;
                        return ρσ_d;
                    }).call(this));
                } else {
                    remove_hint_markup(elem);
                }
            }
            return hints;
        };
        if (!mark_visible_hints.__defaults__) Object.defineProperties(mark_visible_hints, {
            __defaults__ : {value: {frame_id:0}},
            __handles_kwarg_interpolation__ : {value: true},
            __argnames__ : {value: ["action", "frame_id"]},
            __module__ : {value: "hints"}
        });

        function assign_hints() {
            var all_hints, hg, hint_groups, i, fid, ρσ_unpack, hint, frame_id, text;
            all_hints = [];
            var ρσ_Iter18 = current_request.hint_groups;
            ρσ_Iter18 = ((typeof ρσ_Iter18[Symbol.iterator] === "function") ? (ρσ_Iter18 instanceof Map ? ρσ_Iter18.keys() : ρσ_Iter18) : Object.keys(ρσ_Iter18));
            for (var ρσ_Index18 of ρσ_Iter18) {
                hg = ρσ_Index18;
                all_hints = all_hints.concat(hg);
            }
            hint_groups = Object.create(null);
            current_request.all_hints = ρσ_interpolate_kwargs.call(this, sorted, [all_hints].concat([ρσ_desugar_kwargs({key: (function() {
                var ρσ_anonfunc = function (h) {
                    [h.y, h.x];
                };
                if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                    __argnames__ : {value: ["h"]},
                    __module__ : {value: "hints"}
                });
                return ρσ_anonfunc;
            })()})]));
            var ρσ_Iter19 = enumerate(current_request.all_hints);
            ρσ_Iter19 = ((typeof ρσ_Iter19[Symbol.iterator] === "function") ? (ρσ_Iter19 instanceof Map ? ρσ_Iter19.keys() : ρσ_Iter19) : Object.keys(ρσ_Iter19));
            for (var ρσ_Index19 of ρσ_Iter19) {
                ρσ_unpack = ρσ_Index19;
                i = ρσ_unpack[0];
                hint = ρσ_unpack[1];
                i = i.toString(36).toLowerCase();
                fid = hint.frame_id;
                if (!hint_groups[(typeof fid === "number" && fid < 0) ? hint_groups.length + fid : fid]) {
                    hint_groups[(typeof fid === "number" && fid < 0) ? hint_groups.length + fid : fid] = Object.create(null);
                }
                (ρσ_expr_temp = hint_groups[(typeof fid === "number" && fid < 0) ? hint_groups.length + fid : fid])[ρσ_bound_index(hint.num, ρσ_expr_temp)] = hint.num = hint.text_left = i;
            }
            var ρσ_Iter20 = hint_groups;
            ρσ_Iter20 = ((typeof ρσ_Iter20[Symbol.iterator] === "function") ? (ρσ_Iter20 instanceof Map ? ρσ_Iter20.keys() : ρσ_Iter20) : Object.keys(ρσ_Iter20));
            for (var ρσ_Index20 of ρσ_Iter20) {
                frame_id = ρσ_Index20;
                frame_id = int(frame_id);
                if (frame_id === 0) {
                    update_hint_numbers(hint_groups[(typeof frame_id === "number" && frame_id < 0) ? hint_groups.length + frame_id : frame_id]);
                } else {
                    send_action(frame_id, "hints_assigned", hint_groups[(typeof frame_id === "number" && frame_id < 0) ? hint_groups.length + frame_id : frame_id]);
                }
            }
            current_request.marking_done = true;
            var ρσ_Iter21 = current_request.accumulated_keypresses;
            ρσ_Iter21 = ((typeof ρσ_Iter21[Symbol.iterator] === "function") ? (ρσ_Iter21 instanceof Map ? ρσ_Iter21.keys() : ρσ_Iter21) : Object.keys(ρσ_Iter21));
            for (var ρσ_Index21 of ρσ_Iter21) {
                text = ρσ_Index21;
                follow_link(text);
            }
        };
        if (!assign_hints.__module__) Object.defineProperties(assign_hints, {
            __module__ : {value: "hints"}
        });

        function update_hint_numbers(hint_map) {
            var newnum, elem;
            var ρσ_Iter22 = document.querySelectorAll("[" + ATTR + "]");
            ρσ_Iter22 = ((typeof ρσ_Iter22[Symbol.iterator] === "function") ? (ρσ_Iter22 instanceof Map ? ρσ_Iter22.keys() : ρσ_Iter22) : Object.keys(ρσ_Iter22));
            for (var ρσ_Index22 of ρσ_Iter22) {
                elem = ρσ_Index22;
                newnum = hint_map[ρσ_bound_index(elem.getAttribute(ATTR), hint_map)];
                if ((typeof newnum !== "undefined" && newnum !== null)) {
                    elem.setAttribute(ATTR, newnum);
                } else {
                    remove_hint_markup(elem);
                }
            }
        };
        if (!update_hint_numbers.__argnames__) Object.defineProperties(update_hint_numbers, {
            __argnames__ : {value: ["hint_map"]},
            __module__ : {value: "hints"}
        });

        register_subframe_handler((function() {
            var ρσ_anonfunc = function hints_assigned(current_frame_id, source_frame_id, source_frame, hints) {
                update_hint_numbers(hints);
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "hints"]},
                __module__ : {value: "hints"}
            });
            return ρσ_anonfunc;
        })());
        function follow_link(text) {
            var predicate, hint_groups, all_hints, fid, ρσ_unpack, i, hint, frame_id;
            if (!current_request.marking_done) {
                current_request.accumulated_keypresses.push(text);
                return;
            }
            text = text.toLowerCase();
            if (text === "|escape") {
                predicate = (function() {
                    var ρσ_anonfunc = function () {
                        return false;
                    };
                    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                        __module__ : {value: "hints"}
                    });
                    return ρσ_anonfunc;
                })();
            } else if (text === "|enter") {
                predicate = (function() {
                    var ρσ_anonfunc = function (hint) {
                        return hint === current_request.all_hints[0];
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["hint"]},
                        __module__ : {value: "hints"}
                    });
                    return ρσ_anonfunc;
                })();
            } else {
                predicate = (function() {
                    var ρσ_anonfunc = function (hint) {
                        if (hint.text_left.startsWith(text)) {
                            hint.text_left = hint.text_left.slice(text.length);
                            return true;
                        }
                        return false;
                    };
                    if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                        __argnames__ : {value: ["hint"]},
                        __module__ : {value: "hints"}
                    });
                    return ρσ_anonfunc;
                })();
            }
            hint_groups = Object.create(null);
            all_hints = [];
            var ρσ_Iter23 = enumerate(current_request.all_hints);
            ρσ_Iter23 = ((typeof ρσ_Iter23[Symbol.iterator] === "function") ? (ρσ_Iter23 instanceof Map ? ρσ_Iter23.keys() : ρσ_Iter23) : Object.keys(ρσ_Iter23));
            for (var ρσ_Index23 of ρσ_Iter23) {
                ρσ_unpack = ρσ_Index23;
                i = ρσ_unpack[0];
                hint = ρσ_unpack[1];
                if (predicate(hint)) {
                    hint.matched = true;
                    all_hints.push(hint);
                } else {
                    hint.matched = false;
                }
                fid = hint.frame_id;
                if (!hint_groups[(typeof fid === "number" && fid < 0) ? hint_groups.length + fid : fid]) {
                    hint_groups[(typeof fid === "number" && fid < 0) ? hint_groups.length + fid : fid] = [];
                }
                hint_groups[(typeof fid === "number" && fid < 0) ? hint_groups.length + fid : fid].push(hint);
            }
            if (!all_hints.length) {
                js_to_python("link_followed", false, text);
                if (text !== "|escape") {
                    return;
                }
            }
            if ((all_hints.length === 1 || typeof all_hints.length === "object" && ρσ_equals(all_hints.length, 1))) {
                js_to_python("link_followed", true, text);
            }
            var ρσ_Iter24 = hint_groups;
            ρσ_Iter24 = ((typeof ρσ_Iter24[Symbol.iterator] === "function") ? (ρσ_Iter24 instanceof Map ? ρσ_Iter24.keys() : ρσ_Iter24) : Object.keys(ρσ_Iter24));
            for (var ρσ_Index24 of ρσ_Iter24) {
                frame_id = ρσ_Index24;
                frame_id = int(frame_id);
                if (frame_id === 0) {
                    update_filtered_hints(hint_groups[(typeof frame_id === "number" && frame_id < 0) ? hint_groups.length + frame_id : frame_id], all_hints.length === 1);
                } else {
                    send_action(frame_id, "hints_filtered", hint_groups[(typeof frame_id === "number" && frame_id < 0) ? hint_groups.length + frame_id : frame_id], all_hints.length === 1);
                }
            }
            var ρσ_Iter25 = all_hints;
            ρσ_Iter25 = ((typeof ρσ_Iter25[Symbol.iterator] === "function") ? (ρσ_Iter25 instanceof Map ? ρσ_Iter25.keys() : ρσ_Iter25) : Object.keys(ρσ_Iter25));
            for (var ρσ_Index25 of ρσ_Iter25) {
                hint = ρσ_Index25;
                hint.num = hint.text_left;
            }
            current_request.all_hints = all_hints;
        };
        if (!follow_link.__argnames__) Object.defineProperties(follow_link, {
            __argnames__ : {value: ["text"]},
            __module__ : {value: "hints"}
        });

        function update_filtered_hints(hints, found_target) {
            var elem_map, e, target_elem, elem, hint;
            elem_map = (function() {
                var ρσ_Iter = document.querySelectorAll("[" + ATTR + "]"), ρσ_Result = Object.create(null), e;
                ρσ_Iter = ((typeof ρσ_Iter[Symbol.iterator] === "function") ? (ρσ_Iter instanceof Map ? ρσ_Iter.keys() : ρσ_Iter) : Object.keys(ρσ_Iter));
                for (var ρσ_Index of ρσ_Iter) {
                    e = ρσ_Index;
                    ρσ_Result[e.getAttribute(ATTR)] = (e);
                }
                return ρσ_Result;
            })();
            target_elem = null;
            var ρσ_Iter26 = hints;
            ρσ_Iter26 = ((typeof ρσ_Iter26[Symbol.iterator] === "function") ? (ρσ_Iter26 instanceof Map ? ρσ_Iter26.keys() : ρσ_Iter26) : Object.keys(ρσ_Iter26));
            for (var ρσ_Index26 of ρσ_Iter26) {
                hint = ρσ_Index26;
                elem = elem_map[ρσ_bound_index(hint.num, elem_map)];
                if (elem) {
                    if (hint.matched) {
                        elem.setAttribute(ATTR, hint.text_left);
                        if (found_target) {
                            target_elem = elem;
                        }
                    } else {
                        remove_hint_markup(elem);
                    }
                }
            }
            if (target_elem !== null) {
                if (target_elem.tagName.toLowerCase() === REPLACED_ELEM_TAG) {
                    target_elem = target_elem.nextSibling;
                }
                remove_hint_markup(target_elem);
                activate_elem(target_elem);
            }
        };
        if (!update_filtered_hints.__argnames__) Object.defineProperties(update_filtered_hints, {
            __argnames__ : {value: ["hints", "found_target"]},
            __module__ : {value: "hints"}
        });

        function animate_click(elem) {
            var action;
            elem.classList.add("vise-animate-click");
            action = current_request.action;
            if (action !== "sametab" && action !== "copy") {
                js_to_python("middle_click_soon");
            }
            window.setTimeout((function() {
                var ρσ_anonfunc = function () {
                    var mc;
                    elem.classList.remove("vise-animate-click");
                    if (action === "sametab") {
                        elem.click();
                    } else if (action === "copy") {
                        js_to_python("copy_to_clipboard", elem.href);
                    } else {
                        mc = new MouseEvent("click", (function(){
                            var ρσ_d = Object.create(null);
                            ρσ_d["button"] = 1;
                            ρσ_d["buttons"] = 4;
                            return ρσ_d;
                        }).call(this));
                        elem.dispatchEvent(mc);
                    }
                };
                if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                    __module__ : {value: "hints"}
                });
                return ρσ_anonfunc;
            })(), 300);
        };
        if (!animate_click.__argnames__) Object.defineProperties(animate_click, {
            __argnames__ : {value: ["elem"]},
            __module__ : {value: "hints"}
        });

        function activate_elem(elem) {
            var tname;
            tname = elem.tagName.toLowerCase();
            if (tname === "a" || tname === "button") {
                if (tname === "a") {
                    animate_click(elem);
                } else {
                    elem.click();
                }
            } else {
                elem.focus();
            }
        };
        if (!activate_elem.__argnames__) Object.defineProperties(activate_elem, {
            __argnames__ : {value: ["elem"]},
            __module__ : {value: "hints"}
        });

        register_subframe_handler((function() {
            var ρσ_anonfunc = function hints_filtered(current_frame_id, source_frame_id, source_frame, hints, found_target) {
                update_filtered_hints(hints, found_target);
            };
            if (!ρσ_anonfunc.__argnames__) Object.defineProperties(ρσ_anonfunc, {
                __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "hints", "found_target"]},
                __module__ : {value: "hints"}
            });
            return ρσ_anonfunc;
        })());
        function onload() {
            if (!document.body) {
                return;
            }
            document.body.appendChild(E.style("\n    [ATTRN]:before {\n        content: attr(ATTRN);\n        text-decoration: none !important;\n        display: inline-block !important;\n        font-family: monospace;\n        font-weight: bold !important;\n        color: HINT_FOREGROUND !important;\n        background: HINT_BACKGROUND !important;\n        font-size: HINT_FONT_SIZEpx !important;\n        cursor: default !important;\n        padding: 1px !important;\n        border: solid 1px currentColor !important;\n        position: absolute !important;\n        z-index: 9999999 !important;\n    }\n\n    [ATTRN='']:before {\n        content: \" \";\n        background: SELECTED_HINT_BACKGROUND !important;\n    }\n\n    a.vise-animate-click {\n        display: inline-block;\n        transform: scale(2);\n    }\n\n    ".replace(/ATTRN/g, ATTR)));
            if (window.self === window.top) {
                connect_signal("start_follow_link", start_follow_link);
                connect_signal("follow_link", follow_link);
            }
        };
        if (!onload.__module__) Object.defineProperties(onload, {
            __module__ : {value: "hints"}
        });

        ρσ_modules.hints.REPLACED_ELEM_TAG = REPLACED_ELEM_TAG;
        ρσ_modules.hints.ATTR = ATTR;
        ρσ_modules.hints.current_request = current_request;
        ρσ_modules.hints.start_follow_link = start_follow_link;
        ρσ_modules.hints.add_hint_markup = add_hint_markup;
        ρσ_modules.hints.remove_hint_markup = remove_hint_markup;
        ρσ_modules.hints.mark_visible_hints = mark_visible_hints;
        ρσ_modules.hints.assign_hints = assign_hints;
        ρσ_modules.hints.update_hint_numbers = update_hint_numbers;
        ρσ_modules.hints.follow_link = follow_link;
        ρσ_modules.hints.update_filtered_hints = update_filtered_hints;
        ρσ_modules.hints.animate_click = animate_click;
        ρσ_modules.hints.activate_elem = activate_elem;
        ρσ_modules.hints.onload = onload;
    })();

    (function(){
        var __name__ = "edit";
        var edit_counter;
        var connect_signal = ρσ_modules.communicate.connect_signal;
        var js_to_python = ρσ_modules.communicate.js_to_python;

        var send_action = ρσ_modules.frames.send_action;
        var register_handler = ρσ_modules.frames.register_handler;
        var frame_for_id = ρσ_modules.frames.frame_for_id;

        var is_text_input_node = ρσ_modules.utils.is_text_input_node;
        var text_editing_allowed = ρσ_modules.utils.text_editing_allowed;

        edit_counter = 0;
        function export_edit_text_to_qt(current_frame_id, source_frame_id, source_frame, text, node_id) {
            js_to_python("edit_text", text, source_frame_id, node_id);
        };
        if (!export_edit_text_to_qt.__argnames__) Object.defineProperties(export_edit_text_to_qt, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "text", "node_id"]},
            __module__ : {value: "edit"}
        });

        function find_editable_text(current_frame_id, source_frame_id, source_frame) {
            var elem, text;
            elem = document.activeElement;
            if (elem.contentWindow) {
                send_action(elem.contentWindow, "find_editable_text");
            } else if (is_text_input_node(elem) && text_editing_allowed(elem)) {
                text = elem.value;
                edit_counter += 1;
                elem.setAttribute("data-vise-edit-text", edit_counter + "");
                send_action(window.top, "export_edit_text_to_qt", text || "", edit_counter + "");
            }
        };
        if (!find_editable_text.__argnames__) Object.defineProperties(find_editable_text, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame"]},
            __module__ : {value: "edit"}
        });

        function set_editable_text(text, frame_id, eid) {
            var win;
            win = frame_for_id(frame_id);
            if (!win) {
                console.error("Cannot set editable text, frame with id: " + frame_id + " no longer exists");
                return;
            }
            send_action(win, "set_edit_text", text, eid);
        };
        if (!set_editable_text.__argnames__) Object.defineProperties(set_editable_text, {
            __argnames__ : {value: ["text", "frame_id", "eid"]},
            __module__ : {value: "edit"}
        });

        function set_edit_text(current_frame_id, source_frame_id, source_frame, text, eid) {
            var elem;
            elem = document.querySelector("[data-vise-edit-text=\"" + eid + "\"]");
            if (elem) {
                elem.value = text;
                elem.selectionStart = text.length;
            }
        };
        if (!set_edit_text.__argnames__) Object.defineProperties(set_edit_text, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "text", "eid"]},
            __module__ : {value: "edit"}
        });

        function insert_at_cursor(elem, text) {
            var caret_pos, all_text;
            text = text || "";
            caret_pos = elem.selectionStart;
            all_text = elem.value || "";
            elem.value = all_text.slice(0, caret_pos) + text + all_text.slice(elem.selectionEnd);
            elem.selectionStart = elem.selectionEnd = caret_pos + text.length;
            [elem.blur(), elem.focus()];
        };
        if (!insert_at_cursor.__argnames__) Object.defineProperties(insert_at_cursor, {
            __argnames__ : {value: ["elem", "text"]},
            __module__ : {value: "edit"}
        });

        function do_insert_text(current_frame_id, source_frame_id, source_frame, text, eid, selection_start, selection_end) {
            var elem;
            elem = document.querySelector("[data-vise-edit-text=\"" + eid + "\"]");
            if (elem) {
                elem.focus();
                elem.selectionStart = selection_start;
                elem.selectionEnd = selection_end;
                insert_at_cursor(elem, text);
            }
        };
        if (!do_insert_text.__argnames__) Object.defineProperties(do_insert_text, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "text", "eid", "selection_start", "selection_end"]},
            __module__ : {value: "edit"}
        });

        function insert_text_in_saved_node(text, selection_start, selection_end, frame_id, eid) {
            var win;
            win = frame_for_id(frame_id);
            if (!win) {
                console.error("Cannot set editable text, frame with id: " + frame_id + " no longer exists");
                return;
            }
            send_action(win, "do_insert_text", text, eid, selection_start, selection_end);
        };
        if (!insert_text_in_saved_node.__argnames__) Object.defineProperties(insert_text_in_saved_node, {
            __argnames__ : {value: ["text", "selection_start", "selection_end", "frame_id", "eid"]},
            __module__ : {value: "edit"}
        });

        function export_active_text_input_node_to_qt(current_frame_id, source_frame_id, source_frame, node_id, selection_start, selection_end) {
            js_to_python("save_text_edit_node", selection_start, selection_end, source_frame_id, node_id);
        };
        if (!export_active_text_input_node_to_qt.__argnames__) Object.defineProperties(export_active_text_input_node_to_qt, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame", "node_id", "selection_start", "selection_end"]},
            __module__ : {value: "edit"}
        });

        function find_active_text_input_node(current_frame_id, source_frame_id, source_frame) {
            var elem, eid;
            elem = document.activeElement;
            if (elem.contentWindow) {
                send_action(elem.contentWindow, "get_active_text_input_node");
            } else if (is_text_input_node(elem) && text_editing_allowed(elem)) {
                edit_counter += 1;
                eid = edit_counter + "";
                elem.setAttribute("data-vise-edit-text", eid);
                send_action(window.top, "export_active_text_input_node_to_qt", eid, elem.selectionStart, elem.selectionEnd);
            }
        };
        if (!find_active_text_input_node.__argnames__) Object.defineProperties(find_active_text_input_node, {
            __argnames__ : {value: ["current_frame_id", "source_frame_id", "source_frame"]},
            __module__ : {value: "edit"}
        });

        function onload() {
            if (window.self === window.top) {
                register_handler("export_edit_text_to_qt", export_edit_text_to_qt);
                register_handler("export_active_text_input_node_to_qt", export_active_text_input_node_to_qt);
                connect_signal("get_editable_text", (function() {
                    var ρσ_anonfunc = function () {
                        send_action(window.top, "find_editable_text");
                    };
                    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                        __module__ : {value: "edit"}
                    });
                    return ρσ_anonfunc;
                })());
                connect_signal("set_editable_text", set_editable_text);
                connect_signal("get_active_text_input_node", (function() {
                    var ρσ_anonfunc = function () {
                        send_action(window.top, "find_active_text_input_node");
                    };
                    if (!ρσ_anonfunc.__module__) Object.defineProperties(ρσ_anonfunc, {
                        __module__ : {value: "edit"}
                    });
                    return ρσ_anonfunc;
                })());
                connect_signal("insert_text_in_saved_node", insert_text_in_saved_node);
            }
            register_handler("find_editable_text", find_editable_text);
            register_handler("find_active_text_input_node", find_active_text_input_node);
            register_handler("set_edit_text", set_edit_text);
            register_handler("do_insert_text", do_insert_text);
        };
        if (!onload.__module__) Object.defineProperties(onload, {
            __module__ : {value: "edit"}
        });

        ρσ_modules.edit.edit_counter = edit_counter;
        ρσ_modules.edit.export_edit_text_to_qt = export_edit_text_to_qt;
        ρσ_modules.edit.find_editable_text = find_editable_text;
        ρσ_modules.edit.set_editable_text = set_editable_text;
        ρσ_modules.edit.set_edit_text = set_edit_text;
        ρσ_modules.edit.insert_at_cursor = insert_at_cursor;
        ρσ_modules.edit.do_insert_text = do_insert_text;
        ρσ_modules.edit.insert_text_in_saved_node = insert_text_in_saved_node;
        ρσ_modules.edit.export_active_text_input_node_to_qt = export_active_text_input_node_to_qt;
        ρσ_modules.edit.find_active_text_input_node = find_active_text_input_node;
        ρσ_modules.edit.onload = onload;
    })();

    (function(){

        var __name__ = "__main__";


        var init_crypto = ρσ_modules.crypto.initialize;

        var register_frames = ρσ_modules.frames.register_frames;

        var focus_onload = ρσ_modules.focus.onload;

        var downloads = ρσ_modules.downloads.main;

        var fn_onload = ρσ_modules.follow_next.onload;

        var passwd_onload = ρσ_modules.passwd.onload;

        var hints_onload = ρσ_modules.hints.onload;

        var edit_onload = ρσ_modules.edit.onload;

        function on_document_loaded() {
            if (document.location.href === "__DOWNLOADS_URL__") {
                downloads();
                hints_onload();
            } else {
                focus_onload();
                fn_onload();
                passwd_onload();
                hints_onload();
                edit_onload();
            }
        };
        if (!on_document_loaded.__module__) Object.defineProperties(on_document_loaded, {
            __module__ : {value: null}
        });

        init_crypto(register_frames);
        document.addEventListener("DOMContentLoaded", on_document_loaded);
    })();
})();
