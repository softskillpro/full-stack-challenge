import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = 4000;
const exchanges = [
    'https://api.exchange.coinbase.com/products/btc-usd/book?level=2',
    'https://api3.binance.com/api/v3/depth?symbol=BTCUSDT&limit=50',
    'https://api.crypto.com/v2/public/get-book?instrument_name=BTC_USDT&depth=50'
]
const exchangesMapping = {
    0: 'coinbase',
    1: 'binance',
    2: 'crypto.com'
}
let books = [];

app.use(cors());

app.get('/exchange-routing', (req, res) => {
    let btcAmount = parseFloat(req.query.amount);

    exchanges.forEach(function callback(url, index) {
        fetchOrderBook(url, index).then(json => json).catch(err => console.error('error:' + err));
    });

    if (books.length !== 0) {
        let avgPrices = calculateAveragePrice(btcAmount);
        let min = Math.min(...avgPrices);
        let position = avgPrices.indexOf(min);

        let response = {
            "btcAmount": btcAmount,
            "usdAmount": min,
            "exchange": exchangesMapping[position]
        }

        res.send(response);
    }
});

/**
 * For each exchange we loop through the "asks" table and we "purchase" bitcoin until the accumulated one is more than
 * the amount required to buy. Then we find the average price for these orders.
 *
 * @param btcToBuy
 * @returns {*[]}
 */
function calculateAveragePrice(btcToBuy) {
    let avgBuyPrices = []

    for (let exchangesCounter = 0; exchangesCounter < books.length; exchangesCounter++) {
        let btcAccumulated = 0.00;
        let usdAvgPrice = 0.00

        for (let asksLooper = 0; asksLooper < books[exchangesCounter].length; asksLooper++) {
            let price = parseFloat(books[exchangesCounter][asksLooper][0]);
            let amountSelling = parseFloat(books[exchangesCounter][asksLooper][1]);

            if (btcAccumulated >= btcToBuy) {
                avgBuyPrices[exchangesCounter] = usdAvgPrice / asksLooper;
                break;
            }

            btcAccumulated += amountSelling;
            usdAvgPrice += price
        }
    }

    return avgBuyPrices;
}

/**
 * Fetches the order book for each exchanges and inserts only the relevant data to books array.
 *
 * @param url
 * @param index
 * @returns {Promise<void>}
 */
async function fetchOrderBook(url, index)
{
    let response = await fetch(url);
    let tempJson = await response.json();

    // If is crypto.com
    if (typeof tempJson.asks === 'undefined' && index === 2) {
        tempJson = tempJson.result.data[0];
    }

    books[index] = tempJson.asks;
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(port, () => console.log(`Listening on port ${port}!`));