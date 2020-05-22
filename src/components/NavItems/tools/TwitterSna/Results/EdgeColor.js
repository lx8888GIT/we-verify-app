import React from 'react'

class EdgeColor extends React.Component {
    constructor(props) {
        super(props)
        if(this.props.sigma) {
            let colors = {
                8: "#00ff00", //green
                9: "#ffff00", // yellow
                10: "#C0C0C0" // red
            }
            console.log("sigma nodes: ", this.props.sigma.graph.nodes());
            console.log("sigma edges: ", this.props.sigma.graph.edges());
            this.props.sigma.graph.edges().forEach(e => {
                e.color = Math.random()
                if (e.attributes[8]) {
                    e.color = colors[8];
                    console.log("edge is retweet");
                }
                if (e.attributes[9]) {
                    e.color = colors[9];
                    console.log("edge is reply");
                }
                if (e.attributes[10]) {
                    e.color = colors[10];
                    console.log("edge is mention");
                }
            } )
        }
        if(this.props.sigma) this.props.sigma.refresh()
    }

    componentDidMount() {
        if(this.props.sigma) this.props.sigma.refresh()
    }

    embedProps(elements, extraProps) {
        return React.Children.map(elements, element =>
          React.cloneElement(element, extraProps)
        );
      }

    render() {
        return <div>{ this.embedProps(this.props.children, {sigma: this.props.sigma}) }</div>
    }
}

export default EdgeColor;