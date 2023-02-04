const { Configuration, OpenAIApi } = require("openai")
const Validator = require('validatorjs')
var Bottleneck = require("bottleneck")

export default async function handler(req, res) {
    function parseDiff(prScript) {
        const lines = prScript.split("\n")
        const pr = {}
        let filePath = null, codeChangeIndex = null
        for (const line of lines) {
            if (line.startsWith('diff --git', 0)) {
                const filePathMatch = line.match(/^diff --git a\/(.*) b\/.*$/, 'ig')
                filePath = filePathMatch[1]
                pr[filePath] = []
                codeChangeIndex = null
            } else if (line.startsWith('index', 0)) {
            } else if (line.startsWith('new file mode', 0)) {
            } else if (line.startsWith('\\ No newline at end of file', 0)) {
            } else if (line.startsWith('---', 0)) {
            } else if (line.startsWith('+++', 0)) {
            } else if (line.startsWith('@@', 0)) {
                codeChangeIndex = codeChangeIndex === null ? 0 : codeChangeIndex + 1
                pr[filePath].push([])
            } else if (line.startsWith('-', 0)) {
            } else if (line.startsWith('+', 0)) {
                pr[filePath][codeChangeIndex].push(line.substring(1))
            } else {
                pr[filePath][codeChangeIndex].push(line)
            }
        }
        const finalPr = {}
        Object.keys(pr).map(filePath => {
            pr[filePath].map((codeChange, codeChangeIndex) => {
                if (!finalPr?.[filePath]) {
                    finalPr[filePath] = []
                }
                finalPr[filePath].push({
                    code: pr[filePath][codeChangeIndex].join("\n"),
                })
            })
        })

        return finalPr
    }
    
    const validator = new Validator(req.body, {
        action: 'required|string|in:code-review,sql-review,unit-test,automation-test-basic,automation-test-curl,bitbucket-pr-review',
        code: 'required|string',
        provider: 'string|required_if:action,unit-test|required_if:action,automation-test-basic|required_if:action,automation-test-curl',
        endpoint: 'string|required_if:action,automation-test-basic',
        httpMethod: 'string|required_if:action,automation-test-basic',
        assertion: 'string|required_if:action,automation-test-basic|required_if:action,automation-test-curl',
        token: 'string|required_if:action,bitbucket-pr-review',
    })
    if (validator.check() === false) {
        res.status(400).json({ errors: validator.errors.all() })
    }

    const limiter = new Bottleneck({
        minTime: 3000,
        maxConcurrent: 20,
    });

    let prompt = '', model = 'text-davinci-002'
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
    const openai = new OpenAIApi(configuration)

    if (req.body.action === 'bitbucket-pr-review') {
        const url = new URL(req.body.code)
        const [emptyString, namespace, repo, prefix, prId] = url.pathname.split('/')
        if (!namespace || !repo || !prId) {
            res.status(400).json({ errors: { code: ['Url not valid']} })
        }

        const responsePrDiff = await fetch(
            `https://api.bitbucket.org/2.0/repositories/${namespace}/${repo}/pullrequests/${prId}/diff`,
            {
                method: 'GET',
                headers: { 'Accept': 'application/json', Authorization: `Bearer ${req.body.token}` }
            }
        )
        const prDiff = await responsePrDiff.text()
        const diff = parseDiff(prDiff)
        if (!diff) {
            res.status(400).json({ errors: { code: ['PR is empty']} })
        }

        for (const filePath of Object.keys(diff)) {
            let changesIndex = 0
            for (const changes of diff[filePath]) {
                await limiter.schedule(async () => {
                    prompt = `Please review this nodejs code snippet and suggest improvements if any: ${changes.code}`
                    const response = await openai.createCompletion({
                        model,
                        prompt,
                        temperature: 1,
                        max_tokens: 2048,
                        n: 1,
                        stop: null,
                    })
                    console.log(response?.data?.choices?.[0]?.text)
                    diff[filePath][changesIndex].review = response?.data?.choices?.[0]?.text.trim() === ''
                        ? 'No suggestion'
                        : response?.data?.choices?.[0]?.text.trim()
                })

                changesIndex++
            }
        }

        res.status(200).json({
            review: diff
        })
    } else {
        switch (req.body.action) {
            case 'code-review':
                prompt = `Please review this nodejs code snippet and suggest improvements if any: ${req.body.code.replace(/\r?\n/g, '')}`
                break
            case 'sql-review':
                prompt = `Please review this sql code snippet from potential error and suggest improvements if any: ${req.body.code.replace(/\r?\n/g, '')}`
                break
            case 'unit-test':
                prompt = `Generate unit tests using ${req.body.provider} and mock sample data for the following function: ${req.body.code.replace(/\r?\n/g, '')}`
                break
            case 'automation-test-basic':
                prompt = `Please generate api automation test using ${req.body.provider === 'mochajs' ? 'mochajs and supertest' : req.body.provider} for this endpoint ${req.body.httpMethod} ${req.body.endpoint} ${"\n"} with these payload: ${req.body.code.replace(/\r?\n/g, '')} ${"\n"} and these assertion: ${req.body.assertion}`
                break
            case 'automation-test-curl':
                prompt = `Please generate api automation test using ${req.body.provider === 'mochajs' ? 'mochajs and supertest' : req.body.provider} for this curl command: ${req.body.code.replace(/\r?\n/g, '')} ${"\n"} and these assertion: ${req.body.assertion.replace(/\r?\n/g, ', ')}`
                break
        }

        const response = await openai.createCompletion({
            model,
            prompt,
            temperature: 1,
            max_tokens: 2048,
            n: 1,
            stop: null,
        })

        res.status(200).json({
            review: response?.data?.choices?.[0]?.text.trim() === ''
                ? 'No suggestion'
                : response?.data?.choices?.[0]?.text.trim()
        })
    }
}
