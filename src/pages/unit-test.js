import React, { useState, useEffect } from 'react';
import Head from 'next/head'
import 'bootstrap/dist/css/bootstrap.min.css';

export default function UnitTest() {

    const [cmbProvider, setCmbProvider] = useState('jest');
    const [txtCode, setTxtCode] = useState('');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    const doGenerateUnitTest = async () => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await fetch(
                '/api/openai',
                {
                    body: JSON.stringify({ action: 'unit-test', provider: cmbProvider, code: txtCode }),
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
                <title>Generate Unit Test</title>
                <meta name="description" content="Ask OpenAI to generate unit test" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container pt-5">
                <div className="row">
                    <div className="col-12 mb-3">
                        <label htmlFor="cmbProvider" className="form-label">Provider</label>
                        <select className="form-control" id="cmbProvider" onChange={e => setCmbProvider(e.target.value)}>
                            <option value="jest">Jest</option>
                            <option value="junit">JUnit</option>
                        </select>
                    </div>
                    <div className="col-12 mb-3">
                        <label htmlFor="txtCode" className="form-label">Code</label>
                        <textarea className="form-control" id="txtCode" rows={20}
                                  placeholder="Put your code here"
                                  onChange={e => setTxtCode(e.target.value)}
                        />
                    </div>
                    <div className="col-12 mb-3">
                        <button type="button" className="btn btn-primary" disabled={!!loading} onClick={doGenerateUnitTest}>
                            {
                                !loading
                                ? (!data ? 'Generate' : 'Regenerate')
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
                            <pre>{data.review}</pre>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
