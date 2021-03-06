/*! tetra-ui v1.4.7 - 2014 | (MIT Licence) (c) Viadeo/APVO Corp - inspired by Bootstrap (c) Twitter, Inc. (Apache 2 Licence) */

tetra.view.register("alert", {
    scope: "alert",
    constr: function(me, app, _) {
        "use strict";
        return {
            events: {
                user: {
                    click: {
                        ".bx-alert-close": function(e, elm) {
                            _(elm).parent(".bx-alert").remove();
                        },
                        ".bx-close": function(e, elm) {
                            _(elm).parent(".bx").remove();
                        }
                    }
                },
                controller: {}
            },
            methods: {
                init: function() {}
            }
        };
    }
});