import {Component , html , Tag} from '../lib/component.js'



export default class ShadowCtrol extends Component{


constructor(){
  const  _props ={
        mydata : ""
    }
    super(false , _props)
}
    Template(){

        return html`
            <uL>
                ${Object.entries(this.props).map((k ,v) =>  {
                    return html`<li>${k} ${JSON.stringify(v)}</li>`
                })}
            </ul>

        
           `
    }

    Style(){
        return ``
    }

}

Tag('shadow-cmpt' , ShadowCtrol)
