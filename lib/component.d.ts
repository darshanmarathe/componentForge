import { html } from 'lit-html';
export declare abstract class Component extends HTMLElement {
    props: any;
    state: any;
    root: ShadowRoot | any;
    cssStyle: any;
    scripts: any[];
    abstract ComponentDidMount(): Promise<void>;
    abstract ComponentWillUnmount(): Promise<void>;
    abstract slotChnaged(event: any): Promise<void>;
    abstract ComponentDidReceiedProps(propName: string, oldValue: any, newValue: any): Promise<void>;
    abstract Style(): any;
    abstract Template(): any;
    BuildProps(): Promise<void>;
    get(url: string): Promise<unknown>;
    loadScript(id: string, url: string): Promise<unknown>;
    loadCss(id: string, url: string): void;
    post(url: string, data: any): Promise<unknown>;
    /**
     * Creates an instance of Component.
     * @date 10/9/2022 - 7:42:37 PM
     *
     * @constructor
     * @param {generate shadow DOM boolean} [shadow=true]
     * @param {default props to watch {}} [_props={}]
     */
    constructor(shadow?: boolean, _props?: {});
    makeDynamicProps(): void;
    setState(object: any, preRender?: boolean, callback?: (() => void)): void;
    PreRender(): void;
    Log(...args: any[]): void;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): Promise<void>;
    attributeChangedCallback(name: string, oldValue: any, newValue: any): void;
    fireEvent(type: string, propName: string, value: any, bubbles?: boolean, composed?: boolean): void;
    getProps(): string;
    getState(): string;
}
/**
 * @param  {string} tagName tag name
 */
declare function Tag(tagName: string, target: any): void;
export { html, Tag };
