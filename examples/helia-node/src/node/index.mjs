import { createNode, unixfs } from './this/index.mjs'
// create two helia nodes
const node1 = await createNode()
const node2 = await createNode()


const multiaddrs = node2.libp2p.getMultiaddrs()
const dial = await node1.libp2p.dial(multiaddrs[0])

// create a filesystem on top of Helia, in this case it's UnixFS
const fs = unixfs(node1)

// we will use this TextEncoder to turn strings into Uint8Arrays
const encoder = new TextEncoder()

// add the bytes to your node and receive a unique content identifier
const cid = await fs.addBytes(encoder.encode('Hello World 200'))


const fs2 = unixfs(node2)

// this decoder will turn Uint8Arrays into strings
const decoder = new TextDecoder()
let text = ''

// use the second Helia node to fetch the file from the first Helia node
for await (const chunk of fs2.cat(cid)) {
    text += decoder.decode(chunk, {
        stream: true
    })
}

console.log('Added file:', cid.toString())
console.log('Fetched file contents:', text)