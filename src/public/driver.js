const type = 'driver',
      username = "ben",
      email = "ben@live.hk",
      telephone_no ="69381113",
      password = "123456",
      vehicle_reg_no = "a12347",
      taxi_driver_id_photo = "b4703";

// const type = 'driver',
//     username = "ken",
//     email = "ken@live.hk",
//     telephone_no ="67676767",
//     password = "123",
//     vehicle_reg_no = "a390",
//     taxi_driver_id_photo = "djsak";

// const type = 'driver',
//         username = "jari",
//         email = "jari@live.hk",
//         telephone_no =" 67676767",
//         password = "456";

let access_token = null, user = null;;
/**
 * 
 * POST /api/user
 * 
 */
async function register(){
    try {
        const response = await axios.post('http://localhost:3100/api/user', 
            { type, username, email, telephone_no, password, vehicle_reg_no, taxi_driver_id_photo }
        );
        return displayMessage(JSON.stringify(response.data, null, 4));
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
};

async function registerOther(){
    try {
        const response = await axios.post('http://localhost:3100/api/user', 
            { 
                type:'driver',
                username:"ken",
                email:"ken@live.hk",
                telephone_no:"67676767",
                password:"123",
                vehicle_reg_no:"a390",
                taxi_driver_id_photo:"djsak"
            }
        );
        return displayMessage(JSON.stringify(response.data, null, 4));
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
};

/**
 * 
 * POST /api/user/login
 * 
 */
async function login(){
    try {
        const response = await axios.post('http://localhost:3100/api/user/login', { telephone_no, password, type });
        console.log(response);
        displayMessage(JSON.stringify(response.data, null, 4));
        access_token = response.data.access_token;
        user = response.data.user;
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
};

async function loginOther(){
    try {
        const response = await axios.post('http://localhost:3100/api/user/login', { email:'ken@live.hk', password: '123' });
        displayMessage(JSON.stringify(response.data, null, 4));
        access_token = response.data.access_token;
        user = response.data.user;
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
};

/**
 * 
 * PATCH /api/user/
 * 
 */

async function update(){
    try {
        const response = await axios.patch(
            'http://localhost:3100/api/user/' + user._id, 
            { 
                vehicle_reg_no: "djeiwjdef",
                telephone_no: "21800000"
            },
        { 
            headers: { Authorization: 'Bearer ' + access_token }
        });
        displayMessage(JSON.stringify(response.data, null, 4));
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
}

/**
 * 
 * POST /api/order
 * 
 */

async function makeOrder(){
    try {
        const response = await axios.post('http://localhost:3100/api/order', 
            {
                origin: "東海大廈", destination: "屌你老母", route: "信和中心",
                criteria: {
                    taxiType: 'green', 
                    discount: 100,
                    tunnel: 'any',
                    passenger: 5,
                    payment: 'creditCard',
                    return: true,
                    fixedPrice: 123,
                    otherPhone: '21800000'
                    // tunnel: 'eastTunnel'
                }
            },
            { 
                headers: { Authorization: 'Bearer ' + access_token }
            }
        );
        displayMessage(JSON.stringify(response.data, null, 4));
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
}


/**
 * 
 * POST /api/order
 * 
 */
async function getOrder(){
    try {
        const response = await axios.get('http://localhost:3100/api/order', 
            { 
                params: { status: 'new'},
                headers: { Authorization: 'Bearer ' + access_token }
            }
        );
        displayMessage(JSON.stringify(response.data, null, 4));
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
}

async function getOrdererOrder(){
    try {
        const response = await axios.get('http://localhost:3100/api/order', 
            { 
                params: { status: 'all', identity: 'orderer'},
                headers: { Authorization: 'Bearer ' + access_token }
                // headers: { Authorization: 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJncmFkZSI6IkMiLCJtYXJrIjo1MCwidmFsaWQiOnRydWUsImJhbiI6ZmFsc2UsInN1cGVyQ2xhc3MiOmZhbHNlLCJfaWQiOiI1YzJmNGVhZjMzZmQ1NTI1NzQzNjIwMjciLCJ0eXBlIjoiZHJpdmVyIiwidXNlcm5hbWUiOiJrZW4iLCJ0ZWxlcGhvbmVfbm8iOiI2OTM4MTExMyIsInZlaGljbGVfcmVnX25vIjoiOTk5IiwidGF4aV9kcml2ZXJfaWRfcGhvdG8iOiJpbWFnZS05YTdjMWNkMC0xMDFhLTExZTktYTM3YS0xYjkzOWZhNzNhNmEucG5nIiwic2FsdCI6ImRjZjQwZmJkZDAxNDIyZjgyMWVlOGFkMDJmYTgzNDBkIiwiaGFzaCI6Ijc1YzQ0MTBjMTg5ZTM3Mjc1YmM3YmQwYWNjMWRkOGMzODViY2FkOTJkNTI1Y2E1ZjJjOWMxMDVlNGVhOGM2ZTA2YjkyMTdhZDc1N2NiYWM5YWVlNGI2Njk0OTAzYzUyYWEwODZjZWFiMDBmMmFiMGM1YTk2MTRkZWFhMTIxY2Q5IiwiY3JlYXRlZEF0IjoiMjAxOS0wMS0wNFQxMjoxNjo0Ny41MTVaIiwidXBkYXRlZEF0IjoiMjAxOS0wMS0wNlQwODoyMzozNy4wODJaIiwiX192IjowLCJpYXQiOjE1NDY3NjY0NTJ9.VU7QvOueIZPff-IbdwaRADc1oSKTaHhfBOiRC3qQnEQ' }
            }
        );
        displayMessage(JSON.stringify(response.data, null, 4));
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
}

async function getDriverOrder(){
    try {
        const response = await axios.get('http://localhost:3100/api/order', 
            { 
                params: { status: 'all'},
                headers: { Authorization: 'Bearer ' + access_token }
            }
        );
        displayMessage(JSON.stringify(response.data, null, 4));
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
}


/**
 * 
 * POST /api/order/:orderId
 * 
 */
async function acceptOrder(){

    const orderId = document.getElementById('orderNumber').value;

    try {
        const response = await axios.post('http://localhost:3100/api/order/' + orderId, 
            {
                type: 'accept'
            },
            { 
                headers: { Authorization: 'Bearer ' + access_token }
            }
        );
        displayMessage(JSON.stringify(response.data, null, 4));
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
};

async function releaseOrder(){

    const orderId = document.getElementById('orderNumber').value;

    try {
        const response = await axios.post('http://localhost:3100/api/order/' + orderId, 
            {
                type: 'release'
            },
            { 
                headers: { Authorization: 'Bearer ' + access_token }
            }
        );
        displayMessage(JSON.stringify(response.data, null, 4));
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
};

async function overtimeOrder(){

    const orderId = document.getElementById('orderNumber').value;

    try {
        const response = await axios.post('http://localhost:3100/api/order/' + orderId, 
            {
                type: 'overtime'
            },
            { 
                headers: { Authorization: 'Bearer ' + access_token }
            }
        );
        displayMessage(JSON.stringify(response.data, null, 4));
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
};

/**
 * 
 * POST /api/order/comment
 * 
 */
async function confirmOrder(){

    const orderId = document.getElementById('orderNumber').value;
    
    try {
        const response = await axios.post('http://localhost:3100/api/order/' + orderId,
            { 
                type:'confirm' 
            },
            { 
                headers: { Authorization: 'Bearer ' + access_token }
            }
        );
        displayMessage(JSON.stringify(response.data, null, 4));
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
}

/**
 * 
 * GET /api/user
 * 
 */
async function list(){
    
    try {
        const response = await axios.get('http://localhost:3100/api/user/',
            { 
                headers: { Authorization: 'Bearer ' + access_token }
            }
        );
        displayMessage(JSON.stringify(response.data, null, 4));
    } catch (error){
        console.error(error.data);
        return displayMessage(JSON.stringify(error, null, 4));
    };
}


/**
 * 
 * Socket
 * 
 */
const socket = io("http://localhost:3100");
let socketInfo = {};
socket.on("connect", function () {
    console.log('has connected');
    socketInfo.socketId = this.id;
});

socket.on('action', data => 
                console.log(data));

function whatIsMe(){
    socket.emit('what_is_me', access_token );
};

function renewLocation(){
    const position = { "lat": 22.334518, "lng": 114.157452};
    socket.emit('renew_location', position );
};




/**
 * 
 * Helper function
 * 
 */
const displayMessage = message => 
    document.getElementById('message').innerText = message;
