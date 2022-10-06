// @ts-ignore
//import { html, render } from 'https://unpkg.com/lit-html?module';
import { html, render } from 'lit-html';
//@sealed
export class Component extends HTMLElement {
    constructor(shadow = true) {
        var _a;
        super();
        this.props = {};
        this.state = {};
        if (this.Template === undefined && this.Style === undefined) {
            throw new Error("Template and Style functions are required....");
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
        (_a = this.root.querySelector('slot')) === null || _a === void 0 ? void 0 : _a.addEventListener('slotchange', (e) => {
            this.slotChnaged && this.slotChnaged(e);
            this.ComponentDidMount && this.ComponentDidMount();
        });
        setTimeout(() => {
            this.PreRender();
        }, 100);
    }
    async BuildProps() {
        let keys = this.getAttributeNames();
        if (keys.length === 0)
            return;
        let props = {};
        for (const key of keys) {
            if (key.toLowerCase().startsWith("data-")) {
                let obj = JSON.parse(this.getAttribute(key) || "{}");
                props[key.replace("data-", "")] = obj;
            }
            else {
                props[key] = this.getAttribute(key);
            }
        }
        this.props = props;
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
        let script = document.getElementById(id);
        if (!script) {
            script = document.createElement('script');
            script.src = url;
            script.id = id;
            script.async = false;
        }
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
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
        return () => {
            this.root.removeChild(link);
        };
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
    //make sure all props are in lower case
    makeDynamicProps() {
        if (this.props && Object.keys(this.props).length) {
            // Loop through the observed attributes
            Object.keys(this.props).forEach(attribute => {
                // Dynamically define the property getter/setter
                Object.defineProperty(this, attribute, {
                    get() { return this.getAttribute(attribute); },
                    set(attrValue) {
                        console.log(attribute, attrValue);
                        let oldValue = this.props[attribute];
                        if (attrValue !== undefined) {
                            this.setAttribute(attribute, attrValue);
                            this.props[attribute] = attrValue;
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
    }
    Log(...args) {
        if (this.props.debug)
            console.log(...args);
    }
    async connectedCallback() {
        this.ComponentDidMount && await this.ComponentDidMount();
    }
    async disconnectedCallback() {
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
    getProps() {
        return JSON.stringify(this.props, null, 4);
    }
    getState() {
        return JSON.stringify(this.state, null, 4);
    }
}
/**
 * @param  {string} tagName tag name
 */
function Tag(tagName, target) {
    window.customElements.define(tagName, target);
}
export { html, Tag };
