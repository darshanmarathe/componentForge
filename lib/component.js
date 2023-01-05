// CDN Support
// @ts-ignore
import { html, render } from 'https://unpkg.com/lit-html?module';
// @ts-ignore
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html?module';
// import { html, render } from 'lit-html';
// import {unsafeHTML} from 'lit-html/directives/unsafe-html';
//@sealed
export class Component extends HTMLElement {
    /**
     * Creates an instance of Component.
     * @date 10/9/2022 - 7:42:37 PM
     *
     * @constructor
     * @param {generate shadow DOM boolean} [shadow=true]
     * @param {default props to watch {}} [_props={}]
     */
    constructor(shadow = true, _props = {}) {
        var _a;
        super();
        this.props = {};
        this.state = {};
        this.scripts = [];
        if (this.Template === undefined && this.Style === undefined) {
            throw new Error("Template and Style functions are required....");
        }
        if (Object.keys(_props).length > 0) {
            this.props = _props;
        }
        if (shadow) {
            this.root = this.attachShadow({ mode: "open" });
        }
        else {
            this.root = this;
        }
        this.BuildProps();
        this.makeDynamicProps();
        this.Template.bind(this);
        this.Style.bind(this);
        this.slotChnaged && this.slotChnaged.bind(this);
        (_a = this.root.querySelectorAll('slot')) === null || _a === void 0 ? void 0 : _a.forEach((slot) => {
            slot.addEventListener('slotchange', (e) => {
                this.slotChnaged && this.slotChnaged(e);
                this.ComponentDidMount && this.ComponentDidMount();
            });
        });
        setTimeout(() => {
            this.PreRender();
        }, 100);
    }
    async BuildProps() {
        let keys = this.getAttributeNames();
        // @ts-ignore
        if (keys.length === 0)
            return;
        let props = {};
        for (const key of keys) {
            if (key.toLowerCase().startsWith("data-")) {
                let obj = JSON.parse(this.getAttribute(key) || "{}");
                props[key.replace("data-", "")] = typeof this.getAttribute(key) === 'object' ? this.getAttribute(key) : obj;
            }
            else {
                props[key] = this.getAttribute(key);
            }
        }
        this.props = Object.assign(Object.assign({}, this.props), props);
    }
    get(url) {
        return new Promise((resolve, reject) => {
            fetch(url).then(async (response) => {
                const res = response.json();
                resolve(res);
            })
                .catch(error => {
                resolve(error);
            });
        });
    }
    loadScript(id, url) {
        return new Promise((resolve, reject) => {
            let script = document.getElementById(id);
            if (!script) {
                script = document.createElement('script');
                script.src = url;
                script.id = id;
                script.async = false;
            }
            else {
                resolve();
                return;
            }
            this.scripts.push(() => {
                document.body.removeChild(script);
            });
            document.body.appendChild(script);
            script.onload = () => {
                resolve();
            };
        });
    }
    ;
    loadCss(id, url) {
        let link = this.root.getElementById(id);
        if (!link) {
            link = document.createElement('link');
            link.href = url;
            link.id = id;
            link.rel = "stylesheet";
        }
        this.root.appendChild(link);
        this.scripts.push(() => {
            this.root.removeChild(link);
        });
    }
    ;
    post(url, data) {
        return new Promise(async (resolve, reject) => {
            try {
                // Awaiting for fetch response and
                // defining method, headers and body
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                // Awaiting response.json()
                const resData = await response.json();
                // Returning result data
                resolve(resData);
            }
            catch (error) {
                reject(error);
            }
            finally {
                this.Log(`POST Request finished for ${url} ${JSON.stringify(data)}`);
            }
        });
    }
    GetSlots() {
        this.slots = this.root.querySelectorAll('slot');
        this.slots.forEach((slot, index) => {
            let elem = slot.assignedNodes();
            if (elem.length > 0) {
                debugger;
                const keys = elem[0].getAttributeNames();
                for (const k of keys) {
                    elem[0].style.display = 'none';
                    if (['name', 'id', 'slot'].indexOf(k) > -1)
                        continue;
                    elem[0][k] = slot[k];
                    elem[0].style.display = 'block';
                }
            }
        });
    }
    //make sure all props are in lower case
    makeDynamicProps() {
        if (this.props && Object.keys(this.props).length) {
            // Loop through the observed attributes
            Object.keys(this.props).forEach(attribute => {
                // Dynamically define the property getter/setter
                Object.defineProperty(this, attribute, {
                    get() { return this.getAttribute(attribute); },
                    set(attrValue) {
                        let oldValue = this.props[attribute];
                        console.log(attribute, oldValue, attrValue);
                        if (attrValue !== undefined) {
                            this.setAttribute(attribute, attrValue);
                            this.props[attribute] = attrValue;
                            if (oldValue !== attrValue)
                                this.PreRender();
                        }
                        else {
                            this.removeAttribute(attribute);
                        }
                        this.ComponentDidReceiedProps && this.ComponentDidReceiedProps(attribute, oldValue, attrValue);
                    }
                });
            });
        }
    }
    setState(object, preRender = true, callback = () => { }) {
        this.state = Object.assign(this.state, object);
        if (preRender === true)
            this.PreRender();
        callback();
    }
    PreRender() {
        render(html `${this.Style()}
${this.Template()}`, this.root);
        this.GetSlots();
    }
    Tmpl(rec, _tempStr, elem = null) {
        let _template = _tempStr;
        if (typeof elem === 'string') {
            const tempElem = document.createElement('div');
            tempElem.innerHTML = elem;
            elem = tempElem.children[0];
        }
        //Get Child
        const gc = (key, item) => {
            let retItem = item;
            const keys = key.split('.');
            for (const _key of keys) {
                const split = _key.split('.');
                const newKey = split.length > 1 ? split[1] : split[0];
                retItem = retItem[newKey];
            }
            return retItem;
        };
        const re = /{(.*?)}/g;
        const tkeys = _template.match(re);
        tkeys === null || tkeys === void 0 ? void 0 : tkeys.forEach((k) => {
            k = k.replace('{', '').replace('}', '');
            if (k.indexOf('.') === -1)
                _template = _template.replace(`{${k}}`, rec[k]);
            else
                _template = _template.replace(`{${k}}`, gc(k, rec));
        });
        if (elem) {
            const keys = Object.keys(rec);
            for (const k of keys) {
                elem[k] = rec[k];
            }
        }
        if (elem !== null && _template !== "") {
            // @ts-ignore
            elem['innerHTML'] = unsafeHTML(_template);
            return unsafeHTML(_template);
        }
        else if (elem === null && _template !== "") {
            return unsafeHTML(_template);
        }
        else {
            return elem;
        }
    }
    Log(...args) {
        if (this.props.debug)
            console.log(...args);
    }
    async connectedCallback() {
        this.ComponentDidMount && await this.ComponentDidMount();
    }
    async disconnectedCallback() {
        this.scripts.forEach((func) => func());
        this.ComponentWillUnmount && await this.ComponentWillUnmount();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(name, "attribute changed");
        this.BuildProps();
    }
    fireEvent(type, propName, value, bubbles = true, composed = true) {
        // @ts-ignore
        if (propName && propName != "")
            this[propName] = value;
        this.dispatchEvent(new CustomEvent(type, {
            detail: value,
            bubbles,
            composed,
        }));
    }
    getProps(isString = false) {
        if (isString) {
            return JSON.stringify(this.props, null, 4);
        }
        return this.props;
    }
    getState(isString = false) {
        if (isString) {
            return JSON.stringify(this.state, null, 4);
        }
        return this.state;
    }
}
/**
 * @param  {string} tagName tag name
 */
function Tag(tagName, target) {
    window.customElements.define(tagName, target);
}
export { html, Tag };
//# sourceMappingURL=component.js.map