import React, { useState, useEffect } from 'react';
import Head from 'next/head'
import 'bootstrap/dist/css/bootstrap.min.css';

export default function BitbucketPrReview() {

    const [txtCode, setTxtCode] = useState('');
    const [txtToken, setTxtToken] = useState('');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    const doCodeReview = async () => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await fetch(
                '/api/openai',
                {
                    body: JSON.stringify({ action: 'bitbucket-pr-review', code: txtCode, token: txtToken }),
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            const json = await response.json();
            if (json?.errors) {
                setError(json)
            } else {
                setData(json);
            }
        } catch (err) {
            setError(err);
        }
        setLoading(false);
    }

    return (
        <>
            <Head>
                <title>Bitbucket PR Review</title>
                <meta name="description" content="Ask OpenAI to perform code review for bitbucket PR" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container pt-5">
                <div className="row">
                    <div className="col-12 mb-3">
                        <label htmlFor="txtCode" className="form-label">PR link</label>
                        <input type="text" id="txtCode" className="form-control"
                               placeholder="https://bitbucket.org/<project>/<repository>/pull-requests/<PR ID>"
                               onChange={e => setTxtCode(e.target.value)} />
                    </div>
                    <div className="col-12 mb-3">
                        <label htmlFor="txtToken" className="form-label">App password</label>
                        <input type="text" id="txtToken" className="form-control"
                               onChange={e => setTxtToken(e.target.value)} />
                    </div>
                    <div className="col-12 mb-3">
                        <button type="button" className="btn btn-primary" disabled={!!loading} onClick={doCodeReview}>
                            {
                                !loading
                                    ? (!data ? 'Review' : 'Get another insight')
                                    : 'Loading'
                            }
                        </button>
                    </div>
                </div>
                { !loading && !!error && (
                    <div className="row mt-5">
                        <div className="col-12 p-0 bg-white">
                            <div className="alert alert-danger mb-0">{
                                typeof error?.errors === 'object'
                                    ? Object.keys(error.errors).map((field) => {
                                        return error.errors[field] + "\n"
                                    })
                                    : JSON.stringify(error)
                            }</div>
                        </div>
                    </div>
                )}
                { !loading && !!data && (
                    <div className="row mt-5">
                        <div className="col-12 mb-3 bg-white">
                            <h3>Result</h3>
                            <pre>{JSON.stringify(data.review)}</pre>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
