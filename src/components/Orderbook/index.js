import React, { Component } from 'react'
import { connect } from 'react-redux'
import { debounce } from 'lodash';

import './Orderbook.css'
import { connectToSocket } from './actions'

class Orderbook extends Component {
  constructor(props) {
    super(props)

    this.midpointRef = React.createRef()
    this.renderHeaderBottom = debounce(this.renderHeaderBottom, 100, { leading: true, maxWait: 100 })
    this.renderOrdersContainer = debounce(this.renderOrdersContainer, 100, { leading: true, maxWait: 100 })

    this.state = {
      hasScrolled: false
    }
  }

  componentDidMount() {
    this.props.connectToSocket()
  }

  componentWillReceiveProps(props) {
    if(!this.state.hasScrolled) {
      if (this.props.asks.length > 0 && this.props.bids.length > 0) {
        if(this.midpointRef.current) {
          this.midpointRef.current.scrollIntoView({block: 'center'})
          this.setState({ hasScrolled: true })
        }
      }
    }
  }

  renderOrders(orders) {
    return (
      <div>
        {orders.map((order, index) => (
          <div className="Orderbook__book__item" key={index}>
            <div className="columns">
              <div className="column">
                {parseFloat(order[1]).toFixed(4)}
              </div>
              <div className="column">
                <span className="price">{parseFloat(order[0]).toFixed(2)}</span>
              </div>
              <div className="column">
                &nbsp;
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderOrdersMidpoint() {
    return (
      <div id="midpointPrice" ref={this.midpointRef} className="Orderbook__book__item">
        <div className="columns">
          <div className="column">
            Midpoint Price:
          </div>
          <div className="column">
            <span className="price">{this.props.price}</span> <span className="percentage">{this.calcPriceChange()}</span>
          </div>
          <div className="column">
            &nbsp;
          </div>
        </div>
      </div>
    )
  }

  calcPriceChange() {
    const perc = ( this.props.price / this.props.open ) - 1;
    const className = perc >= 0 ? 'color-green' : 'color-red';
    const prefix = perc >= 0 ? '+' : '';
    return <span className={className}>{prefix}{(perc * 100).toFixed(2)}&#37;</span>;
  }

  renderOrdersContainer(order) {
    if (this.props.hasErrored) {
      return <div className="error--">Sorry! There was an error loading the items</div>
    }

    if (!this.props.hasFetched || this.props.isLoading) {
      return <div className="loading--">Loading…</div>
    }

    return (
      <div>
        <div className="asks">
          {this.renderOrders(this.limitOrders(this.props.asks, 50).reverse())}
        </div>
        {this.renderOrdersMidpoint()}
        <div className="bids">
          {this.renderOrders(this.limitOrders(this.props.bids, 50))}
        </div>
      </div>
    )
  }

  limitOrders(orders, amount) {
    return [...orders.slice(0, amount)]
  }

  renderHeaderBottom() {
    if (this.props.hasErrored) {
      return <div className="error--">Sorry! There was an error loading the items</div>
    }
    if (!this.props.hasFetched || this.props.isLoading || !this.props.price) {
      return <div className="loading--">Loading…</div>
    }
    return (
      <div>
        <span className="bold">{this.props.price} USD</span> <span className="help-text">Last trade price</span>
        <span className="bold">{this.calcPriceChange()}</span> <span className="help-text">24h price</span>
        <span className="bold">{this.props.volume} ETH</span> <span className="help-text">24h volume</span>
      </div>
    )
  }

  render() {
    return (
      <div className="Orderbook">
        <header className="Orderbook__header">
          <div className="Orderbook__header__top">
            <span className="heading">Ethereum (ETH)</span>
          </div>
          <div className="Orderbook__header__bottom">
            {this.renderHeaderBottom()}
          </div>
        </header>
        <div className="Orderbook__book">
          <div className="Orderbook__book__header">
            <span className="heading">Order Book</span>
          </div>
          <div className="Orderbook__book__subheader">
            <div className="columns">
              <div className="column">
                <span className="heading">Market Size</span>
              </div>
              <div className="column">
                <span className="heading">Price (USD)</span>
              </div>
              <div className="column">
                <span className="heading">&nbsp;</span>
              </div>
            </div>
          </div>
          <div className="Orderbook__book__content">
            <div className="Orderbook__book__content-inner">
              {this.renderOrdersContainer()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isLoading: state.orderbook.isLoading,
    hasErrored: state.orderbook.hasErrored,
    hasFetched: state.orderbook.hasFetched,
    price: state.orderbook.price,
    open: state.orderbook.open,
    volume: state.orderbook.volume,
    asks: state.orderbook.asks,
    bids: state.orderbook.bids
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    connectToSocket: () => dispatch(connectToSocket())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Orderbook)
