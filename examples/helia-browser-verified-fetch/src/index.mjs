// import {createVerifiedFetch} from '@helia/verified-fetch'
import { verifiedFetch } from '@helia/verified-fetch'
import {fileTypeFromBuffer} from '@sgtpooki/file-type'

const App = async (root) => {
    // const verifiedFetch = await createVerifiedFetch({
    //     gateways: ['http://localhost:9483'],
    //     routers: ['http://delegated-ipfs.dev']
    // })

    let path = ''
    let controller = undefined

    const html = {
        path: root.querySelector('#ipfs-path'), // onPathChange
        buttonFetchJson: root.querySelector('#button-fetch-json'), // onFetchJson('json')
        buttonFetchDagJson: root.querySelector('#button-fetch-dag-json'), // onFetchJson('dag-json')
        buttonFetchText: root.querySelector('#button-fetch-text'), // onFetchText()
        buttonFetchImage: root.querySelector('#button-fetch-image'), // onFetchImage
        buttonFetchFile: root.querySelector('#button-fetch-file'), // onFetchFile
        buttonFetchAuto: root.querySelector('#button-fetch-auto'), // onFetchAuto
        buttonFetchAbort: root.querySelector('#button-fetch-abort') // onAbort
    }

    const setLoading = (message) => {

        console.log('LOG: ', message)
    }

    const setError = (error) => {

        console.error('ERROR', error)
    }

    const setSuccess = async (result, type) => {
        console.log('============= result =============', result)
        switch (type) {
            case 'auto':
                break
            case 'file':
                break
            case 'video':
                break
            case 'text':
                break
            case 'json':
                break
            case 'image':
                break
        }

        return true
    }
    const onPathChange = (event) => {
        path = event.currentTarget.value
    }

    const handleImageType = async (resp, type) => {
        const blob = await resp.blob()
        const url = URL.createObjectURL(blob)
        return setSuccess(`<img src=${url} alt="fetched image content"/>`, type)
    }

    const handleJsonType = async (resp, type) => {
        setLoading('Waiting for full JSON data...')
        const result = await resp.json()
        return setSuccess(result, type)
    }

    const handleVideoType = async (resp, type) => {
        const blob = await resp.blob()
        const url = URL.createObjectURL(blob)
        return setSuccess(`<video controls src=${url} />`, type)
    }

    const handleTextType = async (resp, type) => {
        const result = await resp.text()
        return setSuccess(result, type)
    }

    const handleFileType = async (resp, type) => {
        const blob = await resp.blob()
        const url = URL.createObjectURL(blob)
        const downloadLink = document.createElement('a')
        downloadLink.href = url
        downloadLink.download = 'download'
        downloadLink.click()
        return setSuccess(result, type)
    }

    const onFetchJson = async (event) => {
        // debugger
        let resp = ''
        let jsonType = ''
        let type = ''

        try {
            if (controller) {
                controller.abort()
                controller = undefined
            }

            controller = new AbortController()

            switch (event.currentTarget.id) {
                case 'button-fetch-abort':
                    if (controller) {
                        controller.abort()
                        controller = undefined
                    }
                    return true
                case 'button-fetch-auto':
                    type = 'auto'
                    break
                case 'button-fetch-file':
                    type = 'file'
                    break
                case 'button-fetch-image':
                    type = 'image'
                    break
                case 'button-fetch-json':
                    jsonType = 'application/json'
                    type = 'json'
                    break
                case 'button-fetch-dag-json':
                    jsonType = 'application/vnd.ipld.dag-json'
                    type = 'json'
                    break
                case 'button-fetch-text':
                    jsonType = 'application/vnd.ipld.dag-json'
                    type = 'text'
                    break
            }

            setLoading(`Fetching ${jsonType} response...`)

            switch (type) {
                case 'auto':
                case 'file':
                case 'image':
                    resp = await verifiedFetch(path, {signal: controller.signal})
                    break
                case 'json':
                case 'text':
                    resp = await verifiedFetch(path, {
                        signal: controller.signal,
                        headers: {
                            accept: jsonType
                        }
                    })
                    break
            }

            switch (type) {
                case 'auto':
                    setLoading('Waiting for full auto data...')
                    break
                case 'file':
                    setLoading('Waiting for full file data...')
                    break
                case 'image':
                    setLoading('Waiting for full image data...')
                    break
                case 'json':
                    setLoading('Waiting for full JSON data...')
                    break
                case 'text':
                    setLoading('Waiting for full TEXT data...')
                    break
            }

            try {
                switch (type) {
                    case 'auto':
                        const buffer = await resp.clone().arrayBuffer()
                        let contentType = (await fileTypeFromBuffer(new Uint8Array(buffer)))?.mime
                        if (!contentType) {
                            try {
                                // see if we can parse as json
                                await resp.clone().json()
                                contentType = 'application/json'
                            } catch (err) {
                                // ignore
                            }
                        }
                        switch (true) {
                            case contentType?.includes('image'):
                                await handleImageType(resp, type)
                                break
                            case contentType?.includes('json'):
                                await handleJsonType(resp, type)
                                break
                            case contentType?.includes('video'):
                                await handleVideoType(resp, type)
                                break
                            default:
                                setError(`Unknown content-type: ${contentType}`)
                        }
                        break
                    case 'file':
                        await handleFileType(resp, type)
                    case 'image':
                        setLoading('Waiting for full image data...')
                        await handleImageType(resp, type)
                        break
                    case 'json':
                        await handleJsonType(resp, type)
                        break
                    case 'text':
                        setLoading('Waiting for full TEXT data...')
                        await handleTextType(resp, type)
                        break
                }
            } catch (e) {
                setError(e.message)
            }
        } catch (err) {
            // TODO: simplify AbortErr handling to use err.name once https://github.com/libp2p/js-libp2p/pull/2446 is merged
            if (err?.code === 'ABORT_ERR') {
                return
            }
            if (err instanceof Error) {
                setError(err.message)
            }
        }
    }

    html.path.addEventListener('input', onPathChange)
    html.buttonFetchJson.addEventListener('click', onFetchJson)
    html.buttonFetchDagJson.addEventListener('click', onFetchJson)
    html.buttonFetchText.addEventListener('click', onFetchJson)
    html.buttonFetchImage.addEventListener('click', onFetchJson)
    html.buttonFetchFile.addEventListener('click', onFetchJson)
    html.buttonFetchAuto.addEventListener('click', onFetchJson)
    html.buttonFetchAbort.addEventListener('click', onFetchJson)
}

App(document.body).then().catch(e => console.log('error: ', e))