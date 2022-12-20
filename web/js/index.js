
import {
    Component,
    html,
    Tag,
  } from 'https://cdn.jsdelivr.net/npm/componentforge';
  
  export default class Basic extends Component {
    Template() {
      return html`Hello ${this.props.name || 'world'}`;
    }
  
    Style() {
      return '';
    }
  }
  
  Tag('cf-basic', Basic);
  