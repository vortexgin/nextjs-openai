const { Configuration, OpenAIApi } = require("openai")
const Validator = require('validatorjs');

export default async function handler(req, res) {
    const validator = new Validator(req.body, {
        action: 'required|string|in:code-review,sql-review,unit-test,automation-test-basic,automation-test-curl',
        code: 'required|string',
        provider: 'string|required_if:action,unit-test|required_if:action,automation-test-basic|required_if:action,automation-test-curl',
        endpoint: 'string|required_if:action,automation-test-basic',
        httpMethod: 'string|required_if:action,automation-test-basic',
        assertion: 'string|required_if:action,automation-test-basic|required_if:action,automation-test-curl',
    })
    if (validator.check() === false) {
        res.status(400).json({ errors: validator.errors.all() })
    }
    console.log(req.body)

    let prompt = '', model = 'text-davinci-002'
    switch (req.body.action) {
        case 'code-review':
            prompt = `Please review this nodejs code snippet and suggest improvements if any: ${req.body.code.replace(/\r?\n/g, '')}`
            break;
        case 'sql-review':
            prompt = `Please review this sql code snippet from potential error and suggest improvements if any: ${req.body.code.replace(/\r?\n/g, '')}`
            break;
        case 'unit-test':
            prompt = `Generate unit tests using ${req.body.provider} and mock sample data for the following function: ${req.body.code.replace(/\r?\n/g, '')}`
            break;
        case 'automation-test-basic':
            prompt = `Please generate api automation test using ${req.body.provider === 'mochajs' ? 'mochajs and supertest' : req.body.provider} for this endpoint ${req.body.httpMethod} ${req.body.endpoint} ${"\n"} with these payload: ${req.body.code.replace(/\r?\n/g, '')} ${"\n"} and these assertion: ${req.body.assertion}`
            break;
        case 'automation-test-curl':
            prompt = `Please generate api automation test using ${req.body.provider === 'mochajs' ? 'mochajs and supertest' : req.body.provider} for this curl command: ${req.body.code.replace(/\r?\n/g, '')} ${"\n"} and these assertion: ${req.body.assertion.replace(/\r?\n/g, ', ')}`
            break;
    }
    console.log(prompt)

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
    const openai = new OpenAIApi(configuration)
    const response = await openai.createCompletion({
        model,
        prompt,
        temperature: 1,
        max_tokens: 2048,
        n: 1,
        stop: null,
    })
    // console.log(response)

    res.status(200).json({
        review: response?.data?.choices?.[0]?.text.trim() === ''
            ? 'No suggestion'
            : response?.data?.choices?.[0]?.text.trim()
    })
}
