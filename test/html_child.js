import {Component , html , Tag} from '../lib/component.js'



class UnderLineDisplay extends Component{

    Template(){
        console.info(this.props.record)
        return html`<li><u>${this.props.record ||  "NA"}</u></li>`
    }

    Style(){
        return html`<style> </style>`
    }

    constructor(){
        super();
    }

}
Tag('t-ul' , UnderLineDisplay)



class BoldDisplay extends Component{
    
    Template(){
        return html`<li><b>${this.props.record ||  "NA"}</b></li>`
    }

    Style(){
        return html`<style> </style>`
    }

    constructor(){
        const _props = {
            record : ''
        }
        super(true , _props);
    }

}
Tag('t-bold' , BoldDisplay)

class Display extends Component{
    slotChnaged(e){
        console.log(e);
    }

    Template(){
        return html`
        <h1>${this.props.title}</h1>
        <ul>${this.props.records.map(rec => {
            if(this.props.litemplate){
                return this.Tmpl({record : rec} , this.props.litemplate)
            }
            return html`
                <slot record=${rec} name="li"><li>${rec}</li></slot>
            `
        })}</ul>`
    }

    Style(){
        return html`<style> </style>`
    }

    constructor(){
        const _props = {
            records : [],
            title : 'Title',
            litemplate: null
        }
        super(true , _props);
    }
}

Tag('t-display' , Display)



export {
    BoldDisplay as CarCard, 
    UnderLineDisplay, 
    Display
}

