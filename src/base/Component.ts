import { html, render, TemplateResult } from "lit-html";
@sealed
export abstract class Component extends HTMLElement {

  props: any = {};
  state: any = {};
  root: ShadowRoot;
  cssStyle:any;

  abstract ComponentDidMount(): Promise<void>;
  abstract ComponentWillUnmount(): Promise<void>;
  abstract slotChnaged(event:any):Promise<void>;

  abstract ComponentDidReceiedProps(propName:string , oldValue:any , newValue:any): Promise<void>;

  abstract Style(): TemplateResult;
  abstract Template(): TemplateResult;

  async BuildProps() {
    let keys = this.getAttributeNames();
    if (keys.length === 0) return;
    let props: any = {};
    for (const key of keys) {
      if (key.toLowerCase().startsWith("data-")) {
        let obj = JSON.parse(this.getAttribute(key) || "{}");
        props[key.replace("data-", "")] = obj;
      } else {
        props[key] = this.getAttribute(key);
      }
    }
    this.props = props;
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
        .finally(() => {
          this.Log(`GET Request finished for ${url}`)
        });
    });
  }


   
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
      catch(error) {
          reject(error);
      }
      finally{
          this.Log(`POST Request finished for ${url} ${JSON.stringify(data)}`)
      }
    });
  }

  
  constructor() {
    
    super();
    this.root = this.attachShadow({ mode: "open" });
    this.BuildProps();
    this.makeDynamicProps();
    this.Template.bind(this);
    this.Style.bind(this);
    this.slotChnaged.bind(this);
    this.PreRender();
    this.root.querySelector('slot')?.addEventListener('slotchange', (e:any) => {
      this.slotChnaged(e)
      this.ComponentDidMount();
    }); 
  }

  //make sure all props are in lower case
  makeDynamicProps(){
    if (this.props && Object.keys(this.props).length) {
      // Loop through the observed attributes
      Object.keys(this.props).forEach(attribute => {
        // Dynamically define the property getter/setter
        Object.defineProperty(this, attribute, {
          get() { return this.getAttribute(attribute); },
          set(attrValue) {
            console.log(attribute , attrValue);
            let oldValue = this.props[attribute];
            if (attrValue) {
              this.setAttribute(attribute, attrValue);
              this.props[attribute] = attrValue
              this.PreRender();
            } else {
              this.removeAttribute(attribute);
            }
            this.ComponentDidReceiedProps(attribute , oldValue, attrValue); 
          }
        });
      });
  }
}

  setState(object: any, preRender = true , callback:(() => void) = () =>{}) {
    this.state = Object.assign(this.state, object);
    if (preRender === true) this.PreRender();
    callback();
  }

  PreRender() {
    render( html`${this.Style()} 
              ${this.Template()} `, this.root);
  }


  Log(...args: any[]) {
    if (this.props.debug) console.log(...args);
  }

  async connectedCallback() {
    await this.ComponentDidMount();
  }
  
  async disconnectedCallback() {
    await this.ComponentWillUnmount();
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    console.log(name , "attribute changed")
    this.BuildProps();
  }

  fireEvent(type: string, value: any , bubbles = true ,composed = true ) {
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

export function complex(obj: any) {
  return JSON.stringify(obj);
}

function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}


/**
 * @param  {string} tagName tag name
 */
export function Tag(tagName: string) {
  return (target: any) => {
    window.customElements.define(tagName, target);
  };
}



