import http from 'k6/http';
import {check, group} from 'k6';
import {htmlReport} from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import {textSummary} from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import {randomInt} from '../utils/number-generator.js';

export const options = {
    scenarios: {
        constant_request_rate: {
            executor: 'constant-arrival-rate',
            rate: 900,
            timeUnit: '5s',
            duration: '30s',
            preAllocatedVUs: 150,
            maxVUs: 1000,
            gracefulStop: '30s',
        },
    },
    noConnectionReuse: false,
};

const TOKENIZATION_URL = 'https://tokenization-killer.h4b.dev/api';

let cardRequest = JSON.parse(open('../data/card.json'));

/**
 * Default "Setup" method
 * Used for generate a token for all request
 * */
export function setup() {
    return {
        headers: {
            "x-api-key": "tB2U4JoFW4A9LIk2hQc18hDWaibEKSrDwoS0fPlKorYyvacmzsV4Sn4egMJJ2RbZ",
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
    };
}

export default (data) => {
    let userId = `tokilla_lite_900${randomInt(5)}`;
    let cardId = '';

    group('Payment Methods ALL GET FIRST Cards', function () {
        let response = http.get(TOKENIZATION_URL + "/customers/" + userId + "/cards", {
            headers: data.headers,
        });

        let responseData = JSON.parse(response.body);

        check(response, {
            "Http success status": (r) => r.status === 200,
        });

        check(responseData, {
            "Data success": (r) => r.success === true,
            "Data not null": (r) => r.data != null
        });
    });

    group('Payment Methods ALL POST Card', function () {
        let bin_number = "411111";
        let rand_number = randomInt(10);

        cardRequest.CustomerId = userId;
        cardRequest.Number = `${bin_number}${rand_number}`;
        cardRequest.BinNumber = bin_number;

        let response = http.post(TOKENIZATION_URL + "/cards", JSON.stringify(cardRequest), {
            headers: data.headers,
        });

        let responseData = JSON.parse(response.body);

        cardId = responseData.data.id;

        check(response, {
            "Http success status": (r) => r.status === 200,
        });
        check(responseData, {
            "Data success": (r) => r.success === true,
            "Data not null": (r) => r.data != null,
            "Card id not null": (r) => r.data.id != null
        });
    });

    group('Payment Methods ALL GET Cards', function () {
        let response = http.get(TOKENIZATION_URL + "/customers/" + userId + "/cards", {
            headers: data.headers,
        });

        let responseData = JSON.parse(response.body);

        check(response, {
            "Http success status": (r) => r.status === 200,
        });

        check(responseData, {
            "Data success": (r) => r.success === true,
            "Data not null": (r) => r.data != null,
            "Data not empty": (r) => r.data.length > 0
        });
    });

    group('Payment Methods ALL PUT Card', function () {
        let response = http.put(TOKENIZATION_URL + "/cards/" + cardId, JSON.stringify(cardRequest), {
            headers: data.headers,
        });

        let responseData = JSON.parse(response.body);

        check(response, {
            "Http success status": (r) => r.status === 200,
        });
        check(responseData, {
            "Data success": (r) => r.success === true,
            "Message not null": (r) => r.message != null
        });
    });

    group('Payment Methods ALL DELETE Card', function () {
        let response = http.del(TOKENIZATION_URL + "/cards/" + cardId, null, {
            headers: data.headers,
        });

        let responseData = JSON.parse(response.body);

        check(response, {
            "Http success status": (r) => r.status === 200,
        });
        check(responseData, {
            "Data success": (r) => r.success === true,
            "Message not null": (r) => r.message != null
        });
    });
};

/**
 * Method for generate a html report using benc-uk/k6-reporter
 * */
export function handleSummary(data) {
    return {
        "scriptReportAll.html": htmlReport(data), stdout: textSummary(data, {indent: "", enableColors: true})
    };
}