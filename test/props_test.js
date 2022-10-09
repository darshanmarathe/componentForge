import {Component , html , Tag} from '../lib/component.js'



export default class MyComponent extends Component{
    

constructor(){
  const  _props ={
        mydata : ""
    } 
    super(true , _props)
}
    Template(){

        return html`
            <uL>
                ${Object.entries(this.props).map((k ,v) =>  {
                    return html`<li>${k} ${JSON.stringify(v)}</li>`
                })}
            </ul>

            ${this.props.mydata.id} ${this.props.mydata.name} ${this.props.mydata.age}`
    }

    Style(){
        return ``
    }

}

Tag('my-component' , MyComponent)