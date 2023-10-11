import {Component , html , Tag} from './js/componentforge.js'



export default class MyComponent extends Component{
    

constructor(){
  const  _props ={
        mydata : ""
    } 
    super(true , _props)
}
    Template(){

        return html`
         <h2>Hello world</h2>
           `
    }

    Style(){
        return html`
        <style>
            h2{
                color:red
            }
        
        <style>
        `
    }

}

Tag('my-component' , MyComponent)
        