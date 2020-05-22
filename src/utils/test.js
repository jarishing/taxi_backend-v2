const AWS = require('aws-sdk');

AWS.config.update({
    "accessKeyId":"AKIAI54DQ77BPWGL5K5A",
    "secretAccessKey":"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",
    "region":"ap-southeast-1" 
})

var params = {
    Message: 'Hello mother fucker',
    PhoneNumber: '+85212013010431',
};
  
// Create promise and SNS service object
var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

// Handle promise's fulfilled/rejected states
publishTextPromise.then(
  function(data) {
    console.log("MessageID is " + data.MessageId);
    console.log( data );
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });