function _typeof(e) {
    return (_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ?
    function(e) {
        return typeof e
    }: function(e) {
        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol": typeof e
    })(e)
} !
function() {
    "use strict";
    function e(t) {
        return (e = Object.setPrototypeOf ? Object.getPrototypeOf: function(e) {
            return e.__proto__ || Object.getPrototypeOf(e)
        })(t)
    }
    function t(e, n) {
        return (t = Object.setPrototypeOf ||
        function(e, t) {
            return e.__proto__ = t,
            e
        })(e, n)
    }
    function n() {
        if ("undefined" == typeof Reflect || !Reflect.construct) return ! 1;
        if (Reflect.construct.sham) return ! 1;
        if ("function" == typeof Proxy) return ! 0;
        try {
            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function() {}))),
            !0
        } catch(e) {
            return ! 1
        }
    }
    function o(e, r, i) {
        return (o = n() ? Reflect.construct: function(e, n, o) {
            var r = [null];
            r.push.apply(r, n);
            var i = new(Function.bind.apply(e, r));
            return o && t(i, o.prototype),
            i
        }).apply(null, arguments)
    }
    function r(n) {
        var i = "function" == typeof Map ? new Map: void 0;
        return (r = function(n) {
            if (null === n || (r = n, -1 === Function.toString.call(r).indexOf("[native code]"))) return n;
            var r;
            if ("function" != typeof n) throw new TypeError("Super expression must either be null or a function");
            if (void 0 !== i) {
                if (i.has(n)) return i.get(n);
                i.set(n, a)
            }
            function a() {
                return o(n, arguments, e(this).constructor)
            }
            return a.prototype = Object.create(n.prototype, {
                constructor: {
                    value: a,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t(a, n)
        })(n)
    }
    function i(e, t) {
        return ! t || "object" !== _typeof(t) && "function" != typeof t ?
        function(e) {
            if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return e
        } (e) : t
    }
    var a, c, u = function(o) {
        var a = function(o) { !
            function(e, n) {
                if ("function" != typeof n && null !== n) throw new TypeError("Super expression must either be null or a function");
                e.prototype = Object.create(n && n.prototype, {
                    constructor: {
                        value: e,
                        writable: !0,
                        configurable: !0
                    }
                }),
                n && t(e, n)
            } (u, o);
            var r, a, c = (r = u, a = n(),
            function() {
                var t, n = e(r);
                if (a) {
                    var o = e(this).constructor;
                    t = Reflect.construct(n, arguments, o)
                } else t = n.apply(this, arguments);
                return i(this, t)
            });
            function u() {
                var e; !
                function(e, t) {
                    if (! (e instanceof t)) throw new TypeError("Cannot call a class as a function")
                } (this, u);
                var t = (e = c.call(this)).attachShadow({
                    mode: "open"
                }),
                n = document.createElement("style");
                return n.textContent = "\n      :host {\n        display: block;\n        line-height: initial;\n        font-size: 16px;\n      }\n      div.mermaid {\n        margin: 0;\n        overflow: visible;\n      }",
                t.appendChild(n),
                e
            }
            return u
        } (r(HTMLElement));
        void 0 === customElements.get("mermaid-div") && customElements.define("mermaid-div", a);
        var c = {
            startOnLoad: !1,
            theme: "default",
            flowchart: {
                htmlLabels: !1
            },
            er: {
                useMaxWidth: !1
            },
            sequence: {
                useMaxWidth: !1,
                noteFontWeight: "14px",
                actorFontSize: "14px",
                messageFontSize: "16px"
            }
        };
        mermaid.mermaidAPI.globalReset();
        var u = null;
        try {
            u = document.querySelector("[data-md-color-scheme]").getAttribute("data-md-color-scheme")
        } catch(e) {
            u = "default"
        }
        var l = "undefined" == typeof mermaidConfig ? c: mermaidConfig[u] || mermaidConfig.
    default || c;
        mermaid.initialize(l);
        for (var d = document.querySelectorAll("pre.".concat(o, ", mermaid-div")), f = document.querySelector("html"), s = function(e) {
            var t = d[e],
            n = "mermaid-div" === t.tagName.toLowerCase() ? t.shadowRoot.querySelector("pre.".concat(o)) : t,
            r = document.createElement("div");
            r.style.visibility = "hidden",
            r.style.display = "display",
            r.style.padding = "0",
            r.style.margin = "0",
            r.style.lineHeight = "initial",
            r.style.fontSize = "16px",
            f.appendChild(r);
            try {
                mermaid.mermaidAPI.render("_mermaid_".concat(e),
                function(e) {
                    for (var t = "",
                    n = 0; n < e.childNodes.length; n++) {
                        var o = e.childNodes[n];
                        if ("code" === o.tagName.toLowerCase()) for (var r = 0; r < o.childNodes.length; r++) {
                            var i = o.childNodes[r];
                            if ("#text" === i.nodeName && !/^\s*$/.test(i.nodeValue)) {
                                t = i.nodeValue;
                                break
                            }
                        }
                    }
                    return t
                } (n), (function(e) {
                    var r = document.createElement("div");
                    r.className = o,
                    r.innerHTML = e;
                    var i = document.createElement("mermaid-div");
                    i.shadowRoot.appendChild(r),
                    t.parentNode.insertBefore(i, t),
                    n.style.display = "none",
                    i.shadowRoot.appendChild(n),
                    n !== t && t.parentNode.removeChild(t)
                }), r)
            } catch(e) {}
            f.contains(r) && f.removeChild(r)
        },
        m = 0; m < d.length; m++) s(m)
    };
    c = new MutationObserver((function(e) {
        e.forEach((function(e) {
            if ("attributes" === e.type) {
                var t = e.target.getAttribute("data-md-color-scheme");
                t || (t = "default"),
                localStorage.setItem("data-md-color-scheme", t),
                "undefined" != typeof mermaid && u("mermaid")
            }
        }))
    })),
    a = function() {
        c.observe(document.querySelector("body"), {
            attributeFilter: ["data-md-color-scheme"]
        }),
        "undefined" != typeof mermaid && u("mermaid")
    },
    document.addEventListener("DOMContentLoaded", a),
    document.addEventListener("DOMContentSwitch", a)
} ();
//# sourceMappingURL=extra-uml-51b11a9a.js.map
