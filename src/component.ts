// @ts-ignore
// import { html, render } from 'https://unpkg.com/lit-html?module';
// import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html?module';

import { html, render } from 'lit-html';
import {unsafeHTML} from 'lit-html/directives/unsafe-html';

//@sealed
export abstract class Component extends HTMLElement {

  props: any = {};
  state: any = {};
  root: ShadowRoot | any;
  cssStyle: any;
  scripts: any[] = [];

  abstract ComponentDidMount(): Promise<void>;
  abstract ComponentWillUnmount(): Promise<void>;
  abstract slotChnaged(event: any): Promise<void>;

  abstract ComponentDidReceiedProps(propName: string, oldValue: any, newValue: any): Promise<void>;

  abstract Style(): any;
  abstract Template(): any;

  async BuildProps() {
    let keys = this.getAttributeNames();

    // @ts-ignore
    if (keys.length === 0) return;
    let props: any = {};
    for (const key of keys) {
      if (key.toLowerCase().startsWith("data-")) {
        console.warn(this.getAttribute(key))
        let obj = JSON.parse(this.getAttribute(key) || "{}");
        props[key.replace("data-", "")] = typeof this.getAttribute(key) === 'object' ? this.getAttribute(key) : obj;
      } else {
        props[key] = this.getAttribute(key);
      }
    }
    this.props = { ...this.props, ...props };
    console.warn(this.props)
  }

  get(url: string) {
    return new Promise((resolve, reject) => {
      fetch(url).then(async (response) => {
        const res = response.json();
        resolve(res);
      })
        .catch(error => {
          resolve(error);
        })

    });
  }

  loadScript(id: string, url: string) {
    return new Promise((resolve: any, reject) => {
      let script: HTMLScriptElement = document.getElementById(id) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.src = url;
        script.id = id
        script.async = false;

      } else {
        resolve();
        return;
      }

      this.scripts.push(() => {
        document.body.removeChild(script);
      });

      document.body.appendChild(script);

      script.onload = () => {
        resolve();
      }

    })
  };


  loadCss(id: string, url: string) {
    let link: HTMLLinkElement = this.root.getElementById(id) as HTMLLinkElement;
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

  };


  post(url: string, data: any) {

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
        this.Log(`POST Request finished for ${url} ${JSON.stringify(data)}`)
      }
    });
  }


  /**
   * Creates an instance of Component.
   * @date 10/9/2022 - 7:42:37 PM
   *
   * @constructor
   * @param {generate shadow DOM boolean} [shadow=true]
   * @param {default props to watch {}} [_props={}]
   */
  constructor(shadow = true, _props = {}) {

    super();
    if (this.Template === undefined && this.Style === undefined) {
      throw new Error("Template and Style functions are required....");

    }
    if (Object.keys(_props).length > 0) {
      this.props = _props
    }
    if (shadow) {

      this.root = this.attachShadow({ mode: "open" });
    } else {
      this.root = this;
    }
    this.BuildProps();
    this.makeDynamicProps();
    this.Template.bind(this);
    this.Style.bind(this);

    this.slotChnaged && this.slotChnaged.bind(this);
    this.root.querySelectorAll('slot')?.forEach((slot: any) => {
      slot.addEventListener('slotchange', (e: any) => {
        console.warn(e)
        this.slotChnaged && this.slotChnaged(e)
        this.ComponentDidMount && this.ComponentDidMount();
      })
    });
    setTimeout(() => {
      this.PreRender();
    }, 100);
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
            } else {
              this.removeAttribute(attribute);
            }
            this.ComponentDidReceiedProps && this.ComponentDidReceiedProps(attribute, oldValue, attrValue);
          }
        });
      });
    }
  }

  setState(object: any, preRender = true, callback: (() => void) = () => { }) {
    this.state = Object.assign(this.state, object);
    if (preRender === true) this.PreRender();
    callback();
  }

  PreRender() {
    render(
      html`${this.Style()}
${this.Template()}`, 
this.root);
  }

  Tmpl(rec: any, _tempStr: string, elem:HTMLElement = null) {


    let _template = _tempStr;

    //Get Child
    const gc = (key: string, item: any) => {

      let retItem = item;
      const keys = key.split('.');
      for (const _key of keys) {
        const split = _key.split('.');
        const newKey = split.length > 1 ? split[1] : split[0];
        retItem = retItem[newKey]
      }


      return retItem;
    }
    const re = /{(.*?)}/g;

    const tkeys = _template.match(re)

    tkeys?.forEach((k) => {
      k = k.replace('{', '').replace('}', '')
      if (k.indexOf('.') === -1)
        _template = _template.replace(`{${k}}`, rec[k]);
      else
        _template = _template.replace(`{${k}}`, gc(k, rec))

    })
    
    if(elem !== null){
          // @ts-ignore
          elem['innerHTML'] = unsafeHTML(_template);
    }

    return unsafeHTML(_template);

  }


  Log(...args: any[]) {
    if (this.props.debug) console.log(...args);
  }

  async connectedCallback() {
    this.ComponentDidMount && await this.ComponentDidMount();
  }

  async disconnectedCallback() {
    this.scripts.forEach((func) => func())
    this.ComponentWillUnmount && await this.ComponentWillUnmount();
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    console.log(name, "attribute changed")
    this.BuildProps();
  }


  fireEvent(type: string, propName: string, value: any, bubbles = true, composed = true) {
    // @ts-ignore
    if (propName && propName != "") this[propName] = value;
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: value,
        bubbles,
        composed,
      })
    );

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
function Tag(tagName: string, target: any) {

  window.customElements.define(tagName, target);
}


export {
  html,
  Tag
}
