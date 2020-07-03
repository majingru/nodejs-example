import http from 'http'
import https from 'https'
import qs from 'querystring'
import url from 'url'

function request(path, ops, params) {
    let u = url.parse(path);
    let trans;
    if (u.protocol === 'https:') {
        trans = https;
    } else {
        trans = http;
    }
    let resOps = Object.assign({}, u, ops);
    
    if(resOps.method && resOps.method === 'POST'){
        resOps.headers = Object.assign({}, resOps.headers, {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'})
    }
    return new Promise((resolve, rejects) => {
        let res;
        try {
            res = trans.request(resOps, res => {
                res.setEncoding('utf8');
                let resp = '';
                res.on('data', (chunk) => {
                    resp += chunk;
                });
                res.on('end', () => {
                    resolve({
                        code: res.statusCode,
                        headers: res.headers,
                        request: {
                            ops: resOps,
                            params: params
                        },
                        data: resp
                    });
                })
            })
            res.on('error', e => rejects(e));
            if (params) {
                res.write(qs.stringify(params));
            }
            res.end();
        } catch (error) {
            rejects(error);
        }finally{
            if(res){
                res.end();
            }
        }
    })
}

function get(url, params){
    return request(url + "?" + qs.stringify(params));
}

function post(url, params){
    return request(url, {
        method: 'POST',
    }, params)
}

export default {
    request,
    get,
    post
}
