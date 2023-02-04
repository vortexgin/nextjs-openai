import React, { useState, useEffect } from 'react';
import Head from 'next/head'
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AutomationTest() {

    const [cmbModel, setCmbModel] = useState('curl');
    const [cmbProvider, setCmbProvider] = useState('mochajs');
    const [cmbHttpMethod, setCmbHttpMethod] = useState('GET');
    const [txtEndpoint, setTxtEndpoint] = useState('');
    const [txtCode, setTxtCode] = useState('');
    const [txtAssertion, setTxtAssertion] = useState('');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    const doGenerateApiAutomationTest = async () => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await fetch(
                '/api/openai',
                {
                    body: JSON.stringify({
                        action: `automation-test-${cmbModel}`,
                        provider: cmbProvider,
                        httpMethod: cmbHttpMethod,
                        endpoint: txtEndpoint,
                        code: txtCode,
                        assertion: txtAssertion,
                    }),
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
                <title>Generate API Automation Test</title>
                <meta name="description" content="Ask OpenAI to generate API automation test" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container pt-5">
                <div className="row">
                    <div className="col-12 mb-3">
                        <label htmlFor="cmbModel" className="form-label">Input model</label>
                        <select className="form-control" id="cmbModel" onChange={e => {
                            if (e.target.value === 'basic') {
                                setTxtCode('')
                            } else {
                                setTxtCode('{}')
                                setTxtEndpoint('')
                            }
                            setCmbModel(e.target.value)
                            setData(null)
                            setError(null)
                        }}>
                            <option value="curl">cUrl Command</option>
                            <option value="basic">Basic</option>
                        </select>
                    </div>
                    <div className="col-12 mb-3">
                        <label htmlFor="cmbProvider" className="form-label">Provider</label>
                        <select className="form-control" id="cmbProvider" onChange={e => setCmbProvider(e.target.value)}>
                            <option value="mochajs">MochaJS + SuperTest</option>
                            <option value="cucumber">Cucumber</option>
                        </select>
                    </div>
                    {
                        cmbModel === 'basic'
                        ? (
                            <>
                                <div className="col-12 mb-3">
                                    <label htmlFor="txtEndpoint" className="form-label">Endpoint</label>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text" id="basic-addon1">
                                            <select className="form-control" id="cmbHttpMethod" onChange={e => setCmbHttpMethod(e.target.value)}>
                                                <option value="GET">GET</option>
                                                <option value="POST">POST</option>
                                                <option value="PUT">PUT</option>
                                                <option value="PATCH">PATCH</option>
                                                <option value="DELETE">DELETE</option>
                                            </select>
                                        </span>
                                        <input id="txtEndpoint" type="text" className="form-control" placeholder="https://example.com"
                                               aria-label="URL" aria-describedby="basic-addon1" onChange={e => setTxtEndpoint(e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-12 mb-3">
                                    <label htmlFor="txtCode" className="form-label">Payload</label>
                                    <textarea className="form-control" id="txtCode" rows={20}
                                              placeholder="Put your json payload here"
                                              onChange={e => setTxtCode(e.target.value)}
                                              defaultValue="{}"
                                    />
                                </div>
                            </>
                        )
                        : (
                            <div className="col-12 mb-3">
                                <label htmlFor="txtCode" className="form-label">cUrl command</label>
                                <textarea className="form-control" id="txtCode" rows={20}
                                          placeholder="Put your cUrl command here"
                                          onChange={e => setTxtCode(e.target.value)}
                                />
                            </div>
                        )
                    }
                    <div className="col-12 mb-3">
                        <label htmlFor="txtAssertion" className="form-label">Assertion</label>
                        <textarea className="form-control" id="txtAssertion" rows={20}
                                  placeholder={"Example:\nprice should equal 10000\ndate greater than 2022-01-01"}
                                  onChange={e => setTxtAssertion(e.target.value)} ></textarea>
                    </div>
                    <div className="col-12 mb-3">
                        <button type="button" className="btn btn-primary" disabled={!!loading} onClick={doGenerateApiAutomationTest}>
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
