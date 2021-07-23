import axios from 'axios'

const PAYSTACK_BASE_URL = `https://api.paystack.co/transaction/`
export const PAYSTACK_INTIALIZE = `initialize`
export const PAYSTACK_VERIFY = `verify`
export const PAYSTACK_SUCCESS_STATUS = 'success';

export const payStackAxiosClient = axios.create({
    baseURL: PAYSTACK_BASE_URL,
    headers: {
        'Content-Type':'application/json',
        'Authorization': `Bearer ${process.env.PAYSTACK_TEST_SECRET}`
    }
})
