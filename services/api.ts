import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie  } from 'nookies' 
import { resolve } from 'path';

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestQueue = [];
export const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
        Authorization: `Bearer ${cookies['nextauth.token']}`
    }
});

api.interceptors.response.use(response => {
    return response
}, error => {
    if (error.response.data?.code === 'token.expired') {
        cookies = parseCookies();

        const { 'nextauth.refreshToken' : refreshToken} = cookies
        const originalConfig = error.config
      if (!isRefreshing) {
          isRefreshing = true;
        api.post('/refresh', { 
            refreshToken,
        }).then(response => {
            const { token } = response.data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, //30 days
                path: '/'
             } )
            setCookie(undefined, 'nextauth.refresh', response.data.refreshToken,  {
                maxAge: 60 * 60 * 24 * 30, //30 days
                path: '/'
             }  )
             api.defaults.headers['Authorization'] = `Bearer ${token}`;
        });
    } 
    return new Promise((resolve, reject) => {
        failedRequestQueue.push({
            resolve: (token: string) => {
                if (!originalConfig?.headers) {
                    return
                }
                originalConfig.headers['Authorization'] `Bearer ${token}`
                resolve(api(originalConfig))
            } ,
            reject: (err: AxiosError) => {
                reject(err)
            },
        })
    })
      } else {

    }
})