const fs = require('fs');
const {Mbox, MboxStream} = require('node-mbox');
const split = require('line-stream');

const getMessages = (req, res) => {
    const mboxFile = './AI-AIData-1.mbox';
    // const mbox    = new Mbox({ /* options */ });

    const fs      = require('fs');
    const mailbox = fs.createReadStream(mboxFile);
    const mbox    = MboxStream(mailbox, { /* options */ });

    // Next, catch events generated:
    var mboxData = "";
    mbox.on('data', function(msg) {
        // `msg` is a `Buffer` instance
        mboxData += msg.toString();
    });
    
    mbox.on('error', function(err) {
        return res.status(400).send(err);
    });

    mbox.on('finish', function() {
        return res.status(200).send(mboxData);
        // console.log('done reading mbox file');
    });
};

module.exports = { getMessages };
