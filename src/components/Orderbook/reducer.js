const DEFAULT = {
  hasErrored: false,
  isLoading: false,
  hasFetched: false,
  price: '',
  open: '',
  volume: '',
  asks: [],
  bids: []
}

export default function(state = DEFAULT, action) {
  switch (action.type) {
    case 'ORDERBOOK_HAS_ERRORED':
      return {
        ...state,
        hasErrored: action.hasErrored
      }

    case 'ORDERBOOK_IS_LOADING':
      return {
        ...state,
        isLoading: action.isLoading
      }

    case 'ORDERBOOK_HAS_FETCHED':
      return {
        ...state,
        hasFetched: action.hasFetched
      }

    case 'ORDERBOOK_WS_UPDATE':
      switch (action.data.type) {
        case 'snapshot':
          // console.log('------------------');
          // console.log('ORDERBOOK_WS_UPDATE: snapshot');
          // console.log('------------------');
          // console.log('asks:', [...action.data.response.asks.slice(0, 10)]);
          // console.log('bids:', [...action.data.response.bids.slice(0, 10)]);

          return {
            ...state,
            asks: [...action.data.response.asks],
            bids: [...action.data.response.bids],
          }

        case 'l2update':

          action.data.response.changes.forEach((change, i) => {
            let [saleType, price, size] = change

            // Inherit previous state
            let updateArr = [...state.asks]
            if(saleType === 'buy') {
              updateArr = [...state.bids]
            }

            const index = updateArr.findIndex(order => {
              if(saleType === 'buy') {
                return parseFloat(order[0]) <= parseFloat(price)
              }
              return parseFloat(order[0]) >= parseFloat(price)
            })

            // console.log('------------------');
            // console.log('ORDERBOOK_WS_UPDATE: l2update');
            // console.log('------------------');
            // console.log('saleType:', saleType);
            // console.log('price:', price);
            // console.log('size:', size);
            // console.log(updateArr[index]);

            // If order is found in array, then update size or remove it
            if (updateArr[index] && parseFloat(updateArr[index][0]) === parseFloat(price)) {
              // If size is not zero, then update size since its changed
              if (parseFloat(size) > 0) {
                updateArr[index][1] = size
              // If update size is zero then just remove order node
              } else {
                updateArr.splice(index, 1)
              }
            // If no index is found then we need to add it
            } else {
              // Size should be great than zero but just in case
              if (parseFloat(size) > 0) {
                updateArr.splice(index, 0, [price, size])
              }
            }

            state = {
              ...state,
              asks: saleType !== 'buy' ? updateArr : state.asks,
              bids: saleType === 'buy' ? updateArr : state.bids
            }
          })

          return state

        case 'ticker':
          // console.log('------------------');
          // console.log('ORDERBOOK_WS_UPDATE: ticker');
          // console.log('------------------');
          // console.log('price:', action.data.response.price);
          // console.log('open:', action.data.response.open_24h);
          // console.log('volume:', action.data.response.volume_24h);

          return {
            ...state,
            price: parseFloat(action.data.response.price).toFixed(2),
            open: parseFloat(action.data.response.open_24h).toFixed(2),
            volume: parseFloat(action.data.response.volume_24h).toFixed(2)
          }

        default:
          return state
      }

    default:
      return state
  }
}
